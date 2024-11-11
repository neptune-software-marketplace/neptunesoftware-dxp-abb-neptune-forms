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

    dateFormats: [{ title: "dd.MM.yyyy" }, { title: "MM/dd/yyyy" }, { title: "MM.yyyy" }, { title: "dd MMM" }],
    dateTimeFormats: [{ title: "dd.MM.yyyy HH:mm" }, { title: "MM/dd/yyyy HH:mm" }, { title: "dd MMM HH:mm" }],
    fileTypes: [{title: "pdf"}, {title: "doc"}, {title: "docx"}, {title: "xls"}, {title: "xlsx"}, {title: "ppt"}, {title: "pptx"}, {title: "bmp"}, {title: "png"}, {title: "jpg"}, {title: "jpeg"}],

    // KW - enable media library (+ callback)
    objMedialib: {
        setValue: (url) => {
            if (url && typeof url == "string" && url != "") {
                let filename = decodeURIComponent(url).substring(url.lastIndexOf("/")+1);
                controller.currentObject.getModel().getData().filename = filename;
                controller.currentObject.getModel().getData().link     = decodeURIComponent(url);
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
