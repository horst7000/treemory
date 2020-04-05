const PRE_SC_ID = "children";

export default class {
    constructor(parentId) {
        this.parentId    = parentId;
        this.HTMLId      = PRE_SC_ID+parentId;
        this.HTMLElement = document.createElement("div");
        this.HTMLElement.classList.add("siblings");
        this.HTMLElement.id = this.HTMLId;
    }

    get id() {
        return this.parentId;
    }

    get parentNode() {
        return this.HTMLElement.parentNode;
    }

    append(datafield, pos) {
        if(this.HTMLElement.children.length > pos)
            this.HTMLElement.insertBefore(datafield.HTMLElement, this.HTMLElement.children[pos]);
        else
            this.HTMLElement.appendChild(datafield.HTMLElement);
    }

    // appendTop(datafield) {
    //     this.HTMLElement.insertBefore(datafield.HTMLElement, this.HTMLElement.firstChild);
    // }

    contains(datafield) {
        return this.datafields.indexOf(datafield);
    }

    // insertAfter(datafield, afterfield) {
    //     this.datafields.push(datafield);
    //     this.HTMLElement.insertBefore(datafield, afterfield.nextSibling);
    // }

    // remove() {

    // }

}

// function insertAfter(newNode, referenceNode) {
//     referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
// }