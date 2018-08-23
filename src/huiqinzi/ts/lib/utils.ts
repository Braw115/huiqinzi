import { createHash, randomBytes } from "crypto"
import { ReqError } from "../lib/reqerror"
import { logistics } from "../config/logistics"
import iconv = require('iconv-lite')
import { postAsync } from "../lib/request"

export function checkPassword(real: string, current: string): void {
    let [a, b] = [real.length === 32 ? real : md5sum(real), current.length === 32 ? current : md5sum(current)]
    if (a !== b)
        throw new ReqError("密码不正确！", 400)
}

export function randomInt(from: number, to: number) {
    return Math.floor(Math.random() * (to - from) + from)
}


export function md5sum(str: string): string {
    return createHash('md5').update(str).digest("hex")
}

export function getSalt(): string {
    return randomBytes(128).toString('base64');
}

export function sleepAsync(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(() => resolve(), ms))
}

export function getPageCount(page: string, count?: string) {
    let limit = parseInt(count)
    let cursor = 0
    if (parseInt(page) > 1) {
        cursor = (parseInt(page) - 1) * parseInt(count)
    }
    return { cursor, limit }
}

export function checkCursorLimit(cursor: number, limit: number) {
    if (cursor > -1 && limit > 0)
        return false
    return true
}

export async function checkreq(param: Array<any>, sign: string, next: any) {
    param.sort()
    let s = param.join(",")
    if (sign === md5sum(s)) {
        return next()
    }
    return "参数错误!"
}



export function getSign(order: any, key: string) {
    delete order.sign
    let arr = new Array<any>()
    for (let k in order) {
        arr.push(`${k}=${order[k]}`)
    }
    arr.sort()
    arr.push(`key=${key}`)
    return md5sum(arr.join("&")).toUpperCase()
}
export function numcheckundefined(num: any) {
    if (num == undefined) num = 0
    return num
}
export function strcheckundefined(str: any) {
    if (str == undefined) str = ''
    return str
}
export function getRendomQuestions(num: number, arr: any[]) {
    let indexarr: number[], resarr: any[]
    if (num < arr.length) {
        while (indexarr.length < num) {     //取num个小于arr.length的不重复随机数字
            let i = Math.round(Math.random() * (arr.length - 1))
            for (let j = 0; j < indexarr.length; j++) {
                if (i == indexarr[j]) break
                else if (j == indexarr.length - 1) indexarr.push(i)
            }
        }
        for (let i = 0; i < num; i++) {    //根据获取的随机送取得arr中的数据
            if (i >= arr.length) break
            resarr.push(arr[indexarr[i]])
        }
    } else {
        resarr = arr
    }
    return resarr
}

export async function getOrderTracesByJson(expCode: string, expNo: string, orderCode: string) {
    let requestData = {
        'OrderCode': orderCode,
        'ShipperCode': expCode,
        'LogisticCode': expNo
    }
    let dataSign = new Buffer(md5sum(JSON.stringify(requestData) + logistics.AppKey)).toString('base64')
    let options = {
        url: logistics.url,
        headers: {
            'accept': "*/*",
            'connection': "Keep-Alive",
            'user-agent': "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)",
            'Content-Type': "application/x-www-form-urlencoded"
        },
        form: {
            RequestData: iconv.encode(JSON.stringify(requestData), "UTF-8"),
            EBusinessID: logistics.EBusinessID,
            RequestType: logistics.RequestType,
            DataSign: iconv.encode(dataSign, "UTF-8"),
            DataType: logistics.DataType
        }
    }
    let s = await postAsync(options)
    return s
}

export function logisticsReturn() {
    let res = {
        "EBusinessID": logistics.EBusinessID,
        "UpdateTime": new Date(),
        "Success": true
    }
    return res
}