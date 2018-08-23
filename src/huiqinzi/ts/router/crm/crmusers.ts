
import { validateCgi } from "../../lib/validator"
import { crmusersValidator } from "./validator"
import { Crmusers } from "../../model/crm/crmusers"
import { getTimeStr } from "../../lib/gettime"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"
import { checkPassword, md5sum } from "../../lib/utils"
import { RedisLogin, LoginInfo } from "../../redis/logindao"

export const router = new RouterWrap({ prefix: "/crmusers" })

export class CrmUserOnCrm extends BaseHandler {
    //crm登录
    public static async login(ctx: any, args: any): Promise<any> {
        const { username, password } = args
        validateCgi({ username, password }, crmusersValidator.login)

        let user = await Crmusers.getInstance().findByUsername(username)
        if (!user || user.deleted)
            return super.NotFound("该用户不存在")
        if (user.state == 'off')
            return super.Forbidden("用户已禁用")

        checkPassword(password, user.password)

        let [now, uuid] = [new Date(), user.uuid]
        let [token, key] = [md5sum(`${now.getTime()}_${Math.random()}`), md5sum(`${now.getTime()}_${Math.random()}`)]

        /* 缓存用户登陆信息到redis：key=id, value = {key:key, token:token, login:time, perm:perm}，
                key是双方协商的密钥，token是临时访问令牌, perm是权限列表 */
        let cache = new LoginInfo(uuid, key, token, now.toLocaleString(), user.perm)
        await RedisLogin.setLoginAsync(uuid, cache)

        ctx.cookies.set("perm", user.perm, { maxAge: 90000000, httpOnly: false })
        ctx.cookies.set("username", encodeURIComponent(user.username), { maxAge: 90000000, httpOnly: false })
        ctx.cookies.set("token", token, { maxAge: 90000000, httpOnly: false })
        ctx.cookies.set("uuid", uuid, { maxAge: 90000000, httpOnly: false })
        return { key, uuid, token, username: user.username, perm: user.perm }
    }

    //crm登出
    public static async logout(ctx: any): Promise<any> {
        let loginInfo: LoginInfo = super.getLoginInfo(ctx)

        RedisLogin.delLogin(loginInfo.getUuid())  // 不等待
        return { msg: "已登出！" }
    }

    //添加crm用户
    public static async adduser(ctx: any, args: any): Promise<any> {
        let { username, password, description, state, perm } = args
        let { phone, email, realname, address, remark } = args

        const info: LoginInfo = (ctx.request as any).loginInfo
        if ((info.isAdmin() && perm != 'business') || info.isBusiness())
            return super.Unauthorized("没有权限")

        let obj = { username, password, description, state, perm, phone, email, realname, address, remark }

        validateCgi(obj, crmusersValidator.create)

        let user = await Crmusers.getInstance().findByUsernameNotDel(obj.username);
        if (!!user)
            return super.NotAcceptable("该用户名已经存在！")

        await Crmusers.getInstance().insertUsers(obj)
        return { msg: "添加成功！" }
    }

    //显示crm用户列表
    public static async crmuserlist(args: any): Promise<any> {
        const { start, length, draw } = args
        let search: String = args["search[value]"]
        validateCgi({ start, length }, crmusersValidator.startLength)
        if (!search)
            search = ""

        let crmusers = await Crmusers.getInstance().findUserInfo(start, length, search)
        crmusers.res.forEach(r => {
            delete r.password
            r.created = getTimeStr(r.created)
        })
        return { res: crmusers.res, recordsFiltered: crmusers.recordsFiltered, draw }
    }

    //修改crm用户信息
    public static async updatecrmuser(ctx: any, args: any): Promise<any> {
        const { uuid } = ctx.params
        let { username, description, phone } = args
        let { email, realname, address, remark } = args

        validateCgi({ uuid, username, description, phone, email, realname, address }, crmusersValidator.updateCrmUser)
        let obj = { username, description, phone, email, realname, address, remark }

        let duser = await Crmusers.getInstance().findByPrimary(uuid)
        if (!duser)
            return super.NotFound("用户不存在！")

        const info: LoginInfo = (ctx.request as any).loginInfo
        if ((info.isAdmin() && duser.perm != 'business') || info.isBusiness())
            return super.Unauthorized("没有权限！")

        if (duser.username !== obj.username) {
            let user = await Crmusers.getInstance().findByUsernameNotDel(obj.username);
            if (!!user) {
                return super.NotAcceptable("该用户名已经存在")
            }
        }
        await Crmusers.getInstance().updateCrmuser(obj, uuid)
        return { msg: "修改成功" }
    }

    //禁用&启用
    public static async updatestate(ctx: any): Promise<any> {
        const { uuid } = ctx.params
        const info: LoginInfo = (ctx.request as any).loginInfo
        if (!info.isRoot())
            return super.Unauthorized("没有权限")

        let res = await Crmusers.getInstance().findByPrimary(uuid)
        if (!res)
            return super.NotFound("用户不存在！")

        let state = res.state == 'on' ? 'off' : 'on'
        await Crmusers.getInstance().resetState(uuid, state)
        return { msg: "操作成功" }
    }

    //修改密码
    public static async updatepassword(args: any): Promise<any> {
        const { uuid, password, oldpassword } = args
        validateCgi({ uuid, password }, crmusersValidator.setPassword)

        let user = await Crmusers.getInstance().findByPrimary(uuid)
        if (!user)
            return super.NotFound("用户不存在！")

        if (user.password != oldpassword)
            return super.NotAcceptable("原密码输入有误！")

        if (user.password === password)
            return super.NotAcceptable("新密码不能与旧密码一致")

        await Crmusers.getInstance().resetPassword(uuid, password)
        return { msg: "修改成功" }
    }
    //删除用户
    public static async deleteUser(ctx: any): Promise<any> {
        const { uuid } = ctx.params
        const info: LoginInfo = (ctx.request as any).loginInfo
        if (!info.isRoot())
            return super.Unauthorized("没有权限")

        validateCgi({ uuid }, crmusersValidator.uuid)
        let res = await Crmusers.getInstance().findByPrimary(uuid)
        if (!res)
            return super.NotFound("用户不存在！")

        await Crmusers.getInstance().deleteUser(uuid)
        return { msg: "删除成功" }
    }

    public static async getAllBusiness(): Promise<any> {
        let res = await Crmusers.getInstance().findAllBusiness()
        return res
    }
}

/**
 * 1、用户登录
 */
router.handle("post", "/login", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.login(ctx, (ctx.request as any).body)))

/**
* 2、用户登出
*/
router.loginHandle('post', "/logout", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.logout(ctx)))

/*
* 3、添加用户
*/
router.loginHandle("post", "/crm", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.adduser(ctx, (ctx.request as any).body)))

/*
* 4、显示crm用户列表
*/
router.loginHandle("get", "/users", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.crmuserlist((ctx.request as any).query)))

/*
* 5、修改crm用户
*/
router.loginHandle("put", "/update/:uuid", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.updatecrmuser(ctx, (ctx.request as any).body)))

/*
* 6、禁用&启用
*/
router.loginHandle('put', '/state/:uuid', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.updatestate(ctx)))

/*
* 7、修改密码
*/
router.loginHandle('put', '/password', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.updatepassword((ctx.request as any).body)))

/*
* 8、删除crm用户
*/
router.loginHandle('delete', '/:uuid', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.deleteUser(ctx)))

/*
*9、查看全部的商家用户
*/
router.loginHandle('get', '/business', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await CrmUserOnCrm.getAllBusiness()))
