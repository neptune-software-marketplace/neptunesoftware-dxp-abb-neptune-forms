// @ts-ignore
const {paramList,code} = FORMS.bindingWrapper.Advanced.Configuration.getFormatterConfig(modelpanTopEditor.getData());
// @ts-ignore
try {controller.checkVisCondParamValidation();} catch(e) {}
try{
    new Function(...(paramList ?? []).map(param=>param.variable), code);
    sap.m.MessageToast.show("Activation successfull!");
}
catch (e) {
    console.error(e);
    const errorText = ((typeof e === "string") ? e : (typeof e?.toString === "function" ? e.toString(): ""));
    // @ts-ignore
    sap.m.MessageBox.error(`${errorText}\n\nPlease check the code.`, {title:"Activation error"});
}