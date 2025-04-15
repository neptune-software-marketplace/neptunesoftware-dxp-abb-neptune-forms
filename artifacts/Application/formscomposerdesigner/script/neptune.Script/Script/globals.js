console.log("Version 20241005.1");

const APPVIEW = (this instanceof sap.ui.core.mvc.View)
                    ? this
                    : {
                        sId: "",
                        getId: () => "",
                        createId: pvId => pvId
                    }

const C_CONTEXT_LIST_SINGLE_FORM = "ListSingleForm";
const C_CONTEXT_PREVIEW_FORM = "PreviewForm";

const C_CSS_LIST_ITEM_SELECTED = "nepListItemSelected";
const C_CSS_PROJECT_ITEM_SELECTED = "nepProjectItemSelected";
const C_CSS_PROJECT_ITEM_EXCLUDED = "nepProjectItemExcluded";
const C_CSS_HIDE_ITEM_RADIO_BUTTON = "nepHideItemRadioButton";

const C_FIELD_ID_SINGLE_FORM = "_sfId";
const C_FIELD_CONFIG_ELEMENT = "_config";

