export default class {
    constructor(color, pos = 0, maxPos = 4) {
        this._pos   = pos;
        this.maxPos = maxPos;
        this.color  = color;
        this.column = document.createElement("div");
        this.column.classList.add("column");
        // this.column.classList.add("column-wider");
        this.updateStyle(pos);

        
        this.midcell  = document.createElement("div");
        this.midcell.classList.add("mid-cell");
        this.column.appendChild(this.midcell);

        this.onMidChangeFn  = function(){};
        this.onFocusFn      = function(){};

        this._middleFieldEl;

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

    set pos(pos) {
        this._oldPos = this._pos;
        this._pos    = pos;
    }

    get sc() {
        return siblingContainers;
    }

    set middleFieldEl(mel) {
        if(mel && mel != this._middleFieldEl) {
            this._middleFieldEl = mel;
            this.scrollFieldToMiddle(mel);
            this.onMidChangeFn({column:this});
        }
    }

    updateStyle(pos = this.pos) {
        let width = 94/(this.maxPos);
        this.column.style.backgroundColor = this.color;
        this.column.style.width = width+"%";
        this.column.style.right = -12+(pos-1)*width+"%";
        this.column.style.zIndex = this.maxPos+2-(Math.round(pos)+1); // max 10 columns
    }
    
    smoothUpdateStyle(duration) {
        let posDif = this._pos - this._oldPos;
        let startTime;
        let oldPos = this._oldPos;
        let self = this;
        function animation(currentTime) {
            if(!startTime) startTime = currentTime;
            let timeElapsed = currentTime - startTime;
            let smoothPos = ease(timeElapsed, oldPos, posDif, duration)
            self.updateStyle(smoothPos);
            if(timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t,b,c,d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    onMidChange(fn) {
        this.onMidChangeFn = fn;
    }

    onFocus(fn) {
        this.onFocusFn = fn;
    }

    append(siblingContainer, pos) {
        if(this.midcell.children.length > pos)
            this.midcell.insertBefore(siblingContainer.HTMLElement, this.midcell.children[pos]);
        else
            this.midcell.appendChild(siblingContainer.HTMLElement);
    }

    getMiddleFieldEl() {
        let mc = this.getMiddleContainerEl();
        if(mc)
            for(let fieldEl of mc.children) {
                if(isElementInMiddle(fieldEl)) {
                    return fieldEl;
                }
            }
        if(this._middleFieldEl && this._middleFieldEl.parentNode && this._middleFieldEl.parentNode.parentNode)
            return this._middleFieldEl;
        else
            return undefined
    }

    getMiddleContainerEl() {
        for(let scEl of this.midcell.children) {
            if(isElementInMiddle(scEl))
                return scEl;
        }
    }

    clean() {
        while(this.midcell.lastElementChild)
            this.midcell.removeChild(this.midcell.lastElementChild);
    }
        
    /*
    * 
    * Controls
    * 
    */

    scrollFieldToMiddle(field) {
        this.controlDY(diffToMiddle(field), true);
    }

    controlDown() {
        this.controlDY(12);
    }

    controlUp() {
        this.controlDY(-12);
    }

    controlDY(dy, noNotification) {
        this.dy = this.dy+dy;
        this.midcell.style.transform = "translateY("+this.dy+"px)";
        if(noNotification)
            this._middleFieldEl = this.getMiddleFieldEl();
        else
            this.middleFieldEl = this.getMiddleFieldEl();

    }

    click() {
        this.onFocusFn({column: this});
    }

    addClickListener() {
        this.column.addEventListener("mousedown",() => this.click());
        this.column.addEventListener("touchmove", (e) => this.click());
        this.column.addEventListener("wheel", () => this.click());
    }

    addTouchListener() {
        this.column.addEventListener("touchstart", (e) => {
            let touchobj = e.changedTouches[0]; // first finger
            this.startx = parseInt(touchobj.clientX);
            this.starty = parseInt(touchobj.clientY);
            this.lastx = this.startx;
            this.lasty = this.starty;
         });
    
         this.column.addEventListener("touchmove", (e) => {
            let touchobj = e.changedTouches[0]; // first finger
            let clientx = parseInt(touchobj.clientX);
            let clienty = parseInt(touchobj.clientY);
            let distx = clientx - this.lastx;
            let disty = clienty - this.lasty;
            this.lastx = clientx;
            this.lasty = clienty; 
            e.preventDefault();
            this.controlDY(disty);
         });
    }

    addWheelListener() {
        this.HTMLElement.addEventListener('wheel', (e) => {
            this.sumWheelY += e.deltaY;
            if(this.sumWheelY < -2.5) {
                this.controlDown();
                this.sumWheelY = 0;
            } else if (this.sumWheelY > 2.5) {
                this.controlUp();
                this.sumWheelY = 0;
            }
        });
    }
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
