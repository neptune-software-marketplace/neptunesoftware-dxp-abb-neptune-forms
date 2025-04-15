// Handles the filtering to hide/show disabled/excluded items
switch( oEvent.getParameter("key") ) {
    case "DESIGNER":
        controller.filterProjectViewItemsByWhatToHide();
        break;
    default:
}