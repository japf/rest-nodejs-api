var express = require('express');
var app = express();
    
app.use(express.bodyParser());

// enable cross access origin
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// initial data
// this is also our in-memory "database", of course in the real world this could be 
// a real database :-)
var cellars = [ 
        { id: 0, name: "Jeremy's cellar", bottles: 
            [ { id: 0, name: "Jurançon", price: 12.89 } ] 
        } 
    ];

// get a cellar from its id
function getCellar(id) {
    id = parseInt(id);
    for (var i = 0; i < cellars.length; i++) {
        if (cellars[i].id === id)
            return cellars[i];
    }

    return undefined;
}

// add a new cellar and returns the newly created object
function createCellar(name) {
    var cellar = { id: cellars.length, name: name, bottles:[] };
    cellars.push(cellar);

    return cellar;
}

// get the index of a bottle in a cellar from its id
function getBottleIndex(cellar, id) {
    id = parseInt(id);
    for (var i = 0; i < cellar.bottles.length; i++) {
        if (cellar.bottles[i].id === id)
            return i;
    }

    return -1;
}

function getBottleCount() {
    var count = 0;
    for (var i = 0; i < cellars.length; i++)
        count += cellars[i].bottles.length;

    return count;
}

function findBottle(id) {
    var bottle = undefined;
    id = parseInt(id);
    for (var i = 0; i < cellars.length; i++) {
        for (var j = 0; j < cellars[i].bottles.length; j++) {
            if (cellars[i].bottles[j].id === id) {
                return {
                    cellar: cellars[i],
                    bottleIndex: j
                };
            }
        }
    }
}

// send a 500 error code to a given response
function invalidRequest(res) {
    res.status(500);
    res.type('txt').send('Invalid request');
}

// GET /api/cellar
// Get the list of existings cellars
app.get('/api/cellar', function(req, res) {
    var result = [];
    for (var i = 0; i < cellars.length; i++)
        result[i] = { id: cellars[i].id, name: cellars[i].name };

    res.json(result);
});

// GET /api/cellar/:id
//  Get the detail of an existing cellar id
app.get('/api/cellar/:id', function(req, res) {
    var cellar = getCellar(req.params.id);
    if (cellar) {     
        res.json(cellar);
    }
    else {
        res.status(404);
        res.type('txt').send('404 not found');
    }
});

// POST /api/cellar
//  Create a new cellar
//  Parameter: { name: 'name' }
app.post('/api/cellar', function(req, res) {
    if (req.body && req.body.name) {
        res.json(createCellar(req.body.name));
    } else {
        invalidRequest(res);
    }
});

// POST /api/bottle
//  Add a new bottle to a cellar id
//  Parameter: { cellardId: 0, name: 'name', price: 10 }
app.post('/api/bottle', function(req, res) {
    if (req.body && req.body.cellarId >= 0) {
        var cellar = getCellar(req.body.cellarId);
        if (cellar && req.body.name && req.body.price) {
            var bottleCount = getBottleCount();
            var bottle = { id: bottleCount, name: req.body.name, price: req.body.price };
            cellar.bottles.push(bottle);
            res.json(bottle);
            return;
        }
    }

    invalidRequest(res);
});

// DELETE /api/bottle/:id
//  Remove a bottle
app.delete('/api/bottle/:id', function(req, res) {
    if (req.body && req.params.id) {
        var result = findBottle(req.params.id);
        if (result) {
            var cellar = result.cellar;
            cellar.bottles.splice(result.bottleIndex, 1);
            res.json(cellar);
            return;
        }
    }

    invalidRequest(res);
});

port = process.env.port || 3000;
app.listen(port);
console.log('Listening on port ' + port);