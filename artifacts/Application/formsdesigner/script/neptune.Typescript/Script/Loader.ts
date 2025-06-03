namespace Loader {  // #57 #58
    let promiseResolve,promiseReject;
    let promiseLoaded = new Promise((resolve, reject)=> {promiseResolve=resolve;promiseReject=reject;});
    let mapRequests = new Map();
    let timeoutHandle = setTimeout(()=>promiseReject("Timeout"), 5000);
    export async function onLoad() {
        return promiseLoaded;
    }
    export function requestDone(key) {
        mapRequests.set(key, false);
    }
    export function markDone(key) {
        mapRequests.set(key, true);
        let complete = true;
        for (let result of mapRequests.values()) {
            if (!result) { complete = false; break; }
        }
        if (complete) {
            clearTimeout(timeoutHandle);
            promiseResolve("Ok");
        }
    }
}
Loader.requestDone("cockpitUtils");
Loader.requestDone("controller");
Loader.requestDone("Utils");
Loader.requestDone("EndOfScript");
