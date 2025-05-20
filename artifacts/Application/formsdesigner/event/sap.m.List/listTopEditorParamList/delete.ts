// @ts-ignore
let sourceModel = oEvent.getSource().getModel();
// @ts-ignore
const {paramList} = FORMS.bindingWrapper.Advanced.Configuration.getFormatterConfig(sourceModel.getData());
// @ts-ignore
let parameter = oEvent.getParameter("listItem").getBindingContext().getObject();
let index = paramList.findIndex(item=>item.fieldId === parameter.fieldId);
// Sanity check
if (index<0) {return;}
paramList.splice(index,1);
sourceModel.refresh();
// @ts-ignore
controller.checkVisCondParamValidation();
