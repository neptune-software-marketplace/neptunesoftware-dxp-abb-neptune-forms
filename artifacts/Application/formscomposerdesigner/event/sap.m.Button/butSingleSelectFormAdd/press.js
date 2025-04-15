// Adds the single form to the list
let lvFormId = listSingleSelectForm.getSelectedItem().getBindingContext("appData").getObject().id;
modelappData.getData().selectedForm.setup.forms.push(lvFormId);
modeloPageDetail.getData().setup.forms.push(lvFormId);
// Processes the single form
controller.processListSingleForm();
// updates form changes state
Utils.updatesFormChangesState();
// Closes the dialog
diaSingleFormsSelect.close();
