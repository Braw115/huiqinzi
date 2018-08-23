import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"
// import * as moment from "moment"

const [schema, table] = ["mall", "todayincome"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    TodayIncome.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        useruuid: DataTypes.UUID,
        income:DataTypes.FLOAT,
        modified: DataTypes.TIME,
        today: DataTypes.STRING
        
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class TodayIncome extends ModelBase {
    private static instance: TodayIncome
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!TodayIncome.instance)
        TodayIncome.instance = new TodayIncome(seqz, modelName)
        return TodayIncome.instance
    }
   //新增
   public async insertTodayIncome(obj: any) {
    let res = await this.model().create(obj, { returning: true })
    return res ? res.get() : undefined
    }
   

    //更新
    public async updateIncome(uuid: string, income: any) {
        let [number, res] = await this.model().update({
            income: Sequelize.literal(`income+${income}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //查询今日收益
    public async findIncome(uuid:string) {
        return await this.seqz.query(`
        select income from mall.todayincome
        where deleted = ${uuid}
        `, { type: "select" }) as any[]
    }
    //查询今日收益记录
    public async findByUserAndToday(useruuid:string,today:string) {
        //let res = await this.model().findAll({ order: [['position', 'desc'], ['created', 'desc']] })
        let res = await this.model().findOne({ where: { useruuid,today } })
        return res ? res.get() : undefined
    }

   

   
}