const PRE_DF_ID = "field";

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
        
        this.HTMLId          = PRE_DF_ID+this.id;
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
        this.input.contentEditable  = true;
        this.input.id               = this.HTMLId;
        this.value                  = this._value;
        this.container              = new SiblingContainer(this._id);
        return this.input;
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