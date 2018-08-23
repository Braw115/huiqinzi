import * as winston from "winston"
import { Activity } from "../../model/crm/activity"
import * as moment from "moment"
const format = 'YYYY-MM-DD HH:mm:ss'
const ONLINT_INTERVAL = 30
const ONLINT_FETCH_INTERVAL = ONLINT_INTERVAL * 1000 * 60

export async function init(map: { deamonNotifyMap: Map<string, Function>, deamonGetMap: Map<string, Function> }) {
    AutoOnline.getInstance().run()
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class AutoOnline {
    private static instance = new AutoOnline()
    private constructor() { }
    public static getInstance() {
        return AutoOnline.instance
    }

    private async autoOnline(): Promise<any> {
        let activitys = await Activity.getInstance().findBy(
            {
                $or: [{ state: "wait-on" }, { state: "on" }]
            }
        )

        for (let i = 0; i < activitys.length; i++) {
            let act = activitys[i]
            if (act.opentime && act.closetime) {
                let { opentime, closetime } = { opentime: moment(act.opentime).format(format), closetime: moment(act.closetime).format(format) }
                let now = moment().format(format)
                if (now > opentime && now < closetime && act.state === "wait-on")
                    await Activity.getInstance().updateActivity(act.uuid, { state: "on" })
                if (now > closetime)
                    await Activity.getInstance().updateActivity(act.uuid, { state: "off" })
            }

        }

    }

    public async run() {
        while (true) {
            await sleep(ONLINT_FETCH_INTERVAL)
            try {

                await this.autoOnline()

            } catch (e) {
                winston.error(`notice remind manager fail. ${e.message}`)
            }
        }
    }
}

