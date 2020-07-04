import SiblingContainer from "./siblingContainer.js";

export default class {
    constructor(options) {

        if(typeof options == "object") {
            this._id            = options.id || randomId();
            this._value         = options.value || "";
            this.childrenIds    = options.childrenIds || [];
            this.parentIds      = options.parentIds || [];
        }
        else if(typeof options == "string") {
            this._id             = randomId();
            this._value         = options;
            this.childrenIds    = [];
            this.parentIds      = [];
        } else {
            this._id             = randomId();
            this._value         = "";
            this.childrenIds    = [];
            this.parentIds      = [];
        }
        
        this.lastSelectedChild;
    }

    get id() {
        return this._id;
    }

    set parent(p) {
        this.setParent(p);
    }

    setParent(p, childPos = -1) {
        if(p) {
            this.parentIds = [p.id];
            if(childPos >= 0) {
                p.childrenIds.splice(childPos, 0, this.id);
            } else
                p.childrenIds.push(this.id);
        }
    }

    indexOf(child) {
        return this.childrenIds.indexOf(child.id);
    }

    get value() {
        return this.HTMLElement?this.HTMLElement.innerHTML:this._value; //this._value in case of not displayed
    }

    set value(val) {
        this.input.innerHTML = val;
        this._value      = val;
    }

    set columnNr(column) {
        this._column = column;
    }

    get columnNr() {
        return this._column;
    }

    get HTMLElement() {
        return this.input;
    }

    isDisplayed() {
        return (this.input && this.input.parentNode && this.input.parentNode.parentNode)
    }

    createHTML() {
        if(this.input) return false;
        this.input                  = document.createElement("p");
        // this.input.contentEditable  = true;
        this.input.contentEditable  = false;
        this.input.draggable        = true;
        this.addDragStyleAndDataListener();
        // this.input.id               = this.HTMLId;
        this.input.dataset.id       = this._id;
        this.value                  = this._value;
        this.container              = new SiblingContainer(this._id);
        return this.input;
    }

    addDragStyleAndDataListener() {
        this.input.addEventListener("dragstart", e => {
            e.dataTransfer.setDragImage(e.target,e.layerX,0);
            this.input.style.textShadow         = "3px 4px 3px black";
            this.input.style.borderBottomColor  = "darkslategrey";
            e.dataTransfer.setData("text", this.id);
        });
        this.input.addEventListener("dragend", e => {
            this.input.style.textShadow         = "none";
            this.input.style.borderBottomColor  = "";
            this.ondragleave();
        });
        this.input.addEventListener("dragover", e => {
            this.input.style.marginBottom       = "20px";
            this.input.style.borderBottomWidth  = "3px";
            this.input.style.transform          = "scale(0.9)";
        });
        this.input.addEventListener("dragleave", e => {
            this.ondragleave();
        });
    }

    ondragleave() {
        this.input.style.marginBottom       = "";
        this.input.style.borderBottomWidth  = "";
        this.input.style.transform          = "";
    }

    asObj() {
        return {
            id: this.id,
            value: this.value,
            childrenIds: this.childrenIds,
            parentIds: this.parentIds
        }
    }

}

function randomId() {
    return '_' + Math.random().toString(36).substr(2);
}