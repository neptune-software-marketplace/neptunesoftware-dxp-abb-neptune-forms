(()=>{ 
    // @ts-ignore
    const {waitForCondition} = neptune?.Utils;
    if (waitForCondition) {
        waitForCondition(()=> 
            // @ts-ignore
            (typeof CacheManager !== "undefined") && (typeof cboxConnectors !== "undefined")
        ).then(() => {
            console.log("CacheManager: init");
            // @ts-ignore
            CacheManager.getConfig();

            // @ts-ignore
            if (typeof controller !== "undefined") {
                // @ts-ignore
                oPageTitle.addNavigationAction(butCacheConfig);
            }

            // @ts-ignore
            cboxConnectors.setFilterFunction(function (sTerm, oItem) {
                // A case-insensitive 'string contains' filter
                return oItem.getText().match(new RegExp(sTerm, "i"));
            });
        });
    }
})();
