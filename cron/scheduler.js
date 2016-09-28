var CronJob = require('cron').CronJob;
var Video = require('../api/video');

module.exports.cronJob = function() {
	var job = new CronJob({
	  cronTime: '1 59 * * * *',
	  onTick: function() {
	    console.log('GRAB DATA');
	    Video.refreshVideos();
	  },
	  runOnInit: true,
	  start: false
	});
	job.start();
};
