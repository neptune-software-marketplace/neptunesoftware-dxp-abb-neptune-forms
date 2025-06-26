if (xhr.responseJSON.length > 0) {
    CacheManager.config = xhr.responseJSON[0];
    CacheManager.config.configuration.sort((a, b) => {
        const nameA = a.objectName.toUpperCase(); // ignore upper and lowercase
        const nameB = b.objectName.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
    });
    CacheManager.cacheDB.save("Configuration", CacheManager.config);
}
CacheManager.getObjects();

modeltabCacheConfig.setData(CacheManager.config.configuration);
ConfigUIController.setEditable(false);
