import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["users", "crmusers"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Crmusers.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        username: DataTypes.CHAR(128),
        password: DataTypes.CHAR(128),
        description: DataTypes.TEXT,
        state: DataTypes.CHAR(24),
        perm: DataTypes.CHAR(24),
        phone: DataTypes.CHAR(24),
        email: DataTypes.CHAR(64),
        realname: DataTypes.CHAR(64),
        address: DataTypes.TEXT,
        remark: DataTypes.TEXT,
        ext: DataTypes.JSONB,
        deleted: DataTypes.INTEGER,
        created: DataTypes.TIME,
        modified: DataTypes.TIME
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Crmusers extends ModelBase {
    private static instance: Crmusers
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Crmusers.instance)
            Crmusers.instance = new Crmusers(seqz, modelName)
        return Crmusers.instance
    }

    // 添加一个用户
    public async insertUsers(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    // 通过用户名找用户信息(除了删除)
    public async findByUsername(username: string) {
        let res = await this.model().findOne({ where: { username: username, deleted: 0 } })
        return res ? res.get() : undefined
    }

    // 通过用户名找用户信息(包括删除)
    public async findByUsernameNotDel(username: string) {
        let res = await this.model().findOne({ where: { username: username, deleted: 0 } })
        return res ? res.get() : undefined
    }

    // 分页显示用户除密码外的所有信息
    public async findUserInfo(cursor: number, limit: number, search: any) {
        let res = await this.seqz.query(`
                select * from users.crmusers where
                deleted = 0 and username like '%${search}%'
                order by created desc
                offset ${cursor}
                limit ${limit}
            `, { type: "select" }) as any[]
        let countRes = await this.seqz.query(`
        select
           count(*) num
        from users.crmusers
        where  deleted = 0 and username like '%${search}%'`, { type: "select" }) as any[]
        return { res, recordsFiltered: countRes[0].num }
    }

    // 获取用户总数
    public async getUserTotal() {
        let res = await this.seqz.query(`
                        SELECT
                            COUNT(*)
                        FROM
                            public.CRMUSER
                        WHERE
                            DELETED = 0
                        `, { type: "SELECT" })
        return res[0].count
    }

    // 通过主键查找用户
    public async findByPrimary(uuid: any) {
        let res = await this.model().findOne({ where: { uuid: uuid, deleted: 0 } })
        return res ? res.get() : undefined
    }

    // 修改用户信息
    public async updateCrmuser(crmuser: any, uuid: any) {
        let [number, res] = await this.model().update(crmuser, { where: { uuid: uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    // 禁用和启用
    public async resetState(uuid: any, state: string) {
        let [number, res] = await this.model().update({ state: state }, { where: { uuid: uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    // 重置密码
    public async resetPassword(uuid: any, password: string) {
        let [number, res] = await this.model().update({ password: password }, { where: { uuid: uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    // 删除一个用户,伪删除
    public async deleteUser(uuid: number) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { uuid: uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findAllBusiness() {
        let res = await this.model().findAll({ where: { perm: 'business' } })
        return res ? res.map(r => r.get()) : undefined
    }
}