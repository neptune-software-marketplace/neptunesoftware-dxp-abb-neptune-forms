    function buildElementInformation(element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            editable: false,
            placeholder: element.placeholder,
            visible: FORMS.buildVisibleCond(element),
        });

        return newField;
    }
