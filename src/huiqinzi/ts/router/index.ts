import * as koa from "koa"
import { stat } from "fs"
import { join } from "path"
import winston = require("winston")
import { promisify } from "bluebird"

export async function initRouter(app: koa) {
    const statAsync = promisify(stat)

    let paths = [
        "./file/upload",
        "./crm/crmusers",
        "./crm/activity",
        "./crm/banner",
        "./crm/goods",
        "./crm/category",
        "./crm/groups",
        "./crm/orders",
        "./crm/profit",
        "./crm/system",
        "./crm/wxusers",
        "./crm/logistics",
        "./crm/withdraw",
        "./crm/distribute",
        "./app/wxusers",
        "./app/address",
        "./app/wxpay",
        "./app/activity",
        "./app/goods",
        "./app/orders",
        "./app/withdraw",
        "./app/distribute"
    ]

    await Promise.all(paths.map(path => statAsync(join(__dirname, path) + ".js")))
    paths.forEach(path => app.use(require(path).router.routes()))
    winston.info("initRouter ok")
}
