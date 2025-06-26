function buildElementAngleCalc(element) {
    const bindingField = element.fieldName ? element.fieldName : element.id;

    const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
        value: "{" + FORMS.bindingPath + bindingField + "}",
        editable: false,
        placeholder: element.placeholder,
        visible: FORMS.buildVisibleCond(element),
        change: function (oEvent) {
            function getInputValue(id) {
                let value = 0;
                const inputField = sap.ui.getCore().byId("field" + id);
                if (typeof inputField !== "undefined") value = inputField.getValue();
                if (value === "") value = 0;
                return Math.abs(value);
            }

            this.setValue("");

            const elementAttribute = this.getCustomData().find(
                (item) => item.getKey() === "element"
            );
            if (typeof elementAttribute === "undefined") return;
            const element = elementAttribute.getValue();

            const b = getInputValue(element.inpCrossingDistance1Id);
            const c = getInputValue(element.inpCrossingDistance2Id);
            const a = getInputValue(element.inpPipelineDistanceId);
            let cosAngle = 1; // yields angle = 0 if one of a,b,c = 0
            if (a > 0 && b > 0 && c > 0) cosAngle = (b * b + c * c - a * a) / (2 * b * c);
            let angle = (Math.acos(cosAngle) * 360) / (2 * Math.PI);
            this.setValue(angle.toFixed(element.decimals));
        },
        valueHelpOnly: false,
        showValueHelp: false,
        visible: FORMS.buildVisibleCond(element),
    });

    if (!FORMS.parentIsTable(element.id)) {
        newField.addCustomData(new sap.ui.core.CustomData({ key: "element", value: element }));
        FORMS.fieldSetAsInput(newField, element.inpCrossingDistance1Id);
        FORMS.fieldSetAsInput(newField, element.inpCrossingDistance2Id);
        FORMS.fieldSetAsInput(newField, element.inpPipelineDistanceId);
    }

    // KW addition (number fields are empty after parsing on iOS) // 27.11.2023
    newField.addStyleClass("numField");
    return newField;
}

function tablePostProcessingAngleCalc(section, element, fromIndex, toIndex) {
    for (i = fromIndex; i < toIndex; i++) {
        const rowSid = "-field" + section.id + "-" + i;
        const rowAngleCalc = sap.ui.getCore().byId("field" + element.id + rowSid);
        if (typeof rowAngleCalc !== "undefined") {
            let rowElement = JSON.parse(JSON.stringify(element));
            rowElement.inpCrossingDistance1Id = element.inpCrossingDistance1Id + rowSid;
            FORMS.fieldSetAsInput(rowAngleCalc, rowElement.inpCrossingDistance1Id);
            rowElement.inpCrossingDistance2Id = element.inpCrossingDistance2Id + rowSid;
            FORMS.fieldSetAsInput(rowAngleCalc, rowElement.inpCrossingDistance2Id);
            rowElement.inpPipelineDistanceId = element.inpPipelineDistanceId + rowSid;
            FORMS.fieldSetAsInput(rowAngleCalc, rowElement.inpPipelineDistanceId);
            rowAngleCalc.addCustomData(
                new sap.ui.core.CustomData({ key: "element", value: rowElement })
            );
        }
    }
}

function sectionCopyAngleCalcPostProcess(sourceElement, newElement) {
    sourceElement.elements.forEach((element, ind) => {
        if (element.type === "AngleCalc") {
            sourceElement.elements.find((inp, i) => {
                if (inp.id === element.inpCrossingDistance1Id) {
                    newElement.elements[ind].inpCrossingDistance1Id = newElement.elements[i].id;
                    newElement.elements[ind].inpCrossingDistance1Title = newElement.elements[i].title;
                }
                if (inp.id === element.inpCrossingDistance2Id) {
                    newElement.elements[ind].inpCrossingDistance2Id = newElement.elements[i].id;
                    newElement.elements[ind].inpCrossingDistance2Title = newElement.elements[i].title;
                }
                if (inp.id === element.inpPipelineDistanceId) {
                    newElement.elements[ind].inpPipelineDistanceId = newElement.elements[i].id;
                    newElement.elements[ind].inpPipelineDistanceTitle = newElement.elements[i].title;
                }
            });
        }
    });
}
