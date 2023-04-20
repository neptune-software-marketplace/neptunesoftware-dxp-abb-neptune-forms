// Attachment Function
var elem = document.getElementById("_editUploader");

if (elem) {
    elem.addEventListener("change", function (event) {
        report.uploadFile(event, modelAppData.oData.id);
    });
}