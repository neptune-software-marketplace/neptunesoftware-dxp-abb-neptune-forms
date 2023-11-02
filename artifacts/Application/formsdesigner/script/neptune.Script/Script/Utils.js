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
};
