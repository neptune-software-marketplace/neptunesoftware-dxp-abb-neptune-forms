splitWorkbench.removeAllContentAreas();

if (this.getPressed()) {
    splitWorkbench.addContentArea(panTopProperties);
    splitWorkbench.addContentArea(panTopPreview);
} else {
    splitWorkbench.addContentArea(panTopPreview);
    splitWorkbench.addContentArea(panTopProperties);
}
