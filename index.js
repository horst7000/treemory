const express = require("express");
const app = express();
const Datastore = require('nedb');

app.listen(3000, () => console.log("listening on Port 3000"));
app.use(express.static("public"));  
app.use(express.json()); // for parsing application/json

// configure pug
app.set('views', './templates');
app.set('view engine', 'pug');

// init database
const dbMaps    = new Datastore("db/maps.db");
dbMaps.loadDatabase();

// routing
app.route('/').get( (req, res) =>  {
        res.render('index');
    }
);
app.route('/:map/').get( (req, res) =>  {
        res.render('index');
    }
);
app.route('/:map/:startid').get( (req, res) =>  {
        res.render('index');
    }
);

app.route('/api/map/:name')
    .get( (req, res) =>  {
        dbMaps.findOne({name: req.params.name}, (err, doc) => {
            if(doc)
                res.send({data : doc.data, name : doc.name});
            else
                res.send({});
        });
    });

app.route('/api/map/')
    .post((req, res) => {
        const data = req.body;
        dbMaps.update({name : data.name}, { $set: { data : data.data } }, {upsert: true}, (err, newDoc) => {
            res.send({id: newDoc._id, name: newDoc.name});
        });
        // res.json(data[0].value);
    });

app.use(function(req, res, next) {
    res.status(404).redirect('/img/404.png');
});