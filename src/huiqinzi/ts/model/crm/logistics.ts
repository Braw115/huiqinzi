
import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "logistics"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Logistics.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.UUIDV4,
        },
        logisticscode: DataTypes.CHAR(64),          //运单号
        ordercode: DataTypes.CHAR(64),              //订单uuid
        shippercode: DataTypes.CHAR(64),            //物流公司代码
        traces: DataTypes.ARRAY(DataTypes.JSONB),    //物流跟踪
        modified: DataTypes.TIME,
        created: DataTypes.TIME,
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Logistics extends ModelBase {
    private static instance: Logistics
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }
    public static getInstance(seqz: Sequelize = undefined) {
        if (!Logistics.instance)
            Logistics.instance = new Logistics(seqz, modelName)
        return Logistics.instance
    }

    public async insertLogistics(obj: any) {
        let res = await this.model().create(obj)
        return res ? res.get() : undefined
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findOne({ where: { uuid: uuid } })
        return res ? res.get() : undefined
    }

    public async updateTraces(shippercode: string, logisticscode: string, traces: string) {
        let [number, res] = await this.model().update({ traces: traces }, { where: { shippercode: shippercode, logisticscode: logisticscode }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async getByCode(shippercode: string, logisticscode: string) {
        let res = await this.model().findOne({ where: { shippercode: shippercode, logisticscode: logisticscode } })
        return res ? res.get() : undefined
    }

    public async deleteLogistics(uuid: string) {
        return await this.model().destroy({ where: { uuid: uuid } })
    }

    public async getByOrderUuid(ordercode: string) {
        let res = await this.model().findOne({ where: { ordercode: ordercode } })
        return res ? res.get() : undefined
    }

    public async getCount() {
        let res = await this.seqz.query(`
        select count(*) from
        wxusers.users c, mall.logistics l, mall.orders o ,mall.shipper s
        where c.uuid=o.useruuid
        and l.ordercode=o.uuid
        and s.shippercode=l.shippercode `, { type: "select" }) as any[]
        return parseInt(res[0].count)
    }

    public async getAll(cursor: number, limit: number) {
        return await this.seqz.query(`
        select l.uuid,l.logisticscode ,l.shippercode,s.shippername ,o.goods,c.wxname ,l.ordercode
        from wxuser.wxusers c, mall.logistics l , mall.orders o ,mall.shipper s
        where c.uuid=o.useruuid
        and l.ordercode=o.orderuuid
        and s.shippercode=l.shippercode
        order by o.created desc
        offset ${this.seqz.escape(cursor)} LIMIT ${this.seqz.escape(limit)}`,
            { type: "select" }) as any[]
    }

    public async updateByOrdercode(logisticscode: string, shippercode: string, ordercode: string) {
        let arr: string[] = []
        await this.model().update({ logisticscode, shippercode, traces: arr }, { where: { ordercode: ordercode } })
    }
}

