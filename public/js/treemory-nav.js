import Column from "./column.js"
import Datafield from "./datafield.js";

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

        this.activeColPos = 0;
        this._highlightField = {};

        this.columns.forEach(col => {
            row.appendChild(col.HTMLElement);
            col.onMidChange((e) => {
                this.activeColPos = e.column.pos;
                this.highlightField = this.datafieldById(e.column.getMiddleFieldEl().id);
                // this.updateEmptyChildren();
                this.updateNewChild();
                this.updateActiveFields();
                this.updateMiddleFields(e.column.pos);
            });
            col.onFocus((e) => {
                this.activeColPos = e.column.pos;
                this.highlightField = this.datafieldById(e.column.getMiddleFieldEl().id);
                this.updateActiveFields();
                this.updateNewChild();
                this.updateMiddleFields(e.column.pos);
            });
        });
        dom.appendChild(row);

        this.defaultfield = new Datafield({id:"default"});

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
    import(data, startfield = data[0], startpos = 0) {
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
                this.defaultfield.childrenIds.push(datafield.id);
            }
        });

        let startdatafield = this.datafieldById(startfield.id) || this.datafields[0];
        this.display(startdatafield, startpos);
        this.highlightField = startdatafield;
        this.activeColPos   = startpos;
        this.columns[startpos].middleFieldEl = startdatafield.HTMLElement;
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

    updateDisplay() {
        this.display(this.highlightField, this.activeColPos);
    }

    display(field, at) {
        let basefield = field;
        for (let i = at; i > 0; i--) {
            basefield = this.getParent(basefield);                        
        }
        this.displayBase(basefield);
    }

    displayBase(field) {
        // prepare counter for display
        this.containerIndexPerCol = [];
        for (let i = 0; i < this.columns.length; i++) {
            this.containerIndexPerCol[i] = 0;
        }

        // prepare first container in column0 for display
        let invisibleParent = this.getParent(field);
        if(invisibleParent.createHTML())  
            this.columns[0].append(invisibleParent.container,0);
        this.displayChildren(invisibleParent, 0);
    }

    displayChildren(parent, childColPos) {
        parent.childrenIds.forEach((cId, childContainerPos) => {
            let child   = this.datafieldById(cId);
            let newChildEl = child.createHTML();
            if(newChildEl) {        
                newChildEl.classList.add("fadein");
                newChildEl.addEventListener("focus", (e) => {
                    this.columns[childColPos].middleFieldEl = child.HTMLElement;
                });
                parent.container.append(child, childContainerPos);
            }
            if(childContainerPos == 0 && !parent.lastSelectedChild)
                parent.lastSelectedChild = child;
            
            if(childColPos < this.maxPos) {
                if(newChildEl)
                    this.columns[childColPos+1].append(child.container, this.containerIndexPerCol[childColPos+1]);
                this.containerIndexPerCol[childColPos+1]++;

                this.displayChildren(child, childColPos+1);
            }
        });
    }

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

    getParent(field) {
        return this.datafieldById(field.parentIds[0]) || this.defaultfield;
    }

    updateActiveFields() {
        this.cleanActiveClass();
        this.setActiveRecursive(this.highlightField.id, this.activeColPos);
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
        if(this.highlightField.childrenIds.length == 0 && this.activeColPos != this.maxPos) {
            let newfield = new Datafield();
            this.datafields.push(newfield);
            newfield.parent = this.highlightField;
            this.updateDisplay();
        }
    }

    updateMiddleFields(hglPos) {
        let child = this.highlightField;
        this.columns.forEach(col => {
            let act;
            if(col.pos < hglPos)
                for(let sc of col.midcell.children)
                    for(let d of sc.children)
                        if(d.classList.contains("active")) {
                            act = d;
                            break;
                        }
            if(col.pos == hglPos) {
                return;
            }
            if(col.pos > hglPos && child.lastSelectedChild) {
                child = child.lastSelectedChild;
                act = child.HTMLElement;
            }
            
            if(act)
                col.scrollFieldToMiddle(act)
        });
    }

    set highlightField(field) {
        this._highlightField = field;
        this.cleanHighlightClass();
        field.HTMLElement.classList.add("hgl");
        // this.getParent(field).lastSelectedChild = field;
        let child   = field;
        let parent  = this.getParent(field);
        do {
            parent.lastSelectedChild = child;
            child  = parent;
            parent = this.getParent(parent);
        } while (parent.parentIds.length > 0);
    }

    get highlightField() {
        return this._highlightField;
    }

    cleanActiveClass() {
        let actives = [];
        for(let el of document.getElementsByClassName("active")) {
            actives.push(el);
        }
        actives.forEach(el => {
            el.classList.remove("active");
        });
    }

    cleanHighlightClass() {
        for(let el of document.getElementsByClassName("hgl"))
            el.classList.remove("hgl");    
    }

    setActiveRecursive(startId, pos) {
        let startfield = this.datafieldById(startId);
        startfield.HTMLElement.classList.add("active");
        if(pos >= this.activeColPos)
            startfield.childrenIds.forEach(id => {
                this.setActiveRecursive(id, pos+1);
            });
        if(pos <= this.activeColPos && pos > 0)
            startfield.parentIds.forEach(id => {
                this.setActiveRecursive(id, pos-1);
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

    datafieldById(id) { return this.datafields.find((field) => field.id == id || field.HTMLId == id) }

    addControls() {
        window.addEventListener('keydown', (e) => { 
            if (e.keyCode == 40) {
                this.columns[this.activeColPos].controlUp();
            };
            
            if (e.keyCode == 38) { // Up
                this.columns[this.activeColPos].controlDown();
            }

            if (e.keyCode == 13) { // Enter
                e.preventDefault(); //Firefox bug (innerHTML="" => no height and left aligned)
                let newfield    = new Datafield();
                let parent      = this.getParent(this.highlightField);
                newfield.setParent(parent, parent.indexOf(this.highlightField)+1);

                this.datafields.splice(this.datafields.indexOf(this.highlightField)+1, 0, newfield);
                this.updateDisplay();
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