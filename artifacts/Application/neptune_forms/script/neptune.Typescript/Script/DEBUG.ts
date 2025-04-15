// Used for debugging
var FormsWrapper:any = new sap.m.Text("FormsWrapper", {});
setTimeout(()=>FormsWrapper.FORMS = FORMS,100);
// @ts-ignore
window[this.sId] = {FormsWrapper};