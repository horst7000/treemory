export default class {
    constructor(color, pos = 0, maxPos = 4) {
        this._pos = pos;
        this.column = document.createElement("div");
        this.column.classList.add("column");
        // this.column.classList.add("column-wider");
        let width = 100/(maxPos+1);
        this.column.style.backgroundColor = color;
        this.column.style.width = width+"%";
        this.column.style.right = -15+(pos)*width+"%";
        this.column.style.zIndex = maxPos+1-(pos+1); // max 10 columns

        
        this.midtable = document.createElement("div");
        this.midtable.classList.add("mid-table");
        this.midcell  = document.createElement("div");
        this.midcell.classList.add("mid-cell");
        this.midtable.appendChild(this.midcell)
        this.column.appendChild(this.midtable);

        this.datafields = [];

        this._middleField;

        this.observers = [];

        this.dy = 0;
        this.lastx = this.lasty = this.startx = this.starty = 0;
        this.sumWheelY = 0;

        this.addClickListener();
        this.addTouchListener();
        this.addWheelListener();
    }

    get HTMLElement() {
        return this.column;
    }

    get pos() {
        return this._pos;
    }

    set middleField(mel) {
        if(mel && mel != this._middleField) {
            this._middleField = mel;
            this.scrollFieldToMiddle(mel);
            this.notifyObservers();
        }
    }

    addObserver(o) {
        this.observers.push(o);
    }

    notifyObservers() {
        this.observers.forEach(o => {
            o.update(this);
        });
    }

    assignDatafields(datafields) {
        datafields.forEach(field => {        
            this.appendField(field);
        });
        if(this.pos != 0)
            this.midcell.appendChild(document.createElement("hr"));
    }

    insertInputBelowMiddle(datafield) { // insert below middleElement
        this.appendField(datafield, this.getMiddleField());
    }
    
    appendField(field, previousField = false) {
        this.datafields.push(field);
        if(previousField)
            insertAfter(field.HTMLElement, previousField.HTMLElement); // inserts to end if insertAfter is invalid
        else
            this.midcell.appendChild(field.HTMLElement);
        field.pos = this.pos;
        field.HTMLElement.addEventListener("focus", (e) => {
            this.middleField = field;
        });
    }

    cleanActiveClass() {
        this.datafields.forEach(field => {
            field.HTMLElement.classList.remove("active");
        });
    }

    cleanHighlightClass() {
        this.datafields.forEach(field => {
            field.HTMLElement.classList.remove("hgl");            
        });
    }

    getMiddleField() {
        let midfield = this.datafields.find((field) => isElementInMiddle(field.HTMLElement));
        return midfield || this._middleField;
    }

    remove(datafield) {
        this.datafields = this.datafields.filter((field) => field.id != datafield.id);
        this.midcell.removeChild(datafield.HTMLElement);
        if(this.getMiddleField().id == datafield.id)
            delete this._middleField;

    }
        
    /*
    * 
    * Controls
    * 
    */

    scrollFieldToMiddle(field) {
        this.controlDY(diffToMiddle(field.HTMLElement), true);
    }

    controlDown() {
        // let next = hovered.nextSibling;
        // hoverInputEl(next ? next : createInput());
        this.controlDY(12);
    }

    controlUp() {
        // let prev = hovered.previousSibling;
        // if(!prev) return;
        // hoverInputEl(prev);
        this.controlDY(-12);
    }

    controlDY(dy, noNotification) {
        // this.getMiddleField().HTMLElement.blur();
        this.dy = this.dy+dy;
        this.midcell.style.transform = "translateY("+this.dy+"px)";
        if(noNotification)
            this._middleField = this.getMiddleField();
        else
            this.middleField = this.getMiddleField();

    }

    click() {
        this.notifyObservers();
    }

    addClickListener() {
        this.column.addEventListener("mousedown",(e) => this.click(e));
        this.column.addEventListener("touchstart", (e) => this.click());
        this.column.addEventListener("wheel", (e) => this.click());
    }

    addTouchListener() {
        this.column.addEventListener("touchstart", (e) => {
            let touchobj = e.changedTouches[0]; // first finger
            this.startx = parseInt(touchobj.clientX);
            this.starty = parseInt(touchobj.clientY);
            this.lastx = this.startx;
            this.lasty = this.starty;
            // moves.innerHTML = "touchstart bei ClientX: " + startx + "px ClientY: " + starty + "px";
         });
    
         this.column.addEventListener("touchmove", (e) => {
            let touchobj = e.changedTouches[0]; // first finger
            let clientx = parseInt(touchobj.clientX);
            let clienty = parseInt(touchobj.clientY);
            let distx = clientx - this.lastx;
            let disty = clienty - this.lasty;
            this.lastx = clientx;
            this.lasty = clienty;
            // moves.innerHTML = "touchmove horizontal: " + distx + "px vertikal: " + disty + "px";  
            e.preventDefault();
            this.controlDY(disty);
         });
    }

    addWheelListener() {
        this.HTMLElement.addEventListener('wheel', (e) => {
            this.sumWheelY += e.deltaY;
            if(this.sumWheelY < -2.5) {
                this.controlUp();
                this.sumWheelY = 0;
            } else if (this.sumWheelY > 2.5) {
                this.controlDown();
                this.sumWheelY = 0;
            }
        });
    }

}


function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function isElementInMiddle(el) {        
    let diffTop    = el.getBoundingClientRect().top-1 - window.innerHeight/2; //TO-DO container instead of window
    let diffBottom = el.getBoundingClientRect().bottom-1 - window.innerHeight/2; //TO-DO container instead of window
    // console.log(diffTop);
    // console.log(diffBottom);
    return (diffTop < 0 && diffBottom >= 0);
}

function diffToMiddle(el) {
    let rect = el.getBoundingClientRect();
    return window.innerHeight/2 - (rect.top+rect.height/2);
}
