
import { System } from "../../model/crm/system"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/crmsystem" })

export class SystemOnCrm extends BaseHandler {

    public static async getAll(): Promise<any> {
        let res = await System.getInstance().findAll()
        return res
    }

    public static async update(args: any) {
        const { name, value } = args
        let res = await System.getInstance().updateOne(name, JSON.parse(value))
        if (res)
            return { msg: "修改成功" }
        return { msg: "修改失败" }
    }
}

//查询全部的系统设置,量少不做分页
router.loginHandle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await SystemOnCrm.getAll()))

//修改一个系统设置
router.loginHandle('put', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await SystemOnCrm.update((ctx.request as any).body)))