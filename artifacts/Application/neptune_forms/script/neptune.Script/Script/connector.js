// AC: Connector
function Connector(id) {
    //---------------------------------------------------
    // PUBLIC
    //---------------------------------------------------
    if (!id) {
        console.error("Connector Error: Need connector ID in constructor");
    }

    this.id = id;

    this.paginationSetup = {
        enabled: false,
        table: null,
        take: 5,
        index: 0,
        count: 0,
        sortOrder: "Ascending",
        sortField: "",
        options: null,
        colHeaders: {},
    };

    this.list = async function (options) {
        let data = {
            id: this.id,
            settings: {
                fieldsSel: options.filter || [],
                fieldsRun: parseFields(options.fields),
            },
            runParams: parseFilter(options.filter),
        };

        // Pagination - Manually
        if (options.pagination && !this.paginationSetup.enabled) {
            data._pagination = options.pagination;
            data.runParams._pagination = options.pagination;
        }

        // Pagination - Auto - Before
        if (this.paginationSetup.enabled) {
            if (this.paginationSetup.sortField) {
                options.order = {};
                options.order[this.paginationSetup.sortField] = this.paginationSetup.sortOrder === "Descending" ? "DESC" : "ASC";
            }

            this.paginationSetup.options = options;
            const pagination = { take: this.paginationSetup.take, skip: this.paginationSetup.take * this.paginationSetup.index };
            data._pagination = pagination;
            data.runParams._pagination = pagination;
        }

        // Order
        if (options.order) {
            data._order = options.order;
            data.runParams._order = options.order;
        }

        const response = await ajax("List", data);

        // Pagination - Auto - After
        if (this.paginationSetup.enabled) {
            paginationHandle(response, this.paginationSetup);
        }
        
        return response;
    };

    this.get = async function (options) {
        let data = {
            id: this.id,
            settings: {
                fieldsSel: parseFields(options.fields),
            },
            runParams: parseFilter(options.filter),
        };

        const response = await ajax("Get", data);

        if (response && response.length) {
            return response[0];
        } else {
            return {};
        }
    };

    this.save = async function (options) {
        let data = {
            settings: {
                fieldsSel: [],
            },
            runParams: options.data,
        };

        const keys = Object.keys(options.data);

        keys.forEach(function (key) {
            data[key] = options.data[key];
        });

        return await ajax("Save", data, this.id);
    };

    this.delete = async function (options) {
        if (!options.filter) {
            return { status: "No filter defined for delete operation" };
        }

        const data = {
            id: this.id,
            settings: {
                fieldsSel: options.filter,
                fieldsRun: [],
            },
            runParams: parseFilter(options.filter),
        };

        return await ajax("Delete", data);
    };

    this.getFieldCatalog = async function () {
        const data = { id: this.id };
        return await ajax("FieldCatalog", data);
    };

    // REVIEW - Auto create Table ? <-- TODO left from the original code

    this.enablePagination = function (options) {
        this.paginationSetup.enabled = true;
        this.paginationSetup.table = options.table;
        this.paginationSetup.take = options.take;

        const tableId = this.paginationSetup.table.sId;
        const me = this;

        const toolPagination = new sap.m.Toolbar({
            width: "100%",
            design: "Transparent",
        }).addStyleClass("sapUiSizeCompact ");

        toolPagination.addContent(
            new sap.m.Text({
                textAlign: "Center",
                text: "Items per page",
            }).addStyleClass("sapUiHideOnPhone")
        );

        var toolPaginationShowItems = new sap.m.Select({
            width: "100px",
            selectedKey: "",
            change: function (oEvent) {
                me.paginationSetup.take = this.getSelectedKey();
                me.paginationSetup.index = 0;
                me.list(me.paginationSetup.options);
            },
        }).addStyleClass("sapUiHideOnPhone");

        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: "Default", key: me.paginationSetup.take || 5 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 5, key: 5 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 10, key: 10 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 15, key: 15 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 20, key: 20 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 30, key: 30 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 40, key: 40 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 50, key: 50 }));
        toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 100, key: 100 }));

        toolPagination.addContent(toolPaginationShowItems);
        toolPagination.addContent(new sap.m.ToolbarSpacer());

        toolPagination.addContent(
            new sap.m.Button("paginationFirst" + tableId, {
                icon: "sap-icon://fa-solid/angle-double-left",
                press: function (oEvent) {
                    me.paginationSetup.index = 0;
                    me.list(me.paginationSetup.options);
                },
            })
        );

        toolPagination.addContent(
            new sap.m.Button("paginationPrev" + tableId, {
                icon: "sap-icon://fa-solid/angle-left",
                press: function (oEvent) {
                    me.paginationSetup.index--;
                    me.list(me.paginationSetup.options);
                },
            })
        );

        const toolPaginationPages = new sap.m.SegmentedButton("paginationPages" + tableId, {
            selectionChange: function (oEvent) {
                me.paginationSetup.index = parseInt(this.getSelectedKey());
                me.list(me.paginationSetup.options);
            },
        });

        toolPagination.addContent(toolPaginationPages);

        const toolPaginationText = new sap.m.Text({
            visible: false,
            textAlign: "Center",
            text: "0/0",
        });

        toolPagination.addContent(toolPaginationText);

        toolPagination.addContent(
            new sap.m.Button("paginationNext" + tableId, {
                icon: "sap-icon://fa-solid/angle-right",
                press: function (oEvent) {
                    me.paginationSetup.index++;
                    me.list(me.paginationSetup.options);
                },
            })
        );

        toolPagination.addContent(
            new sap.m.Button("paginationLast" + tableId, {
                icon: "sap-icon://fa-solid/angle-double-right",
                press: function (oEvent) {
                    let maxIndex = me.paginationSetup.count / parseInt(me.paginationSetup.take);
                    maxIndex = Math.ceil(maxIndex);

                    me.paginationSetup.index = maxIndex - 1;
                    me.list(me.paginationSetup.options);
                },
            })
        );

        toolPagination.addContent(new sap.m.ToolbarSeparator());

        const toolPaginationTitle = new sap.m.ObjectNumber("paginationTitle" + tableId, {});

        toolPagination.addContent(toolPaginationTitle);

        this.paginationSetup.table.setInfoToolbar(toolPagination);
    };

    this.enableColumnSorting = function (options) {
        // Requires Pagination
        if (!this.paginationSetup.enabled) {
            console.error("Connector Error: Sorting needs to have pagination enabled");
        }

        const column = options.column;
        const field = options.field;
        const me = this;

        var _column_delegate = {
            onclick: function (e) {
                const sortIndicatorOrder = column.getSortIndicator();

                // Clear All
                const keys = Object.keys(me.paginationSetup.colHeaders);

                keys.forEach(function (key) {
                    me.paginationSetup.colHeaders[key].setSortIndicator("None");
                });

                if (sortIndicatorOrder === "Ascending") {
                    column.setSortIndicator("Descending");
                    sortModelOrder = true;
                } else {
                    column.setSortIndicator("Ascending");
                    sortModelOrder = false;
                }

                me.paginationSetup.sortOrder = column.getSortIndicator();
                me.paginationSetup.sortField = field;
                me.list(me.paginationSetup.options);
            },
        };

        column.addEventDelegate(_column_delegate);

        column.exit = function () {
            column.removeEventDelegate(_column_delegate);
        };

        column.setStyleClass("nepMTableSortCell");

        if (!this.paginationSetup.colHeaders) this.paginationSetup.colHeaders = {};
        this.paginationSetup.colHeaders[column.sId] = column;
    };

    //---------------------------------------------------
    // PRIVATE
    //---------------------------------------------------
    handleColumnSorting = function (table, bindingField, sortModelOrder) {
        const oSorter = new sap.ui.model.Sorter(bindingField, sortModelOrder, false);
        const binding = table.getBinding("items");
        binding.sort(oSorter);
    };

    paginationHandle = function (response, paginationSetup) {
        paginationSetup.count = response.count;

        const model = paginationSetup.table.getModel();
        model.setData(response.result);

        let maxIndex = paginationSetup.count / paginationSetup.take;
        maxIndex = Math.ceil(maxIndex);

        if (paginationSetup.count <= paginationSetup.take) maxIndex = 1;

        toolPaginationFirst = sap.ui.getCore().byId("paginationFirst" + paginationSetup.table.sId);
        toolPaginationPrev = sap.ui.getCore().byId("paginationPrev" + paginationSetup.table.sId);
        toolPaginationNext = sap.ui.getCore().byId("paginationNext" + paginationSetup.table.sId);
        toolPaginationLast = sap.ui.getCore().byId("paginationLast" + paginationSetup.table.sId);
        toolPaginationPages = sap.ui.getCore().byId("paginationPages" + paginationSetup.table.sId);
        toolPaginationTitle = sap.ui.getCore().byId("paginationTitle" + paginationSetup.table.sId);

        toolPaginationFirst.setEnabled(true);
        toolPaginationPrev.setEnabled(true);
        toolPaginationNext.setEnabled(true);
        toolPaginationLast.setEnabled(true);

        if (paginationSetup.index < 0) paginationSetup.index = 0;

        if (paginationSetup.index === 0) {
            toolPaginationFirst.setEnabled(false);
            toolPaginationPrev.setEnabled(false);
        }

        if (paginationSetup.index + 1 >= maxIndex) {
            toolPaginationNext.setEnabled(false);
            toolPaginationLast.setEnabled(false);
        }

        toolPaginationPages.destroyItems();

        let numItems = 0;
        let maxItems = 6;
        let startItem = paginationSetup.index - maxItems / 2;

        if (startItem < 0) startItem = 0;

        for (i = startItem; i < maxIndex; i++) {
            if (numItems <= maxItems) toolPaginationPages.addItem(new sap.m.SegmentedButtonItem({ text: i + 1, key: i }));
            numItems++;
        }

        toolPaginationPages.setSelectedKey(paginationSetup.index);
        toolPaginationTitle.setNumber(paginationSetup.index + 1 + "/" + maxIndex);
    };

    parseFields = function (fields) {
        let formattedFields = [];

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];

            let formattedField = {
                name: field.name,
            };

            // Lookup
            if (field.lookupTable && field.lookupKey && field.lookupText) {
                formattedField.valueType = "Lookup";
                formattedField.valueLookup = {
                    table: field.lookupTable,
                    textField: field.lookupText,
                    keyField: [{ fieldName: field.name, key: field.lookupKey }],
                    hideKey: true,
                };
            }

            formattedFields.push(formattedField);
        }

        return formattedFields;
    };

    parseFilter = function (filters) {
        let runParams = {};
        if (!filters) return runParams;

        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];

            switch (filter.type) {
                case "Boolean":
                    if (filter.value) {
                        filter.type = "CheckBox";
                        runParams[filter.name] = true;
                    } else {
                        filter.type = "MultiSelect";
                        runParams[filter.name] = [false, ""];
                    }
                    break;

                case "MultiSelect":
                    runParams[filter.name] = filter.value;
                    break;

                case "DateRange":
                    runParams[filter.name] = filter.value[0];
                    runParams[filter.name + "_end"] = filter.value[1];
                    break;

                default:
                    runParams[filter.name] = filter.value;
                    break;
            }
        }

        return runParams;
    };

    ajax = function (method, data, id) {
        return new Promise(function (resolve) {
            let url;

            switch (method) {
                case "List":
                    url = "/api/functions/Connector/run?method=List";
                    break;

                case "Get":
                    url = "/api/functions/Connector/run?method=Get";
                    break;

                case "Save":
                    url = "/api/functions/Connector/run?method=Save&id=" + id;
                    break;

                case "Delete":
                    url = "/api/functions/Connector/run?method=Delete";
                    break;

                case "FieldCatalog":
                    url = "/api/functions/Connector/getFieldCatalog";
                    break;

                default:
                    break;
            }

            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (req, status, request) {
                    resolve(req);
                },
                error: function (req, status) {
                    console.log(req, status);
                    resolve(req);
                },
            });
        });
    };
}