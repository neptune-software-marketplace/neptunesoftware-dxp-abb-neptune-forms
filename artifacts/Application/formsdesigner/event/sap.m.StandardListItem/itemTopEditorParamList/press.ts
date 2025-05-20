// copies the variable to the clipboard
try {
    let text = this.getBindingContext().getObject().variable;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    }
    else {
        // @ts-ignore
        Utils.fallbackCopyTextToClipboard(text);
    }
    sap.m.MessageToast.show(`"${text}" copied to Clipboard!`);
    MonacoEditor.instance.focus();
}
catch(e) {
    sap.m.MessageToast.show("Copy to Clipboard failed!");
    console.error(e);
}
