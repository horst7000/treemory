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

        this.input = document.createElement("input");
        this.input.value = this._value;
    }

    get id() {
        return this._id;
    }

    set parent(p) {
        if(p) {
            this.parentIds = [p.id];
            p.childrenIds.push(this.id);
        }
    }

    set value(val) {
        this.input.value = val;
        this._value      = val;
    }

    set column(column) {
        this._column = column;
    }

    get value() {
        return this.HTMLElement.value;
    }

    get column() {
        return this._column;
    }

    get HTMLElement() {
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