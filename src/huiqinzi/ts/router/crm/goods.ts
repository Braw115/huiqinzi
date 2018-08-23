import { validateCgi } from "../../lib/validator"
import { goodsValidator } from "./validator"
import { Goods } from "../../model/crm/goods"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"
import { deletePic } from "../file/upload"

export const router = new RouterWrap({ prefix: "/crmgoods" })

export class GoodsOnCrm extends BaseHandler {
    //新加一个商品
    public static async add(args: any): Promise<any> {
        let { title, price, detail, category, subcategory, pricetag, pics,
            position, inventory, sold, specialprice, hotposition, city } = args
        if (specialprice)
            specialprice = parseFloat(specialprice)

        let obj = {
            title, price, detail, category, subcategory,
            pricetag: JSON.parse(pricetag), state: "new",
            pics: JSON.parse(pics), position, inventory,
            sold, specialprice, hotposition, city
        }
        validateCgi(obj, goodsValidator.add)

        let res = await Goods.getInstance().insertGoods(obj)
        if (res)
            return { msg: "添加成功" }
        return { msg: "添加失败" }
    }

    //删除一个商品
    public static async delete(ctx: any): Promise<any> {
        const { uuid } = ctx.params
        validateCgi({ uuid }, goodsValidator.delete)

        let good = await Goods.getInstance().findByPrimary(uuid)

        for (let pic of good.pics) {
            await deletePic(pic)
        }

        let res = await Goods.getInstance().deleteGoods(uuid)
        if (res)
            return { msg: "删除成功" }
        return { msg: "删除失败" }
    }

    //修改一个商品
    public static async update(args: any): Promise<any> {
        let { uuid, title, price, detail, category, subcategory, pricetag, pics,
            position, inventory, sold, specialprice, hotposition, city } = args

        validateCgi({
            uuid, title, price, detail, category, subcategory,
            pricetag, pics, position, inventory, sold, city
        }, goodsValidator.update)

        if (specialprice)
            specialprice = parseFloat(specialprice)

        let obj = {
            title, price, detail, category, subcategory,
            pricetag: JSON.parse(pricetag), pics: JSON.parse(pics),
            position, inventory, sold, specialprice, hotposition
        }
        let res = await Goods.getInstance().updateGoods(uuid, obj)
        if (res)
            return { msg: "修改成功" }
        return { msg: "修改失败" }
    }

    //分页查询商品
    public static async findAll(args: any): Promise<any> {
        const { start, length, category, subcategory, draw } = args
        let search: String = args["search[value]"]
        validateCgi({ start, length, category, subcategory }, goodsValidator.startLength)
        if (!search)
            search = ""

        let { goods, recordsFiltered } = await Goods.getInstance().findAllGoods(start, length, category, subcategory, search, undefined)
        return { goods, recordsFiltered, draw }
    }

    //上下架
    public static async updateState(args: any): Promise<any> {
        const { uuid, state } = args
        validateCgi({ state }, goodsValidator.updateState)
        await Goods.getInstance().updateGoods(uuid, { state })
        return { msg: "修改成功" }
    }

    //置顶
    public static async updatePosition(args: any): Promise<any> {
        const { uuid } = args
        validateCgi({ uuid }, goodsValidator.delete)
        let activity = await Goods.getInstance().findGoodsByPosition()
        let position = 1
        if (activity[0].position)
            position = activity[0].position + 1
        await Goods.getInstance().updateGoods(uuid, { position })
        return { msg: "修改成功" }
    }

}

/*
*1、新加一个商品
*/
router.loginHandle("post", "/add", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsOnCrm.add((ctx.request as any).body)))


/*
*2、删除一个商品
*/
router.loginHandle("delete", "/:uuid", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsOnCrm.delete(ctx)))

/*
*3、修改一个商品
*/
router.loginHandle("put", "/update", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsOnCrm.update((ctx.request as any).body)))

/*
*4、分页查询商品
*/
router.loginHandle("get", "/getAll", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsOnCrm.findAll((ctx.request as any).query)))

/*
*5.上下架
*/
router.loginHandle('put', '/state', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsOnCrm.updateState((ctx.request as any).body)))