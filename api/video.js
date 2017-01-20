// api/quote.js
var http = require('http');
var Async = require('async');
var firebase = require("firebase");

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

module.exports.emptyCache = function() {
    emptyGhettoCache();
};

function emptyGhettoCache() {
    awesomeSaved = null;
    funstompSaved = null;
    newestSaved = null;
}

module.exports.getSpecific = function (req, res, type) {
    var sortT;

    switch(type) {
        case 'awesome':
            if (awesomeSaved && awesomeSaved.length >= 12) {
                awesomeSaved.sort(function(a, b) {
                    return parseInt(b.awesomeN) - parseInt(a.awesomeN);
                });
                return res.json({
                    vids: awesomeSaved.slice(0, 12)
                });
            }
            sortT = 'awesomeN';
            break;
        case 'fun':
            if (funstompSaved && funstompSaved.length >= 12) {
                funstompSaved.sort(function(a, b) {
                    return parseInt(b.funstompN) - parseInt(a.funstompN);
                });  
                return res.json({
                    vids: funstompSaved.slice(0, 12)
                });
            }
            sortT = 'funstompN';
            break;
        case 'new':
            if (newestSaved && newestSaved.length >= 12) {
                newestSaved.sort(function(a, b) {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                return res.json({
                    vids: newestSaved.slice(0, 12)
                });
            }
            sortT = 'created_at';
            break;
        default:
            return res.json({
                error: 'Inproper type passed: ' + type
            });

    }

    var db = firebase.database();
    var ref = db.ref("/videos");
    ref.orderByChild(sortT).limitToLast(12).once("value", function(vids) {
        var dataVids = [];

        for(var a in vids.val()) {
            dataVids.push({
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
        
        switch(type) {
            case 'awesome':
                dataVids.sort(function(a, b) {
                    return parseInt(b.awesomeN) - parseInt(a.awesomeN);
                });
                awesomeSaved = dataVids;
                break;
            case 'fun':
                dataVids.sort(function(a, b) {
                    return parseInt(b.funstompN) - parseInt(a.funstompN);
                });
                funstompSaved = dataVids;
                break;
            case 'new':
                dataVids.sort(function(a, b) {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                newestSaved = dataVids;
                break;
            default:
                return res.json({
                    error: 'Inproper type passed: ' + type
                });
        }

        return res.json({
            vids: dataVids
        });
    });
};

module.exports.getAllVid = function (req, res) {
    if (awesomeSaved && funstompSaved && newestSaved) {
        if (awesomeSaved.length >= 4 && funstompSaved.length >= 3 && newestSaved.length >= 3) {
            console.log('Using saved');
            awesomeSaved.sort(function(a, b) {
                return parseInt(b.awesomeN) - parseInt(a.awesomeN);
            });
            funstompSaved.sort(function(a, b) {
                return parseInt(b.funstompN) - parseInt(a.funstompN);
            });  
            newestSaved.sort(function(a, b) {
                return new Date(b.created_at) - new Date(a.created_at);
            });
            return res.json({
                awesome: awesomeSaved.slice(0, 4),
                funstomp: funstompSaved.slice(0, 3),
                newest: newestSaved.slice(0, 3)
            });
        }
    }
    var db = firebase.database();
    var ref = db.ref("/videos");
    ref.orderByChild("awesomeN").limitToLast(4).once("value", function(vids) {
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

        ref.orderByChild("funstompN").limitToLast(3).once("value", function(vids1) {
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
            ref.orderByChild("created_at").limitToLast(3).once("value", function(vids2) {
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
                awesomeSaved.sort(function(a, b) {
                    return parseInt(b.awesomeN) - parseInt(a.awesomeN);
                });
                funstompSaved.sort(function(a, b) {
                    return parseInt(b.funstompN) - parseInt(a.funstompN);
                });
                newestSaved.sort(function(a, b) {
                    return new Date(b.created_at) - new Date(a.created_at);
                });

                return res.json({
                    awesome: awesomeVids,
                    funstomp: funstompVids,
                    newest: newestVids
                });
            });
        });
    });
};

function isFound(type, vids, a) {
    switch(type) {
        case 'awesome':
            if (!awesomeSaved) {
                return false;
            }

            for(var i = 0; i < awesomeSaved.length; i++) {
                if (awesomeSaved[i].id == vids.val()[a].id) {
                    return true;
                }
            }
            break;
        case 'fiesta':
            if (!funstompSaved) {
                return false;
            }

            for(var i = 0; i < funstompSaved.length; i++) {
                if (funstompSaved[i].id == vids.val()[a].id) {
                    return true;
                }
            }
            break;
        case 'newest':
            if (!newestSaved) {
                return false;
            }

            for(var i = 0; i < newestSaved.length; i++) {
                if (newestSaved[i].id == vids.val()[a].id) {
                    return true;
                }
            }
            break;
    }
    return false;
}

module.exports.getMoreVids = function (req, res, ind, type) {
    var orderBy;
    var limitToLast;
    var awesomeReadjust = false;
    var fiestaReadjust = false;
    var newReadjust = false;
    switch (type) {
        case 'awesome':
            var extraOne = 1;
            if (!awesomeSaved || !(awesomeSaved.length >= ind + 4)) {
                orderBy = 'awesomeN';
                if (req.query.specific) {
                    extraOne = 0;
                }
                limitToLast = ind + 3 + extraOne; //Current + big vid

                if (!awesomeSaved) {
                    awesomeReadjust = true;
                }
                break;
            } else {
                return res.json({
                    additions: awesomeSaved.slice(ind + 1, ind + 3 + extraOne)
                });
            }
        case 'fiesta':
            if (!funstompSaved || !(funstompSaved.length >= ind + 3)) {
                orderBy = 'funstompN';
                limitToLast = ind + 3; //Current

                if (!funstompSaved) {
                    fiestaReadjust = true;
                }
                break;
            } else {
                return res.json({
                    additions: funstompSaved.slice(ind, ind + 3)
                });
            }
        case 'newest':
            if (!newestSaved || !(newestSaved.length >= ind + 3)) {
                orderBy = 'created_at';
                limitToLast = ind + 3;

                if (!newestSaved) {
                    newReadjust = true;
                }
                break;
            } else {
                return res.json({
                    additions: newestSaved.slice(ind, ind + 3)
                });
            }
    }

    var db = firebase.database();
    var ref = db.ref("/videos");

    ref.orderByChild(orderBy).limitToLast(limitToLast).once("value", function(vids) {
        var vidsNew = [];

        for(var a in vids.val()) {
            if (!isFound(type, vids, a)) {
                var model = {
                    key: a,
                    id: vids.val()[a].id,
                    name: vids.val()[a].name,
                    info: vids.val()[a].info,
                    year: vids.val()[a].year,
                    awesomeN: vids.val()[a].awesomeN,
                    funstompN: vids.val()[a].funstompN,
                    region: vids.val()[a].region,
                    created_at: new Date(vids.val()[a].created_at)
                };
                vidsNew.push(model);
                switch (type) {
                    case 'awesome':
                        if (!awesomeSaved) {
                            awesomeSaved = [];
                        }

                        awesomeSaved.push(model);
                        break;
                    case 'fiesta':
                        if (!funstompSaved) {
                            funstompSaved = [];
                        }

                        funstompSaved.push(model);
                        break;
                    case 'newest':
                        if (!newestSaved) {
                            newestSaved = [];
                        }

                        newestSaved.push(model);
                        break;
                }
                console.log('pushing model: ', model);
            }
        }
        if (awesomeReadjust) {
            vidsNew = awesomeSaved.slice(awesomeSaved.length - 3);
        }
        if (fiestaReadjust) {
            vidsNew = funstompSaved.slice(funstompSaved.length - 3);
        }
        if (newReadjust) {
            vidsNew = newestSaved.slice(newestSaved.length - 3);
        }

        if (awesomeSaved) {
            awesomeSaved.sort(function(a, b) {
                return b.awesomeN > a.awesomeN;
            });
        }
        if (funstompSaved) {
            funstompSaved.sort(function(a, b) {
                return b.funstompN > a.funstompN;
            });
        }
        if (newestSaved) {  
            newestSaved.sort(function(a, b) {
                return new Date(b.created_at) - new Date(a.created_at);
            });
        }

        return res.json({
            additions: vidsNew
        });
    });
};


module.exports.rateVideo = function(data, res) {
    var db = firebase.database();
    var voteType;
    var negative = false;

    switch (data.type) {
        case 'boring':
            negative = true;
        case 'awesome':
            voteType = '/awesomeN';
            break;
        case 'fun':
            voteType = '/funstompN';
            break;
        default:
            console.log('incorrect type: ' + data.type + ' -exiting');
            return;
    }

    var videosRef = db.ref('/videos/' + data.key + voteType);
    videosRef.transaction(function (current_value) {
        var updated;
        if (negative) {
            updated = (current_value || 0) - 1;
        } else {
            updated = (current_value || 0) + 1;
        }
        return updated;
    }).then(function() {
        emptyGhettoCache();
        res.json({
            success: true
        });
    });
};
