import { validateCgi } from "../../lib/validator"
import { withdrawValidator } from "./validator"
import { Withdraw } from "../../model/crm/withdraw"
import { Wxusers } from "../../model/wechat/wxusers"
import { RouterWrap } from "../../lib/routerwrap"
import { getTimeStr } from "../../lib/gettime"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/crmwithdraw" })

export class WithdrawOnCrm extends BaseHandler {
    public static async getAll(args: any): Promise<any> {
        const { start, length, state } = args
        validateCgi({ start, length }, withdrawValidator.get)

        let res = await Withdraw.getInstance().findAll(state ? state : undefined, start, length)
        let recordsFiltered = await Withdraw.getInstance().getCount(state ? state : undefined)
        for (let i = 0; i < res.length; i++) {
            res[i].created = getTimeStr(res[i].created)
            switch (res[i].state) {
                case 'pending': res[i].state = '待受理'; break;
                case 'accepted': res[i].state = '已受理'; break;
                case 'refused': res[i].state = '已拒绝'; break;
                default: break;
            }
        }
        return { withdraw: res, recordsFiltered }
    }

    public static async deal(args: any): Promise<any> {
        const { uuid, state } = args
        validateCgi({ uuid, state }, withdrawValidator.deal)

        let withdraw = await Withdraw.getInstance().findByPrimary(uuid)
        let wxuser = await Wxusers.getInstance().findByPrimary(withdraw.useruuid)
        if (wxuser.balance < withdraw.amount) {
            await Withdraw.getInstance().updateWithdraw(uuid, { state: 'refused' })
            return super.NotAcceptable('余额不足,已拒绝')
        }

        if (state == 'accepted') {
            await Wxusers.getInstance().updateBalanceAndWithdraw(withdraw.useruuid, withdraw.amount)
        }

        await Withdraw.getInstance().updateWithdraw(uuid, { state })
        return { msg: "处理成功，" + state }
    }
}

/*
*1、查看全部的提现记录
*/
router.loginHandle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WithdrawOnCrm.getAll((ctx.request as any).query)))

/*
*2.受理&拒绝
*/
router.loginHandle('put', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WithdrawOnCrm.deal((ctx.request as any).body)))