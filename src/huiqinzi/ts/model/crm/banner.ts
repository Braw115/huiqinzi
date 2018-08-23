import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"

const [schema, table] = ["mall", "banner"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Banner.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        pic: DataTypes.TEXT,    //banner图片
        gooduuid: DataTypes.UUID,   //商品uuid,点击banner进入商品详情
        position: DataTypes.INTEGER, //banner的位置
        price: DataTypes.FLOAT,
        synopsis: DataTypes.TEXT,
        title: DataTypes.CHAR(225),
        category: DataTypes.CHAR(128),
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

export class Banner extends ModelBase {
    private static instance: Banner
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Banner.instance)
            Banner.instance = new Banner(seqz, modelName)
        return Banner.instance
    }

    // 添加一个轮播
    public async insertBanner(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    //删除一个banner
    public async deleteBanner(uuid: string) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //修改一个banner
    public async updateBanner(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //查找全部banner
    public async findByPosition() {
        let res = await this.model().findAll({ where: { deleted: 0 }, order: [['position', 'asc']] })
        return res ? res.map(r => r.get()) : undefined
    }
}