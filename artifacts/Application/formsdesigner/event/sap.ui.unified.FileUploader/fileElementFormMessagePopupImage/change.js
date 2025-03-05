// try {
//     const file = oEvent.getParameter("files")[0];
//     const fileReader = new FileReader();

//     // if (file.size > 100000) {
//     //     sap.m.MessageToast.show("File size is larger than max 100k");
//     //     return;
//     // }

//     fileReader.onload = async function (fileLoadedEvent) {
//         modelpanTopProperties.oData.imageSrc = await FORMS.imageResize(fileLoadedEvent.target.result, modelpanTopProperties.oData);
//         modelpanTopProperties.refresh();
//         oEvent.getSource().clear(); //document.getElementById("pictureUploader").value = "";
//     };

//     fileReader.readAsDataURL(file);
// } catch (e) {
//     console.log(e);
// }