export default class {
    constructor(nav) {
        this.nav = nav;
    }

    update(column) {
        this.nav.activeCol = column;
        this.nav.highlightField = column.getMiddleField();
        this.nav.updateHighlightField();
        this.nav.updateEmptyChildren();
        this.nav.updateNewChild();
        this.nav.updateActiveFields();
        this.nav.updateMiddleFields(column.pos);
    }
}