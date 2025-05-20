// Checks if the drop will work
console.log("Using OutlineItems@VisibleCondition dragEnter");
// @ts-ignore
let oDragSession:any = oEvent.getParameter("dragSession");
// @ts-ignore
let oDraggedControl = oDragSession.getDragControl();
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
if (oDroppedData.id === oDraggedData.id) {
    // Cannot drop self
    // @ts-ignore
    oEvent.preventDefault(true);
    return false;
}

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
if ((typeof formatterConfig !== "object") || (formatterConfig === null)) {
    formatterConfig = FORMS.bindingWrapper.Advanced.Generator.emptyFormatterConfig();
}
if (!Array.isArray(formatterConfig.paramList)) {
    formatterConfig.paramList = [];
}
if (formatterConfig.paramList.find(param=>param.fieldId === oDraggedData.id)) {
    // Does not duplicate
    // @ts-ignore
    oEvent.preventDefault(true);
    return false;
}
return true;
