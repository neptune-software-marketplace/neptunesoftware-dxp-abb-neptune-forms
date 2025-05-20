// @ts-ignore
const state = oEvent.getParameter("state");
this.getBindingContext().getObject().visibleValue = (state) ? "true" : "false";
panTopProperties.getModel().refresh();
