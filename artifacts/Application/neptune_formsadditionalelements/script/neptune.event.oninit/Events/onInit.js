if (typeof controller !== "undefined" || typeof FORMS !== "undefined") {

// Some UI elements need the binding path to be reset
    if (typeof controller !== "undefined") {
        customFORMS.resetBindingPath();

        customPanel.getContent().forEach((item) => {
            panElements.addContent(item);
        });
    }

    customFORMS.elementTypes.forEach((item) => {
        FORMS.elementTypes.push(item);
        // controller.elementTypes.push(item);
    });
    
    if (typeof controller !== "undefined") {
        // console.log(">> additional elements: ", controller.elementTypes);
        controller.init();
    }

}


