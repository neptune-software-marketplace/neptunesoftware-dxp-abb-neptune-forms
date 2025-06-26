const columns = CacheManager.modelGetColumns(modelpanTopProperties.oData.objectName);
columns.sort((a, b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
    });

modellistModelColumnSelect.setData(columns);

const binding = listModelColumnSelect.getBinding("items");
binding.filter([]);
listModelColumnFilter.setValue("");

