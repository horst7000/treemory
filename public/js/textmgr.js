(function() {
    const COLUMN_SUPER = "superinputs";
    const COLUMN_SUB = "subinputs";
    const START_ID = "start";
    let hovered = {};
    let superhovered = {};
    let startEl = {item:{children:[]}, localID:START_ID};
    let superqueue = [START_ID];
    let focusedColumn = COLUMN_SUPER;
    let sumWheelY = 0;
    let firstInputdY = 0;
    let firstinputs = document.getElementById("firstinputs");
    let firstcolumn = document.getElementById("firstcolumn");
    loadStart();
    // loadSubs(startEl, COLUMN_SUPER);
    // hoverInputEl(document.getElementById(COLUMN_SUPER).firstChild);

    printRecursive("start");
    
    function printRecursive(startId) {
        let item = loadItem(startId);

        item.children.forEach(id => {
            printRecursive(id);
        });
    }

    // Controls for stand-alone 
    window.addEventListener('keydown', (e) => { 
        if (e.keyCode == 40 || (e.keyCode == 13 && isFocusOnHovered())) {
            controlDown();
        };
        
        if (e.keyCode == 38) {
            controlUp();
        }

        if (e.keyCode == 13) {
            hovered.focus();
        }

        if (e.keyCode == 27) { // ESC
            hovered.blur();
            saveElement(hovered);
        }

        if (e.keyCode == 37 && !isFocusOnHovered()) { // left
            controlLeft();
        }
        
        if (e.keyCode == 39  && !isFocusOnHovered() && superqueue.length > 1) { // right
            controlRight();
        }

    });

    function controlDown() {
        // let next = hovered.nextSibling;
        // hoverInputEl(next ? next : createInput());
        controlDY(12);
    }

    function controlUp() {
        // let prev = hovered.previousSibling;
        // if(!prev) return;
        // hoverInputEl(prev);
        controlDY(-12);
    }

    function controlDY(dy) {
        firstInputdY = firstInputdY+dy;
        firstinputs.style.transform = "translateY("+firstInputdY+"px)";
    }

    function controlLeft() {
        if(focusedColumn == COLUMN_SUB && !hovered.value) return;
            if(focusedColumn == COLUMN_SUB) {
                let superId = hovered.localID;
                loadSubs(superhovered, COLUMN_SUPER);
                superhovered = findElById(superId, COLUMN_SUPER);
                loadSubs(superhovered);
                superqueue.unshift(hovered.localID);
            }
            hoverInputEl(document.getElementById(COLUMN_SUB).firstChild);
            console.log(superqueue);
    }

    function controlRight() {
        if(focusedColumn == COLUMN_SUPER && superqueue.length > 2) {
            superqueue.shift();
            let superId = superqueue[0];
            loadSubs({item:loadItem(superqueue[1])},COLUMN_SUPER);
            superhovered = findElById(superId, COLUMN_SUPER);
        }
        hoverInputEl(superhovered);
    }

    let moves = document.getElementById("moves");
    let lastx, lasty, startx, starty;

    firstcolumn.addEventListener("touchstart", function(e){
        let touchobj = e.changedTouches[0]; // erster Finger
        startx = parseInt(touchobj.clientX);
        starty = parseInt(touchobj.clientY);
        lastx = startx;
        lasty = starty;
        // moves.innerHTML = "touchstart bei ClientX: " + startx + "px ClientY: " + starty + "px";
     });

     firstcolumn.addEventListener("touchmove", function(e){
        let touchobj = e.changedTouches[0]; // erster Finger
        let clientx = parseInt(touchobj.clientX);
        let clienty = parseInt(touchobj.clientY);
        let distx = clientx - lastx;
        let disty = clienty - lasty;
        lastx = clientx;
        lasty = clienty;
        // moves.innerHTML = "touchmove horizontal: " + distx + "px vertikal: " + disty + "px";  
        e.preventDefault();
        controlDY(disty);
     });

    window.addEventListener('wheel', (e) => {
        sumWheelY += e.deltaY;
        if(sumWheelY < -2.5) {
            controlUp();
            sumWheelY = 0;
        } else if (sumWheelY > 2.5) {
            controlDown();
            sumWheelY = 0;
        }
        let middleChild = [...firstinputs.childNodes].find((el) => isElementInMiddle(el));          
        if(middleChild)
            console.log( middleChild.value );
    });

    // document.getElementById("arl").onclick = controlLeft;
    // document.getElementById("arr").onclick = controlRight;
    
    function isElementInMiddle(el) {
        let diff = el.getBoundingClientRect().bottom - window.innerHeight/2;
        return (diff > 0 && diff < 38)
    }

    function createInput(inputId) {
        // create HTML Element
        if(document.getElementById(focusedColumn).lastChild
            && !document.getElementById(focusedColumn).lastChild.value)
            return document.getElementById(focusedColumn).lastChild;
        let inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.placeholder = "add";
        document.getElementById(focusedColumn).appendChild(inputEl);
        inputEl.addEventListener("click", (e) => {
            hoverInputEl(inputEl);
            inputEl.focus();
        });

        // load/create id, item
        let isNew = false;
        if(!inputId) {
            inputId = randomID();
            isNew   = true;
        } 
        inputEl.localID = inputId;
        inputEl.item  = loadItem(inputId);
        inputEl.value = inputEl.item.value;
        
        // save parents
        if(isNew) {
            // add new item without parents to start
            if( inputItem.parents.length == 0 ) {
                startEl.item.children.push(inputEl.localID);
                saveStart();
            }
            
            if ( focusedColumn == COLUMN_SUB) {
                superhovered.item.children.push(inputEl.localID);
                saveElement(superhovered);
            }
        }
        return inputEl;
    }
    
    function loadStart() {
        let startitem = JSON.parse(localStorage.getItem(START_ID));
        if(!startitem) {
            hoverInputEl(createInput());
            saveStart();
        } else {
            startEl.item = startitem;
            startitem.children.forEach(id => {
                let el = createInput(id);
                checkForChildren(el);
            });
            hoverInputEl(document.getElementById(COLUMN_SUPER).firstChild);
        }
    }

    function saveStart() {
        localStorage.setItem(START_ID, JSON.stringify(startEl.item));
    }

    function loadItem(inputId) {
        let inputItemStr = localStorage.getItem(inputId);
        if(!inputItemStr) {            
            inputItem = {value:"", parents:[], children:[]};
            if(focusedColumn == COLUMN_SUB)
                inputItem.parents.push(superhovered.localID);
            localStorage.setItem(inputId,JSON.stringify(inputItem));
        } else {
            inputItem = JSON.parse(inputItemStr);
        }
        return inputItem;
    }

    function saveElement(inputEl) {
        inputEl.item.value = inputEl.value;
        if(!inputEl.value && inputEl.parentNode && inputEl != inputEl.parentNode.lastChild) {
            console.log("remove "+inputEl.localID);
            removeElement(inputEl);
            return;
        }
        localStorage.setItem(inputEl.localID, JSON.stringify(inputEl.item));
        checkForChildren(superhovered);
    }

    function removeElement(inputEl) {
        localStorage.removeItem(inputEl.localID);
        
        // filter start ids
        startEl.item.children = startEl.item.children.filter((id) => id != inputEl.localID);
        saveStart();
        
        // filter parent ids
        superhovered.item.children = superhovered.item.children.filter((id) => id != inputEl.localID);
        saveElement(superhovered);

        document.getElementById(focusedColumn).removeChild(inputEl);
    }

    function checkForChildren(inputEl) {
        if(inputEl.item.children.length > 1 ||
            (inputEl.item.children.length == 1
                && loadItem(inputEl.item.children[0]).value))
            inputEl.classList.add("hasChildren");            
        else
            inputEl.classList.remove("hasChildren");
    }

    function findElById(id, column) {
        if(id == START_ID) return startEl;
        return [...document.getElementById(column).childNodes].find((el) => el.localID == id);
    }

    function loadSubs(superInputEl, column = COLUMN_SUB) {
        document.getElementById(column).innerHTML = "";
        let tmp       = focusedColumn;
        focusedColumn = column;
        if(superInputEl.item.children.length == 0) {
            createInput();
        } else {
            superInputEl.item.children.forEach( subId => {
                let el = createInput(subId);
                checkForChildren(el);
            });
        }
        focusedColumn = tmp;
    }
    
    function randomID() {
        return '_' + Math.random().toString(36).substr(2);
    }

    function hoverInputEl(el) {
        focusedColumn = el.parentNode.id;
        dehoverInput(hovered);
        hovered = el;
        el.classList.add("hov");
        
        // load subs
        if(focusedColumn == COLUMN_SUPER) {
            superhovered = hovered;
            if(superqueue.length == 1)
                superqueue.unshift(el.localID);
            else
                superqueue[0] = el.localID;
            loadSubs(el);
        }
    }
    
    function dehoverInput(el) {
        if(Object.entries(el).length === 0 && el.constructor === Object) return;
        saveElement(el);
        el.blur();
        el.classList.remove("hov");
    }

    function isFocusOnHovered() {
        return document.activeElement === hovered;
    }

})();