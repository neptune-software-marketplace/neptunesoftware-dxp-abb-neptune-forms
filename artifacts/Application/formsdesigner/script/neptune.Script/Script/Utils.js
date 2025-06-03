const Utils = {
    arrayMove: function (arr, fromPos, toPos) {
        while (fromPos < 0) {
            fromPos += arr.length;
        }
        while (toPos < 0) {
            toPos += arr.length;
        }
        if (toPos >= arr.length) {
            var k = toPos - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(toPos, 0, arr.splice(fromPos, 1)[0]);
    },
    toCamelCase: text => {
        if (typeof text !== "string") {return '';}
        if (!text) {return '';}
        let capitalLetter = false;
        let camelCasedText = Array.from(text).reduce( (bag, letter) => {
            if (letter.match(/[^\w]/)) {
                capitalLetter = true;
                return bag;
            }
            let newLetter = (capitalLetter) ? letter.toLocaleUpperCase("en") : letter;
            capitalLetter = false;
            return bag+newLetter;
        }, '');
        return camelCasedText[0].toLocaleLowerCase("en")+camelCasedText.slice(1);
    },
    fallbackCopyTextToClipboard: text => {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    },
    checkVisibleConditionMutuallyExclusive: (source, oEvent) => {
        switch(source) {
            case "advanced":
                if (oEvent.getParameter("selected")) {
                    modelpanTopProperties.getData().enableVisibleCond = false;
                    modelpanTopProperties.refresh();
                }
                // Note: changes to the advanced are always reported to panTopEditor
                modelpanTopEditor.refresh();
                break;
            default:
                if (oEvent.getParameter("selected")) {
                    FORMS.bindingWrapper.Advanced.Configuration.setFormatterConfig(modelpanTopProperties.getData());
                    modelpanTopProperties.getData().useFormatterConfig.visible = false;
                    modelpanTopProperties.refresh();
                    modelpanTopEditor.refresh();
                }
        }
    },

    buildValParamSelect: (select, i) => {
        select.destroyItems();
        while (i > 0) {
            select.addItem(
                new sap.ui.core.ListItem({
                    key: i,
                    text: i,
                })
            );
            i--;
        }
    },

    dateFormats: [{ title: "dd.MM.yyyy" }, { title: "MM/dd/yyyy" }, { title: "MM.yyyy" }, { title: "dd MMM" }, {title: "yyyy"}],
    dateTimeFormats: [{ title: "dd.MM.yyyy HH:mm" }, { title: "MM/dd/yyyy HH:mm" }, { title: "dd MMM HH:mm" }],
    fileTypes: [{title: "pdf"}, {title: "doc"}, {title: "docx"}, {title: "xls"}, {title: "xlsx"}, {title: "ppt"}, {title: "pptx"}, {title: "bmp"}, {title: "png"}, {title: "jpg"}, {title: "jpeg"}],

    // KW - enable media library (+ callback)
    objMedialib: {
        setValue: (url) => {
            if (url && typeof url == "string" && url != "") {
                // MOD #(20250319-1139) begin
                // INFO: { reason: "3: 1)the url may contain ? parameters; 2) decoded url is calculated twice; 3) name acquisition will fail if decided url !== url" }
                // let filename = decodeURIComponent(url).substring(url.lastIndexOf("/")+1);
                // controller.currentObject.getModel().getData().filename = filename;
                // controller.currentObject.getModel().getData().link     = decodeURIComponent(url);
                // MOD #(20250319-1139) ---
                let decodedUrl = decodeURIComponent(url);
                // extract name it expects the url to have at least one "/"
                const C_REGEX_URLNAME = /\/([^/?]*)\/?(?:\?.*)?$/;
                let nameMatch = decodedUrl.match(C_REGEX_URLNAME);
                let filename = (Array.isArray(nameMatch))
                                ? (nameMatch[1])
                                    ? nameMatch[1]
                                    : "" // A match was found but no filename was able to be extracted
                                : decodedUrl; // No "/" was found so assume that the name is the full decodedUrl
                controller.currentObject.getModel().getData().filename = filename;
                controller.currentObject.getModel().getData().link     = decodedUrl;
                // MOD #(20250319-1139) end
                controller.currentObject.getModel().refresh();
            } else {
                controller.currentObject.getModel().getData().filename = "";
                controller.currentObject.getModel().getData().link     = "";
                controller.currentObject.getModel().refresh();
            }
        },
        fireChange: () => {}
    }
};

// KW - init allowed file types for File element
for (const t of Utils.fileTypes) {
    mcbElementFormFileType.addItem(new sap.ui.core.Item({key: t.title, text: t.title}));
}
// modelmcbElementFormFileType.setData(Utils.fileTypes);

Loader.markDone("Utils"); // #57 #58
