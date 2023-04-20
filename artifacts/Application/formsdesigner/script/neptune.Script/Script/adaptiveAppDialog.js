const kAdaptiveAppsOpenCols = 'p9_adaptive_apps_open_dialog_cols';

const adaptiveAppsOpenColsKeys = [
    'name', 'description', 'dev_package', 
    'adaptive_template', 'updated_at', 'changed_by',
];
const defaultAdaptiveAppsOpenColKeys = ['name', 'description', 'updated_at', 'changed_by'];
const adaptiveAppsOpenColsMap = {
    name: {
        text: 'Name',
        column: coltabAppsname
    },
    description: {
        text: 'Description',
        column: coltabAppsdescription
    },
    dev_package: {
        text: 'Development Package',
        column: coltabAppsDevPackage
    },
    adaptive_template: {
        text: 'Adaptive Template',
        column: coltabAppsAdaptiveTemplate,
    },
    updated_at: {
        text: 'Updated At',
        column: coltabAppsupdatedAt
    },
    changed_by: {
        text: 'Updated By',
        column: coltabAppschangeBy,
    },
};

function fillAdapativeAppsOpenCols() {
    toolAppsCols.destroyItems();
    adaptiveAppsOpenColsKeys.forEach(function (k) {
        const item = adaptiveAppsOpenColsMap[k];
        toolAppsCols.addItem(
            new sap.ui.core.ListItem({ key: k, text: item.text })
        );
    });
}

function setVisibleAdaptiveAppsOpenCols(keys) {
    adaptiveAppsOpenColsKeys.forEach(function (k) {
        const { column } = adaptiveAppsOpenColsMap[k];
        column.setVisible(keys.includes(k));
    });
}

function loadAdaptiveAppsOpenCols() {
    try {
        let keys = defaultAdaptiveAppsOpenColKeys;
        const selected = localStorage.getItem(kAdaptiveAppsOpenCols);
        if (selected) {
            const selectedKeys = JSON.parse(selected);
            if (selectedKeys.length > 0) {
                keys = selectedKeys;
            }
        }

        toolAppsCols.setSelectedKeys(keys);
        setVisibleAdaptiveAppsOpenCols(keys);
    } catch (e) {
        console.log('loadAdaptiveAppsOpenCols: Failed to parse columns selected in the Open dialog.')
    }
}

function saveAdaptiveAppsOpenCols(keys) {
    if (keys.length === 0) {
        keys = defaultAdaptiveAppsOpenColKeys;
        toolAppsCols.setSelectedKeys(keys);
    }

    setVisibleAdaptiveAppsOpenCols(keys);
    localStorage.setItem(kAdaptiveAppsOpenCols, JSON.stringify(keys));
    filterApps.fireLiveChange();
}
