const objectName = txtDiaDelete.getText();
ModelData.Delete(modeltabCacheConfig, "objectName", objectName);
modeltabCacheConfig.refresh();
CacheManager.clearCache(objectName);
CacheManager.objects = CacheManager.objects.filter (item => item.objectName !== objectName);

diaDelete.close();
CacheManager.saveConfig();