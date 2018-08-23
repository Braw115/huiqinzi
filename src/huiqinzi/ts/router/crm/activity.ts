import { validateCgi } from "../../lib/validator"
import { actValidator } from "./validator"
import { Activity } from "../../model/crm/activity"
import { Category } from "../../model/crm/category"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"
import * as moment from "moment"
import { deletePic } from "../file/upload"
import { LoginInfo } from "../../redis/logindao"

const format = 'YYYY-MM-DD HH:mm:ss'

export const router = new RouterWrap({ prefix: "/crmactivity" })

export class ActivityOnCrm extends BaseHandler {
    //新加一个活动
    public static async add(args: any): Promise<any> {
        let { title, price, groupbyprice, amount, opentime, closetime, businessuuid,
            detail, category, subcategory, pricetag, pics, position, city, reservation,
            acttime, endtime, realprice, hotposition, specialprice, substance, sold } = args
        validateCgi({
            title, price, detail, category, subcategory, state: 'new', position, city, businessuuid
        }, actValidator.add)
        if (groupbyprice && amount) {
            validateCgi({ groupbyprice, amount }, actValidator.amount)
        }
        if (acttime)
            acttime = JSON.parse(acttime)
        if (realprice)
            realprice = parseFloat(realprice)
        if (specialprice)
            specialprice = parseFloat(specialprice)

        if (hotposition)
            hotposition = parseInt(hotposition)

        let obj = {
            title, price, opentime, closetime,
            detail, category, subcategory, pricetag: JSON.parse(pricetag),
            state: 'new', pics: JSON.parse(pics), position, city, businessuuid,
            reservation, endtime, realprice, substance, sold
        } as any
        if (groupbyprice)
            obj.groupbyprice = groupbyprice
        if (amount)
            obj.amount = amount
        if (hotposition)
            obj.hotposition = hotposition
        if (specialprice)
            obj.specialprice = specialprice
        if (acttime)
            obj.acttime = acttime
        let res = await Activity.getInstance().insertActivity(obj)
        if (res)
            return { msg: "新建成功" }
        return { msg: "新建失败" }
    }
    //删除一个活动
    public static async delete(ctx: any): Promise<any> {
        const { uuid } = ctx.params
        validateCgi({ uuid }, actValidator.delete)

        let act = await Activity.getInstance().findByPrimary(uuid)
        if (act.state && act.state === "on") {
            return super.NotAcceptable('活动正在进行，不能删除')
        }

        let category = await Category.getInstance().findByPrimary(act.category)
        if (category.key !== "rushBuy" && category.key !== "groupBuy")
            for (let pic of act.pics) {//删除图片
                await deletePic(pic)
            }
        let res = await Activity.getInstance().deleteActivity(uuid)
        if (res)
            return { msg: "删除成功" }
        return { msg: "删除失败" }
    }
    //修改一个活动
    public static async update(args: any): Promise<any> {
        let { uuid, title, price, groupbyprice, amount, opentime, closetime,
            detail, category, subcategory, pricetag, pics, position, city, reservation,
            acttime, endtime, realprice, hotposition, specialprice, substance, sold,distribute } = args
        validateCgi({
            title, price, detail, category, subcategory, position, city
        }, actValidator.add)
        if (groupbyprice && amount) {
            validateCgi({ groupbyprice, amount }, actValidator.amount)
        }
        if (acttime)
            acttime = JSON.parse(acttime)
        if (realprice)
            realprice = parseFloat(realprice)
        if (specialprice)
            specialprice = parseFloat(specialprice)

        if (hotposition)
            hotposition = parseInt(hotposition)

        let obj = {
            title, price, opentime, closetime,
            detail, category, subcategory, pricetag: JSON.parse(pricetag),
            state: 'new', pics: JSON.parse(pics), position, city,
            reservation, endtime, realprice, substance, sold,distribute
        } as any
        if (groupbyprice)
            obj.groupbyprice = groupbyprice
        if (amount)
            obj.amount = amount
        if (hotposition)
            obj.hotposition = hotposition
        if (specialprice)
            obj.specialprice = specialprice
        if (acttime)
            obj.acttime = acttime

        let act = await Activity.getInstance().findByPrimary(uuid)
        if (act.state && act.state === "on") {
            return super.NotAcceptable('活动正在进行，不能修改')
        }

        let res = await Activity.getInstance().updateActivity(uuid, obj)
        if (res)
            return { msg: "修改成功" }
        return { msg: "修改失败" }
    }
    //分页查询活动
    public static async findAll(ctx :any ,args: any): Promise<any> {
        const { start, length, category, subcategory, draw } = args
        let search: String = args["search[value]"]
        const info: LoginInfo = (ctx.request as any).loginInfo
        validateCgi({ start, length, category, subcategory }, actValidator.startLength)
        if (!search)
            search = ""
        let res:any
        if (info.isBusiness()) {
             let businessuuid = info.getUuid()
             res = await Activity.getInstance().findActByBusinessUUID(start, length, category, subcategory, search, businessuuid)
        }else{
             res = await Activity.getInstance().findAllActivity(start, length, category, subcategory, search)
        }
        res.draw = draw
        return res
    }

