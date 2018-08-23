import { validateCgi } from "../../lib/validator"
import { goodsValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { Activity } from "../../model/crm/activity"
import { Groups } from "../../model/wechat/groups"
import { Goods } from "../../model/crm/goods"
import { Orders } from "../../model/crm/orders"
import { getPageCount } from "../../lib/utils"
import { BaseHandler } from "../lib/basehandler"
import { Search } from "../../model/wechat/search"
import { OrdersOnApp } from "./orders"
import { getWeek } from "../../lib/gettime"


export const router = new RouterWrap({ prefix: "/appactivity" })

export class ActivityOnApp extends BaseHandler {

    public static async getGroup(args: any): Promise<any> {
        const { page, count, category, subcategory, city } = args
        validateCgi({ page, count, category, subcategory }, goodsValidator.getAll)

        let { cursor, limit } = getPageCount(page, count)
        let res = await Activity.getInstance().findAllGroupActivity(cursor, limit, category, subcategory, city)
        return res
    }

    public static async getTimeLimit(args: any): Promise<any> {
        const { page, count, category, subcategory, city } = args
        validateCgi({ page, count, category, subcategory }, goodsValidator.getAll)

        let { cursor, limit } = getPageCount(page, count)
        let res = await Activity.getInstance().getTimeLimit(cursor, limit, category, subcategory, city)
        return res
    }

    public static async findOrdinary(args: any): Promise<any> {
        const { page, count, category, subcategory, city } = args
        validateCgi({ page, count, category, subcategory }, goodsValidator.getAll)

        let { cursor, limit } = getPageCount(page, count)
        let res = await Activity.getInstance().findOrdinary(cursor, limit, category, subcategory, city)
        return res
    }

    public static async search(args: any): Promise<any> {
        const { search, city, useruuid } = args
        let mysearchcount = await Search.getInstance().countByUserUUID(useruuid)
        if (mysearchcount >= 5) {
            await Search.getInstance().deleteOldest(useruuid)
        }

        let searchss = await Search.getInstance().getBywords(useruuid, search)
        if (searchss) {
            await Search.getInstance().deleteByUUID(searchss.uuid)
        }
        await Search.getInstance().insertSearch({ useruuid, words: search })

        let act = await Activity.getInstance().search(search, city)
        let goods = await Goods.getInstance().search(search)
        return { act, goods }
    }

    public static async mysearch(args: any): Promise<any> {
        const { useruuid } = args
        return await Search.getInstance().getByUserUUID(useruuid)
    }

    public static async deletemysearch(args: any): Promise<any> {
        const { useruuid } = args
        await Search.getInstance().deleteByUserUUID(useruuid)
        return { msg: "ok" }
    }

    public static async  countGroups(args: any): Promise<any> {
        const { activityuuid } = args
        validateCgi({ uuid: activityuuid }, goodsValidator.getCount)

        let groups = await Groups.getInstance().findAllGroupsByAct(activityuuid, undefined, undefined)
        let act = await Activity.getInstance().findByPrimary(activityuuid)
        
        let count = 0   //这个活动现在有多少人参加
        for (let i = 0; i < groups.length; i++) {
            count += groups[i].useruuids.length
            for (let j = 0; j < groups.length - i; j++) {
                if (groups[j + 1] && groups[j].useruuids.length < groups[j + 1].useruuids.length) {
                    let temp = groups[j]
                    groups[j] = groups[j + 1]
                    groups[j + 1] = temp
                }
            }
        }
        return { count, groups, act }
    }
    //一键开团
    public static async createGroups(args: any): Promise<any> {
        let { useruuid, activityuuid, name, phone, remark, address, specification,rebate1,amount} = args
        validateCgi({ useruuid, activityuuid, name, phone, remark }, goodsValidator.createGroups)
        let act = await Activity.getInstance().findByUuid(activityuuid)
        //let useruuids = new Array(useruuid)
        // let group = await Groups.getInstance().insertGroup({
        //     useruuids,
        //     activityuuid,
        //     state: "processing"
        // })
        // console.log(group)
        let goodsinfo = JSON.stringify(act)
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
        
        if(!specification){//没有规格的商品
            total_fee = act.groupbyprice * amount
            realtotal_fee = act.realprice * amount
        }else{//存在规格
            let fee
            specification = JSON.parse(specification)
            if (state) {
                fee  = OrdersOnApp.getactTotalFee(specification, act.pricetag, amount)
                total_fee = fee.total_fee
            } else {
                fee = OrdersOnApp.getGroupTotalFee(specification, act.pricetag, amount)
                total_fee = fee.total_fee
            }
    
            if (!fee) {
                return super.NotAcceptable('库存不足')
            }
            let realFee = OrdersOnApp.getaRealTotalFee(specification, act.pricetag, amount)
            realtotal_fee = realFee.total_fee
            await Activity.getInstance().updateActivity(activityuuid, { pricetag: fee.pricetag })//更新库存

        }

        let obj: any
        if(rebate1 && rebate1 != "undefined" && rebate1 != useruuid){
            obj= {
                useruuid,
                gooduuid: activityuuid,
                name,
                phone,
                remark,
                address,
                total_fee,
                realtotal_fee,
                state: 'wait-pay',
                activityuuid,
                goodsinfo,
                amount,
                rebate1,
                distributeorder:'1'//表示此订单为分销订单
            }    
        }else{
            obj= {
                useruuid,
                gooduuid: activityuuid,
                name,
                phone,
                remark,
                address,
                total_fee,
                realtotal_fee,
                state: 'wait-pay',
                activityuuid,
                goodsinfo,
                amount
            }
        }
       
        // if (ext)
        //     obj['ext'] = JSON.parse(ext)

        let order = await Orders.getInstance().insertOrder(obj)
        return { order }
    }
    //参团
    public static async joinGroups(args: any): Promise<any> {
        let { useruuid, groupuuid,activityuuid, name, phone, remark,  address, specification,rebate1, amount} = args
        validateCgi({ useruuid, activityuuid,groupuuid, name, phone, remark }, goodsValidator.createGroups)

        let group = await Groups.getInstance().findByPrimary(groupuuid)
        let act = await Activity.getInstance().findByUuid(group.activityuuid)
        if(group.useruuids.length >= act.amount)
            return super.NotAcceptable("该团已满")
        let goodsinfo = JSON.stringify(act)
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
        
        if(!specification){//没有规格的商品
            total_fee = act.groupbyprice * amount
            realtotal_fee = act.realprice * amount
        }else{//存在规格
            let fee
            specification = JSON.parse(specification)
            if (state) {
                fee  = OrdersOnApp.getactTotalFee(specification, act.pricetag, amount)
                total_fee = fee.total_fee
            } else {
                fee = OrdersOnApp.getGroupTotalFee(specification, act.pricetag, amount)
                total_fee = fee.total_fee
            }
    
            if (!fee) {
                return super.NotAcceptable('库存不足')
            }
            let realFee = OrdersOnApp.getaRealTotalFee(specification, act.pricetag, amount)
            realtotal_fee = realFee.total_fee
            await Activity.getInstance().updateActivity(act.uuid, { pricetag: fee.pricetag })//更新库存
        }
        

        let obj: any 
        if(rebate1 && rebate1 != "undefined" && rebate1 != useruuid){
            obj = {
                useruuid,
                gooduuid: act.uuid,
                name,
                phone,
                remark,
                address,
                total_fee,
                realtotal_fee,
                state: 'wait-pay',
                activityuuid: act.uuid,
                groupuuid,
                goodsinfo,
                amount, 
                rebate1,
                distributeorder:'1'//表示此订单为分销订单
            }
        }else{
            obj = {
                useruuid,
                gooduuid: act.uuid,
                name,
                phone,
                remark,
                address,
                total_fee,
                realtotal_fee,
                state: 'wait-pay',
                activityuuid: act.uuid,
                groupuuid,
                goodsinfo,
                amount
            }
        }

        
        //if (ext)
         //   obj['ext'] = JSON.parse(ext)

        let order = await Orders.getInstance().insertOrder(obj)

        return { order }
}


public static async hot():Promise<any> {
        let resActivity = await Activity.getInstance().hot()
        let returnactivity = new Array()
        resActivity.forEach(r => {
            let state = true
            returnactivity.forEach(j => {
                if (r.title === j.title)
                    state = false
            })
            if (state)
                returnactivity.push(r)
        })
        return { res: returnactivity }

    }
    
}


/*
*1、查找全部的团购活动
*/
router.loginHandle('get', '/group', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.getGroup((ctx.request as any).query)))

/*
*2、查找全部的限时抢购
*/
router.loginHandle('get', '/timeLimit', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.getTimeLimit((ctx.request as any).query)))

/*
*3、查询全部的普通活动
*/
router.loginHandle('get', '/ordinary', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.findOrdinary((ctx.request as any).query)))

/*
*4、搜索功能,包括实体商品，和活动
*/
router.loginHandle('get', '/search', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.search((ctx.request as any).query)))

/*
*5、参团页面
*/
router.loginHandle('get', '/act', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.countGroups((ctx.request as any).query)))

/*
*6、一键开团
*/
router.loginHandle('post', '/open', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.createGroups((ctx.request as any).body)))

/*
7、参团
*/
router.loginHandle('post', '/join', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.joinGroups((ctx.request as any).body)))

/*
8、我的搜索
*/
router.loginHandle('get', '/mysearch', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.mysearch((ctx.request as any).query)))

/*
9、清空我的搜索
*/
router.loginHandle('delete', '/', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.deletemysearch((ctx.request as any).body)))

/*
10、最新热卖,前十
*/
router.handle('get', '/hot', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnApp.hot()))