import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "category"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Category.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: DataTypes.TEXT,   //类名
        parent: DataTypes.UUID, //父类uuid
        pic: DataTypes.TEXT,    //图片
        key: DataTypes.CHAR(225),
        position: DataTypes.INTEGER     //位置
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table
        })
}

export class Category extends ModelBase {
    private static instance: Category
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Category.instance)
            Category.instance = new Category(seqz, modelName)
        return Category.instance
    }

    public async insertCategroy(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    public async deleteCategory(uuid: string) {
        return await this.model().destroy({ where: { uuid: uuid } })
    }

    public async updateCategory(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //查找全部的大类
    public async findAllCategory(start: any, length: any) {
        let category = await this.seqz.query(`
        select * from mall.category
        where parent is null
        order by position asc
        offset ${start} limit ${length}
        `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
        select count(*) from mall.category
        where parent is null
        `, { type: "select" }) as any[]

        return { category, recordsFiltered: count[0].count }
    }

    //查找全部的小类
    public async findAllCategoryByParent(start: any, length: any, parent: string) {
        let category = await this.seqz.query(`
        select * from mall.category
        where parent ='${parent}'
        order by position asc
        offset ${start} limit ${length}
        `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
        select count(*) from mall.category
        where parent = '${parent}'
        `, { type: "select" }) as any[]
        return { category, recordsFiltered: count[0].count }
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res ? res.get() : undefined
    }

    public async deleteByParent(parent: string) {
        return await this.model().destroy({ where: { parent } })
    }
}