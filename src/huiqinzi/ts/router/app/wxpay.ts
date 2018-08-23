import { validateCgi } from "../../lib/validator"
import { wxpayValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { Orders } from "../../model/crm/orders"
import { Groups } from "../../model/wechat/groups"
import { Goods } from "../../model/crm/goods"
import { randomInt } from "../../lib/utils"
import { genPrePayUnifiedOrderh5, validateNotify, getWebParamh5 } from "../../lib/wxpay"
import { wxPayOpt, wxPaymentOpt } from "../../config/wxpay"
import { Wxtrade } from "../../model/wechat/wxtrade"
import { Wxusers } from "../../model/wechat/wxusers"
import { BaseHandler } from "../lib/basehandler"
import { Activity } from "../../model/crm/activity"
import { sendSms } from "../../lib/sms"
import * as moment from "moment"


export const router = new RouterWrap({ prefix: "/appwxpay" })

export class WxpayOnApp extends BaseHandler {

    public static async pay(args: any): Promise<any> {
        const { orderuuid, useruuid } = args
        validateCgi({ orderuuid, useruuid }, wxpayValidator.pay)

        let wxuser = await Wxusers.getInstance().findByPrimary(useruuid)
        let order = await Orders.getInstance().findByPrimary(orderuuid)
        if (!order)
            return super.NotFound("不存在订单！")

        let good = await Goods.getInstance().findByPrimary(order.gooduuid)
        if (good && good.inventory < order.amount)
            return super.NotAcceptable('库存数量不足')

        let act = await Activity.getInstance().findByPrimary(order.gooduuid)
        if (act && act.opentime && act.closetime) {
            let now = moment().format('YYYY-MM-DD HH:mm:ss')
            if (now > act.closetime || now < act.opentime)
                return super.NotAcceptable('活动已结束或者没开始')
        }

        if (order.groupuuid) {
            let group = await Groups.getInstance().findByPrimary(order.groupuuid)
            if (group.useruuids.length >= act.amount)
                return super.NotAcceptable('该团已经满员')
        }

        // 请求生成订单
        let wxorder = await genPrePayUnifiedOrderh5({
            body: "惠亲子-购买商品",
            total_fee: order.total_fee * 100,
            spbill_create_ip: "192.168.0.6",
            trade: "JSAPI",
            openid: wxuser.openid
        }, wxPaymentOpt)

        //插入数据库
        let exist = await Wxtrade.getInstance().findByPrimary(orderuuid)
        if (!!exist) {
            await Wxtrade.getInstance().deleteByPrimary(orderuuid)
        }
        wxorder["uuid"] = orderuuid
        await Wxtrade.getInstance().insertNewTrade(wxorder)
        await Orders.getInstance().updateTradeNo(wxorder["out_trade_no"], orderuuid)

        let timestamp = "" + new Date().getTime()
        
        let webParam = await getWebParamh5(wxorder.prepay_id, wxPaymentOpt.appid, timestamp, wxPaymentOpt.key, wxPaymentOpt.mch_id)
        return { param: webParam }
    }

    // 读取POST的body
    public static async readRawBody(req: any): Promise<any> {
        return new Promise((resove, reject) => {
            let arr = new Array<string>()
            req.on('data', function (chunk: any) {
                arr.push(chunk.toString())
            })

            req.on('end', function (chunk: any) {
                if (chunk) {
                    arr.push(chunk.toString())
                }
                resove(arr.join())
            })

            req.on("error", function (e: any) {
                reject(e)
            })
        })
    }

    //一键开团
    public static async createGroup(order: any) {
        let user = await Wxusers.getInstance().findByPrimary(order.useruuid)
        let obj = {
            activityuuid: order.activityuuid,
            useruuids: [order.useruuid],
            state: 'processing',
            pic: user.headurl
        }
        let group = await Groups.getInstance().insertGroup(obj)
        await Orders.getInstance().updateOrder(order.uuid, { groupuuid: group.uuid, state: 'wait-join' })//开团也要及时记录他的团uuid，后面批量更新订单
    }

    //加入一个团
    public static async joinGroup(order: any) {
        let group = await Groups.getInstance().findByPrimary(order.groupuuid)
        group.useruuids.push(order.useruuid)
        let act = await Activity.getInstance().findByPrimary(group.activityuuid)
        await Orders.getInstance().updateOrder(order.uuid, { state: 'wait-join' })
        if (act.amount == group.useruuids.length) {
            group.state = 'success'  //达到人数就把状态改为组团成功

            let orders = await Orders.getInstance().findByGroupUUID(group.uuid)//查找已支付的所有参团订单
            for (let i = 0; i < orders.length; i++) {   //给订单派发兑换码
                let act = await Activity.getInstance().findByPrimary(orders[i].activityuuid)
                if (act.substance) {//实体商品
                    await Orders.getInstance().updateOrder(orders[i].uuid, { state: 'wait-send' })
                } else {
                    await WxpayOnApp.Distribute(orders[i])
                }
            }

        } 
           
        await Groups.getInstance().updateGroup(group.uuid, group)
    }

    //给某订单派发兑换码
    public static async Distribute(order: any) {
        while (1) {
            let random = '' + randomInt(10000000, 99999999)
            let or = await Orders.getInstance().findByCode(random)
            if (or == undefined || or.length == 0) {    //这个随机码不存在，可以用
                await Orders.getInstance().updateOrder(order.uuid, { state: 'wait-use', code: random })
                let arr = new Array()
                let act = await Activity.getInstance().findByPrimary(order.gooduuid)
                arr = [act.title, random]
                await sendSms([order.phone], arr) //发送短信
                break
            } else {    //随机码存在，重新生成吧
                continue
            }
        }
    }

    public static async notify(args: any): Promise<any> {
        let body = await WxpayOnApp.readRawBody(args.req)
        let obj = await validateNotify(body, wxPayOpt)
        let out_trade_no = obj.out_trade_no
        let trade = await Wxtrade.getInstance().findByTradeNo(out_trade_no)
        if (trade.state != null) {
            return `<xml> <return_code><![CDATA[SUCCESS]]></return_code> <return_msg><![CDATA[OK]]></return_msg> </xml>`
        }

        Wxtrade.getInstance().setWxTradeState(out_trade_no, "fin")
        let order = await Orders.getInstance().findByPrimary(trade.uuid)

        if (order.address && order.address !== "" && !order.activityuuid && !order.groupuuid) {//实体商品
            Orders.getInstance().updateOrder(trade.uuid, { state: 'wait-send' })//改为待发货
            Activity.getInstance().updateSoldInventory(order.gooduuid, order.amount)//更新库存和已售量
        } else if (order.activityuuid || order.groupuuid) {
            Activity.getInstance().updateSold(order.gooduuid, order.amount) //更新已售量
            if (order.activityuuid && !order.groupuuid) {   //一键开团
                WxpayOnApp.createGroup(order)
            } else if (order.activityuuid && order.groupuuid) {   //参团
                WxpayOnApp.joinGroup(order)
            }
        } else {
            WxpayOnApp.Distribute(order)   //发放兑换码
            Activity.getInstance().updateSold(order.gooduuid, order.amount) //更新已售量
        }

        return `<xml> <return_code><![CDATA[SUCCESS]]></return_code> <return_msg><![CDATA[OK]]></return_msg> </xml>`
    }
}

/*
*1、支付
*/
router.loginHandle('post', '/add', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxpayOnApp.pay((ctx.request as any).body)))

/*
*2、微信回调
*/
router.handle('post', '/notify', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await WxpayOnApp.notify(ctx)))