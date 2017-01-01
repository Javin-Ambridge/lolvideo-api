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
	var refreshCache = new CronJob({
	  cronTime: '1 */15 * * * *',
	  onTick: function() {
	    console.log('Refresh CACHE');
	    Video.emptyCache();
	  },
	  runOnInit: true,
	  start: false
	});
	job.start();
	refreshCache.start();
};
