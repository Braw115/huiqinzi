import moment = require("moment")

//获取周
export function getWeek(): any {
    return moment(new Date()).format("d")
}

//获取时间戳（秒）
export function getTime(str: string): number {
    return new Date(str).getTime()
}

//获取时间字符串（秒）
export function getTimeStr(str: string): string {
    return moment(new Date(str)).format("YYYY-MM-DD HH:mm:ss")
}

//获取时间字符串（天）
export function getDateStr(str: string): string {
    return moment(new Date(str)).format("YYYY-MM-DD")
}

//获取日
export function getDate(str: string): number {
    return moment(new Date(str)).date()
}

//获取月
export function getMonth(str: string): number {
    return moment(new Date(str)).month() + 1
}

//获取年
export function getYear(str: string): number {
    return moment(new Date(str)).year()
}

//获取时
export function getHour(str: string): number {
    return moment(new Date(str)).hour()
}

//获取分
export function getMinute(str: string): number {
    return moment(new Date(str)).minute()
}

//获取分
export function getSecond(str: string): number {
    return moment(new Date(str)).second()
}

//获取季度
export function getQuarter(str: string): number {
    return moment(new Date(str)).quarter()
}


//获取每月天数
export function getDaysInMonth(str: string): number {
    return moment(new Date(str)).daysInMonth()
}

//获取时间间隔
export function getHourAndMinute(start: string, end: string): any {
    let starttime = new Date(start).getTime() / 1000
    let endtime = new Date(end).getTime() / 1000
    let hour = (endtime - starttime) / 60 / 60
    let minute = ((endtime - starttime) % (60 * 60)) / 60
    return { hour: Math.floor(hour), minute: Math.floor(minute) }
}

//获取时间(天)
function getdate(datestr: any) {
    let temp = datestr.split("-");
    let date = new Date(temp[0], temp[1], temp[2]);
    return date;
}

//获取时间段内日期列表
export function getDateList(start: any, end: any): Array<any> {
    let startTime = getdate(start)
    let endTime = getdate(end)
    let datelist = new Array()
    while ((endTime.getTime() - startTime.getTime()) >= 0) {
        let year = startTime.getFullYear();
        let month = startTime.getMonth().toString().length == 1 ? "0" + startTime.getMonth().toString() : startTime.getMonth();
        let day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
        let da = year + "-" + month + "-" + day
        datelist.push(da)
        startTime.setDate(startTime.getDate() + 1)
    }
    return datelist
}

export function getendtime(starttime: string, hour: number, minute: number): string {
    let res = moment(new Date(starttime)).add('hour', hour).format("YYYY-MM-DD HH:mm:ss")
    return moment(new Date(res)).add('minute', minute).format("YYYY-MM-DD HH:mm:ss")
}

export function getDeadline(day: number): string {
    return moment(new Date()).add('days', day).format("YYYY-MM-DD HH:mm:ss")
}

//
export function getTrue(start: string, end: string, cur: string): any {
    let vstart = start.split(":")
    let vend = end.split(":")
    let vcur = cur.split(":")
    let startt = parseInt(vstart[0]) * 60 + parseInt(vstart[1])
    let endt = parseInt(vend[0]) * 60 + parseInt(vend[1])
    let curt = parseInt(vcur[0]) * 60 + parseInt(vcur[1])
    if (curt <= endt && curt >= startt)
        return true

    return false
}
