splitDesigner.removeAllContentAreas();

if (this.getPressed()) {
    splitDesigner.addContentArea(panTopOutline);
    splitDesigner.addContentArea(panTopProperties);
    splitDesigner.addContentArea(panTopProjectPreview);
} else {
    splitDesigner.addContentArea(panTopOutline);
    splitDesigner.addContentArea(panTopProjectPreview);
    splitDesigner.addContentArea(panTopProperties);
}
