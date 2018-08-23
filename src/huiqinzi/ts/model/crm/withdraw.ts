import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "withdraw"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Withdraw.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        useruuid: DataTypes.UUID,   //用户uuid
        amount: DataTypes.FLOAT,    //金额
        remark: DataTypes.STRING,   //备注
        state: DataTypes.STRING,       //状态，待受理，已受理，已拒绝
        created: DataTypes.TIME,
        modified: DataTypes.TIME
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Withdraw extends ModelBase {
    private static instance: Withdraw
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Withdraw.instance)
            Withdraw.instance = new Withdraw(seqz, modelName)
        return Withdraw.instance
    }

    //
    public async insertWithdraw(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    //
    public async updateWithdraw(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findByUseruuid(useruuid: string) {
        let res = await this.model().findAll({ where: { useruuid }, order: [['created', 'desc']] })
        return res ? res.map(r => r.get()) : undefined
    }

    public async findAll(state: any, cursor: any, length: any) {
        let res
        if (state)
            res = await this.model().findAll({ where: { state }, offset: cursor, limit: length })
        else
            res = await this.model().findAll({ offset: cursor, limit: length })
        return res ? res.map(r => r.get()) : undefined
    }
    //查询提现记录
    public async findAll2( cursor: any, length: any) {
        let res = await this.model().findAll({ offset: cursor, limit: length })
        let count = await this.seqz.query(`
        select count(*) from  mall.withdraw
        `, { type: "select" }) as any[]
        return {res, recordsFiltered: count[0].count}
}

    public async getCount(state: any) {
        let res
        if (state)
            res = await this.model().count({ where: { state } })
        else
            res = await this.model().count()
        return res
    }

    public async findByStateAndUseruuid(useruuid: string, state: string) {
        let count = await this.seqz.query(`
            select sum(amount) from mall.withdraw
            where useruuid = '${useruuid}'
            and state = '${state}'
        `, { type: "select" }) as any[]
        return count[0].sum
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res.get()
    }

}