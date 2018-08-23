import { validateCgi } from "../../lib/validator"
import { addressValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { Address } from "../../model/wechat/address"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/appaddress" })

export class AddressOnApp extends BaseHandler {
    public static async newAddress(args: any): Promise<any> {
        let { useruuid, address, contact, phone, defaul } = args

        let obj = { useruuid, address, contact, phone, defaul }
        validateCgi(obj, addressValidator.newAddress)
        let count = await Address.getInstance().getCount(useruuid)
        if (count < 5) {
            if (count == 0) {
                obj.defaul = "yes"
            }
            if (defaul === "yes")
                await Address.getInstance().updatedefaul(useruuid, "no")
            await Address.getInstance().createAddress(obj)
            return { msg: "新增成功" }
        } else {
            return { msg: "地址不能超过5个" }
        }
    }

    public static async delAddress(args: any): Promise<any> {
        let { addressuuid } = args
        validateCgi({ addressuuid }, addressValidator.deleteAddress)

        await Address.getInstance().deleteAddress(addressuuid)
        return { msg: "删除成功" }
    }

    public static async updateAddress(args: any): Promise<any> {
        let { useruuid, addressuuid, address, contact, phone, defaul } = args
        validateCgi({ addressuuid, address, contact, phone, defaul }, addressValidator.updateAddress)
        let obj = { address, contact, phone, defaul }
        if (defaul === "yes")
            await Address.getInstance().updatedefaul(useruuid, "no")

        await Address.getInstance().updateAddress(addressuuid, obj)
        return { msg: "修改成功" }
    }

    public static async findAllAddress(args: any): Promise<any> {
        let { useruuid } = args
        validateCgi({ useruuid }, addressValidator.findAddress)
        return await Address.getInstance().findByUseruuid(useruuid)
    }

    public static async updateDefault(args: any): Promise<any> {
        let { addressuuid, useruuid } = args
        validateCgi({ addressuuid, useruuid }, addressValidator.setDefaul)
        await Address.getInstance().updateState(useruuid, addressuuid)
        return { msg: "修改成功" }
    }
}

/*
*1、新增地址
*/
router.loginHandle('post', '/add', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await AddressOnApp.newAddress((ctx.request as any).body)))

/*
*2、删除地址
*/
router.loginHandle('delete', '/delete', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await AddressOnApp.delAddress((ctx.request as any).body)))

/*
*3、修改一个地址
*/
router.loginHandle('put', '/update', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await AddressOnApp.updateAddress((ctx.request as any).body)))

/*
*4、查找用户全部地址
*/
router.loginHandle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await AddressOnApp.findAllAddress((ctx.request as any).query)))

/*
*5、修改用户的默认地址
*/
router.loginHandle('put', '/updateDefault', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await AddressOnApp.updateDefault((ctx.request as any).body)))

