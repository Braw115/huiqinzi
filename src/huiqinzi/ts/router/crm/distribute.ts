import moment = require("moment")
import { validateCgi } from "../../lib/validator"
import { withdrawValidator } from "./validator"
import { RouterWrap } from "../../lib/routerwrap"
import { Orders } from "../../model/crm/orders"
import { Withdraw } from "../../model/crm/withdraw"
import { BaseHandler } from "../lib/basehandler"
import { Wxusers}from "../../model/wechat/wxusers"
import { getTimeStr } from "../../lib/gettime"
import { Activity } from "../../model/crm/activity"



export const router = new RouterWrap({ prefix: "/crmdistribute" })

export class DistributeOnCrm extends BaseHandler {

    //首页,返回今日概况,分销趋势(近期数据)
    public static async getDistributeData(args: any): Promise<any> {
        //今日概况
        let today =moment()
        let finishdate = today.format('YYYY-MM-DD')
        let distribute = '1'
        let distributeOrder :any = await Orders.getInstance().findByDistAndDate(finishdate)
        let users = await Wxusers.getInstance().findByDistributeAndTime(distribute,finishdate)
        distributeOrder.peopleNum = users.length
        //近十日概况
        let tenDays =new Array()
        let distributeOrders =new Array()
        for(let i = 1;i<=10;i++){
            let day = today.subtract(1,'days').format('YYYY-MM-DD')
            tenDays.push(day)  
        }
        for(let j=9;j>=0;j--){
            distributeOrders[j] = await Orders.getInstance().findByDistAndDate(tenDays[j])
            let users = await Wxusers.getInstance().findByDistributeAndTime(distribute,tenDays[j])
            distributeOrders[j].peopleNum = users.length
            distributeOrders[j].date = tenDays[j]
        }
        
        return {distributeOrder,distributeOrders}
    }

    //添加分销商品
   public static async addDistributeGoods(args: any):Promise<any> {
        let {uuid} =args
        let distribute = '1'
        let res = await Activity.getInstance().updateDistribute(uuid,distribute)
        if(res)
            return {msg: "添加成功!"}
        else
            return {msg: "添加失败!"}
    }
    //删除分销商品 
    public static async delDistributeGoods(args: any):Promise<any> {
        let {uuid} =args
        let distribute = '0'
        let res = await Activity.getInstance().updateDistribute(uuid,distribute)
        if(res)
            return {msg: "删除成功!"}
        else
            return {msg: "删除失败!"}
    }

    //获取商品详情,查询所有的分销商品
    public static async getGoodsDetail(args: any):Promise<any> {
        let {start, length} =args
        let result = await Activity.getInstance().findAll(start, length)
        return result
    }

    //模糊查询分销商品
    public static async getGoodsDetailBySerach(args: any):Promise<any> {
        let {search} = args
        let actives = await Activity.getInstance().findDistributeBySearch(search)
        return actives 
    }

    //查询所有的分销达人
    public static async getDistPeople(args: any):Promise<any> {
        let {start, length} =args
        let result = await Wxusers.getInstance().findByDistribute(start, length)
       
        return result
    }

    //搜索达人,根据昵称查找达人
    public static async getByNickname(args: any):Promise<any> {
        let {search} =args
        let disUsers = await Wxusers.getInstance().findByNickname(search)
        return disUsers
    }
    
    //达人提现记录
    public static async getWithDraw(args: any):Promise<any> {
        let {start, length} =args
        let result :any= await Withdraw.getInstance().findAll2(start, length)
        let res = result.res
        let recordsFiltered = result.recordsFiltered
        for (let i = 0; i < res.length; i++) {
            res[i].created = getTimeStr(res[i].created)
            switch (res[i].state) {
                case 'pending': res[i].state = '待受理'; break;
                case 'accepted': res[i].state = '已受理'; break;
                case 'refused': res[i].state = '已拒绝'; break;
                default: break;
            }
        }
        return {res,recordsFiltered}
    }
    //更新提现记录(人工受理或拒绝)
    public static async updateWithDraw(args: any):Promise<any> {
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
        return { msg: "处理成功!"}
        
    }
        
}
/*
*1、分销概况查询
*/

router.loginHandle('post', '/getDistributeData', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await DistributeOnCrm.getDistributeData((ctx.request as any).body)))

/*
*2、添加分销商品
*/
router.loginHandle('post', '/addDistributeGoods', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await DistributeOnCrm.addDistributeGoods((ctx.request as any).body)))
    /*
*3、删除分销商品
*/
router.loginHandle('post', '/delDistributeGoods', async (ctx, next) =>
BaseHandler.handlerResult(ctx, await DistributeOnCrm.delDistributeGoods((ctx.request as any).body)))

/*
*4、查询全部商品详情
*/
router.loginHandle("get", "/getGoodsDetail", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await DistributeOnCrm.getGoodsDetail((ctx.request as any).query)))
  
 /*
*5、模糊查询分销商品
*/
router.loginHandle("post", "/getGoodsBySerach", async (ctx, next) =>
BaseHandler.handlerResult(ctx, await DistributeOnCrm.getGoodsDetailBySerach((ctx.request as any).body)))

/*
*6、查询所有达人
*/
router.loginHandle('get', '/getDistPeople', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await DistributeOnCrm.getDistPeople((ctx.request as any).query)))

/*
*7、根据昵称查找达人
*/
router.loginHandle('post', '/getDistPeopleByNickname', async (ctx, next) =>
BaseHandler.handlerResult(ctx, await DistributeOnCrm.getByNickname((ctx.request as any).body)))

/*
*8、达人提现记录
*/
router.loginHandle('get', '/getWithDraw', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await DistributeOnCrm.getWithDraw((ctx.request as any).query)))

 /*
*9、更新提现状态
*/   
    router.loginHandle('post', '/updateWithDraw', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await DistributeOnCrm.updateWithDraw((ctx.request as any).body)))
    

