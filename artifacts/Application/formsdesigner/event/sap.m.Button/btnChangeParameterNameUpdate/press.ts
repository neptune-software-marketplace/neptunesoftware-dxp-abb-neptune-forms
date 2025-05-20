// Updates the data to the source
let diaData = modeldiaChangeParameterName.getData();
if (!diaData.variable) {
    sap.m.MessageToast.show("Please supply a valid name for the variable.");
}
let sourceData = diaData._source;
if (diaData.variable === sourceData.variable) {
    diaChangeParameterName.close();
}
sourceData.variable = diaData.variable;
// @ts-ignore
controller.checkVisCondParamValidation();
diaChangeParameterName.close();