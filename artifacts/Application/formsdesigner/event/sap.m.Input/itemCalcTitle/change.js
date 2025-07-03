let calc = modelpanTopProperties.oData;
let data = this.getParent().getBindingContext().getObject();

const element = controller.attachListener(this, calc);
if (typeof element !== "undefined") {
    data.id = element.id;
    data.title = element.title;
}
