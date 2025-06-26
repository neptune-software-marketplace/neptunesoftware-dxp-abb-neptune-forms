// The following parameters are available via oEvent.getParameter("parameterName"); 
// 
// value - string
// 
let data = oEvent.getSource().getBindingContext().getObject();
let value = oEvent.getParameter("value");
    value = isNaN(Number.parseFloat(value)) ? undefined : Number.parseFloat(value);
if (!Array.isArray(data.visibleValue)) {
    data.visibleValue = [value];
}
else {
    data.visibleValue[0] = value;
}
modelpanTopProperties.refresh();