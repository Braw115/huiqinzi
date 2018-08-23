import { validateCgi } from "../../lib/validator"
import { wxusersValidator } from "./validator"
import { Wxusers } from "../../model/wechat/wxusers"
import { RouterWrap } from "../../lib/routerwrap"
import { getTimeStr } from "../../lib/gettime"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/crmwxusers" })

export class WxusersOnCrm extends BaseHandler {

    public static async getAll(args: any): Promise<any> {
        const { start, length } = args
        validateCgi({ start, length }, wxusersValidator.startLength)
        let search: string = args["search[value]"]
        if (!search)
            search = ""

        let res = await Wxusers.getInstance().findAll(start, length, search)
        let recordsFiltered = await Wxusers.getInstance().getCount(search)
        res.forEach(r => {
            r.created = getTimeStr(r.created)
            r.modified = getTimeStr(r.modified)
        })
        return { wxusers: res, recordsFiltered }
    }

    //禁用&解禁
    public static async updateState(args: any): Promise<any> {
        const { uuid } = args
        validateCgi({ uuid }, wxusersValidator.uuid)
        let wxuser = await Wxusers.getInstance().findByPrimary(uuid)
        let deleted = wxuser.deleted == 0 ? 1 : 0
        let res = await Wxusers.getInstance().updateState(uuid, deleted)
        if (res)
            return { msg: "操作成功" }
        return { msg: "操作失败" }
    }

    public static async findOne(args: any): Promise<any> {
        const { useruuid } = args
        let res = await Wxusers.getInstance().findByPrimary(useruuid)
        return res
    }
}

/*
*1、查看全部的小程序用户
*/
router.loginHandle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxusersOnCrm.getAll((ctx.request as any).query)))

/*
*2、禁用&解禁小程序用户
*/
router.loginHandle('put', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxusersOnCrm.updateState((ctx.request as any).body)))

/*
*3、查看某个小程序用户的信息
*/
router.loginHandle('get', "/get", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxusersOnCrm.findOne((ctx.request as any).query)))
