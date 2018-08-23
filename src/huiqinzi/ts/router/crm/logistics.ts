
import { Logistics } from "../../model/crm/logistics"
import { Shipper } from "../../model/crm/shipper"
import { RouterWrap } from "../../lib/routerwrap"
import { logisticsReturn } from "../../lib/utils"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/crmlogistics" })

export class LogisticsOnCrm extends BaseHandler {

    public static async updateTrace(args: any): Promise<any> {
        let result = args 
        let logistics = JSON.parse(result.RequestData).Data
        for (let i = 0; i < logistics.length; i++) {
            let logistic = await Logistics.getInstance().getByCode(logistics[i].ShipperCode, logistics[i].LogisticCode)
            if (logistic) {
                await Logistics.getInstance().updateTraces(logistics[i].ShipperCode, logistics[i].LogisticCode, logistics[i].Traces)
            } else {
                let lo = {
                    logisticscode: logistics[i].LogisticCode,
                    shippercode: logistics[i].ShipperCode,
                    traces: logistics[i].Traces
                }
                await Logistics.getInstance().insertLogistics(lo)
            }
        }
        return logisticsReturn()
    }

    public static async getShipper(): Promise<any> {
        let res = await Shipper.getInstance().getShipper()
        return res
    }

    public static async getTrace(args: any): Promise<any> {
        let { orderuuid } = args
        let res = await Logistics.getInstance().getByOrderUuid(orderuuid)
        return res
    }

    public static async getShipperName(args: any): Promise<any> {
        let { shippercode } = args
        let res = await Shipper.getInstance().getShipperName(shippercode)
        return res
    }
}

/*
*1、物流通知，自动触发
*/
router.handle('all', '/updatetrace', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await LogisticsOnCrm.updateTrace((ctx.request as any).body)))

/*
*2、查找全部的物流公司
*/
router.loginHandle('get', '/shipper', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await LogisticsOnCrm.getShipper()))

/*
*3、查找某个订单的物流信息
*/
router.loginHandle('get', '/getTrace', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await LogisticsOnCrm.getTrace((ctx.request as any).query)))

/*
*4、根据快递公司代码查找快递公司名
*/
router.loginHandle('get', '/bycode', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await LogisticsOnCrm.getShipperName((ctx.request as any).query)))

