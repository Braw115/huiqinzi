import { validateCgi } from "../../lib/validator"
import { sProgram } from "../../config/wechat"
import { appusersValidator } from "./validator"
import { getAsync } from "../../lib/request"
import { Wxusers } from "../../model/wechat/wxusers"
import { Withdraw } from "../../model/crm/withdraw"
import { RouterWrap } from "../../lib/routerwrap"
import { RedisLogin, LoginInfo } from "../../redis/logindao"
import { md5sum } from "../../lib/utils"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/appwxusers" })

export class WxusersOnApp extends BaseHandler {
    //小程序登录
    public static async login(ctx: any, args: any): Promise<any> {
        const { jscode, headurl, wxname, upuseruuid } = args
        validateCgi({ jscode }, appusersValidator.wxlogin)

        let opt = {
            url: "https://api.weixin.qq.com/sns/jscode2session?appid=" + sProgram.appid + "&secret=" + sProgram.secret + "&js_code=" + jscode + "&grant_type=authorization_code",
        }
        let openidObj = await getAsync(opt)
        let openid = JSON.parse(openidObj).openid
        if (!openid)
            return super.BadRequest("获取openid有误！")

        let duser = await Wxusers.getInstance().findByOpenid(openid)
        let store: any = { name: null, logo: null, switch: null }
        if (duser) {    //旧用户
            if (duser.deleted == 1)
                return super.Unauthorized("用户被禁用")

            if (duser.upuseruuid) {//这个用户有上级用户
                let upuser = await Wxusers.getInstance().findByPrimary(duser.upuseruuid)
                store.name = upuser.storename
                store.logo = upuser.storelogo
                store.switch = upuser.switch
                if (upuseruuid && duser.upuseruuid != upuseruuid) {
                    upuser = await Wxusers.getInstance().findByPrimary(upuseruuid)
                    store.name = upuser.storename
                    store.logo = upuser.storelogo
                    store.switch = upuser.switch
                    if (duser.uuid != upuseruuid)//前端要求的判断
                        await Wxusers.getInstance().updateWxuser(duser.uuid, { upuseruuid })
                }
            } else if (upuseruuid) {    //没有上级用户
                let upuser = await Wxusers.getInstance().findByPrimary(upuseruuid)
                store.name = upuser.storename
                store.logo = upuser.storelogo
                store.switch = upuser.switch
                if (duser.uuid != upuseruuid)//前端要求的判断
                    await Wxusers.getInstance().updateWxuser(duser.uuid, { upuseruuid })
            }

            if (wxname != duser.wxname)
                await Wxusers.getInstance().updateWxname(duser.uuid, wxname)

            if (headurl != duser.headurl)
                await Wxusers.getInstance().updateHeadurl(duser.uuid, headurl)

            let [now, uuid] = [new Date(), duser.uuid]
            let [token, key] = [md5sum(`${now.getTime()}_${Math.random()}`), md5sum(`${now.getTime()}_${Math.random()}`)]

            let cache = new LoginInfo(uuid, key, token, now.toLocaleString())
            await RedisLogin.setLoginAsync(uuid, cache)

            ctx.cookies.set("token", token, { maxAge: 90000000, httpOnly: false })
            ctx.cookies.set("uuid", uuid, { maxAge: 90000000, httpOnly: false })
            return { key, token, uuid, wxname, store }
        } else {    //新用户
            let invitecode = Math.round(Math.random()*1000000)//生成随机6位验证码
            let wxobj: any = { openid, headurl, wxname, invitecode }
            if (upuseruuid) {
                wxobj['upuseruuid'] = upuseruuid
                let upuser = await Wxusers.getInstance().findByPrimary(upuseruuid)
                store.name = upuser.storename
                store.logo = upuser.storelogo
                store.switch = upuser.switch
            }

            let user = await Wxusers.getInstance().insertWxusers(wxobj)

            let [now, uuid] = [new Date(), user.uuid]
            let [token, key] = [md5sum(`${now.getTime()}_${Math.random()}`), md5sum(`${now.getTime()}_${Math.random()}`)]

            let cache = new LoginInfo(uuid, key, token, now.toLocaleString())
            await RedisLogin.setLoginAsync(uuid, cache)

            ctx.cookies.set("token", token, { maxAge: 90000000, httpOnly: false })
            ctx.cookies.set("uuid", uuid, { maxAge: 90000000, httpOnly: false })
            return { key, token, uuid, wxname, store }
        }
    }

    public static async update(args: any): Promise<any> {
        const { useruuid, storename, logo } = args
        if (storename)
            await Wxusers.getInstance().updateWxuser(useruuid, { storename })
        if (logo)
            await Wxusers.getInstance().updateWxuser(useruuid, { storelogo: logo })

        return { msg: "修改成功" }
    }

    public static async Distribution(args: any): Promise<any> {
        const { useruuid } = args
        validateCgi({ useruuid }, appusersValidator.Distribution)

        let wxuser = await Wxusers.getInstance().findByPrimary(useruuid)
        let count = await Wxusers.getInstance().findDownUser(useruuid)
        let withdraw = await Withdraw.getInstance().findByStateAndUseruuid(useruuid, 'pending')
        wxuser.customer = count //顾客数
        wxuser.pending = withdraw   //提现中的金额
        return wxuser
    }

    public static async switch(args: any): Promise<any> {
        const { uuid } = args
        let wxuser = await Wxusers.getInstance().findByPrimary(uuid)
        let sw = wxuser.switch == true ? false : true
        await Wxusers.getInstance().updateWxuser(uuid, { switch: sw })
        return { msg: "ok" }
    }
}

/*
*1、小程序登录
*/
router.handle('post', '/login', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxusersOnApp.login(ctx, (ctx.request as any).body)))

/*
2.修改店名，logo
*/
router.handle('put', '/update', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxusersOnApp.update((ctx.request as any).body)))

/*
*3.分销后台
*/
router.loginHandle('get', '/distribution', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxusersOnApp.Distribution((ctx.request as any).query)))

/*
4.显示&关闭店名，logo
*/
router.loginHandle('put', '/switch', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxusersOnApp.switch((ctx.request as any).body)))
