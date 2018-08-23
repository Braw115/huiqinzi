
import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "shipper"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Shipper.getInstance(sequelize)
    return sequelize.define(modelName, {
        shippercode: {
            primaryKey: true,
            type: DataTypes.CHAR(64)
        },
        shippername: DataTypes.CHAR(64),
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Shipper extends ModelBase {
    private static instance: Shipper
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public async getCount(obj: any) {
        let res
        if (obj)
            res = await this.model().count({ where: obj })
        else
            res = await this.model().count()
        return res
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Shipper.instance)
            Shipper.instance = new Shipper(seqz, modelName)
        return Shipper.instance
    }

    public async getShipperName(shippercode: string) {
        let res = await this.model().findOne({ where: { shippercode: shippercode } })
        return res ? res.get() : undefined
    }

    public async getByShipperName(shippername: string) {
        let res = await this.model().findOne({ where: { shippername: shippername } })
        return res ? res.get() : undefined
    }

    public async getShipper() {
        let res = await this.model().findAll()
        return res ? res.map(r => r.get()) : undefined
    }
}
