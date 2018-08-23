import { validateCgi } from "../../lib/validator"
import { bannerValidator } from "./validator"
import { Banner } from "../../model/crm/banner"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/crmbanner" })

export class BannerOnCrm extends BaseHandler {
    //新加一个banner
    public static async add(args: any): Promise<any> {
        const { pic, gooduuid, position, synopsis, price, title, category } = args
        validateCgi({ pic, gooduuid, position }, bannerValidator.add)
        let res = await Banner.getInstance().insertBanner({ pic, gooduuid, position, synopsis, price, title, category })
        if (res)
            return { msg: "添加成功" }
        return { msg: "添加失败" }
    }

    //删除一个banner
    public static async delete(ctx: any): Promise<any> {
        const { uuid } = ctx.params
        validateCgi({ uuid }, bannerValidator.delete)
        let res = await Banner.getInstance().deleteBanner(uuid)
        if (res)
            return { msg: "删除成功" }
        return { msg: "删除失败" }
    }

    //修改一个banner
    public static async update(args: any): Promise<any> {
        const { uuid, pic, gooduuid, position, synopsis, price, title, category } = args
        validateCgi({ uuid, pic, gooduuid, position }, bannerValidator.update)
        let res = await Banner.getInstance().updateBanner(uuid, { pic, gooduuid, position, synopsis, price, title, category })
        if (res)
            return { msg: "修改成功" }
        return { msg: "修改失败" }
    }

    //查找全部banner,量少不做分页，全部找出来
    public static async getAll(): Promise<any> {
        let res = await Banner.getInstance().findByPosition()
        return res
    }
}

/*
*1、新加一个banner
*/
router.loginHandle("post", "/add", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await BannerOnCrm.add((ctx.request as any).body)))

/*
*2、删除一个banner
*/
router.loginHandle("delete", "/:uuid", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await BannerOnCrm.delete(ctx)))

/*
*3、修改一个banner
*/
router.loginHandle('put', '/update', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await BannerOnCrm.update((ctx.request as any).body)))

/*
*4、查找全部banner
*/
router.handle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await BannerOnCrm.getAll()))