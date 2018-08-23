import moment = require("moment")
import { validateCgi } from "../../lib/validator"
import { ordersValidator } from "./validator"
import { Orders } from "../../model/crm/orders"
import { Activity } from "../../model/crm/activity"
import { Logistics } from "../../model/crm/logistics"
import { Wxusers } from "../../model/wechat/wxusers"
import { System } from "../../model/crm/system"
import { RouterWrap } from "../../lib/routerwrap"
import { getOrderTracesByJson } from "../../lib/utils"
import { BaseHandler } from "../lib/basehandler"
import { LoginInfo } from "../../redis/logindao"
import { TodayIncome } from "../../model/crm/todayIncome"

export const router = new RouterWrap({ prefix: "/crmorders" })

//返佣函数
async function getRebate(uuid: string) {
    let order = await Orders.getInstance().findByPrimary(uuid)  //找到订单
    let rebate = await System.getInstance().findByName('rebate')//找到回扣比例
    let wxuser
    if(order.rebate1 && order.rebate1 != "undefined" )
        wxuser = await Wxusers.getInstance().findByPrimary(order.rebate1)//找到受益人
    if (wxuser) {
        //返佣
        await Wxusers.getInstance().updateBalance(wxuser.uuid, order.total_fee * parseFloat(rebate.value.rebate1))
        //累计收益
        await Wxusers.getInstance().updateTotalIncome(wxuser.uuid, order.total_fee * parseFloat(rebate.value.rebate1))
        //成单量+1
        await Wxusers.getInstance().updateDistributeNum(wxuser.uuid)
        //成单价+该商品售价
        await Wxusers.getInstance().updateDistributePrice(wxuser.uuid,order.total_fee)
        //今日收益  
        let date = new Date()
        let today = date.toLocaleDateString()
        let useruuid = wxuser.uuid
        let income = order.total_fee * parseFloat(rebate.value.rebate1)
        let obj ={useruuid,today,income}
        let result = await TodayIncome.getInstance().findByUserAndToday(wxuser.uuid, today)
        if(!result){//今日无收益,插入
            await TodayIncome.getInstance().insertTodayIncome(obj)
        }else{
            await TodayIncome.getInstance().updateIncome(result.uuid, order.total_fee * parseFloat(rebate.value.rebate1))
        }
        //该订单的收益
        await Orders.getInstance().updateOrder(uuid, { brokerage1: order.total_fee * parseFloat(rebate.value.rebate1) })
    }
    
}

export class OrdersOnCrm extends BaseHandler {
    //查看全部订单
    public static async findAll(ctx: any, args: any): Promise<any> {
        let { start, length, state, code } = args
        const info: LoginInfo = (ctx.request as any).loginInfo
        validateCgi({ start, length }, ordersValidator.findAll)
        let res, recordsFiltered
        if (!code)
            code = ''

        if (info.isBusiness()) {
            let uuid = info.getUuid()
            let act = await Activity.getInstance().findByBusinessUUID(uuid)
            let r = await Orders.getInstance().findByGoodUUID(start, length, state, act, code)
            res = r.orders
            recordsFiltered = r.recordsFiltered
        } else {
            /* if (state) {
                res = await Orders.getInstance().findAllOrders(start, length, { state })
                recordsFiltered = await Orders.getInstance().getCount({ state })
            } else {
                res = await Orders.getInstance().findAllOrders(start, length)
                recordsFiltered = await Orders.getInstance().getCount()
            } */
            res = await Orders.getInstance().findAllOrders(start, length, state, code)
            recordsFiltered = await Orders.getInstance().getCount(state, code)

        }

        for (let i = 0; i < res.length; i++) {
            switch (res[i].state) {
                case 'wait-pay': res[i].state = '待支付'; break;
                case 'wait-use': res[i].state = '待使用'; break;
                case 'wait-send': res[i].state = '待发货'; break;
                case 'shipped': res[i].state = '已发货'; break;
                case 'used': res[i].state = '已使用'; break;
                case 'wait-join': res[i].state = '待组团'; break;
                default: break;
            }
        }

        return { orders: res, recordsFiltered }

    }

    //发货(实体商品)，分销机制返佣
    public static async updateOrder(args: any): Promise<any> {
        const { uuid, logisticscode, shippercode } = args
        validateCgi({ uuid, logisticscode, shippercode }, ordersValidator.update)

        await getRebate(uuid)  //返佣

        await getOrderTracesByJson(shippercode, logisticscode, uuid)    //注册物流

        let lo = {
            logisticscode: logisticscode,
            shippercode: shippercode,
            ordercode: uuid
        }
        await Logistics.getInstance().insertLogistics(lo)

        let res = await Orders.getInstance().updateOrder(uuid, { logisticscode, shippercode, state: 'shipped' })
        if (res)
            return { msg: "更新成功" }
        return { msg: "更新失败" }
    }
    //消费，分销机制返佣
    public static async updateOrder2(ctx: any, args: any): Promise<any> {
        const { uuid } = args
        validateCgi({ uuid }, ordersValidator.update2)
        const info: LoginInfo = (ctx.request as any).loginInfo
        if (!info.isBusiness())
            return super.Unauthorized('需要商家权限')
        let finishdate = moment().format("YYYY-MM-DD")//订单完成时间
        let res = await Orders.getInstance().updateOrder(uuid, { state: 'used', code: '' , finishdate })//改为已使用并清空兑换码
        getRebate(uuid)  //返佣
        if (res)
            return { msg: "更新成功" }
        return { msg: "更新失败" }
    }

    //按预留信息查询订单
    public static async findBySearch(args: any): Promise<any> {
        let search: string = args["search[value]"]
        validateCgi({ search }, ordersValidator.search)

        let res = await Orders.getInstance().findBySearch(search)
        return res
    }

}

/*
*1、查看全部订单
*/
router.loginHandle("get", "/findAll", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnCrm.findAll(ctx, (ctx.request as any).query)))

/*
*2、发货
*/
router.loginHandle("put", "/update", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnCrm.updateOrder((ctx.request as any).body)))

/*
*3、根据兑换码查询
*/
router.loginHandle("get", "/find", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnCrm.findBySearch((ctx.request as any).query)))

/*
*4、消费，把订单改为已使用，并清空兑换码，释放兑换码，给后面的订单使用，因为code in [10000000,99999999]
*/
router.loginHandle('put', '/consume', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnCrm.updateOrder2(ctx, (ctx.request as any).body)))

