import { validateCgi } from "../../lib/validator"
import { goodsValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { Goods } from "../../model/crm/goods"
import { getPageCount } from "../../lib/utils"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/appgoods" })

export class GoodsOnApp extends BaseHandler {
    public static async get(args: any): Promise<any> {
        const { page, count, category, subcategory } = args
        validateCgi({ page, count, category, subcategory }, goodsValidator.getAll)

        let { cursor, limit } = getPageCount(page, count)
        let res = await Goods.getInstance().findAllGoods(cursor, limit, category, subcategory, '', 'on')
        return res
    }
}

/*
*1、查找全部的商品,实体商品
*/
router.loginHandle('get', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsOnApp.get((ctx.request as any).query)))
    
