const context = oEvent.oSource.getBindingContext();
const data = context.getObject();

currentObject.visibleValue = data.key;

modelpanTopProperties.refresh();
popVisibilityValue.close();