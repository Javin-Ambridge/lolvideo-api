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
var awesomeSaved, funstompSaved, newestSaved;

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
    if (awesomeSaved && funstompSaved && newestSaved) {
        console.log('Using saved');
        return res.json({
            awesome: awesomeSaved,
            funstomp: funstompSaved,
            newest: newestSaved
        });
    }
    var db = firebase.database();
    var ref = db.ref("/videos");
    ref.orderByChild("awesomeN").limitToLast(4).on("value", function(vids) {
        var awesomeVids = [];

        for(var a in vids.val()) {
            awesomeVids.push({
                key: a,
                id: vids.val()[a].id,
                name: vids.val()[a].name,
                info: vids.val()[a].info,
                year: vids.val()[a].year,
                awesomeN: vids.val()[a].awesomeN,
                funstompN: vids.val()[a].funstompN,
                region: vids.val()[a].region,
                created_at: new Date(vids.val()[a].created_at)
            });
        }

        ref.orderByChild("funstompN").limitToLast(3).on("value", function(vids1) {
            var funstompVids = [];

            for(var b in vids1.val()) {
                funstompVids.push({
                    key: b,
                    id: vids1.val()[b].id,
                    name: vids1.val()[b].name,
                    info: vids1.val()[b].info,
                    year: vids1.val()[b].year,
                    awesomeN: vids1.val()[b].awesomeN,
                    funstompN: vids1.val()[b].funstompN,
                    region: vids1.val()[b].region,
                    created_at: new Date(vids1.val()[b].created_at)
                });
            }
            ref.orderByChild("created_at").limitToLast(3).on("value", function(vids2) {
                var newestVids = [];

                for(var c in vids2.val()) {
                    newestVids.push({
                        key: c,
                        id: vids2.val()[c].id,
                        name: vids2.val()[c].name,
                        info: vids2.val()[c].info,
                        year: vids2.val()[c].year,
                        awesomeN: vids2.val()[c].awesomeN,
                        funstompN: vids2.val()[c].funstompN,
                        region: vids2.val()[c].region,
                        created_at: new Date(vids2.val()[c].created_at)
                    });
                }
                
                awesomeSaved = awesomeVids;
                funstompSaved = funstompVids;
                newestSaved = newestVids;

                return res.json({
                    awesome: awesomeVids,
                    funstomp: funstompVids,
                    newest: newestVids.reverse()
                });
            });
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