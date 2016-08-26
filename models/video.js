// models/quote.js

var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    id: String,
    name: String,
    info: String,
    year: Number,
    awesomeN: Number,
    boringN: Number,
    funstompN: Number,
    region: String
});


module.exports = mongoose.model('Video', VideoSchema);