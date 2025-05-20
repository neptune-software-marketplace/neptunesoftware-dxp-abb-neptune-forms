console.log("Using OutlineItems@VisibleCondition drop");
// @ts-ignore
let oDraggedControl = oEvent.getParameter("draggedControl");
// @ts-ignore
let oDraggedContext = oDraggedControl.getBindingContext();
// @ts-ignore
const position = oEvent.getParameter("dropPosition");
// @ts-ignore
let oDraggedData = oDraggedContext.getObject();
// @ts-ignore
let oDraggedElementType = controller.getElementType(oDraggedData.type);
if (!oDraggedElementType?.parameter) {
    // @ts-ignore
    oEvent.preventDefault(true);
    return false;
}

// @ts-ignore
let oDroppedData = panTopEditor.getModel().getData();
if (oDroppedData.id === oDraggedData.id) {return;}

// @ts-ignore
let oDraggedSection:any = null;
// @ts-ignore
let pathNodes:any = oDraggedContext.getPath().split("/");
while ((!oDraggedSection) && (pathNodes.length>1)) {
    pathNodes.pop();
    let rejoinedNodes = ((pathNodes.length === 1) && (pathNodes[0] === "")) ? "/" : pathNodes.join("/");
    // @ts-ignore
    let node = oDraggedControl.getModel().getContext(rejoinedNodes).getObject();
    oDraggedSection = ["Form","Table"].includes(node?.type) ? node : null;
}
if (!oDraggedSection) {oDraggedSection = {};}
// @ts-ignore
let formatterConfig = FORMS.bindingWrapper.Advanced.Configuration.getFormatterConfig(oDroppedData);
if (formatterConfig.paramList.find(param=>param.fieldId === oDraggedData.id)) {
    // Does not duplicate
    return;
}
// @ts-ignore
let {toCamelCase} = Utils;
// @ts-ignore
let {getVisCondParamTypeOf, getVisCondParamFieldIdsOf, checkVisCondParamValidation} = controller;

let fieldTitle = toCamelCase(oDraggedData.title);
let sectionTitle = toCamelCase(oDraggedSection.title);
let title = '';
let variable = toCamelCase(`var ${oDraggedData.type}`);;
if (sectionTitle) {
    title = `${sectionTitle}.${fieldTitle}`;
    if (title.length > 30) { title = title.slice(0,27)+"..."; }
}
else {
    title = variable = `${fieldTitle}`;
}
let varType = getVisCondParamTypeOf(oDraggedData);
let fieldId = getVisCondParamFieldIdsOf(oDraggedData);
formatterConfig.paramList.push({
    title,
    variable,
    varType,
    enableDuplicate: oDraggedData.enableDuplicate,
    "fieldId": oDraggedData.id
});
FORMS.bindingWrapper.Advanced.Configuration.setFormatterConfig(oDroppedData, formatterConfig); // bug prevention
checkVisCondParamValidation();

if (!modelappControl.getData().topEditorParametersExpanded) {
    modelappControl.getData().topEditorParametersExpanded = true;
    modelappControl.refresh();
}
