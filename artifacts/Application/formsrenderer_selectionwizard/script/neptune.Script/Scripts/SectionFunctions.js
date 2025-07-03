function performPreviousNext(oSource) {
    var previousEnabled = false;
    var nextEnabled = false;

    const currentIndex = selSections.getSelectedIndex();

    const currentSectionValid = FORMS.validateSection(FORMS.config.setup[currentIndex], false);

    // Validate on Next button when WizardNavigation is true
    if( oSource == btnNext && !currentSectionValid && modelFormDefinition.getData().WizardNavigation ) {
        sap.m.MessageBox.error("Please fix validation errors before continuing.");
        return;
    }

    if( oSource == btnNext ) selSections.setSelectedIndex(currentIndex+1);
    if( oSource == btnPrevious  ) selSections.setSelectedIndex(currentIndex-1);

    const itemCount = selSections.getItems().length;
    const newIndex = selSections.getSelectedIndex();

    nextEnabled = newIndex < itemCount-1;
    previousEnabled = newIndex > 0;    

    selSections.rerender();

    btnPrevious.setEnabled(previousEnabled);
    btnNext.setEnabled(nextEnabled);

    scrollToSection(selSections.getSelectedItem().getText(), true);
}

// Retrieves all sections in a Neptune Form and populates the selSections select control
// function populateSections(config) {
//     var data = [];
//     var i = 0;

//     const wizardNavigation = modelFormDefinition.getData().WizardNavigation;
//     const sections = pageEndScrollContainer.getContent()[0].getContent();

//     if (typeof config.setup == "object") {
//         for (const st of config.setup) {
//             if (st.title) {
//                 data.push({ section: st.title });
//                 // Expand and select the first section
//                 if (!i) {
//                     selSections.setSelectedKey(st.title);
//                     expandFormSection(st.title, true);
//                 } else {
//                     // Hide subsequent sections if in Wizard Navigation
//                     if( wizardNavigation ) {
//                         sections[i].setVisible(false);
//                     }
//                 }
//             }
//             if( i > 0 ) btnNext.setEnabled(true); // Next is enabled when more > 1
//             ++i;
//         }
//     }

//     modelselSections.setData(data);

//     if( wizardNavigation ) selSections.setEditable(false); // Have to use next/previous

//     return data;
// }

function scrollToSection(sectionText, collapseOtherSections) {
    var match = false;
    var thisView = AppCache.View.KINDERMORGAN_SHELL.sId;

    var scrollContainer = "#" + thisView + "--pageEndScrollContainer";

    for (i = 0; i < document.getElementsByClassName("sapMPanelHdr").length; i++) {
        if (
            document.getElementsByClassName("sapMPanelHdr")[i].innerText ===
            sectionText
        ) {
            var $container = $(scrollContainer);
            var scrollTo = document.getElementsByClassName("sapMPanelHdr")[i];
            scrollTo.scrollIntoView(true);
            match = true;
        }
    }

    if (match === false) {
        for (i = 0; i < document.getElementsByClassName("sapMPanelHeaderTB").length; i++) {
            if (
                document
                    .getElementsByClassName("sapMPanelHeaderTB")
                    [i].getElementsByClassName("sapMTitle") &&
                document
                    .getElementsByClassName("sapMPanelHeaderTB")
                    [i].getElementsByClassName("sapMTitle")[0] &&
                document
                    .getElementsByClassName("sapMPanelHeaderTB")
                    [i].getElementsByClassName("sapMTitle")[0].innerText ===
                    sectionText
            ) {
                var $container = $(scrollContainer);
                var scrollTo = document.getElementsByClassName("sapMPanelHeaderTB")[i];
                //scrollTo.scrollIntoView();
                scrollTo.scrollIntoView(true);
            }
        }
    }

    /* IPAD HANDLES DIFFERENT CLASS NAMES */
    if (match === false) {
        for (i = 0; i < document.getElementsByClassName("sapMPanelHeadingDiv").length; i++) {
            if (
                document.getElementsByClassName("sapMPanelHeadingDiv")[i].innerText ===
                sectionText
            ) {
                var $container = $(scrollContainer);
                var scrollTo = document.getElementsByClassName("sapMPanelHeadingDiv")[i];

                seamless.scrollIntoView(scrollTo, {
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                });
                //scrollTo.scrollIntoView();
                scrollTo.scrollIntoView(true);
                match = true;
            }
        }
    }

    expandFormSection(sectionText, collapseOtherSections);
}

function expandFormSection(headerText, collapseOthers) {
    // Expand / Collapse Logic
    const sections = pageEndScrollContainer.getContent(); //[0].getContent();
    for (var s in sections) {
        var sectionText = sections[s].getHeaderText();
        // For Tables
        if (
            sectionText == "" &&
            sections[s].getHeaderToolbar() &&
            sections[s].getHeaderToolbar().getTitleControl()
        ) {
            sectionText = sections[s].getHeaderToolbar().getTitleControl().getText();
        }

        if (sectionText != headerText && collapseOthers) {
            sections[s].setExpanded(false);
        }

        if (sectionText == headerText) {
            // Unhide subsequent sections when in Wizard Navigation
            sections[s].setVisible(true);
            sections[s].setExpanded(true);
        }
    }
}
