/**
 * Created by Heshan.i on 12/5/2016.
 */

var redis = require('ioredis');
var bluebird = require('bluebird');
var util = require('util');
var config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var eventEmitter = require('events').EventEmitter;
var async = require('async');

//bluebird.promisifyAll(redis.RedisClient.prototype);
//bluebird.promisifyAll(redis.Multi.prototype);

//require("redis-scanrx")(redis);

//--------------------Dashboards Redis Client-------------------------------------
var redisip = config.Redis.ip;
var redisport = config.Redis.port;
var redispass = config.Redis.password;
var redismode = config.Redis.mode;
var redisdb = config.Redis.db;



var redisSetting =  {
    port:redisport,
    host:redisip,
    family: 4,
    password: redispass,
    db: redisdb,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: function (err) {

        return true;
    }
};

if(redismode == 'sentinel'){

    if(config.Redis.sentinels && config.Redis.sentinels.hosts && config.Redis.sentinels.port, config.Redis.sentinels.name){
        var sentinelHosts = config.Redis.sentinels.hosts.split(',');
        if(Array.isArray(sentinelHosts) && sentinelHosts.length > 2){
            var sentinelConnections = [];

            sentinelHosts.forEach(function(item){

                sentinelConnections.push({host: item, port:config.Redis.sentinels.port})

            })

            redisSetting = {
                sentinels:sentinelConnections,
                name: config.Redis.sentinels.name,
                password: redispass,
                db: redisdb
            }

        }else{

            console.log("No enough sentinel servers found .........");
        }

    }
}

var client = undefined;

if(redismode != "cluster") {
    client = new redis(redisSetting);
}else{

    var redisHosts = redisip.split(",");
    if(Array.isArray(redisHosts)){


        redisSetting = [];
        redisHosts.forEach(function(item){
            redisSetting.push({
                host: item,
                port: redisport,
                family: 4,
                password: redispass,
                db: redisdb});
        });

        var client = new redis.Cluster([redisSetting]);

    }else{

        client = new redis(redisSetting);
    }


}

client.on("error", function (err) {
    logger.error('Redis connection error :: %s', err);
});
//
client.on("connect", function (err) {
    //client.select(config.Redis.redisDB, redis.print);

});


//--------------------Ards Redis Client-------------------------------------

var ardsredisip = config.ArdsRedis.ip;
var ardsredisport = config.ArdsRedis.port;
var ardsredispass = config.ArdsRedis.password;
var ardsredismode = config.ArdsRedis.mode;
var ardsredisdb = config.ArdsRedis.db;



var ardsredisSetting =  {
    port:ardsredisport,
    host:ardsredisip,
    family: 4,
    password: ardsredispass,
    db: ardsredisdb,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: function (err) {

        return true;
    }
};

if(ardsredismode == 'sentinel'){

    if(config.ArdsRedis.sentinels && config.ArdsRedis.sentinels.hosts && config.ArdsRedis.sentinels.port, config.ArdsRedis.sentinels.name){
        var sentinelHosts = config.ArdsRedis.sentinels.hosts.split(',');
        if(Array.isArray(sentinelHosts) && sentinelHosts.length > 2){
            var sentinelConnections = [];

            sentinelHosts.forEach(function(item){

                sentinelConnections.push({host: item, port:config.ArdsRedis.sentinels.port})

            })

            ardsredisSetting = {
                sentinels:sentinelConnections,
                name: config.ArdsRedis.sentinels.name,
                password: ardsredispass,
                db: ardsredisdb
            }

        }else{

            console.log("No enough sentinel servers found .........");
        }

    }
}

var ardsClient = undefined;

if(ardsredismode != "cluster") {
    ardsClient = new redis(ardsredisSetting);
}else{

    var redisHosts = redisip.split(",");
    if(Array.isArray(redisHosts)){


        ardsredisSetting = [];
        redisHosts.forEach(function(item){
            ardsredisSetting.push({
                host: item,
                port: ardsredisport,
                family: 4,
                password: ardsredispass,
                db: ardsredisdb});
        });

        var ardsClient = new redis.Cluster([ardsredisSetting]);

    }else{

        ardsClient = new redis(ardsredisSetting);
    }


}


ardsClient.on("error", function (err) {
    logger.error('ARDS Redis connection error :: %s', err);
});

ardsClient.on("connect", function (err) {
    //ardsClient.select(config.ArdsRedis.ardsRedisDB, redis.print);
});



function scanAsync(index, pattern, matchingKeys){
    console.log("-------------------Using scanAsync---------------------");
    /*return client.scanAsync(index, 'MATCH', pattern, 'COUNT', 1000).then(
        function (replies) {
            if(replies.length > 1) {
                var match = matchingKeys.concat(replies[1]);
                if (replies[0] === "0") {
                    return match;
                } else {
                    return scanAsync(replies[0], pattern, match)
                }
            }else{
                return matchingKeys;
            }

        });
        */

    var promiseFunc = new Promise(function (resolve, reject) {
        var stream = client.scanStream({
            match: pattern,
            count: 1000
        });

        stream.on('data', function (resultKeys) {
            for (var i = 0; i < resultKeys.length; i++) {
                matchingKeys.push(resultKeys[i]);
            }
        });
        stream.on('end', function () {
            resolve(matchingKeys);
        });
    });

    return promiseFunc;

}

