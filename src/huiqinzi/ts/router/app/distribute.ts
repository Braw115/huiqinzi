import { validateCgi } from "../../lib/validator"
import { RouterWrap } from "../../lib/routerwrap"
import { System } from "../../model/crm/system"
import { Orders } from "../../model/crm/orders"
//import { Withdraw } from "../../model/crm/withdraw"
import { BaseHandler } from "../lib/basehandler"
import { Wxusers}from "../../model/wechat/wxusers"
import { getTimeStr } from "../../lib/gettime"
import { appusersValidator } from "./validator"
import { Activity } from "../../model/crm/activity"
import { TodayIncome } from "../../model/crm/todayIncome"
import * as moment from "moment"


export const router = new RouterWrap({ prefix: "/distribution" })

export class GoodsDistribute extends BaseHandler {
    //查询热销商品和个人信息
    public static async getGoods(args: any): Promise<any> {
        
        let  { uuid } = args
        let distribute = '1'
        let goodss = await Activity.getInstance().findAllByDistribute(distribute)//查询所有的分销商品
        let  rebate = await System.getInstance().findByName('rebate')//找到回扣比例
        let rate = rebate.value.rebate1
        let wxuser = await Wxusers.getInstance().findByPrimary(uuid)
        if(wxuser.distribute != "0" && wxuser.distribute == 0)
            return super.NotAcceptable("您还不是分销达人")
        //查询今日收益
        let today = new Date().toLocaleDateString()
        let result = await TodayIncome.getInstance().findByUserAndToday(uuid, today)
        let todayIncome
        if(!result){
            todayIncome = 0
        }else{
            todayIncome = result.income
        }
        wxuser.todayIncome = todayIncome
       return { goodss,rate,wxuser }
    }

    //分销达人条件,每隔1秒请求一次
    public static async distributionLogin(args: any):Promise<any> {
        const { useruuid } = args
        validateCgi({ useruuid }, appusersValidator.Distribution)
        let distribute_date = moment().format('YYYY-MM-DD')
        let wxuser:any =await Wxusers.getInstance().findByPrimary(useruuid)
        let invitecode = wxuser.invitecode
        let invitedUser:any =await Wxusers.getInstance().findByUpInviteCode(invitecode)
        if(invitedUser.length >= 3 ){
            let distribute = '1'
            await Wxusers.getInstance().updateDistribute(useruuid,distribute,distribute_date) 
        }
        return invitedUser
    }
    //获得邀请码
    public static async getInviteCode(args: any):Promise<any> {
        let { uuid } = args
        let user = await Wxusers.getInstance().findByPrimary(uuid)
        let inviteCode = user.invitecode
       return {inviteCode}
    }


    //填写邀请码 
    public static async writeInviteCode(args: any):Promise<any> {
        let { uuid,invitecode} = args
        let upinvitedcode = invitecode 
        await Wxusers.getInstance().updateUpInviteCode(uuid, upinvitedcode)
        return {msg:"ok"}
    }
    //获取我的邀请卡
    public static async getMyInviteCard(args: any):Promise<any> {
        let {uuid, useruuid} =args
        let user = await Wxusers.getInstance().findByPrimary(useruuid)
        let goods = await Activity.getInstance().findByPrimary(uuid)
        let sharenum = parseInt(goods.sharenum)
        await Activity.getInstance().updateShareNum(uuid,sharenum+1)
        let obj ={user,goods}
       return obj
    }
    //查询分销订单
    public static async getDistributeOrder(args: any):Promise<any> {
        let {useruuid} =args 
        let distributeOrders = await Orders.getInstance().findByRebate(useruuid)
        let income = 0
        let orderNum = distributeOrders.length
        for(let i= 0 ; i<orderNum ;i++){
            income += distributeOrders[i].brokerage1
            distributeOrders[i].created = getTimeStr(distributeOrders[i].created)
        }
        let obj={income,orderNum,distributeOrders}
       return obj
    }
       
    
}


/*
*1、进入分销系统,成为分销达人
*/
router.loginHandle('post', '/open', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsDistribute.distributionLogin((ctx.request as any).body)))
/*

*2、查找全部的分销商品,实体商品
*/
router.loginHandle('post', '/getGoods', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsDistribute.getGoods((ctx.request as any).body)))


/*
*3、获取邀请码
*/
router.loginHandle('post', '/getInviteCode', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsDistribute.getInviteCode((ctx.request as any).body)))

/*
*4、填写邀请码
*/
router.loginHandle('post', '/writeInviteCode', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsDistribute.writeInviteCode((ctx.request as any).body)))

/*
*5、获取我的邀请卡
*/
router.loginHandle('post', '/getMyInviteCard', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsDistribute.getMyInviteCard((ctx.request as any).body)))

/*
*6、查询分销订单
*/
router.loginHandle('post', '/getDistributeOrder', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GoodsDistribute.getDistributeOrder((ctx.request as any).body)))
/*
*7、提现
*/
