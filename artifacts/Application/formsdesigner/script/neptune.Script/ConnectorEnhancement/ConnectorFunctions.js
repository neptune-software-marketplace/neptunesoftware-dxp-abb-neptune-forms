// AC: Review this logic
function getConnectorList() {
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
}

function fillConnectorInfo(connectorID, connectorKey, connectorTitle) {
    if (!connectorID) return;

    let connector = new Connector(connectorID);
    connector.getFieldCatalog().then(function (fieldCatalog) {
        populateComboBox(cboxKey, fieldCatalog);
        cboxKey.setSelectedKey(""); // AR default empty value
        if (!!connectorKey) cboxKey.setSelectedKey(connectorKey);

        populateComboBox(cboxTitle, fieldCatalog);
        cboxTitle.setSelectedKey(""); // AR default empty value
        if (!!connectorTitle) cboxTitle.setSelectedKey(connectorTitle);
    });
}

function populateComboBox(cbox, data) {
    cbox.removeAllItems();
    for (var i in data) {
        var newItem = {
            key: data[i].name,
            text: data[i].label,
        };

        cbox.addItem(new sap.ui.core.Item(newItem));
    }
}
