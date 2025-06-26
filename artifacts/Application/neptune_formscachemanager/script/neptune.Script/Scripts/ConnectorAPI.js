const cm = {
    getConnectorData: async function (connectorID) {
        let data = {
            id: connectorID,
            settings: {
                fieldsSel: [],
                fieldsRun: [],
            },
            runParams: [],
        };

        const fieldCatalog = await $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/api/functions/Connector/getFieldCatalog",
            data: JSON.stringify(data),
            success: function (response) {
                //console.log("Connector data received");
            },
            error: function (result, status) {
                // Error Handler
                console.log("Failure in getting connector data");
            },
        });
        fieldCatalog.forEach((row) => {
            if (row.usage === "BOTH" || row.usage === "OUTPUT"){
                data.settings.fieldsRun.push({
                    name: row.name
                });
            }
            });

        let response = await $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/api/functions/Connector/run?method=List",
            data: JSON.stringify(data),
            success: function (response) {
                //console.log("Connector data received");
            },
            error: function (result, status) {
                // Error Handler
                sap.m.MessageToast.show('The data for the connector could not be retrieved.');
                console.log("Failure in getting connector data");
            },
        });
        return response.result;
    },

    getConnectorList: function () {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/api/functions/Connector/list",
            headers: {
                // Needed when triggered externally
                Authorization: "Basic xxxx ", // Or use Bearer + token (JWT from user)
                "X-Requested-With": "XMLHttpRequest",
            },
            data: {},
            success: function (data) {
                // Succes Handler
                cboxConnectors.removeAllItems();
                cboxConnectors.addItem(new sap.ui.core.Item({ key: "", text: "" }));

                data.sort((a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return -1;
                    } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                for (var i in data) {
                    var newItem = {
                        key: data[i].id,
                        text: data[i].name,
                    };

                    cboxConnectors.addItem(new sap.ui.core.Item(newItem));
                }
            },
            error: function (result, status) {
                // Error Handler
                console.log("Failure in getting connector list");
            },
        });
    },
};
