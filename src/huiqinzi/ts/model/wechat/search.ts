import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["users", "search"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Search.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        useruuid: DataTypes.UUID,   //用户
        words: DataTypes.STRING,    //搜索记录
        created: DataTypes.TIME
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Search extends ModelBase {
    private static instance: Search
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Search.instance)
            Search.instance = new Search(seqz, modelName)
        return Search.instance
    }

    public async insertSearch(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    public async countByUserUUID(useruuid: string) {
        return await this.model().count({ where: { useruuid } })
    }

    public async deleteOldest(useruuid: string) {
        return await this.seqz.transaction(async t => {
            let search = await this.model().findAll({ where: { useruuid }, order: [['created', 'asc']], transaction: t })
            let arr = search.map(r => r.get())
            return await this.model().destroy({ where: { useruuid: arr[0].useruuid }, transaction: t })
        })
    }

    public async getByUserUUID(useruuid: string) {
        let res = await this.model().findAll({ where: { useruuid } })
        return res ? res.map(r => r.get()) : undefined
    }

    public async deleteByUserUUID(useruuid: string) {
        return await this.model().destroy({ where: { useruuid } })
    }

    public async deleteByUUID(uuid: string) {
        return await this.model().destroy({ where: { uuid } })
    }

    public async getBywords(useruuid: string, words: string) {
        let res = await this.model().findOne({ where: { useruuid, words } })
        return res ? res.get() : undefined
    }
}
