// @ts-ignore
const state = oEvent.getParameter("state");
this.getBindingContext().getObject().visibleValue = (state) ? "exists" : "empty";
panTopProperties.getModel().refresh();
