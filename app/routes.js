// app/router.js

 var videos = require('../api/video');
 module.exports = function(router) {
  router.route('/videos').post(function(req, res) {
   console.log(req.body); quotes.addQuote(req,res); 
 	}).get(function(req,res) { 
 		if (req.query.view == 'dashboard') {
 			videos.getAllVid(req,res);
 		}
 	});
  router.route('*').get(function(req, res) {
      res.sendfile('./public/index.html'); // load our public/index.html file

  });
};