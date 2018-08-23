import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["sys", "system"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    System.getInstance(sequelize)
    return sequelize.define(modelName, {
        name: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        value: DataTypes.JSONB
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table
        })
}

export class System extends ModelBase {
    private static instance: System
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!System.instance)
            System.instance = new System(seqz, modelName)
        return System.instance
    }

    public async insertOne(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    public async updateOne(name: string, value: any) {
        let [number, res] = await this.model().update({ value }, { where: { name }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findByName(name: string) {
        let res = await this.model().findByPrimary(name)
        return res ? res.get() : undefined
    }

    public async findAll() {
        let res = await this.model().findAll()
        return res ? res.map(r => r.get()) : undefined
    }
}