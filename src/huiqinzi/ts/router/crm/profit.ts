import { validateCgi } from "../../lib/validator"
import { profitValidator } from "./validator"
import { Orders } from "../../model/crm/orders"
import { Goods } from "../../model/crm/goods"
import { Activity } from "../../model/crm/activity"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/crmprofit" })

export class ProfitOnCrm extends BaseHandler {
    public static async getAll(args: any): Promise<any> {
        const { start, length, category, startdate, enddate } = args
        let orders, goods, activitys
        if (category) { //by分类
            validateCgi({ uuid: category }, profitValidator.category)
            goods = await Goods.getInstance().findByCategory(category)
            let arr = new Array()
            if (goods.length) {//选的是实体商品的分类
                for (let i = 0; i < goods.length; i++) {
                    arr.push(goods[i].uuid)
                }
                orders = await Orders.getInstance().findByGooduuids(arr, start, length)
            } else {//选的是活动分类
                activitys = await Activity.getInstance().findByCatagory(category)
                for (let i = 0; i < activitys.length; i++) {
                    arr.push(activitys[i].uuid)
                }
                orders = await Orders.getInstance().findByGooduuids(arr, start, length)
            }
            return orders
        } else if (startdate && enddate) {  //by时间
            validateCgi({ startdate, enddate }, profitValidator.date)
            orders = await Orders.getInstance().findByTimeRange(new Date(startdate), new Date(enddate), start, length)
            return orders
        } else {
            return super.NotAcceptable('参数有误')
        }
    }
}

/*
*1、查询利润数据,by分类，时间
*/
router.loginHandle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ProfitOnCrm.getAll((ctx.request as any).query)))