    public static async find(): Promise<any> {
        return await Activity.getInstance().find()
    }

    public static async updateState(args: any): Promise<any> {
        const { uuid, state } = args
        validateCgi({ state }, actValidator.updatestate)
        let act = await Activity.getInstance().findByPrimary(uuid)
        if (act.opentime && act.closetime && state === "on") {
            let { opentime, closetime } = { opentime: moment(act.opentime).format(format), closetime: moment(act.closetime).format(format) }
            let now = moment().format(format)
            if (now < opentime || now > closetime)
                return super.Forbidden("商品上下线时间与设定不符合,无法上线")
            await Activity.getInstance().updateActivity(uuid, { state })
            return { msg: "修改成功" }
        } else if (state !== "on") {
            await Activity.getInstance().updateActivity(uuid, { state })
            return { msg: "修改成功" }
        }
        return super.Forbidden("商品上下线时间不存在,无法上线")
    }

    public static async findUUID(args: any): Promise<any> {
        const { uuid } = args
        return await Activity.getInstance().findByPrimary(uuid)
    }

    public static async updateHotPosition(args: any): Promise<any> {
        const { uuid } = args
        validateCgi({ uuid }, actValidator.delete)
        let hotActivity = await Activity.getInstance().findActivityByHotPosition()
        let hotPodition = 1
        if (hotActivity[0].hotposition)
            hotPodition = hotActivity[0].hotposition + 1
        await Activity.getInstance().updateActivity(uuid, { hotposition: hotPodition })
        return { msg: "修改成功" }
    }
    
    public static async updatePosition(args: any): Promise<any> {
        const { uuid } = args
        validateCgi({ uuid }, actValidator.delete)
        let activity = await Activity.getInstance().findActivityByPosition()
        let position = 1
        if (activity[0].position)
            position = activity[0].position + 1
        await Activity.getInstance().updateActivity(uuid, { position })
        return { msg: "修改成功" }
    }

    public static async addGroupActivity(args: any): Promise<any> {
        const { uuid, categoryuuid, subcategoryuuid, endtime, position } = args
        validateCgi({ uuid, categoryuuid, subcategoryuuid, position }, actValidator.addgroup)
        let activity = await Activity.getInstance().findByPrimary(uuid)
        delete activity.uuid
        delete activity.created
        delete activity.modified
        activity.category = categoryuuid
        activity.subcategory = subcategoryuuid
        if (position)
            activity.position = position
        if (endtime)
            activity.endtime = endtime
        await Activity.getInstance().insertActivity(activity)
        return { msg: "添加成功" }
    }

    
}

/*
*1、新加一个活动
*/
router.loginHandle("post", "/add", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.add((ctx.request as any).body)))

/*
*2、删除一个活动
*/
router.loginHandle("delete", "/:uuid", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.delete(ctx)))

/*
*3、修改一个活动
*/
router.loginHandle("put", "/update", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.update((ctx.request as any).body)))
    
/*
*4、分页查询活动
*/
router.loginHandle("get", "/getAll", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.findAll(ctx,(ctx.request as any).query)))

/*
5、上下架，限时团购不能操作这个
*/
router.loginHandle('put', '/state', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.updateState((ctx.request as any).body)))

/*
6、不分页查询全部活动,给banner下拉选择活动用
*/
router.loginHandle('get', '/get', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.find()))


/*
7、根据uuid查询活动
*/
router.loginHandle('get', '/getByuuid', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.findUUID((ctx.request as any).query)))

/*
8、活动置顶
*/
router.loginHandle('put', '/updateposition', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.updatePosition((ctx.request as any).body)))


/*
9、热门活动置顶
*/
router.loginHandle('put', '/updatehotposition', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.updateHotPosition((ctx.request as any).body)))

/**
 * 10、添加精选团购/限时热卖
 */
router.loginHandle('put', '/addgroup', async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await ActivityOnCrm.addGroupActivity((ctx.request as any).body)))
