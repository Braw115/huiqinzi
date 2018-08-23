
import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "wxtrade"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Wxtrade.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        out_trade_no: DataTypes.TEXT,
        openid: DataTypes.TEXT,
        prepay_id: DataTypes.TEXT,
        state: {
            type: DataTypes.ENUM,
            values: ["new", "fin", "abandon"]
        },
        appid: DataTypes.TEXT,
        mch_id: DataTypes.TEXT,
        body: DataTypes.TEXT,
        total_fee: DataTypes.FLOAT,
        spbill_create_ip: DataTypes.TEXT,
        trade_type: {
            type: DataTypes.ENUM,
            values: ["JSAPI", "WEB"]
        },
        ext: DataTypes.JSONB,
        created: DataTypes.TIME,
        modified: DataTypes.TIME,
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Wxtrade extends ModelBase {
    private static instance: Wxtrade
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }
    public static getInstance(seqz: Sequelize = undefined) {
        if (!Wxtrade.instance)
            Wxtrade.instance = new Wxtrade(seqz, modelName)
        return Wxtrade.instance
    }

    public async insertNewTrade(obj: any) {
        let res = await this.model().create(obj)
        return res ? res.get() : undefined
    }

    public async findByTradeNo(tradeNo: string) {
        let res = await this.model().findOne({ where: { out_trade_no: tradeNo } })
        return res ? res.get() : undefined
    }

    public async setWxTradeState(tradeNo: string, state: string) {
        return await this.model().update({ state: state }, { where: { out_trade_no: tradeNo } })
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findOne({ where: { uuid: uuid } })
        return res ? res.get() : undefined
    }

    public async deleteByPrimary(uuid: string) {
        return await this.model().destroy({ where: { uuid: uuid } })
    }
}