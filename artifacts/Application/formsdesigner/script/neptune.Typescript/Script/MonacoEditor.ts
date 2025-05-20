namespace MonacoEditor {
    let monacoCreated:Function = null;
    export let onCreated:Promise<any> = new Promise(ok => monacoCreated=ok);
    export const fulfillMonacoCreated = (monacoEditor:object)=>monacoCreated(monacoEditor);
    export let instance:any = null;
}