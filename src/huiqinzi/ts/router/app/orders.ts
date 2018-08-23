import { validateCgi } from "../../lib/validator"
import { goodsValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { Goods } from "../../model/crm/goods"
import { Activity } from "../../model/crm/activity"
import { Orders } from "../../model/crm/orders"
import { getTimeStr, getWeek } from "../../lib/gettime"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/apporders" })

export class OrdersOnApp extends BaseHandler {
    public static async createOrder(args: any): Promise<any> {
        let { useruuid, activityuuid, specification, amount, address,rebate1 } = args
        validateCgi({ useruuid, activityuuid, amount, address }, goodsValidator.buyGoods)

        specification = JSON.parse(specification)
        let good = await Activity.getInstance().findByPrimary(activityuuid)
        if (!good)
            return super.NotAcceptable("活动已下架")
        let total_fee = OrdersOnApp.getTotalFee(specification, good.pricetag, amount)
        if (!total_fee) {
            return super.NotAcceptable('库存不足')
        }

        let realtotal_fee = OrdersOnApp.getaRealTotalFee(specification, good.pricetag, amount)

        await Activity.getInstance().updateActivity(activityuuid, { pricetag: total_fee.pricetag })//更新库存
        let obj
        if(rebate1){//分销商品订单
            obj = {
                useruuid,
                goods: specification,
                gooduuid: activityuuid,
                total_fee: total_fee.total_fee,
                realtotal_fee: realtotal_fee.total_fee,
                address,
                amount,
                rebate1,//分销订单的受益人uuid
                state: 'wait-pay',
                distributeorder:'1'//表示此订单为分销订单
            }
        }else{
            obj = {
                useruuid,
                goods: specification,
                gooduuid: activityuuid,
                total_fee: total_fee.total_fee,
                realtotal_fee: realtotal_fee.total_fee,
                address,
                amount,
                state: 'wait-pay'
            }
        }
        
        let res = await Orders.getInstance().insertOrder(obj)
        return { msg: "创建订单成功", order: res }
    }
    //创建活动商品订单
    public static async createOrder2(args: any): Promise<any> {
        let { useruuid, activityuuid, specification, amount, contact, phone, remark, rebate1 } = args
        validateCgi({ useruuid, activityuuid, amount, contact, phone, remark ,rebate1}, goodsValidator.buyActivity)
        
        let act:any = await Activity.getInstance().findByUuid(activityuuid)
        let goodsinfo = JSON.stringify(act)
        let now = new Date().getTime()
        let endtime = new Date(act.closetime).getTime()
        if (now > endtime)
            return super.NotAcceptable('活动已经结束')

        let week = getWeek()
        let state = false
        let acttime = new Array()
        acttime = act.acttime
        if (acttime)
            acttime.forEach(r => {
                if (r == week)
                    state = true
            })
        
        let total_fee 
        let realtotal_fee 
        //没有规格的商品
        if(!specification){
            total_fee = act.price * amount
            realtotal_fee= act.realprice * amount
        }else{
            let fee
            specification = JSON.parse(specification)
            if (state) {
                fee   = OrdersOnApp.getactTotalFee(specification, act.pricetag, amount)
                total_fee = fee.total_fee 
            } else {
                fee = OrdersOnApp.getTotalFee(specification, act.pricetag, amount)
                total_fee = fee.total_fee
            }
    
            if (!fee) {
                return super.NotAcceptable('库存不足')
            }
            let  realFee = OrdersOnApp.getaRealTotalFee(specification, act.pricetag, amount)
            realtotal_fee = realFee.total_fee
            await Activity.getInstance().updateActivity(activityuuid, { pricetag: fee.pricetag })//更新库存

        }
       

        let obj: any
        if(rebate1 && rebate1 != "undefined" && rebate1 != useruuid ) {//分销商品订单
            obj = {
                    useruuid,
                    goods: specification,
                    gooduuid: activityuuid,
                    name: contact,
                    phone,
                    remark,
                    total_fee,
                    realtotal_fee,
                    amount,
                    rebate1,//分销订单的受益人uuid
                    state: 'wait-pay',
                    distributeorder:'1',//表示此订单为分销订单
                    goodsinfo

            }
        }else{
            obj = {
                useruuid,
                goods: specification,
                gooduuid: activityuuid,
                name: contact,
                phone,
                remark,
                total_fee,
                realtotal_fee,
                amount,
                state: 'wait-pay',
                goodsinfo
            }
        }
        // if (ext)
        //     obj['ext'] = JSON.parse(ext)

        let res = await Orders.getInstance().insertOrder(obj)
        return { msg: "创建订单成功", order: res }
    }

    public static async getAllOrders(args: any): Promise<any> {
        const { useruuid, state, start, length,} = args
        let res = await Orders.getInstance().findByUseruuid(start, length, useruuid, state)
        for (let i = 0; i < res.length; i++) {
            res[i].created = getTimeStr(res[i].created)
            let act = await Activity.getInstance().findByUuid(res[i].gooduuid)
            if (!act)
                act = await Goods.getInstance().findByPrimary(res[i].gooduuid)
            res[i]['act'] = act
        }
        let recordsFiltered = res.length
        return {res, recordsFiltered}
    }
    //根据受益人查找返佣订单
    public static async getRebateOrders(args: any): Promise<any> {
        const { useruuid } = args
        let res = await Orders.getInstance().findByRebate(useruuid)
        for (let i = 0; i < res.length; i++) {
            res[i].created = getTimeStr(res[i].created)
            let act = await Activity.getInstance().findByPrimary(res[i].gooduuid)
            if (!act)
                act = await Goods.getInstance().findByPrimary(res[i].gooduuid)
            res[i]['act'] = act
            res[i]['brokerage'] = useruuid == res[i].rebate1 ? res[i].brokerage1 : res[i].brokerage2
        }
        return res
    }

    public static async deleteOrder(args: any): Promise<any> {
        const { orderuuid } = args
        let order = await Orders.getInstance().findByPrimary(orderuuid)
        let act = await Activity.getInstance().findByPrimary(order.gooduuid)
        if (order.state === "wait-pay" && !(act.pricetag) ) {
            let actprice = OrdersOnApp.updateAmount(order.goods, act.pricetag, order.amount)
            await Activity.getInstance().updateActivity(order.gooduuid, { pricetag: actprice.pricetag })
        }
        await Orders.getInstance().deleteOrder(orderuuid)
        return { msg: "删除成功" }
    }

    //根据规格获得价格,和库存
    public static getTotalFee(specification: any, pricetag: any, amount: number): any {
        for (let i = 0; i < pricetag.length; i++) {
            for (let j = 0; j < specification.length; j++) {

                if (specification[j].name == pricetag[i].name && specification[j].type == pricetag[i].type) {

                    if (pricetag[i].data) {
                        pricetag[i].data = OrdersOnApp.getTotalFee(pricetag[i].data, specification, amount)
                        return pricetag
                    } else {
                        if (pricetag[i].stock != undefined && pricetag[i].stock < amount) {
                            return undefined
                        }
                        if (pricetag[i].stock)
                            pricetag[i].stock = pricetag[i].stock - amount
                        return { pricetag, total_fee: parseFloat(pricetag[i].price) * amount }
                    }
                }
            }
        }
    }
    //获得活动价
    public static getactTotalFee(specification: any, pricetag: any, amount: number): any {
        for (let i = 0; i < pricetag.length; i++) {
            for (let j = 0; j < specification.length; j++) {

                if (specification[j].name == pricetag[i].name && specification[j].type == pricetag[i].type) {

                    if (pricetag[i].data) {
                        pricetag[i].data = OrdersOnApp.getactTotalFee(pricetag[i].data, specification, amount)
                        return pricetag
                    } else {
                        if (pricetag[i].stock != undefined && pricetag[i].stock < amount) {
                            return undefined
                        }
                        if (pricetag[i].stock)
                            pricetag[i].stock = pricetag[i].stock - amount
                        return { pricetag, total_fee: parseFloat(pricetag[i].actprice) * amount }
                    }
                }
            }
        }
    }

    //获得团购价
    public static getGroupTotalFee(specification: any, pricetag: any, amount: number): any {
        for (let i = 0; i < pricetag.length; i++) {
            for (let j = 0; j < specification.length; j++) {

                if (specification[j].name == pricetag[i].name && specification[j].type == pricetag[i].type) {

                    if (pricetag[i].data) {
                        pricetag[i].data = OrdersOnApp.getactTotalFee(pricetag[i].data, specification, amount)
                        return pricetag
                    } else {
                        if (pricetag[i].stock != undefined && pricetag[i].stock < amount) {
                            return undefined
                        }
                        if (pricetag[i].stock)
                            pricetag[i].stock = pricetag[i].stock - amount
                        return { pricetag, total_fee: parseFloat(pricetag[i].groupprice) * amount }
                    }
                }
            }
        }
    }
    //主要用于删除未支付的订单之后更新库存
    public static updateAmount(specification: any, pricetag: any, amount: number): any {
        for (let i = 0; i < pricetag.length; i++) {
            for (let j = 0; j < specification.length; j++) {

                if (specification[j].name == pricetag[i].name && specification[j].type == pricetag[i].type) {

                    if (pricetag[i].data) {
                        pricetag[i].data = OrdersOnApp.getactTotalFee(pricetag[i].data, specification, amount)
                        return pricetag
                    } else {
                        if (pricetag[i].stock != undefined && pricetag[i].stock < amount) {
                            return undefined
                        }
                        if (pricetag[i].stock)
                            pricetag[i].stock = pricetag[i].stock + amount
                        return { pricetag }
                    }
                }
            }
        }
    }

    public static getaRealTotalFee(specification: any, pricetag: any, amount: number): any {
        for (let i = 0; i < pricetag.length; i++) {
            for (let j = 0; j < specification.length; j++) {

                if (specification[j].name == pricetag[i].name && specification[j].type == pricetag[i].type) {

                    if (pricetag[i].data) {
                        pricetag[i].data = OrdersOnApp.getaRealTotalFee(pricetag[i].data, specification, amount)
                        return pricetag
                    } else {
                        if (pricetag[i].stock != undefined && pricetag[i].stock < amount) {
                            return undefined
                        }
                        return { pricetag, total_fee: parseFloat(pricetag[i].realprice) * amount }
                    }
                }
            }
        }
    }

    public static async getOrdersInfo(params: any): Promise<any> {
        const { orderuuid } = params
        let res = await Orders.getInstance().findByPrimary(orderuuid)
        return res
    }
}

/*
*1、生成订单，实体商品
*/
router.loginHandle('post', '/goods', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnApp.createOrder((ctx.request as any).body)))

/*
*2、生成订单，活动商品（不包括拼团的）
*/
router.loginHandle('post', '/act', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnApp.createOrder2((ctx.request as any).body)))

/*
*3、查看自己的全部订单
*/
router.loginHandle('get', '/self', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnApp.getAllOrders((ctx.request as any).query)))

/*
*4、删除订单
*/
router.loginHandle('delete', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnApp.deleteOrder((ctx.request as any).body)))

/*
*5、获得返佣的订单
*/
router.loginHandle('get', '/rebate', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnApp.getRebateOrders((ctx.request as any).query)))

/*
*5、获得返佣的订单
*/
router.loginHandle('get', '/:uuid', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await OrdersOnApp.getOrdersInfo(ctx.params)))