/*var scanKeys = function(index, pattern, matchingKeys, callback){
    client.scan(index, 'MATCH', pattern, function (err, replies) {
        if (err) {
            logger.error('Redis searchKeys error :: %s', err);
            callback(err, matchingKeys);
        } else {

            if(replies.length > 1) {
                var match = matchingKeys.concat(replies[1]);
                if (replies[0] === "0") {

                    callback(null, match);
                } else {
                    scanKeys(replies[0], pattern, match, function (err, res) {
                        callback(err, res);
                    });
                }
            }else{
                callback(null, matchingKeys);
            }
        }
    });
};*/


var GetHashValues = function (keys, field, callback) {

    var hashFunctions = [];
    keys.forEach(function (key) {
        hashFunctions.push(function (callback) {
            client.hget(key, field, function (err, hValue) {

                if(err){
                    logger.error('Redis hget error :: %s', err);
                }

                callback(undefined, hValue);

                //if(err){
                //    logger.error('Redis hget error :: %s', err);
                //}else{
                //}
                //
                //if (keys.length === count) {
                //    console.log("end", count);
                //}
            });
        });
    });

    async.parallel(hashFunctions, function(err, results) {
        callback(results);
    });
};

var getHashValue = function (key, field) {
    client.hget(key, field, function (err, hValue) {
        if (err) {
            logger.error('Redis getHashValue error :: %s', err);
            callback(err, undefined);
        } else {
            logger.info('Redis getHashValue success :: %s', hValue);
            callback(undefined, hValue);
        }
    });
};

var getObject = function(key, callback){
    client.get(key, function(err, obj){
        if(err){
            logger.error('Redis getObject (get) error :: %s', err);
            callback(err, undefined);
        }else{
            logger.info('Redis getObject (get) success :: %s', obj);
            callback(err, obj);
        }
    });
};

var searchObjects = function(searchPattern, callback){
    var result = [];

    var sPromise = scanAsync(0, searchPattern, []);
    //var sPromise = client.scanrx(searchPattern).toArray().toPromise();
    sPromise.then(function(replies){
        //if (err) {
        //    logger.error('Redis searchKeys error :: %s', err);
        //    callback(err, result);
        //} else {
            logger.info('Redis searchKeys success :: replies:%s', replies.length);
            if (replies && replies.length > 0) {
                client.mget(replies, function(err, objs){
                    if(err){
                        logger.error('Redis searchKeys (mget) error :: %s', err);
                        callback(err, result);
                    }else{
                        logger.info('Redis searchKeys (mget) success :: %s', objs);
                        callback(err, objs);
                    }
                });
            } else {
                callback(null, result);
            }
        //}
    });
};

var searchHashes = function(searchPattern, hashField, callback){
    var result = [];

    var sPromise = scanAsync(0, searchPattern, []);
    //var sPromise = client.scanrx(searchPattern).toArray().toPromise();
    sPromise.then(function(replies){
        //if (err) {
        //    logger.error('Redis searchKeys error :: %s', err);
        //    callback(err, result);
        //} else {
            logger.info('Redis searchKeys success :: replies:%s', replies.length);
            if (replies && replies.length > 0) {
                GetHashValues(replies, hashField, function (hValues) {
                    callback(null, hValues);
                });

                //ghv.on('result', function (hValue) {
                //    result.push(hValue);
                //});
                //
                //ghv.on('end', function () {
                //    callback(null, result);
                //});
            } else {
                callback(null, result);
            }
        //}
    });
};

var searchKeys = function(searchPattern, callback) {
    var result = [];

    var sPromise = scanAsync(0, searchPattern, []);
    //var sPromise = client.scanrx(searchPattern).toArray().toPromise();
    sPromise.then(function(replies){
        //if (err) {
        //    logger.error('Redis searchKeys error :: %s', err);
        //    callback(err, result);
        //} else {
            logger.info('Redis searchKeys success :: replies:%s', replies.length);
            if (replies && replies.length > 0) {
                callback(null, replies);
            } else {
                callback(null, result);
            }
        //}
    });
};

var getHashField = function(key, field, callback){
    ardsClient.hget(key, field, function (err, hValue) {
        if(err){
            logger.error('Redis getHashField error :: %s', err);
            callback(err, undefined);
        }else{
            logger.info('Redis getHashField Success');
            callback(undefined, hValue);
        }
    });
};

var getKeyCounts = function(callback){
    client.dbsize(function (err, replies) {
        if (err) {
            logger.error('Redis getKeyCounts error :: %s', err);
            callback(err, 0);
        } else {
            logger.info('Redis getKeyCounts success :: replies:%d', replies);
            callback(null, replies+1000);
        }
    });
};


module.exports.GetObject = getObject;
module.exports.GetHashValue = getHashValue;
module.exports.SearchObjects = searchObjects;
module.exports.SearchHashes = searchHashes;
module.exports.SearchKeys = searchKeys;
module.exports.GetHashField = getHashField;