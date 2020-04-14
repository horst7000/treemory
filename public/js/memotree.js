import Nav from "./treemory-nav.js"

let nav = new Nav(document.body);

// let d1 = {
//     id: "x1",
//     value: "edt x1",
//     childrenIds: ["w1"],
//     parentIds: []
// }
// let d2 = {
//     id: "x2",
//     value: "edt x2",
//     childrenIds: [],
//     parentIds: []
// }
// let d3 = {
//     id: "w1",
//     value: "edt w1",
//     childrenIds: ["v1"],
//     parentIds: ["x1"]
// }
// let d4 = {
//     id: "v1",
//     value: "edt v1",
//     childrenIds: ["u1"],
//     parentIds: ["w1"]
// }
// let d5 = {
//     id: "u1",
//     value: "edt u1",
//     childrenIds: ["t1"],
//     parentIds: ["v1"]
// }
// nav.import([d1,d2,d3,d4,d5,d6],d1);

let nested = [{
    value: "Bäume",
    children: [
        {value: "Pappel"},
        {value: "Fichte"}
    ]
},
{
    value: "Einkaufsliste",
    children: [
        {value: "Brot"},
        {value: "\\(2^3\\) Tomaten"}
    ]
}];

let shortname = "";

(async function getMapByUrl() {
    const urlpathname = window.location.pathname;
    const paths = urlpathname.split("/");  // paths = ["", "map", "startid", ""]
    
    // TODO dialogue: forward to last map?

    console.log(paths);
    let mapdata = await fetchGetMap(paths[1]);

    if(paths[1] && !mapdata || paths[1] && !mapdata.data)
        window.location.replace("/");
    
    nav.import( mapdata && mapdata.data ? mapdata.data : nested );

    if(paths[1]) {
        localStorage.setItem("save-map", paths[1]);
        shortname = paths[1];
    } else {
        shortname = nav.whereAmI().id.substr(1,3);
    }
    document.getElementById("dialogue-save-pre-id").innerHTML = "mathekarte.de/"+shortname;
    
})();

function openSaveFormOrSave() {
    if(shortname.length == 3)
        document.getElementById("dialogue-save").classList.toggle("hidden");
    else
        save();
    animateBtn(document.getElementById("btn-save"));
}

window.saveForm = function() {
    document.getElementById("dialogue-save").classList.toggle("hidden");
    save();
}

function save() {
    if(shortname.length == 3)
        shortname += document.getElementById("dialogue-save-inp-name").value;
    if(shortname.length != 7) return;

    for(let math of MathJax.startup.document.math) {
        math.typesetRoot.replaceWith(math.start.delim + math.math + math.end.delim);
    }
    MathJax.startup.document.clear();

    localStorage.setItem("default-tree", JSON.stringify(nav.export()));
    console.log("saving...:");
    console.log(nav.export());

    fetchPostExport();
    // history.pushState({}, nav.whereAmI().value, nav.whereAmI().id);
}

function animateBtn(btn) {
    btn.style.transform = "rotateY(0.2turn)";
    setTimeout(() => btn.style.transform = "", 100);
}


/**
 * 
 * 
 *           eventlisteners
 * 
 */


window.onpopstate = (e) => {
    nav.import(nested);
}

window.addEventListener('keydown', (e) => {
    if (e.keyCode == 83 && e.ctrlKey) { // ctrl+s
        e.preventDefault();
        openSaveFormOrSave();
    }
});

let mathfields = [];
document.getElementById("mathmode").addEventListener("click", (e) => {
    let activefield = nav.whereAmI();
    if(mathfields.indexOf(activefield) == -1) {
        mathfields.push(activefield);
        MathJax.typeset();
    }
    else {
        mathfields = mathfields.filter((f) => f != activefield);
        for(let math of MathJax.startup.document.math) {
            if(math.typesetRoot.parentNode == activefield.HTMLElement)
                math.typesetRoot.replaceWith(math.start.delim + math.math + math.end.delim);
        }
        // MathJax.startup.document.clear();
        // TODO MathJax.startup.document.math = filter(m => m != math)
    }
    animateBtn(e.target);
});

document.getElementById("btn-save").addEventListener("click", (e) => {
    openSaveFormOrSave();
});

document.getElementById("dialogue-save-btn-close").addEventListener("click", (e) => {
    document.getElementById("dialogue-save").classList.toggle("hidden");
});
document.getElementById("dialogue-save-btn-cancel").addEventListener("click", (e) => {
    document.getElementById("dialogue-save").classList.toggle("hidden");    
});


/**
 * 
 * 
 *           fetch
 * 
 */

function fetchPostExport() {
    const options = { //for fetch
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({   
        data : nav.export(),
        name : shortname
      })
    }
    fetch('/api/map/', options) // POST
        .then((res) => (res.json()))
        .then((json) => {
            console.log(json);
            const paths = window.location.pathname.split("/");
            // console.log(paths[1]);
            // console.log(paths[1] != encodeURI(json));
            if(paths.length >= 2 && paths[1] != shortname)
                window.location.replace(shortname+"/");
        });
}

function fetchGetMap(name) {
    if(!name || name == "") return;
    return new Promise((resolve) => {
        fetch('/api/map/' + name)
            .then((res) => resolve(res.json()));
    });
}