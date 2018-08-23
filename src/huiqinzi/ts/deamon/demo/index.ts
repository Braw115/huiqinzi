export function init(map: { deamonNotifyMap: Map<string, Function>, deamonGetMap: Map<string, Function> }) {
    map.deamonNotifyMap.set("demoSet", demoSet)
    map.deamonGetMap.set("demoGet", demoGet)
}

function demoSet(event: string, args: any) {

}

async function demoGet(event: string, args: any) {
    return new Date()
}