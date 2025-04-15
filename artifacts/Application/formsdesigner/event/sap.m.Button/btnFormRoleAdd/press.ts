// @ts-ignore
sap.n.Planet9.openRoles("Multi", function(roles: Array) {
    if (!Array.isArray(roles)) {
        console.error("openRoles: expected an array, got", roles);
        return;
    }
    let formRoles = modeloPageDetail.getData()?.roles ?? [];
    let mapRoles:Map<string,object> = formRoles.concat(roles).reduce(
        (bag, item)=>bag.set(item.id, item), new Map());
    modeloPageDetail.getData().roles = Array.from(mapRoles.values());
    modeloPageDetail.refresh();
}, null, !0)