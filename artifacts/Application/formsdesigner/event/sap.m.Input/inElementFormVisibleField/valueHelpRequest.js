const context = oEvent.oSource.getBindingContext();
currentObject = context.getObject();

let visibilityFields = [];

let elementParent = controller.getParentFromId(modelpanTopProperties.oData.id);

const addConditionalField = function (element, prefix) {
    if (element.id === modelpanTopProperties.oData.id) return;
    if (!controller.elementTypes.find(item=>item.type === element.type)?.parameter) {return;} // not usable as a conditional parameter

    const parent = controller.getParentFromId(element.id);

    visibilityFields.push({
        id: element.id,
        text: element.title,
        parent: parent.title,
        parentId: `${prefix}|${parent.title}`,
        index: visibilityFields.length + 1,
    });
};

// Conditional Access
let prefix = '';
modeloPageDetail.oData.setup.forEach(function (section, index) {
    prefix = `0000000${index}`.slice(-8);
    section.elements.forEach(function (element) {
        addConditionalField(element, prefix);
        if (element.elements) {
            element.elements.forEach(function (element) {
                addConditionalField(element, prefix);
            });
        }
    });
});

modellistVisibility.setData(visibilityFields);

diaVisibility.open();
