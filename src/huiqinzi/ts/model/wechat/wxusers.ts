import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["users", "wxusers"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Wxusers.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        openid: DataTypes.STRING,   //微信唯一标识
        headurl: DataTypes.STRING,  //头像
        wxname: DataTypes.STRING,   //微信昵称
        realname: DataTypes.STRING, //姓名
        phone: DataTypes.STRING,    //电话
        balance: DataTypes.FLOAT,   //余额
        withdrawbalance: DataTypes.FLOAT,   //已提现余额
        customer: DataTypes.INTEGER,    //顾客数
        storename: DataTypes.STRING,    //店名
        storelogo: DataTypes.STRING,    //店铺logo
        upuseruuid: DataTypes.UUID, //上级用户uuid
        switch: DataTypes.BOOLEAN,  //是否显示店名logo
        deleted: DataTypes.INTEGER, //删除标识
        created: DataTypes.TIME,
        modified: DataTypes.TIME,
        invitecode:DataTypes.STRING,//邀请码
        upinvitedcode:DataTypes.STRING,//上级的邀请码
        distribute:DataTypes.STRING,//标志是否是分销达人(1为分销达人,0不是)
        totalincom:DataTypes.FLOAT,//累计收益
        distribute_date:DataTypes.STRING,//成为分销达人的时间
        distribute_num:DataTypes.INTEGER,//成单量
        distribute_price:DataTypes.FLOAT//成单价
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Wxusers extends ModelBase {
    private static instance: Wxusers
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Wxusers.instance)
            Wxusers.instance = new Wxusers(seqz, modelName)
        return Wxusers.instance
    }

    public async insertWxusers(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res ? res.get() : undefined
    }

    //找这个人有多少顾客
    public async findDownUser(useruuid: string) {
        let count = await this.model().count({ where: { upuseruuid: useruuid } })
        return count
    }

    //返佣
    public async updateBalance(uuid: string, balance: any) {
        let [number, res] = await this.model().update({
            balance: Sequelize.literal(`balance+${balance}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //累计收益
    public async updateTotalIncome(uuid: string, totalincom: any) {
        let [number, res] = await this.model().update({
            totalincom: Sequelize.literal(`totalincom+${totalincom}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //成单量+1
    public async updateDistributeNum(uuid: string) {
        let num=1
        let [number, res] = await this.model().update({
            distribute_num: Sequelize.literal(`distribute_num+${num}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //成单价+本次成单价price
    public async updateDistributePrice(uuid: string,distribute_price:number) {
        let [number, res] = await this.model().update({
            distribute_price: Sequelize.literal(`distribute_price+${distribute_price}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //提现,更新个人数据
    public async updateBalanceAndWithdraw(uuid: string, balance: any) {
        let [number, res] = await this.model().update({
            balance: Sequelize.literal(`balance-${balance}`),
            withdrawbalance: Sequelize.literal(`withdrawbalance+${balance}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findAll(cursor: number, limit: number, search?: any) {
        let res = await this.seqz.query(`
            select * from users.wxusers
            where wxname like '%${search}%'
            or realname like '%${search}%'
            or phone like '%${search}%'
            order by created desc
            offset ${cursor}
            limit ${limit}
        `, { type: "select" }) as any[]
        return res
    }

    public async getCount(search?: any) {
        let res = await this.seqz.query(`
        select count(*) from users.wxusers
            where wxname like '%${search}%'
            or realname like '%${search}%'
            or phone like '%${search}%'
        `, { type: "select" }) as any[]
        return res[0].count
    }

    public async updateState(uuid: string, deleted: number) {
        let [number, res] = await this.model().update({ deleted }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findByOpenid(openid: string) {
        let res = await this.model().findOne({ where: { openid } })
        return res ? res.get() : undefined
    }

    public async updateHeadurl(uuid: string, headurl: string) {
        let [number, res] = await this.model().update({ headurl }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async updateWxname(uuid: string, wxname: string) {
        let [number, res] = await this.model().update({ wxname }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async updateWxuser(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //更新upInviteCode 
    public async updateUpInviteCode(uuid: string, upinvitedcode: String) {
        let [number, res] = await this.model().update({upinvitedcode}, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //根据upinvitedcode查询
    public async findByUpInviteCode(upinvitedcode: string) {
        let res = await this.model().findAll({ where: { upinvitedcode } })
        return res ? res : undefined
    }
    //更新distribute,表示该用户为分销达人
    public async updateDistribute(uuid:string,distribute: string,distribute_date:string) {
        let [number, res] = await this.model().update({distribute,distribute_date}, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //查询分销达人
    public async findByDistribute(cursor:any, limit:any) {
        
        let res = await this.seqz.query(`
        select * from users.wxusers
        where distribute = '1'
        order by  created desc
        offset ${cursor}
        limit ${limit}
    `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
        select count(*) from users.wxusers 
        where distribute = '1'
        `, { type: "select" }) as any[]

        return {res,recordsFiltered: count[0].count}
    }

     //根据昵称查询分销达人
     public async findByNickname(search:string) {
        let res = await this.seqz.query(`
        select * from users.wxusers
            where wxname like '%${search}%'
            and distribute = '1'
        `, { type: "select" }) as any[]
        return res
    }
    //查询分销达人
    public async findByDistributeAndTime(distribute:string,distribute_date:string) {
        let res = await this.model().findAll({ where: { distribute,distribute_date } })
        return res ? res : undefined
    }
}