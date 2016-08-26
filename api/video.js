// api/quote.js

var Video = require('../models/video');
var http = require('http');
var Async = require('async');
var YouTube = require('youtube-node');
var Playlists = require('../config/playlists');
var youTube = new YouTube();
youTube.setKey('AIzaSyC8cU2wC_I1MxQ70AJF7o65hCSzCifyOtE');

var consoleTag = '[VIDEO]: ';

module.exports.getAllVid = function (req, res) {
    Video
        .find()
        .sort('+awesomeN')
        .limit(3)
        .exec(function(err, results) {
            Video
                .find()
                .sort('+boringN')
                .limit(3)
                .exec(function(err1, results1) {
                    Video
                        .find()
                        .sort('+funstompN')
                        .limit(3)
                        .exec(function(err2, results2) {
                            res.json({
                                awesome: results,
                                boring: results1,
                                funstomp: results2
                            });
                        });
                });
        });
}

module.exports.removeAll = function() {
    Video.find().remove().exec();
}

function recurseNextPages(pt, playlistID, plid, cvl, callback) {
    var pageTokens = [{
        id: pt
    }];
    var nextPage = null;
    Async.eachOfSeries(pageTokens, function (pageT, ind, cb) {
        youTube.addParam('pageToken', pageT.id);
        youTube.getPlayListsItemsById(playlistID, function (error, result) {
            if (error) {
                console.log(consoleTag + "ERROR1: " + error);
            } else {
                for (var i = 0; i < result.items.length; i++) {
                    var found = false;
                    for(var k = 0; k < cvl.length; k++) {
                        if (cvl[k].id == result.items[i].snippet.resourceId.videoId) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        console.log(consoleTag + "NEED TO ADD A NEW ONE!");
                        var video = new Video({
                            id: result.items[i].snippet.resourceId.videoId,
                            name: result.items[i].snippet.title,
                            info: plid.name,
                            year: plid.year,
                            awesomeN: 0,
                            boringN: 0,
                            funstompN: 0,
                            region: plid.region
                        });
                        video.save(function(err) {
                            if (err) {
                                console.log(consoleTag + "ERROR2" + err);
                            }
                            console.log(consoleTag + "SUCCESSFULLY SAVED: " + video);
                        });
                    }
                }
                if (!!result.nextPageToken) {
                    nextPage = result.nextPageToken;
                }
                cb();
            }
        });
    }, function (err) {
        if (nextPage == null) {
            callback();
        } else {
            recurseNextPages(nextPage, playlistID, plid, cvl, callback);
        }
    });
}

function startSeries(cvl) {
    youTube.addParam('maxResults', '50');
    youTube.addParam('pageToken', null);
    Async.eachOfSeries(Playlists.playlistIds, function (plid, ind, cb) {
        youTube.addParam('pageToken', null);
        youTube.getPlayListsItemsById(plid.id, function (error, result) {
          if (error) {
            console.log(consoleTag + "ERROR: " + error);
          }
          else {
            for(var i = 0; i < result.items.length; i++) {
                var found = false;
                for(var k = 0; k < cvl.length; k++) {
                    if (cvl[k].id == result.items[i].snippet.resourceId.videoId) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.log(consoleTag + "NEED TO ADD A NEW ONE!");
                    var video = new Video({
                        id: result.items[i].snippet.resourceId.videoId,
                        name: result.items[i].snippet.title,
                        info: plid.name,
                        year: plid.year,
                        awesomeN: 0,
                        boringN: 0,
                        funstompN: 0,
                        region: plid.region
                    });
                    video.save(function(err) {
                        if (err) {
                            console.log(consoleTag + "ERROR2" + err);
                        }
                        console.log(consoleTag + "SUCCESSFULLY SAVED: " + video);
                    });
                }
            }
            if (!!!result.nextPageToken) {
                cb();
            } else {
                recurseNextPages(result.nextPageToken, plid.id, plid, cvl, cb);
            }
          }
        });
    }, function(err) {
        console.log(consoleTag + "DONE VIDEO REFRESH");
    });
}

module.exports.refreshVideos = function() {
    Video.find({}, 'id', function(err, videos) {
        if (err) {
            console.log(consoleTag + "ERROR3: " + err);
        }
        startSeries(videos);
    });
};