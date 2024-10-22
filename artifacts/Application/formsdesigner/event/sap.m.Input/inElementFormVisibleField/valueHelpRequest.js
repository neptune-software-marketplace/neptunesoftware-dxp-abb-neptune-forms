const context = oEvent.oSource.getBindingContext();
currentObject = context.getObject();

let visibilityFields = [];

let elementParent = controller.getParentFromId(modelpanTopProperties.oData.id);

const addConditionalField = function (element) {
    if (element.id === modelpanTopProperties.oData.id) return;

    switch (element.type) {
        case "Image":
        case "MessageStrip":
        case "Text":
        case "FormTitle":
        case "Date":
            break;

        default:
            const parent = controller.getParentFromId(element.id);

            switch (elementParent.type) {
                case "Table":
                    if (elementParent.id !== parent.id) return;
                    break;

                default:
                    if (parent.type === "Table") return;
                    break;
            }

            visibilityFields.push({
                id: element.id,
                text: element.title,
                parent: parent.title,
                index: visibilityFields.length + 1,
            });

            break;
    }
};

// Conditional Access
modeloPageDetail.oData.setup.forEach(function (section) {
    section.elements.forEach(function (element) {
        addConditionalField(element);
        if (element.elements) {
            element.elements.forEach(function (element) {
                addConditionalField(element);
            });
        }
    });
});

modellistVisibility.setData(visibilityFields);

diaVisibility.open();
