// @ts-ignore
const state = oEvent.getParameter("state");
this.getBindingContext().getObject().visibleSep = (state) ? "or" : "and";
panTopProperties.getModel().refresh();
