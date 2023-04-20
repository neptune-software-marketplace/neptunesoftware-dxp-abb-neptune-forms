const controller = {
    remoteSystem: null,

    init: function () {
        jQuery.sap.require("sap.m.MessageBox");

        if (!cockpitUtils.isCockpit) {
            sap.m.MessageBox.confirm("Neptune FORMS is only supported to run inside our Cockpit. Press OK and we will guide to to the right place.", {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "System Information",
                actions: [sap.m.MessageBox.Action.OK],
                initialFocus: "Ok",
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        location.href = location.origin + "/cockpit.html#forms-deployment";
                    }
                },
            });
        }

        controller.list();
    },

    list: function () {
        apiMasterdata().then(function (res) {
            modelappData.setData(res);
        });
    },

    get: async function (system) {
        treeDeploy.setBusy(true);

        modeltreeDeploy.setData({
            children: [],
        });

        if (system) {
            controller.remoteSystem = system;
            oPageDetailHeaderSubTitle.setText(system.name);
        }

        oApp.to(oPageDetail);

        let actions = [];
        actions.push(controller.getRemoteData("forms_design"));
        actions.push(controller.getRemoteData("forms_group"));
        actions.push(controller.getRemoteData("forms_attribute_group"));

        Promise.all(actions).then(function (values) {
            controller.buildData("FORMS", modelappData.oData.forms, values[0]);
            controller.buildData("Classification", modelappData.oData.group, values[1]);
            controller.buildData("Attributes", modelappData.oData.attributegroup, values[2]);
            modeltreeDeploy.refresh();
            treeDeploy.setBusy(false);
        });
    },

    buildData: function (parent, localData, remoteData) {
        let items = [];

        localData.forEach(function (data) {
            let item = {
                id: data.id,
                name: data.name,
                description: data.description,
                updatedAt: data.updatedAt,
                updatedBy: data.updatedBy,
            };

            item._selectable = true;
            item._selected = false;

            let remoteItem = remoteData.find((r) => r.id === data.id);

            if (!remoteItem) {
                remoteItem = remoteData.find((r) => r.id === data.id.toUpperCase());
                if (remoteItem) item._uppercase = true;
            }

            if (remoteItem) {
                item._updatedAt = remoteItem.updatedAt;
                item._updatedBy = remoteItem.updatedBy;

                if (item._updatedAt === item.updatedAt) {
                    item._state = "Success";
                } else {
                    item._state = "Error";
                }
            }

            items.push(item);
        });

        modeltreeDeploy.oData.children.push({
            name: parent,
            _selectable: false,
            children: items,
        });
    },

    deploy: async function () {
        treeDeploy.setBusy(true);

        modeltreeDeploy.oData.children.forEach(async function (parent) {
            parent.children.forEach(async function (item) {
                if (item._selected) {
                    let tableName;
                    let tableData;

                    switch (parent.name) {
                        case "Attributes":
                            tableName = "forms_attribute_group";
                            tableData = ModelData.FindFirst(modelappData.oData.attributegroup, "id", item.id);
                            break;

                        case "Classification":
                            tableName = "forms_group";
                            tableData = ModelData.FindFirst(modelappData.oData.group, "id", item.id);
                            break;

                        case "FORMS":
                            tableName = "forms_design";
                            tableData = ModelData.FindFirst(modelappData.oData.forms, "id", item.id);
                            if (item._uppercase) {
                                if (tableData.groupid) tableData.groupid = tableData.groupid.toUpperCase();
                                if (tableData.subgroupid) tableData.subgroupid = tableData.subgroupid.toUpperCase();
                            }
                            break;

                        default:
                            break;
                    }

                    if (item._uppercase) tableData.id = item.id.toUpperCase();
                    await controller.saveRemoteData(tableName, tableData);

                    //  SubData
                    switch (parent.name) {
                        case "Attributes":
                            tableName = "forms_attribute_fields";
                            tableData = ModelData.Find(modelappData.oData.attributefields, "groupid", item.id);

                            if (item._uppercase) {
                                for (let i = 0; i < tableData.length; i++) {
                                    let tableRec = tableData[i];
                                    tableRec.id = tableRec.id.toUpperCase();
                                    tableRec.groupid = tableRec.groupid.toUpperCase();
                                }
                            }

                            await controller.saveRemoteData(tableName, tableData);
                            break;

                        case "Classification":
                            tableName = "forms_subgroup";
                            tableData = ModelData.Find(modelappData.oData.subgroup, "groupid", item.id);

                            if (item._uppercase) {
                                for (let i = 0; i < tableData.length; i++) {
                                    let tableRec = tableData[i];
                                    tableRec.id = tableRec.id.toUpperCase();
                                    tableRec.groupid = tableRec.groupid.toUpperCase();
                                }
                            }

                            await controller.saveRemoteData(tableName, tableData);
                            break;

                        default:
                            break;
                    }
                }
            });
        });

        setTimeout(function () {
            controller.get();
        }, 500);
    },

    saveRemoteData: function (tableName, tableData, index) {
        return new Promise(function (resolve) {
            var reqData = {
                data: tableData,
                table: tableName,
            };

            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/proxy/remote/" + encodeURIComponent(controller.remoteSystem.url + "/api/serverscript/formsclient/deployment-save") + "/" + controller.remoteSystem.id,
                data: JSON.stringify(reqData),
                success: function (data) {
                    resolve("OK");
                },
                error: function (result, status) {
                    resolve("ERROR");
                },
            });
        });
    },

    getRemoteData: function (table) {
        return new Promise(function (resolve) {
            const endpoint = "/api/entity/" + table + "?select=id,name,updatedAt,updatedBy";
            const url = "/proxy/remote/" + encodeURIComponent(controller.remoteSystem.url + endpoint) + "/" + controller.remoteSystem.id;

            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                success: function (data) {
                    resolve(data);
                },
                error: function (result, status) {
                    resolve("ERROR");
                },
            });
        });
    },
};

controller.init();
