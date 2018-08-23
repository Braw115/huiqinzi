import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "orders"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Orders.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        useruuid: DataTypes.UUID,    //用户uuid
        goods: DataTypes.JSONB,  //规格信息
        gooduuid: DataTypes.UUID,    //商品uuid
        name: DataTypes.STRING, //预留姓名
        phone: DataTypes.STRING, //预留手机号
        remark: DataTypes.STRING,    //预留备注
        total_fee: DataTypes.FLOAT,  //总价
        realtotal_fee: DataTypes.FLOAT,  //内部核算总价
        amount: DataTypes.INTEGER,  //数量
        address: DataTypes.STRING,    //地址
        state: DataTypes.STRING, //
        logisticscode: DataTypes.STRING,    //运单号
        shippercode: DataTypes.STRING,  //物流公司代码
        out_trade_no: DataTypes.TEXT,
        groupuuid: DataTypes.UUID,  //参团的时候，这个字段表示团的uuid
        activityuuid: DataTypes.UUID,   //开团的时候，这个字段表示活动的uuid
        code: DataTypes.STRING, //兑换码
        rebate1: DataTypes.UUID,    //返佣受益人
        rebate2: DataTypes.UUID,    //返佣受益人
        brokerage1: DataTypes.FLOAT,    //佣金
        brokerage2: DataTypes.FLOAT,    //佣金
        ext: DataTypes.JSONB,   //备用字段
        created: DataTypes.TIME,
        modified: DataTypes.TIME,
        distributeorder: DataTypes.STRING,//是否为分销订单1为分销订单,0不为
        goodsinfo: DataTypes.JSONB,//商品信息
        finishdate:DataTypes.STRING,//订单完成时间
        delete: DataTypes.INTEGER //标志订单是否被删除1为删除
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Orders extends ModelBase {
    private static instance: Orders
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Orders.instance)
            Orders.instance = new Orders(seqz, modelName)
        return Orders.instance
    }

    public async insertOrder(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }
    //app端假删除
    public async deleteOrder(uuid: string) {
        return await this.model().update( {delete:1},{ where: { uuid } })
    }

    public async updateOrder(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findBySearch(search: string) {
        let orders = await this.seqz.query(`
            select * from mall.orders
            where code like '%${search}%'
        `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
        select count(*) from mall.orders
        where code like '%${search}%'
        `, { type: "select" }) as any[]

        return { orders, recordsFiltered: count[0].count }
    }

    //根据受益人找订单
    public async findByRebate(uuid: string) {
        let res = await this.seqz.query(`
        select * from mall.orders where
        rebate1 = '${uuid}'
        and state in ('used','shipped')
        and distributeorder = '1' order by created desc
        `, { type: 'select' }) as any[]

        /*   let res2 = await this.seqz.query(`
          select * from mall.orders where
          rebate2 = '${uuid}'
          `, { type: 'select' }) as any[] */
        return res
    }

    public async findByUseruuid(cursor: number, limit: number,uuid: string, state: any) {
        let res
        if (!state){
            //res = await this.model().findAll({ where: { useruuid: uuid }, order: [["created", "desc"]] })
            res =await this.seqz.query(`
            select * from mall.orders where
            useruuid = '${uuid}' and
            delete = 0
            order by created desc
            offset ${cursor}
            limit ${limit}
            `, { type: 'select' }) as any[]
        }else{
            //res = await this.model().findAll({ where: { useruuid: uuid, state }, order: [["created", "desc"]] })
            res =await this.seqz.query(`
            select * from mall.orders where
            useruuid = '${uuid}' and
            state ='${state}'
            order by created desc
            offset ${cursor}
            limit ${limit}
            `, { type: 'select' }) as any[]
        }   
        return res 
    }

    //查找某个商品某个状态的订单
    public async findByState(state: string, gooduuid: string) {
        let res = await this.model().findAll({ where: { state, gooduuid } })
        return res ? res.map(r => r.get()) : undefined
    }

    //根据条件分页查找全部订单
    public async findAllOrders(cursor: number, limit: number, state: any, code: any) {
        let res
        if (state) {
            res = await this.seqz.query(`
            select * from mall.orders
            where state = '${state}'
            and code like '%${code}%'
            offset ${cursor} limit ${limit}
        `, { type: 'select' }) as any[]
        } else {
            res = await this.seqz.query(`
            select * from mall.orders
            where code like '%${code}%'
            offset ${cursor} limit ${limit}
        `, { type: 'select' }) as any[]
        }
        return res
    }

    //根据活动uuid查找全部的订单
    public async findByGoodUUID(cursor: number, limit: number, state: string, gooduuid: any, code: any) {
        let uuid = "("
        for (let i = 0; i < gooduuid.length; i++) {
            uuid = uuid + "'" + gooduuid[i].uuid + "'"
            if (gooduuid.length - 1 != i) {
                uuid = uuid + ","
            }
        }
        uuid = uuid + ")"

        let res, recordsFiltered
        if (state) {
            res = await this.seqz.query(`
            select * from mall.orders
            where state = '${state}'
            and gooduuid in ${uuid}
            and code like '%${code}%'
            offset ${cursor}
            limit ${limit}
        `, { type: "select" }) as any[]

            recordsFiltered = await this.seqz.query(`
            select count(*) from mall.orders
            where state = '${state}'
            and gooduuid in ${uuid}
            and code like '%${code}%'
            `, { type: "select" }) as any[]
        } else {
            res = await this.seqz.query(`
            select * from mall.orders
            where gooduuid in ${uuid}
            and code like '%${code}%'
            offset ${cursor}
            limit ${limit}
        `, { type: "select" }) as any[]
            recordsFiltered = await this.seqz.query(`
            select count(*) from mall.orders
            where gooduuid in ${uuid}
            and code like '%${code}%'
            `, { type: "select" }) as any[]
        }
        return { orders: res, recordsFiltered: recordsFiltered[0].count }
    }

    //根据条件获得总数
    public async getCount(state: any, code: any) {
        let res
        /* if (obj)
            res = await this.model().count({ where: obj })
        else
            res = await this.model().count() */
        if (state) {
            res = await this.seqz.query(`
            select count(*) from mall.orders
            where state = '${state}'
            and code like '%${code}%'
            `, { type: "select" }) as any[]
        } else {
            res = await this.seqz.query(`
            select count(*) from mall.orders
            where code like '%${code}%'
            `, { type: "select" }) as any[]
        }

        return res[0].count
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res ? res.get() : undefined
    }

    //根据兑换码，查找订单
    public async findByCode(code: any) {
        let res = await this.model().findAll({ where: { code } })
        return res ? res.map(r => r.get()) : undefined
    }

    public async findByGooduuids(uuid: Array<string>, cursor: any, length: any) {
        let uuids = "("
        for (let i = 0; i < uuid.length; i++) {
            if (i == uuid.length - 1) {
                uuids = uuids + "'" + uuid[i] + "'"
            } else {
                uuids = uuids + "'" + uuid[i] + "',"
            }
        }
        uuids = uuids + ")"
        let res, count
        if (uuids != '()') {
            res = await this.seqz.query(`
            select * from mall.orders
            where gooduuid in ${uuids}
            and state != 'wait-pay'
            offset ${cursor}
            limit ${length}
        `, { type: "select" }) as any[]

            count = await this.seqz.query(`
            select sum(total_fee-realtotal_fee),count(*) from mall.orders
            where gooduuid in ${uuids}
            and state != 'wait-pay'
        `, { type: "select" }) as any[]
        } else {
            res = await this.seqz.query(`
            select * from mall.orders
            where
             state != 'wait-pay'
            offset ${cursor}
            limit ${length}
        `, { type: "select" }) as any[]

            count = await this.seqz.query(`
            select sum(total_fee-realtotal_fee),count(*) from mall.orders
            where
             state != 'wait-pay'
        `, { type: "select" }) as any[]
        }

        return { orders: res, sum: count[0].sum, recordsFiltered: count[0].count }
    }

    public async findByCategory(category: string, cursor: any, length: any) {

        let res = await this.seqz.query(`
            SELECT
                o.*, act.title
            FROM
                mall.orders AS o
            RIGHT JOIN mall.activity AS act ON o.gooduuid = act.uuid
            WHERE
                o. STATE != 'wait-pay'
            AND act.category = '${category}'
            offset ${cursor}
            limit ${length}
        `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
            select sum(total_fee-realtotal_fee),count(*)
            FROM
                mall.orders AS o
            RIGHT JOIN mall.activity AS act ON o.gooduuid = act.uuid
            WHERE
                o. STATE != 'wait-pay'
            AND act.category = '${category}'
        `, { type: "select" }) as any[]


        return { orders: res, sum: count[0].sum, recordsFiltered: count[0].count }
    }

    public async findByTimeRange(starttime: any, endtime: any, cursor: any, length: any) {
        let res = await this.seqz.query(`
            select * from mall.orders
            where created > '${starttime.toLocaleString()}'
            and created < '${endtime.toLocaleString()}'
            and state != 'wait-pay'
            offset ${cursor}
            limit ${length}
        `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
            select sum(total_fee-realtotal_fee),count(*) from mall.orders
            where created > '${starttime.toLocaleString()}'
            and created < '${endtime.toLocaleString()}'
            and state != 'wait-pay'
        `, { type: "select" }) as any[]
        return { orders: res, sum: count[0].sum, recordsFiltered: count[0].count }
    }

    public async updateTradeNo(tradeNo: string, orderuuid: string) {
        return await this.model().update({ tradeNo: tradeNo }, { where: { uuid: orderuuid } })
    }

    public async findByGroupUUID(groupuuid: string) {//根据团id查询带参团订单
        let res = await this.model().findAll({ where: { groupuuid ,state:"wait-join" } })
        return res ? res.map(r => r.get()) : undefined
    }
    //查询今日分销订单
    public async findByDistribute(distribute:string,state:string,finishdate:string,) {
        let res = await this.model().findAll({ where: { distribute,state,finishdate} })
        return res ? res.map(r => r.get()) : undefined
    }
    //统计当日分销订单
    public async findByDistAndDate(day:string) {
        
        let res = await this.seqz.query(`
            select COALESCE(sum(total_fee),0.0) AS totalfee,count(*) AS distributeOrderNum,COALESCE(sum(brokerage1),0.0) AS disPeoplefee, COALESCE(sum(total_fee-brokerage1),0.0) AS profits from mall.orders
            where distributeorder ='1'
            and finishdate ='${day}'
            and state = 'used' or state ='shipped'
        `, { type: "select" }) as any[]
        return  res[0]
    }

    
}