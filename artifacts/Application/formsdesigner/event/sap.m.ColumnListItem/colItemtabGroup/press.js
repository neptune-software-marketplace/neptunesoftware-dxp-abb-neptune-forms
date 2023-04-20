const context = oEvent.oSource.getBindingContext("appData");  
const data = context.getObject();

controller.filterGroupid = data.id;

toolFieldsFilter.setValue();
toolFieldsFilter.fireLiveChange();

navAttributes.to(PageFields);