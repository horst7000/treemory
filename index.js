const express = require("express");
const app = express();

app.listen(3000, () => console.log("listening on Port 3000"));
app.use(express.static("public"));  
app.use(express.json()); // for parsing application/json

// configure pug
app.set('views', './templates');
app.set('view engine', 'pug');

// routing
app.route('/').get( (req, res) =>  {
        res.render('index');
    }
);