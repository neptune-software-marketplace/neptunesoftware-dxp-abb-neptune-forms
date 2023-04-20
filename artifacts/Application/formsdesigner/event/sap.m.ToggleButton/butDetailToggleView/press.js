splitDesigner.removeAllContentAreas();

if (this.getPressed()) {
    splitDesigner.addContentArea(panTopOutline);
    splitDesigner.addContentArea(panTopProperties);
    splitDesigner.addContentArea(panTopPreview);
} else {
    splitDesigner.addContentArea(panTopOutline);
    splitDesigner.addContentArea(panTopPreview);
    splitDesigner.addContentArea(panTopProperties);
}
