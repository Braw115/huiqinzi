import { validateCgi } from "../../lib/validator"
import { groupsValidator } from "./validator"
import { Groups } from "../../model/wechat/groups"
import { Wxusers } from "../../model/wechat/wxusers"
import { RouterWrap } from "../../lib/routerwrap"
import { BaseHandler } from "../lib/basehandler"

export const router = new RouterWrap({ prefix: "/crmgroups" })

export class GroupsOnCrm extends BaseHandler {
    //查看某个活动全部的团
    public static async findAll(args: any): Promise<any> {
        const { uuid, start, length } = args
        validateCgi({ uuid, start, length }, groupsValidator.findAll)
        let res = await Groups.getInstance().findAllGroupsByAct(uuid, start, length)
        let count = await Groups.getInstance().getCountByActUUID(uuid)

        for (let i = 0; i < res.length; i++) {
            let useruuids = res[i].useruuids
            let arr = new Array()
            for (let j = 0; j < useruuids.length; j++) {
                let wxuser = await Wxusers.getInstance().findByPrimary(useruuids[j])
                arr.push({ headurl: wxuser.headurl, wxname: wxuser.wxname, realname: wxuser.realname, phone: wxuser.phone })
            }
            res[i]['wxusers'] = arr
        }
        return { groups: res, recordsFiltered: count }
    }
}

/*
*1、查看某个活动全部的团
*/
router.loginHandle("get", "/findAll", async (ctx, next) =>
    BaseHandler.handlerResult(ctx, await GroupsOnCrm.findAll((ctx.request as any).query)))