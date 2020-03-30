import Column from "./column.js"
import Datafield from "./datafield.js";
import navColObserver from "./navColObserver.js";

export default class {
    constructor(dom, editable = true, color = "#447cff") {
        let row = document.createElement("div");
        row.classList.add("row");

        this.columns = [];
        // this.columns.push(new Column(color, 0));
        // this.columns.push(new Column("#454545", 1));
        // this.columns.push(new Column("#4af545", 2));
        // this.columns.push(new Column(color, 3));
        // this.columns.push(new Column("#454545", 4));
        // this.maxPos = this.columns.length-1;

        this.maxPos = 2;
        let colors = ["#447cff", "#454545", "#3aed35"];
        for (let i = 0; i <= this.maxPos; i++) {
            this.columns.push(new Column(colors[i%3], i, this.maxPos));
        }


        this.obs = new navColObserver(this);
        this.activeCol = {};
        this.highlightField = {};

        this.columns.forEach(col => {
            row.appendChild(col.HTMLElement);
            col.addObserver(this.obs);
        });
        dom.appendChild(row);

        this.displayIndex = 0;
        this.datafields  = [];
        // this.import(["default"]);

        this.addControls();
    }

    whereAmI() {

    }

    /**
     * 
     * @param {*} data either an array of {id, value, parentIds, childrenIds}-objects
     * or array of nested {value,children:[{...}]}-objects or a single nested 
     * {value,children:[{...}]}-object
     * @param {*} startfield 
     */
    import(data, startfield) {
        this.datafields.forEach(datafield => {
            this.remove(datafield);
        });
        

        if(Array.isArray(data)) {
            if(data[0].children)
                data.forEach(date => { // elements in data array are top level parents
                    this.createRecursive(date);
                });
            else
                data.forEach(date => {
                    this.datafields.push(new Datafield(date));
                });
        } else { // only one top level parent
            this.createRecursive(data);
        }

        this.datafields.forEach(datafield => {
            if(datafield.parentIds.length == 0) {
                this.displayRecursive(datafield, 0);
            }
        });

        // this.obs.update(this.columns[0]);
        this.columns[0].middleField = this.columns[0].datafields[0];
    }

    autoExportAll(fnExp) { //fnExp function with export (all objects) as input
        //TO-DO on datafield change call fnExp(export())
    }

    autoExportDiff(fnExp) { //fnExp function with export (changed objects) as input
        //TO-DO: on datafield change call fnExp(exportDiff())
    }

    export() {
        let exp = [];
        this.datafields.forEach(field => {
            exp.push(field.asObj());
        });
        return exp;
    }

    exportAs() {

    }

    // private

    createRecursive(date, parent) {
        let child = new Datafield(date.value);
        if(parent) child.parent = parent;
        this.datafields.push(child);

        // call for each child
        if(date.children)
            date.children.forEach(childdata => {
                this.createRecursive(childdata, child);
            });
    }

    displayRecursive(startfield, pos) {
        if(pos == 0) {
            this.columns[0].assignDatafields([startfield]);
        }
        
        let children = [];
        if(pos < this.maxPos) {
            startfield.childrenIds.forEach(id => {
                children.push(this.datafieldById(id));
            });
            this.columns[pos+1].assignDatafields(children);
        }

        children.forEach(child => {
            this.displayRecursive(child, pos+1);
        });
    }

    updateActiveFields() {
        this.setActiveFields(this.highlightField);
    }

    updateHighlightField() {
        this.setHighlightField(this.highlightField);
    }

    updateEmptyChildren() {
        this.datafields.forEach(datafield => {
            if(datafield.childrenIds.length == 0 && datafield.HTMLElement.value == ""
                && datafield.parentIds[0] != this.highlightField.id
                && datafield.id != this.highlightField.id) {
                this.remove(datafield);
            }
        });
    }

    updateNewChild() {
        if(this.highlightField.childrenIds.length == 0 && this.activeCol.pos != this.maxPos) {
            let newfield = new Datafield();
            newfield.HTMLElement.classList.add("fadein");
            this.datafields.push(newfield);
            this.columns[this.activeCol.pos+1].insertInputBelowMiddle(newfield);

            newfield.parent = this.highlightField;
        }
    }

    updateMiddleFields(exceptPos) {
        this.columns.forEach(col => {
            if(col.pos == exceptPos) return;
            let act = col.datafields.find((field) => field.HTMLElement.classList.contains("active")
                && field.value != "") ||  
                col.datafields.find((field) => field.HTMLElement.classList.contains("active"));
            if(act)
                col.scrollFieldToMiddle(act)
        });
    }

    setActiveFields(field) {
        this.cleanActiveClass(field.pos);
        this.setActiveRecursive(field.id, field.pos);
    }

    setHighlightField(field) {
        this.cleanHighlightClass(field.pos);
        field.HTMLElement.classList.add("hgl");
    }

    cleanActiveClass(pos) {
        this.columns.forEach(col => {
            // if(col.pos >= pos)
                col.cleanActiveClass();
        });
    }

    cleanHighlightClass() {
        this.columns.forEach(col => {
            col.cleanHighlightClass();
        });
    }

    setActiveRecursive(startId, fixPos) {
        let startfield = this.datafieldById(startId);
        startfield.HTMLElement.classList.add("active");
        
        if(startfield.pos >= fixPos)
            startfield.childrenIds.forEach(id => {
                this.setActiveRecursive(id, fixPos);
            });
        if(startfield.pos <= fixPos)
            startfield.parentIds.forEach(id => {
                this.setActiveRecursive(id, fixPos);
            });
    }

    remove(removefield) {
        this.datafields = this.datafields.filter((field) => field.id != removefield.id);
        this.columns[removefield.pos].remove(removefield);
        removefield.parentIds.forEach(pId => {
            let parent = this.datafieldById(pId);
            parent.childrenIds = parent.childrenIds.filter(cId => cId != removefield.id);
        });
    }

    datafieldById(id) { return this.datafields.find((field) => field.id == id) }

    addControls() {
        window.addEventListener('keydown', (e) => { 
            if (e.keyCode == 40) {
                this.activeCol.controlDown();
            };
            
            if (e.keyCode == 38) { // Up
                this.activeCol.controlUp();
            }

            if (e.keyCode == 13) { // Enter
                let newfield = new Datafield();
                newfield.parent = this.datafieldById(this.highlightField.parentIds[0]);
                this.datafields.push(newfield);
                this.activeCol.insertInputBelowMiddle(newfield);
                newfield.HTMLElement.focus();
            }

            if (e.keyCode == 27) { // ESC
                this.highlightField.HTMLElement.blur();
            }

            // if (e.keyCode == 37 && !isFocusOnHovered()) { // left
            //     this.activeCol.controlLeft();
            // }
            
            // if (e.keyCode == 39  && !isFocusOnHovered() && superqueue.length > 1) { // right
            //     this.activeCol.controlRight();
            // }
        });
    }
}