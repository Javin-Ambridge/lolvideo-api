// server.js

// modules =================================================
var express        = require('express');  
var app            = express();  
var bodyParser     = require('body-parser');
var cron           = require('./cron/scheduler.js');
var firebase       = require("firebase");

// set our port
var port = process.env.PORT || 3000;

// set the static files location for our Ember application
app.use(express.static(__dirname + '/public'));

//bodyParser Middleware to allow different encoding requests
app.use(bodyParser.urlencoded({ extended: true }));  
app.use(bodyParser.json());       // to support JSON-encoded bodies

app.use(function(req, res, next) {

	var allowedOrigins = ['https://pro-league-videos.herokuapp.com', 'http://pro-league-videos.herokuapp.com', 'http://localhost:4200'];
	var origin = req.headers.origin;

	console.log('ORIGIN: ' + origin + ', index: ' + allowedOrigins.indexOf(origin));
	if (allowedOrigins.indexOf(origin) > -1) {
    	// Website you wish to allow to connect
    	res.setHeader('Access-Control-Allow-Origin', origin);

	}
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//
firebase.initializeApp({
  serviceAccount: "./config/lolvideo-7c00d5772a07.json",
  databaseURL: "https://lolvideo-d12f0.firebaseio.com"
});

//Routes API
var router = express.Router();  
app.use('/', router);  
require('./app/routes')(router); // configure our routes

// startup our app at http://localhost:3000
app.listen(port);
cron.cronJob();

// expose app
exports = module.exports = app;