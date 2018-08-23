import { DataTypes, Sequelize } from "sequelize"
import { ModelBase } from "../lib/modelbase"
// import * as moment from "moment"

const [schema, table] = ["mall", "activity"]
const modelName = `${schema}.${table}`

export const defineFunction = function (sequelize: Sequelize) {
    Activity.getInstance(sequelize)
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        title: DataTypes.STRING,    //活动标题
        price: DataTypes.FLOAT,  //价格
        realprice: DataTypes.FLOAT,  //内部核算价格
        specialprice: DataTypes.FLOAT, //特价
        groupbyprice: DataTypes.FLOAT,   //团购价，拼团，疯抢活动有效
        amount: DataTypes.INTEGER,  //需要人数，只在拼团有效
        opentime: DataTypes.STRING,    //开放时间，只在限时抢购有效
        closetime: DataTypes.STRING,   //关闭时间，只在限时抢购有效
        detail: DataTypes.TEXT,  //详情
        category: DataTypes.UUID,    //大类
        subcategory: DataTypes.UUID, //小类
        pricetag: DataTypes.JSONB,   //价格标签
        state: DataTypes.STRING, //on,off,new,wait-on
        pics: DataTypes.ARRAY(DataTypes.TEXT),    //图片数组
        position: DataTypes.INTEGER, //排列的位置
        city: DataTypes.STRING,  //投放城市
        sold: DataTypes.INTEGER,    //已售量
        realsold: DataTypes.INTEGER,    //真实已售量
        businessuuid: DataTypes.UUID,   //商家帐号的uuid
        reservation: DataTypes.BOOLEAN, //是否需要预约
        acttime: DataTypes.ARRAY(DataTypes.TEXT),       //活动时段（周一到周日）
        endtime: DataTypes.TIME,   //结束时间
        substance: DataTypes.BOOLEAN, //是否是实体商品
        deleted: DataTypes.INTEGER,//是否删除,0没有删除,1删除
        hotposition: DataTypes.INTEGER, //热卖排序位置
        created: DataTypes.TIME,
        modified: DataTypes.TIME,
        sharenum: DataTypes.INTEGER,//该商品的分享数
        distribute: DataTypes.STRING,//是否为分销商品1为分销商品,0不为
        distributeprice:DataTypes.FLOAT//分销价
        
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}

export class Activity extends ModelBase {
    private static instance: Activity
    private getlist = "uuid,title,price,pics,realprice,specialprice,"
        + "groupbyprice,amount,opentime,closetime,category,subcategory,"
        + "pricetag,state,pics,position,city,sold,realsold,businessuuid,"
        + "reservation,acttime,endtime,substance,deleted,hotposition,"
        + "created,modified,distribute,distributeprice"
    private constructor(seqz: Sequelize, modelName: string) {
        super(seqz, modelName)
    }

    public static getInstance(seqz: Sequelize = undefined) {
        if (!Activity.instance)
            Activity.instance = new Activity(seqz, modelName)
        return Activity.instance
    }

    //新增一个活动
    public async insertActivity(obj: any) {
        let res = await this.model().create(obj, { returning: true })
        return res ? res.get() : undefined
    }

