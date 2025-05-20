const APPVIEW:any = (this instanceof sap.ui.core.mvc.View)
                        ? this
                        : {
                            sId: "formsdesigner",
                            sViewName: "",
                            getId: () => APPVIEW.sId,
                            getViewName: () => APPVIEW.getViewName,
                            getModel: function() { return sap.ui.getCore().getModel(...arguments)},
                            // @ts-ignore
                            setModel: function() { sap.ui.getCore().setModel(...arguments)},
                            createId: (id:string):string => id,
                            byId: id => sap.ui.getCore().byId(id)
                        }
