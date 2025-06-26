file = oEvent.getParameter("files")[0];
const thisFileUploader = this;
const context = this.getBindingContext();
const data = context.getObject();

//if (!!file.name) sap.m.MessageToast.show(file.name + " [" + file.type + "]");

var reader = new FileReader();
reader.onload = function (oEvent) {
    var tsv = oEvent.target.result; //This is the content of the text file
    CacheManager.tsvStore(tsv, data.objectName);
    sap.m.MessageToast.show(TextSuccessLoad.getText());
    thisFileUploader.clear();
    //if (typeof controller !== "undefined") controller.preview(); //Rebuild forms
};
//reader.readAsDataURL(file);
reader.readAsText(file);
