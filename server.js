
/**
 * Module dependencies.
 */

var API_VERSION = "v1";


var express = require('express')
  , routes = require('./routes')

var app = express();
var favicon = require('serve-favicon');

app.use(favicon(__dirname + '/public/img/gas_station.ico'));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


// Routes
app.get('/', routes.index);
app.get('/gasolina95', routes.gasolina95);
app.get('/gasolina98', routes.gasolina98);
app.get('/diesel', routes.diesel);
app.get('/heatmap', routes.heatmap);


// bind the app to listen for connections on a specified port
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ipaddr = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

// START THE SERVER
app.listen(port, ipaddr);

console.log("Node app is running at " + ipaddr + ":" + port );
