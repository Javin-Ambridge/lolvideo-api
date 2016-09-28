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