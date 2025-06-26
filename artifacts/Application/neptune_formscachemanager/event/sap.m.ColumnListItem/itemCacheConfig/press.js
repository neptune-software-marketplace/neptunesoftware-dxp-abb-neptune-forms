const context = this.getBindingContext();
const data = context.getObject();


if (!data.connectorID) data.connectorID = "";

modelSFCacheConfig.setData(data);
ConfigUIController.setEditable(true);

