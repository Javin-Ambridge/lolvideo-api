// app/router.js

 var videos = require('../api/video');
 module.exports = function(router) {
  router.route('/videos').post(function(req, res) {
   console.log(req.body); quotes.addQuote(req,res); 
 	}).get(function(req,res) { 
 		videos.getAllVid(req,res);
 	});
  router.route('/series').post(function(req, res) {
  	videos.rateVideo(req.body, res);
 	}).get(function(req,res) { 
 		videos.getAllVid(req,res);
 	});
 	 router.route('/loadmore').post(function(req, res) {
 	 	console.log('POSTING TO awesome');
 	}).get(function(req,res) {
 		console.log(req.query);
 		switch(req.query.type) {
 			case 'awesome':
 				return videos.getMoreAwesomeVids(req, res, parseInt(req.query.ind));
 			default:
 				console.log('ERROR HERE');
 				break;
 		}
 	});
  router.route('*').get(function(req, res) {
      res.sendfile('./public/index.html'); // load our public/index.html file
  });
};