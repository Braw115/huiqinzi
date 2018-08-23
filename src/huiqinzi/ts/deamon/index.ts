let deamonGetMap: Map<string, any>
let deamonNotifyMap: Map<string, any>

function checkFunction(map: Map<string, any>, event: string): Function {
    let f = map.get(event)
    if (!f)
        throw new Error("invalid event " + event)
    return f
}
export function deamonNotify(event: string, args?: any) {
    checkFunction(deamonNotifyMap, event)(event, args)
}

export async function deamonGet(event: string, args?: any) {
    return checkFunction(deamonGetMap, event)(event, args)
}

import { stat } from "fs"
import { join } from "path"
import winston = require("winston")
import { promisify } from "bluebird"
import * as assert from "assert"
import { MinioHelper } from "../lib/miniohelper"
import { minioObj } from "../config/minio"
export async function init() {
    [deamonGetMap, deamonNotifyMap] = [new Map(), new Map()]

    let paths: string[] = [
        "./demo/index",
        "./activity/index"
    ]

    const statAsync = promisify(stat)
    await Promise.all(paths.map(path => statAsync(join(__dirname, path) + ".js")))
    paths.forEach(path => {
        let m = require(path)
        assert(m.init, `miss init in file ${path}`)
        m.init({ deamonNotifyMap, deamonGetMap })
    })

    winston.info("init deamon ok")

    //  新建minio文件夹和授权
    await initMinio()
}

async function initMinio() {
    let bucketArr = minioObj.bucket
    bucketArr.forEach(async item => {
        let targ = await MinioHelper.getInstance().bucketExists(item)
        if (!targ) {
            await MinioHelper.getInstance().makeBucket(item)
            await MinioHelper.getInstance().setBucketPolicy(item, '*')
        }
    })
}
