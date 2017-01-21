var CronJob = require('cron').CronJob;
var Video = require('../api/video');
var https = require('https');

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
	var pingUpdater = new CronJob({
		cronTime: '1 */15 7-23 * * *',
		onTick: function() {
			console.log('Pinging Updater');
			var options = {
			  host: 'lolvideo-ghetto-worker.herokuapp.com',
			  port: 443,
			  method: 'GET'
			};
			var getReq = https.request(options, function(res) {});
			getReq.end();
		},
		runOnInit: true,
		start: false
	});
	pingUpdater.start();
	refreshCache.start();
};
