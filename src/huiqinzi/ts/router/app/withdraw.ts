
import { validateCgi } from "../../lib/validator"
import { withdrawValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { Withdraw } from "../../model/crm/withdraw"
import { getTimeStr } from "../../lib/gettime"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/appwithdraw" })

export class WithdrawOnApp extends BaseHandler {
    public static async createWithdraw(args: any): Promise<any> {
        const { useruuid, amount, remark } = args
        validateCgi({ useruuid, amount, remark }, withdrawValidator.add)

        await Withdraw.getInstance().insertWithdraw({ useruuid, amount, remark, state: 'pending' })
        return { msg: '申请成功' }
    }

    public static async getAll(args: any): Promise<any> {
        const { useruuid } = args
        validateCgi({ useruuid }, withdrawValidator.get)
        let res = await Withdraw.getInstance().findByUseruuid(useruuid)
        for (let i = 0; i < res.length; i++) {
            res[i].created = getTimeStr(res[i].created)
            switch (res[i].state) {
                case 'pending': res[i].state = '待受理'; break;
                case 'accepted': res[i].state = '已受理'; break;
                case 'refused': res[i].state = '已拒绝'; break;
                default: break;
            }
        }
        return res
    }
}

/*
*1.申请提现
*/
router.loginHandle('post', '/apply', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WithdrawOnApp.createWithdraw((ctx.request as any).body)))

/*
*2、查看我的提现记录
*/
router.loginHandle('get', '/notes', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WithdrawOnApp.getAll((ctx.request as any).query)))