// api/quote.js
var http = require('http');
var Async = require('async');
var firebase = require("firebase");
var YouTube = require('youtube-node');
var Playlists = require('../config/playlists');
var youTube = new YouTube();
youTube.setKey('AIzaSyC8cU2wC_I1MxQ70AJF7o65hCSzCifyOtE');

var consoleTag = '[VIDEO]: ';
var locked = false;

function videoModel(ID, NAME, INFO, YEAR, AWESOMEN, FUNSTOMPN, REGION, DATE){
    return {
        id: ID,
        name: NAME,
        info: INFO,
        year: YEAR,
        awesomeN: AWESOMEN,
        funstompN: FUNSTOMPN,
        region: REGION,
        created_at: DATE
    };
}                           

module.exports.getAllVid = function (req, res) {
    var db = firebase.database();
    var ref = db.ref("/videos");
    ref.orderByChild("awesomeN").limitToLast(3).on("value", function(vids) {
        console.log(vids.val());
        res.json({
            awesome: vids.val()
        });
    });
}

module.exports.getBigVid = function (req, res) {

}

module.exports.removeAll = function() {

}

function recurseNextPages(pt, playlistID, plid, cvl, callback) {
    var pageTokens = [{
        id: pt
    }];
    var nextPage = null;

    var videos = firebase.database().ref('/videos');

    locked = true;
    Async.eachOfSeries(pageTokens, function (pageT, ind, cb) {

        youTube.addParam('pageToken', pageT.id);
        youTube.getPlayListsItemsById(playlistID, function (error, result) {
            if (error) {
                console.log(consoleTag + "ERROR1: " + error);
            } else {
                Async.eachOfSeries(result.items, function (item, ind2, cb2) {
                    var found = false;
                    for(var a in cvl.val()) {
                        if (cvl.val()[a].id == item.snippet.resourceId.videoId) {
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        console.log('found');
                        i++;
                        cb2();
                    } else {
                        console.log('not found');
                        videos.push(videoModel(
                            item.snippet.resourceId.videoId, 
                            item.snippet.title,
                            plid.name,
                            plid.year,
                            0,
                            0,
                            plid.region,
                            new Date(item.snippet.publishedAt).getTime()
                        ), function(done) {
                            i++;
                            cb2();
                        });
                    }
                }, function(err) {
                    if (result.nextPageToken) {
                        nextPage = result.nextPageToken;
                    }
                    cb();
                });
            }
        });
    }, function(err) {
        if (err) {
            console.log(err);
        }
        if (nextPage) {
            console.log("Found another page also: " + nextPage);
            recurseNextPages(nextPage, playlistID, plid, cvl, callback);
        } else {
            locked = false;
            callback();
        }
    });
}

function startSeries(cvl) {
    if (locked) {
        return;
    }
    //Connecting to firebase
    var videos = firebase.database().ref('/videos');

    locked = true; //Locking for firebase push issue
    Async.eachOfSeries(Playlists.playlistIds, function (plid, ind, cb) {
        if (plid.done) {
            cb();
        } else {
            console.log(plid.name + '-' + plid.region);
            
            youTube.addParam('maxResults', '50');
            youTube.addParam('pageToken', null);
            youTube.getPlayListsItemsById(plid.id, function (error, result) {
                if (error) {
                    console.log(consoleTag + 'ERROR: ' + error);
                } else {

                    Async.eachOfSeries(result.items, function (item, ind2, cb2) {
                        var found = false;
                        for(var a in cvl.val()) { //Saved already?
                            if (cvl.val()[a].id == item.snippet.resourceId.videoId) {
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            console.log('found');
                            cb2();
                        } else {
                            locked = true;
                            console.log('not found');
                            videos.push(videoModel(
                                item.snippet.resourceId.videoId, 
                                item.snippet.title,
                                plid.name,
                                plid.year,
                                0,
                                0,
                                plid.region,
                                new Date(item.snippet.publishedAt).getTime()
                            ), function(done) {
                                cb2();
                            });
                        }
                    }, function(err) {
                        if (result.nextPageToken) {
                            console.log(result.nextPageToken);
                            recurseNextPages(result.nextPageToken, plid.id, plid, cvl, cb);
                        } else {
                            cb();
                        }
                    });
                }
            });
        }
    }, function(err) {
        console.log(consoleTag + "DONE VIDEO REFRESH");
    });
}

module.exports.refreshVideos = function() {
    var db = firebase.database();
    var ref = db.ref('/videos');
    ref.on("value", function(vids) {
        startSeries(vids);
    });
};