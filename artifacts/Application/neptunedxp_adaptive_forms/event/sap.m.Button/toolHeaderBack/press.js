const { openAs } = (modelAppConfig.oData.settings?.navigation || {});

if (openAs === 'S') {
    const tabKey = oApp.getParent().getParent().getProperty('key');
    sap.n.Shell.closeSidepanelTab(tabKey);
} else {
    // 'D' = Dialog or 'F' = Fullscreen
    report.close();
}