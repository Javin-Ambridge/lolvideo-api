var CronJob = require('cron').CronJob;
var Video = require('../api/video');

module.exports.cronJob = function() {
	var refreshCache = new CronJob({
	  cronTime: '1 */15 * * * *',
	  onTick: function() {
	    console.log('Refresh CACHE');
	    Video.emptyCache();
	  },
	  runOnInit: true,
	  start: false
	});
	refreshCache.start();
};