    //删除一个活动
    public async deleteActivity(uuid: string) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //更新一个活动
    public async updateActivity(uuid: string, obj: any) {
        let [number, res] = await this.model().update(obj, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    //查询一个活动
    public async findActivityByPosition() {
        let res = await this.model().findAll({ order: [['position', 'desc'], ['created', 'desc']] })
        return res.map(r => r.get())
    }

    //查询一个活动
    public async findActivityByHotPosition() {
        let res = await this.model().findAll({ order: [['hotposition', 'desc'], ['created', 'desc']] })
        return res.map(r => r.get())
    }

    //分页查询全部的活动
    public async findAllActivity(cursor: number, limit: number, category: string, subcategory: string, search: any) {
        let activity = await this.seqz.query(`
        select ${this.getlist} from mall.activity where
        deleted = 0
        and title like '%${search}%'
        and category = '${category}'
        and subcategory = '${subcategory}'
        order by position desc, created desc
        offset ${cursor}
        limit ${limit}
    `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
        select count(*) from mall.activity where
        deleted =0
        and title like '%${search}%'
        and category = '${category}'
        and subcategory = '${subcategory}'
        `, { type: "select" }) as any[]
        return { activity, recordsFiltered: count[0].count }
    }

    //分页查询所有全部活动
    public async findAll(cursor: number, limit: number) {
        let activity = await this.seqz.query(`
        select ${this.getlist} from mall.activity where
        deleted =0
        order by position desc, created desc
        offset ${cursor}
        limit ${limit}
    `, { type: "select" }) as any[]

    let count = await this.seqz.query(`
        select count(*) from mall.activity where
        deleted =0
        `, { type: "select" }) as any[]
        return { activity, recordsFiltered: count[0].count }
    }

    public async findBySubcategory(subcategory: string) {
        let res = await this.model().findAll({ where: { subcategory, deleted: 0 } })
        return res ? res.map(r => r.get()) : undefined
    }

    public async findAllByCategory(category: string) {
        let res = await this.model().findAll({ where: { category, deleted: 0 } })
        return res ? res.map(r => r.get()) : undefined
    }

    public async deleteBySubcategory(subcategory: string) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { subcategory }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findByBusinessUUID(businessuuid: string) {
        /* let res = await this.model().findAll({ attributes: ['uuid'], where: { businessuuid } })
        return res ? res.map(r => r.get()) : undefined */
        let res = await this.seqz.query(`
            select uuid from mall.activity
            where businessuuid = '${businessuuid}'
        `, { type: 'select' }) as any[]
        return res
    }

    //根据商户uuid查询active
    public async findActByBusinessUUID(cursor: number, limit: number, category: string, subcategory: string, search: any,businessuuid: string) {
       
        let activity = await this.seqz.query(`
        select ${this.getlist} from mall.activity where
        deleted =0 
        and title like '%${search}%'
        and category = '${category}'
        and subcategory = '${subcategory}'
        and businessuuid ='${businessuuid}'
        order by position desc, created desc
        offset ${cursor}
        limit ${limit}
    `, { type: "select" }) as any[]

    let count = await this.seqz.query(`
        select count(*) from mall.activity where
        deleted =0 
        and title like '%${search}%'
        and category = '${category}'
        and subcategory = '${subcategory}'
        and businessuuid = '${businessuuid}'
        `, { type: "select" }) as any[]
        return { activity, recordsFiltered: count[0].count }
    }

    public async deleteByCategory(category: string) {
        let [number, res] = await this.model().update({ deleted: 1 }, { where: { category }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async findByPrimary(uuid: string) {
        let res = await this.model().findByPrimary(uuid)
        return res ? res.get() : undefined
    }
    //返回不包含detail字段
    public async findByUuid(uuid: string) {
         let activity  = await this.seqz.query(`
         select ${this.getlist} from mall.activity where uuid = '${uuid}'`, { type: "select" }) as any[]
        return activity[0] 
    }

    public async findByCatagory(category: string) {
        let res = await this.seqz.query(`
        select a.uuid from mall.activity a
        where a.category = '${category}'
        or a.subcategory = '${category}'
        `, { type: "select" }) as any[]
        return res
    }

    //全部的团购活动
    public async findAllGroupActivity(cursor: number, limit: number, category: string, subcategory: string, city: string) {
        // let now = moment().format('YYYY-MM-DD HH:mm:ss')
        let activity = await this.seqz.query(`
        select ${this.getlist} from mall.activity where
        deleted = 0
        and category = '${category}'
        and subcategory = '${subcategory}'
        and groupbyprice is not null
        and amount is not null
        and city = '${city}'
        and state = 'on'
        order by position desc, created desc
        offset ${cursor}
        limit ${limit}
    `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
        select count(*) from mall.activity where
        deleted =0
        and groupbyprice is not null
        and amount is not null
        and category = '${category}'
        and subcategory = '${subcategory}'
        and city = '${city}'
        and state = 'on'
        `, { type: "select" }) as any[]
        return { activity, recordsFiltered: count[0].count }
        // and opentime < '${now}'
        // and closetime > '${now}'
    }
    
    //全部的限时抢购,正在进行的
    public async getTimeLimit(cursor: number, limit: number, category: string, subcategory: string, city: string) {
        let activity = await this.seqz.query(`
        select ${this.getlist} from mall.activity where
        deleted = 0
        and category = '${category}'
        and subcategory = '${subcategory}'
        and state = 'on'
        and city = '${city}'
        order by position desc, created desc
        offset ${cursor}
        limit ${limit}
    `, { type: "select" }) as any[]

        let count = await this.seqz.query(`
        select count(*) from mall.activity where
        deleted =0
        and state = 'on'
        and category = '${category}'
        and subcategory = '${subcategory}'
        and city = '${city}'
        `, { type: "select" }) as any[]
        return { activity, recordsFiltered: count[0].count }
    }

    public async findOrdinary(cursor: number, limit: number, category: string, subcategory: string, city: string) {
        let activity = await this.seqz.query(`
        select ${this.getlist} from mall.activity where
        deleted = 0
        and state = 'on'
        and category = '${category}'
        and subcategory = '${subcategory}'
        and city = '${city}'
        order by position desc, created desc
        offset ${cursor}
        limit ${limit}
    `, { type: "select" }) as any[]
        // and opentime is null
        // and closetime is null
        let count = await this.seqz.query(`
        select count(*) from mall.activity where
        deleted =0
        and state = 'on'
        and category = '${category}'
        and subcategory = '${subcategory}'
        and city = '${city}'
    `, { type: "select" }) as any[]
        return { activity, recordsFiltered: count[0].count }
    }

    public async search(search: any, city: string) {
        let res = await this.seqz.query(`
        select ${this.getlist} from mall.activity
        where deleted = 0
        and title like '%${search}%'
        and city = '${city}'
        `, { type: "select" }) as any[]
        return res
    }

    public async updateSold(uuid: string, amount: any) {
        let [number, res] = await this.model().update({
            sold: Sequelize.literal(`sold+${amount}`),
            realsold: Sequelize.literal(`realsold+${amount}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }

    public async find() {
        return await this.seqz.query(`
        select ${this.getlist} from mall.activity
        where deleted = 0
        `, { type: "select" }) as any[]
    }

    public async findBy(obj: any) {
        let res = await this.model().findAll({ where: obj })
        return res.map(r => r.get())
    }

    public async hot() {
        let res = await this.seqz.query(`
            select uuid,title,price,pics,groupbyprice,amount,opentime,closetime,category,subcategory,pricetag,position,city,sold,businessuuid,deleted reservation,created,modified,actitme,endtime,hotposition,realprice,acttime,specialprice,substance,realsold,state ,sharenum from mall.activity
            where ((state = 'on' and opentime is null and closetime is null and groupbyprice is null and amount is null) or
            ( state = 'on' and groupbyprice is not null and amount is null) or
            ( state = 'on' and groupbyprice is not null and amount is not null))
            and hotposition>0 order by  hotposition ASC, sold desc
            limit 100
        `, { type: 'select' }) as any[]
        return res
    }

    public async updateSoldInventory(uuid: string, amount: any) {
        let [number, res] = await this.model().update({
            sold: Sequelize.literal(`sold+${amount}`),
            realsold: Sequelize.literal(`realsold+${amount}`)
        },
            { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //更新分享数
    public async updateShareNum(uuid:string,sharenum:number){
        let [number, res]  = await this.model().update({sharenum}, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
    //查询分销活动
    public async findAllByDistribute(distribute:string,){
        let res = await this.seqz.query(`
            select uuid,title,price,pics,groupbyprice,amount,opentime,closetime,category,subcategory,pricetag,position,city,sold,businessuuid,deleted reservation,created,modified,actitme,endtime,hotposition,realprice,acttime,specialprice,substance,realsold,state ,sharenum from mall.activity
            where ((state = 'on' and opentime is null and closetime is null and groupbyprice is null and amount is null) or
            ( state = 'on' and groupbyprice is not null and amount is null) or
            ( state = 'on' and groupbyprice is not null and amount is not null))
            and hotposition>0  and distribute='${distribute}' order by  hotposition ASC, sold desc
            limit 100
        `, { type: 'select' }) as any[]
        return res
        
    }
    //模糊(标题)查询分销活动
    public async findDistributeBySearch(search:string) {
        let res = await this.seqz.query(`
        select ${this.getlist} from mall.activity
        where title like '%${search}%'
        and distribute = '1'
        `, { type: "select" }) as any[]
        return res
    }
     //添加分销商品(更新distribute字段为1)
     public async updateDistribute(uuid:string,distribute:string){
        let [number, res]  = await this.model().update({distribute}, { where: { uuid }, returning: true })
        return number > 0 ? res[0].get() : undefined
    }
}