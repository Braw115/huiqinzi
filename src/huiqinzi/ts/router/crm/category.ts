import { validateCgi } from "../../lib/validator"
import { cateValidator } from "./validator"
import { Category } from "../../model/crm/category"
import { Goods } from "../../model/crm/goods"
import { Activity } from "../../model/crm/activity"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"
import { deletePic } from "../file/upload"

export const router = new RouterWrap({ prefix: "/crmcategory" })

export class CategoryOnCrm extends BaseHandler {
    //新加一个Category
    public static async add(args: any): Promise<any> {
        const { name, parent, pic, key, position } = args
        let obj = { name, key, parent, pic, position }
        validateCgi({ name, position }, cateValidator.add)
        if (parent)
            validateCgi({ parent }, cateValidator.parent)
        else
            delete obj.parent

        let res = await Category.getInstance().insertCategroy(obj)
        if (res)
            return { msg: "新建成功" }
        return { msg: "新建失败" }
    }

    //删除一个类
    public static async delete(ctx: any): Promise<any> {
        const { uuid } = ctx.params
        validateCgi({ uuid }, cateValidator.delete)
        let category = await Category.getInstance().findByPrimary(uuid)
        if (category.parent) {//小类,删除下面的商品和活动
            await Category.getInstance().deleteCategory(uuid)
            await Goods.getInstance().deleteBySubcategory(uuid)
            await Activity.getInstance().deleteBySubcategory(uuid)

            let goods = await Goods.getInstance().findBySubcategory(uuid)
            if (goods && goods.length > 0) {
                for (let i = 0; i < goods.length; i++) {
                    let pics = goods[i].pics
                    for (let pic of pics) {
                        await deletePic(pic)
                    }
                }
            }

            let act = await Activity.getInstance().findBySubcategory(uuid)
            if (act && act.length > 0) {
                for (let i = 0; i < goods.length; i++) {
                    let pics = goods[i].pics
                    for (let pic of pics) {
                        await deletePic(pic)
                    }
                }
            }

        } else {    //大类，删除下面的小类,和下面的商品活动
            await Category.getInstance().deleteCategory(uuid)
            await Category.getInstance().deleteByParent(uuid)
            await Goods.getInstance().deleteByCategory(uuid)
            await Activity.getInstance().deleteByCategory(uuid)

            let goods = await Goods.getInstance().findAllByCategory(uuid)
            if (goods && goods.length > 0) {
                for (let i = 0; i < goods.length; i++) {
                    let pics = goods[i].pics
                    for (let pic of pics) {
                        await deletePic(pic)
                    }
                }
            }

            let act = await Activity.getInstance().findAllByCategory(uuid)
            if (act && act.length > 0) {
                for (let i = 0; i < goods.length; i++) {
                    let pics = goods[i].pics
                    for (let pic of pics) {
                        await deletePic(pic)
                    }
                }
            }
        }
        return { msg: "删除成功" }
    }

    //修改一个类
    public static async update(args: any): Promise<any> {
        const { uuid, pic, key, name, position } = args
        validateCgi({ uuid, name, position }, cateValidator.update)
        let res = await Category.getInstance().updateCategory(uuid, { pic, name, position, key })
        if (res)
            return { msg: "修改成功" }
        return { msg: "修改失败" }
    }

    //查询全部大类
    public static async getAll(args: any): Promise<any> {
        const { start, length } = args
        validateCgi({ start, length }, cateValidator.getAll)
        let res = await Category.getInstance().findAllCategory(start, length)
        return res
    }
    //查询全部小类
    public static async getAllSub(args: any): Promise<any> {
        const { uuid, start, length } = args
        validateCgi({ uuid, start, length }, cateValidator.getAllSub)
        let res = await Category.getInstance().findAllCategoryByParent(start, length, uuid)
        return res
    }
}

/*
*1、新加一个Category
*/
router.loginHandle("post", "/add", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CategoryOnCrm.add((ctx.request as any).body)))

/*
*2、删除一个Category
*/
router.loginHandle("delete", "/:uuid", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CategoryOnCrm.delete(ctx)))

/*
*3、修改一个Category
*/
router.loginHandle('put', '/update', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CategoryOnCrm.update((ctx.request as any).body)))

/*
*4、查找全部大类Category
*/
router.handle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CategoryOnCrm.getAll((ctx.request as any).query)))

/*
*5、查找全部小类Category
*/
router.loginHandle('get', '/sub', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CategoryOnCrm.getAllSub((ctx.request as any).query)))
