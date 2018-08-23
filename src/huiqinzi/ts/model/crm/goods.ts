import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "goods"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Goods.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        title: DataTypes.STRING,    //商品标题
        price: DataTypes.FLOAT,  //价格
        realprice: DataTypes.FLOAT,  //内部核算价格
        specialprice: DataTypes.FLOAT, //特价
        detail: DataTypes.TEXT,  //详情
        category: DataTypes.UUID,    //大类
        subcategory: DataTypes.UUID, //小类
        pricetag: DataTypes.JSONB,   //价格标签
        state: DataTypes.STRING, //on,off,new
        pics: DataTypes.ARRAY(DataTypes.TEXT),    //图片数组
        position: DataTypes.INTEGER, //排列的位置
        hotposition: DataTypes.INTEGER, //排列的位置
        sold: DataTypes.INTEGER, //已售
        inventory: DataTypes.INTEGER, //库存
        city: DataTypes.CHAR(128),  //投放城市
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

export class Goods extends ModelBase {
    private static instance: Goods
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Goods.instance)
            Goods.instance = new Goods(seqz, modelName)
        return Goods.instance
    }

    //新加一个商品
    public async insertGoods(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    //删除一个商品
    public async deleteGoods(uuid: string) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //更新一个商品
    public async updateGoods(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    // 分页分类查找全部的商品
    public async findAllGoods(cursor: number, limit: number, category: string, subcategory: string, search: any, state: any) {
        let goods, count
        if (!state) {
            goods = await this.seqz.query(`
            select * from mall.goods where
            deleted = 0
            and title like '%${search}%'
            and category = '${category}'
            and subcategory = '${subcategory}'
            order by position desc,created desc
            offset ${cursor}
            limit ${limit}
        `, { type: "select" }) as any[]

            count = await this.seqz.query(`
            select count(*) from mall.goods where
            deleted =0
            and title like '%${search}%'
            and category = '${category}'
            and subcategory = '${subcategory}'
            `, { type: "select" }) as any[]
        } else {
            goods = await this.seqz.query(`
            select * from mall.goods where
            deleted = 0
            and title like '%${search}%'
            and category = '${category}'
            and subcategory = '${subcategory}'
            and state = '${state}'
            order by position desc,created desc
            offset ${cursor}
            limit ${limit}
        `, { type: "select" }) as any[]

            count = await this.seqz.query(`
            select count(*) from mall.goods where
            deleted =0
            and title like '%${search}%'
            and category = '${category}'
            and subcategory = '${subcategory}'
            and state = '${state}'
            `, { type: "select" }) as any[]
        }

        return { goods, recordsFiltered: count[0].count }
    }

    public async deleteBySubcategory(subcategory: string) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { subcategory }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findBySubcategory(subcategory: string) {
        let res = await this.model().findAll({ where: { subcategory, deleted: 0 } })
        return res ? res.map(r => r.get()) : undefined
    }

    public async deleteByCategory(category: string) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { category }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findAllByCategory(category: string) {
        let res = await this.model().findAll({ where: { category, deleted: 0 } })
        return res ? res.map(r => r.get()) : undefined
    }

    public async findByCategory(category: string) {
        let res = await this.seqz.query(`
            select g.uuid from mall.goods g
            where g.category = '${category}'
            or g.subcategory = '${category}'
        `, { type: "select" }) as any[]
        return res
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res ? res.get() : undefined
    }

    public async search(search: any) {
        let res = await this.seqz.query(`
        select * from mall.goods
        where deleted = 0
        and title like '%${search}%'
        `, { type: "select" }) as any[]
        return res
    }

    public async updateSoldInventory(uuid: string, amount: any) {
        let [number, res] = await this.model().update({
            inventory: Sequelize.literal(`inventory-${amount}`),
            sold: Sequelize.literal(`sold+${amount}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //查询一个商品
    public async findGoodsByPosition() {
        let res = await this.model().findAll({ order: [['position', 'desc'], ['created', 'desc']] })
        return res.map(r => r.get())
    }

    //商品
    public async hot() {
        let res = await this.model().findAll({ where: { hotposition: { $gt: 0 }, deleted: 0 }, order: [['hotposition', 'desc'], ['created', 'desc']], offset: 0, limit: 100 })
        return res.map(r => r.get())
    }
    //热销商品
    public async findAllBySold() {
        let res = await this.seqz.query(
            `select * from mall.goods
            ORDER BY sold DESC `, { type: "select" } 
        )as any[]
        return res
    }
}