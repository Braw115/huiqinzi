import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["users", "groups"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Groups.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        activityuuid: DataTypes.UUID,
        useruuids: DataTypes.ARRAY(DataTypes.UUID),
        state: DataTypes.STRING,
        pic: DataTypes.CHAR(255),
        created: DataTypes.TIME,
        modified: DataTypes.TIME
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Groups extends ModelBase {
    private static instance: Groups
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Groups.instance)
            Groups.instance = new Groups(seqz, modelName)
        return Groups.instance
    }

    public async insertGroup(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    public async updateUseruuids(uuid: string, useruuids: string[]) {
        let [number, res] = await this.model().update({ useruuids }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async updateState(uuid: string, state: string) {
        let [number, res] = await this.model().update({ state }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findAllGroupsByAct(activityuuid: string, cursor: number, limit: number) {
        let res
        if (cursor != undefined && limit != undefined)
            res = await this.model().findAll({ where: { activityuuid }, offset: cursor, limit: limit })
        else
            res = await this.model().findAll({ where: { activityuuid } })

        return res ? res.map(r => r.get()) : undefined
    }

    public async getCountByActUUID(activityuuid: string) {
        let res = await this.model().count({ where: { activityuuid } })
        return res
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res ? res.get() : undefined
    }

    public async updateGroup(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
}
