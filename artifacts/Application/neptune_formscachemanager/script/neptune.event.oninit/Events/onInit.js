CacheManager.getConfig();

if (typeof controller !== "undefined") {

   oPageTitle.addNavigationAction(butCacheConfig);

}

cboxConnectors.setFilterFunction(function (sTerm, oItem) {
            // A case-insensitive 'string contains' filter
            return oItem.getText().match(new RegExp(sTerm, "i"));
        });


