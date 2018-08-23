import assert = require("assert")
import { ReqError } from "../lib/reqerror"
export class LoginInfo {
    private uuid: string
    private key: string
    private token: string
    private login: string
    private perm: string
    private permMap?: any

    constructor(uuid: string, key: string, token: string, login: string, perm?: string) {
        [this.uuid, this.key, this.token, this.login] = [uuid, key, token, login]
        if (perm) {
            assert(typeof perm === "string")
            this.perm = perm
            this.permMap = { perm: perm }
        }
    }

    public static valueOf(s: string): LoginInfo {
        assert(typeof s === "string")

        let obj = JSON.parse(s)
        if (!obj)
            throw new ReqError("invalid LoginInfo format")

        let { uuid, key, token, login, perm } = obj

        if (perm)
            assert(typeof perm === "string")

        return new LoginInfo(uuid, key, token, login, perm)
    }

    public getUuid() { return this.uuid }
    public getKey() { return this.key }
    public getToken() { return this.token }
    public getLogin() { return this.login }
    public getPerm() { return this.perm }

    private isCommon(field: string) {
        if (!this.permMap)
            return false
        return !!(this.permMap['perm'] === field)
    }

    public isRoot() {
        return this.isCommon("root")
    }

    public isAdmin() {
        return this.isCommon("admin")
    }

    public isBusiness() {
        return this.isCommon("business")
    }

    public isController() {
        return this.isCommon("controller")
    }

    public isManager() {
        return this.isCommon("manager")
    }

}

import logger = require("winston")
import { getRedisClientAsync } from "../lib/redispool"

// import { sendError } from "../lib/response"

const [sessionDbOpt, Sessiontimeout] = [{ db: 0 }, 86400]

export class RedisLogin {
    public static async setLoginAsync(uuid: string, loginInfo: LoginInfo) {
        const content = JSON.stringify(loginInfo)
        await getRedisClientAsync(async rds => await rds.setAsync(uuid, content, "ex", Sessiontimeout), sessionDbOpt)
    }

    public static async getLoginAsync(uuid: string, token: string): Promise<any> {
        if (!uuid || !token)
            return { error: "没有登录！" }

        let s = await getRedisClientAsync(async rds => await rds.getAsync(uuid), sessionDbOpt)
        if (!s)
            return { error: "没有登录！" }

        let info = LoginInfo.valueOf(s)
        if (token !== info.getToken())
            return { error: "您的账号在其他地方登陆，请重新登陆！" }

        return { info }
    }

    public static async delLogin(uuid: string) {
        try {
            await getRedisClientAsync(async rds => rds.delAsync(uuid), sessionDbOpt)
        } catch (e) {
            logger.error("delLogin error", e.message)
        }
    }
    /*
        public static async checkLogin(req: any, res: any, next: any) {
            console.log(99999, req.cookies.token, req.cookies.uuid, req.headers.token, req.headers.uuid)
            let { token, uuid } = (req as any).cookies
            if (!token && !uuid) {
                token = (req as any).headers.token
                uuid = (req as any).headers.uuid
            }
            try {
                let [info, errMsg] = await RedisLogin.getLoginAsync(uuid, token)
                if (info) {
                    req.loginInfo = info
                    return next()
                }

                return sendError(res, new ReqError(errMsg, 401))
            } catch (e) {
                e.info(sendError, res, e)
            }
        }
        */
}
