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
        {value: "Brot"}
    ]
}];

nav.import(
    JSON.parse(localStorage.getItem("default-tree")) || nested
);


window.addEventListener('keydown', (e) => {
    if (e.keyCode == 83 && e.ctrlKey) { // ctrl+s
        e.preventDefault();
        console.log(nav.export());
        localStorage.setItem("default-tree", JSON.stringify(nav.export()));
    }
});
