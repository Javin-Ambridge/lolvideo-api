var CronJob = require('cron').CronJob;
var Video = require('../api/video');
var ping = require('ping');

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
			var host = 'https://lolvideo-ghetto-worker.herokuapp.com/';
			ping.sys.probe(host, function(isAlive) {
		        var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
		        console.log(msg);
			});
		},
		runOnInit: true,
		start: false
	});
	pingUpdater.start();
	refreshCache.start();
};
