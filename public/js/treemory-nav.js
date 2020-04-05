import Column from "./column.js"
import Datafield from "./datafield.js";

export default class {
    constructor(dom, editable = true, color = "#447cff") {
        this.row = document.createElement("div");
        this.row.classList.add("row");

        this.columns = [];
        // this.columns.push(new Column(color, 0));
        // this.columns.push(new Column("#454545", 1));
        // this.columns.push(new Column("#4af545", 2));
        // this.columns.push(new Column(color, 3));
        // this.columns.push(new Column("#454545", 4));
        // this.maxPos = this.columns.length-1;

        this.maxPos = 3;
        this.colors = ["#447cff", "#454545", "#3aed35"];
        for (let i = 0; i <= this.maxPos+2; i++) {
            this.appendColumn(this.colors[i%3], i, this.maxPos);
        }
        this.baseColIndex = 0; //pos 0

        this.activeColPos = 0;
        this.highlightField = {};

        dom.appendChild(this.row);

        this.defaultfield = new Datafield({id:"default"});

        this.datafields  = [];
        // this.import(["default"]);

        this.addControls();
    }

    appendColumn(color, pos) {
        let col = new Column(color, pos, this.maxPos);
        if(pos == 0)
            this.columns.splice(pos, 0, col);
        else
            this.columns.push(col);
        this.row.appendChild(col.HTMLElement);
        
        col.onMidChange((e) => {
            this.activeColPos   = e.column.pos;
            this.updateHighlightField();
            // this.updateEmptyChildren();
            if(!this.isHighlightFieldFocused())
                document.activeElement.blur();
        });

        col.onFocus((e) => {
            this.focus(e.column);
        });
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
    import(data, startfield = data[0], startpos = 1) {
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
        this.activeColPos   = startpos;
        // this.highlightField = startdatafield;
        this.updateHighlightField(startdatafield);
        this.columns[startpos].middleFieldEl = startdatafield.HTMLElement;
    }

    autoExportAll(fnExp) { //fnExp function with export (all objects) as input
        //TODO on datafield change call fnExp(export())
    }

    autoExportDiff(fnExp) { //fnExp function with export (changed objects) as input
        //TODO: on datafield change call fnExp(exportDiff())
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
        console.log("display "+this.highlightField.value+" at "+this.activeColPos);
        this.display(this.highlightField, this.activeColPos);
        console.log(this.containerIndexPerCol);
    }

    display(field, at) {  // at = this.activeColPos
        let basefield = field;
        for (let i = at; i > 0; i--) {
            basefield = this.getParent(basefield);                        
        }
        this.displayBase(basefield);
    }

    displayBase(invisibleParent) {
        // prepare counter for display
        this.containerIndexPerCol = [];
        for (let i = 0; i <= this.maxPos+2; i++) {
            this.containerIndexPerCol[i] = 0;
        }
       
        // prepare first container in column1 for display
        // let invisibleParent = this.getParent(field);
        if(!invisibleParent.container)
            invisibleParent.createHTML();
        if(!invisibleParent.container.HTMLElement.parentNode)
            this.columns[this.baseColIndex+1].append(invisibleParent.container,0);
        console.log("base "+invisibleParent.value);
        invisibleParent.keepContainer = true;
        this.containerIndexPerCol[1]++;
        this.displayChildren(invisibleParent, 1);

        
        // clean all columns
        this.datafields.forEach(field => {
            // if(field != invisibleParent)
            this.keepOrDelete(field);
        });
        this.keepOrDelete(this.defaultfield);
    }

    keepOrDelete(field) {
        if(!field.keepContainer && field.container && field.container.HTMLElement.parentNode) {
            field.container.HTMLElement.parentNode.removeChild(field.container.HTMLElement);
        }
        field.keepContainer = false;
    }

    displayChildren(parent, displayPos) {
        let displayColIndex = this.baseColIndex + displayPos;
        parent.childrenIds.forEach((cId, childContainerPos) => {
            // create children (HTML)
            let child   = this.datafieldById(cId);
            child.createHTML();
            child.keepContainer = true;
            if(!child.HTMLElement.parentNode) {        
                child.HTMLElement.classList.add("fadein");
                child.HTMLElement.addEventListener("focus", (e) => {
                    this.columns[displayColIndex].middleFieldEl = child.HTMLElement;
                });
                parent.container.append(child, childContainerPos);
            }
            // append container of children
            if(!child.container.parentNode)
                this.columns[displayColIndex+1].append(child.container, this.containerIndexPerCol[displayPos+1]);
            this.containerIndexPerCol[displayPos+1]++;
            
            if(childContainerPos == 0 && !parent.lastSelectedChild) {
                parent.lastSelectedChild = child;
                // console.log(child.value+" <- "+parent.value);
            }
            
            if(displayPos < this.maxPos+1) {
                this.displayChildren(child, displayPos+1);
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
        if(this.highlightField.childrenIds.length == 0) {
            let newfield = new Datafield();
            this.datafields.push(newfield);
            newfield.parent = this.highlightField;
            this.updateDisplay();
        }
    }

    updateMiddleFields() {
        let hglPos = this.activeColPos;
        let child  = this.highlightField;
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

    // needs activeColPos to be set correctly
    updateHighlightField(field) {
        if(!field)
            field = this.datafieldById(this.columns[this.activeColPos+this.baseColIndex].getMiddleFieldEl().id)
        if(!field) return;
        this.highlightField = field;
        this.cleanHighlightClass();
        field.HTMLElement.classList.add("hgl");
        // this.getParent(field).lastSelectedChild = field;
        let child   = field;
        let parent  = this.getParent(field);
        do {
            parent.lastSelectedChild = child;
            child  = parent;
            parent = this.getParent(parent);
        } while (parent.isDisplayed());
        
        this.updateActiveFields();
        this.updateNewChild();
        this.updateMiddleFields();
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
        if(pos >= this.activeColPos && pos < this.maxPos)
            startfield.childrenIds.forEach(id => {
                this.setActiveRecursive(id, pos+1);
            });
        if(pos <= this.activeColPos && pos > 0)
            startfield.parentIds.forEach(id => {
                this.setActiveRecursive(id, pos-1);
            });
    }

    // remove(removefield) {
    //     this.datafields = this.datafields.filter((field) => field.id != removefield.id);
    //     this.columns[removefield.pos].remove(removefield);
    //     removefield.parentIds.forEach(pId => {
    //         let parent = this.datafieldById(pId);
    //         parent.childrenIds = parent.childrenIds.filter(cId => cId != removefield.id);
    //     });
    // }

    focus(column) {
        if(column.pos <= this.activeColPos) {
            if (column.pos == 0 && this.baseColIndex == 0) return;
            let oldPos = this.activeColPos;
            this.activeColPos   = column.pos;
            if (column.pos == 0) {
                while(oldPos > 0) {
                    this.highlightField = this.getParent(this.highlightField);
                    oldPos--;
                }
                this.moveColumnsRight();
            }
            this.updateHighlightField();
        }
        else { // select most left highlight field (following actives)
            let newHgl;
            newHgl = this.highlightField;
            while(newHgl.lastSelectedChild && this.activeColPos < column.pos) {
                newHgl = newHgl.lastSelectedChild;
                this.activeColPos++;
            }
            
            this.activeColPos = this.activeColPos;
            this.updateHighlightField(newHgl); // eventually creates new field

            
            if(this.activeColPos < column.pos) {
                this.activeColPos++;
                this.updateHighlightField();
            }
            
            if(column.pos == this.maxPos+1 && this.activeColPos == this.maxPos+1)
                this.moveColumnsLeft();
        }  
    }

    moveColumnsLeft() {
        this.columns.forEach(col => {
            col.pos--;
            col.smoothUpdateStyle(400);
        });

        if(this.columns[this.columns.length-1].pos == this.maxPos+1)
            this.appendColumn(this.colors[this.columns.length%3], this.maxPos+2);

        this.baseColIndex++;
        this.activeColPos--;
        this.updateDisplay();
    }

    moveColumnsRight() {
        this.columns.forEach(col => {
            col.pos++;
            col.smoothUpdateStyle(400);
        });
        
        if(this.columns[0].pos == 1)
            this.appendColumn(this.columns[2].color, 0);

            
        if(this.baseColIndex > 0) this.baseColIndex--;
        this.activeColPos++;
        this.updateDisplay();
    }

    isHighlightFieldFocused() {
        return document.activeElement == this.highlightField.HTMLElement;
    }

    datafieldById(id) { return this.datafields.find((field) => field.id == id || field.HTMLId == id) }

    addControls() {
        window.addEventListener('keydown', (e) => { 
            if (e.keyCode == 40) {
                this.columns[this.activeColPos+this.baseColIndex].controlUp();
                this.columns[this.activeColPos+this.baseColIndex].controlUp();
            };
            
            if (e.keyCode == 38) { // Up
                this.columns[this.activeColPos+this.baseColIndex].controlDown();
                this.columns[this.activeColPos+this.baseColIndex].controlDown();
            }

            if (e.keyCode == 13) { // Enter
                e.preventDefault(); //Firefox bug (innerHTML="" => no height and left aligned)
                if(this.isHighlightFieldFocused()) {
                    let newfield    = new Datafield();
                    let parent      = this.getParent(this.highlightField);
                    let siblingsPos = parent.indexOf(this.highlightField)+1;
                    if(parent != this.defaultfield)
                        newfield.setParent(parent, siblingsPos);
                    else
                        this.defaultfield.childrenIds.splice(siblingsPos, 0, newfield.id);
                    
    
                    this.datafields.splice(this.datafields.indexOf(this.highlightField)+1, 0, newfield);
                    this.updateDisplay();
                    newfield.HTMLElement.focus();
                } else
                    this.highlightField.HTMLElement.focus();
            }

            if (e.keyCode == 27) { // ESC
                this.highlightField.HTMLElement.blur();
            }

            if (e.keyCode == 37 && !this.isHighlightFieldFocused()) { // left
                this.focus(this.columns[this.activeColPos+this.baseColIndex+1]);
            }
            
            if (e.keyCode == 39 && !this.isHighlightFieldFocused()) { // right
                this.focus(this.columns[this.activeColPos+this.baseColIndex-1]);
            }
        });
    }
}