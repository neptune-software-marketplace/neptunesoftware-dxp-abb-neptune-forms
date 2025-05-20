console.log("Using OutlineItems drag");
// @ts-ignore
const targetContext = oEvent.getParameter("target").getBindingContext();
// @ts-ignore
controller.dragElement = targetContext.getObject();