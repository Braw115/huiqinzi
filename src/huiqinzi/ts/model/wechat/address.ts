import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["users", "address"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Address.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {                                 // UUID
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        useruuid: DataTypes.UUID,               // 对应的用户UUID
        address: DataTypes.TEXT,                // 常用收货地址管理	每个最多可预设5个收货地址
        contact: DataTypes.CHAR(36),            // 联系人
        phone: DataTypes.CHAR(20),              // 联系电话
        defaul: DataTypes.ENUM("yes", "no"),   // 默认地址：yes-是的 no-不是
        modified: DataTypes.TIME,
        created: DataTypes.TIME,
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Address extends ModelBase {
    private static instance: Address
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }
    public static getInstance(seqz: Sequelize = undefined) {
        if (!Address.instance)
            Address.instance = new Address(seqz, modelName)
        return Address.instance
    }

    public async createAddress(obj: any) {
        let res = await this.model().create(obj)
        return res.get()
    }

    public async updatedefaul(useruuid: string, defaul: string) {
        let [number, res] = await this.model().update({ defaul: defaul }, { where: { useruuid: useruuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async getCount(useruuid: string) {
        return await this.model().count({ where: { useruuid: useruuid } })
    }

    public async deleteAddress(uuid: string) {
        await this.model().destroy({ where: { uuid: uuid } })
    }

    public async updateAddress(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid: uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res.get()
    }

    public async findByUseruuid(useruuid: string) {
        let res = await this.model().findAll({ where: { useruuid: useruuid }, order: [['created', 'desc']] })
        return res.map(r => r.get())
    }

    public async updateState(useruuid: string, uuid: string) {
        await this.seqz.transaction(async t => {
            await this.model().update({ defaul: "no" }, { where: { useruuid: useruuid, defaul: "yes" }, transaction: t })
            let [number, res] = await this.model().update({ defaul: "yes" }, { where: { uuid: uuid }, transaction: t, returning: true })
            return number > 0 ? res[0].get() : undefined
        })
    }

    public async getDefaultAddress(useruuid: string) {
        let res = await this.model().findOne({ where: { useruuid: useruuid, defaul: 'yes' } })
        return res ? res.get() : undefined
    }
}

