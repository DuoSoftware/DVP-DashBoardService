/**
 * Created by Heshan.i on 12/5/2016.
 */

var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var util = require('util');
var redisHandler = require('../RedisHandler.js');
var moment = require('moment');
var Q = require('q');
var config = require('config');

var UniqueArray = function(array) {
    var processed = [];
    for (var i=array.length-1; i>=0; i--) {
        if (array[i]!= null) {
            if (processed.indexOf(array[i])<0) {
                processed.push(array[i]);
            } else {
                array.splice(i, 1);
            }
        }
    }
    return array;
};


var getQueueName = function(queueId){
    var deferred = Q.defer();

    var queue = queueId.replace(/-/g, ":");
    console.log('QueueId:: '+ queue);
    redisHandler.GetHashField('QueueNameHash', queue, function(err, result){
        if(err){
            deferred.resolve(queueId);
        }else{
            deferred.resolve(result);
        }
    });

    return deferred.promise;
};

var getQueueDetail = function(tenant, company, queueId){
    var deferred = Q.defer();

    var queueDetail = {QueueId: queueId, QueueInfo: {}};

    getQueueName(queueId).then(function(queueName){
        queueDetail.QueueName = queueName;
        return onGetTotalCount(tenant, company, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.TotalQueued = result.value;
        return onGetTotalCount(tenant, company, 'QUEUEANSWERED', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.TotalAnswered = result.value;
        return onGetTotalCount(tenant, company, 'QUEUEDROPPED', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.QueueDropped = result.value;
        return onGetMaxTime(tenant, company, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.MaxWaitTime = result.value;
        return onGetCurrentMaxTime(tenant, company, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.CurrentMaxWaitTime = result.value;
        return onGetCurrentCount(tenant, company, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.CurrentWaiting = result.value;
        return onGetAverageTime(tenant, company, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.AverageWaitTime = result.value;
        deferred.resolve(queueDetail);
    }).catch(function(err){
        console.log('getQueueDetail: Error:: '+err);
        deferred.resolve(queueDetail);
    });

    return deferred.promise;
};

var onGetMaxTime = function(tenant, company, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetMaxTime Internal method ");

    var reply = {};

    var maxTimeSearch = util.format('MAXTIME:%s:%s:%s:%s:%s', tenant, company, window, param1, param2);

    redisHandler.SearchObjects(maxTimeSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetMaxTime: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var tempMaxTime = 0;
                for(var i = 0; i< result.length; i++){
                    var value = parseInt(result[i]);
                    if (tempMaxTime < value) {
                        tempMaxTime = value
                    }
                }

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetMaxTime: Success", true, tempMaxTime);
                reply.value = tempMaxTime;
                deferred.resolve(reply);
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetMaxTime: No Keys Found", false, 0);
                reply.value = 0;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetCurrentMaxTime = function(tenant, company, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetCurrentMaxTime Internal method ");

    var reply = {};

    var currentSessionSearch = util.format('SESSION:%s:%s:%s:*:%s:%s', tenant, company, window, param1, param2);

    redisHandler.SearchHashes(currentSessionSearch, 'time', function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetCurrentMaxTime: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var tempMaxTime = 0;
                var timeNow = moment();
                for(var i = 0; i< result.length; i++){
                    var sessionTime = moment(result[i]);
                    var timeDiff = timeNow.diff(sessionTime, 'seconds');
                    if (tempMaxTime < timeDiff) {
                        tempMaxTime = timeDiff
                    }
                }

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentMaxTime: Success", true, tempMaxTime);
                reply.value = tempMaxTime;
                deferred.resolve(reply);
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentMaxTime: No Keys Found", false, 0);
                reply.value = 0;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetCurrentCount = function(tenant, company, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetCurrentCount Internal method ");

    var reply = {};

    var currentCountSearch = util.format('CONCURRENT:%s:%s:%s:%s:%s', tenant, company, window, param1, param2);

    redisHandler.SearchObjects(currentCountSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetCurrentCount: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var tempTotal = 0;
                for(var i = 0; i< result.length; i++){
                    var value = parseInt(result[i]);
                    tempTotal = tempTotal+ value;
                }

                if (tempTotal < 0) {
                    tempTotal = 0;
                }

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentCount: Success", true, tempTotal);
                reply.value = tempTotal;
                deferred.resolve(reply);
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentCount: No Keys Found", false, 0);
                reply.value = 0;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetTotalCount = function(tenant, company, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetTotalCount Internal method ");

    var reply = {};

    var totalCountSearch = util.format('TOTALCOUNT:%s:%s:%s:%s:%s', tenant, company, window, param1, param2);

    redisHandler.SearchObjects(totalCountSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalCount: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var tempTotal = 0;
                for(var i = 0; i< result.length; i++){
                    var value = parseInt(result[i]);
                    tempTotal = tempTotal+ value;
                }

                if (tempTotal < 0) {
                    tempTotal = 0;
                }

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalCount: Success", true, tempTotal);
                reply.value = tempTotal;
                deferred.resolve(reply);
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalCount: No Keys Found", false, 0);
                reply.value = 0;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetTotalTime = function(tenant, company, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetTotalTime Internal method ");

    var reply = {};

    var totalTimeSearch = util.format('TOTALTIME:%s:%s:%s:%s:%s', tenant, company, window, param1, param2);

    redisHandler.SearchObjects(totalTimeSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalTime: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var tempTotal = 0;
                for(var i = 0; i< result.length; i++){
                    var value = parseInt(result[i]);
                    tempTotal = tempTotal+ value;
                }

                if (tempTotal < 0) {
                    tempTotal = 0;
                }

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalTime: Success", true, tempTotal);
                reply.value = tempTotal;
                deferred.resolve(reply);
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalTime: No Keys Found", false, 0);
                reply.value = 0;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetCurrentTotalTime = function(tenant, company, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetCurrentMaxTime Internal method ");

    var reply = {};

    var currentSessionSearch = util.format('SESSION:%s:%s:%s:*:%s:%s', tenant, company, window, param1, param2);

    redisHandler.SearchHashes(currentSessionSearch, 'time', function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetCurrentMaxTime: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var tempTotalTime = 0;
                var timeNow = moment();
                for(var i = 0; i< result.length; i++){
                    var sessionTime = moment(result[i]);
                    var timeDiff = timeNow.diff(sessionTime, 'seconds');
                    if(timeDiff > 0) {
                        tempTotalTime = tempTotalTime + timeDiff;
                    }
                }

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentMaxTime: Success", true, tempTotalTime);
                reply.value = tempTotalTime;
                deferred.resolve(reply);
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentMaxTime: No Keys Found", false, 0);
                reply.value = 0;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetAverageTime = function(tenant, company, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetAverageTime Internal method ");

    var reply = {};

    var totalTime = 0;
    var totalCount = 0;
    var average = 0;

    if(config.ServiceConfig.addCurrentSessions){
        onGetCurrentTotalTime(tenant, company, window, param1, param2).then(function(result){
            totalTime = totalTime + result.value;
            return onGetTotalTime(tenant, company, window, param1, param2);
        }).then(function(result){
            totalTime = totalTime + result.value;
            return onGetTotalCount(tenant, company, window, param1, param2);
        }).then(function(result){
            totalCount = result.value;

            if (totalCount === 0) {
                average = 0
            } else {
                average = (totalTime / totalCount);
            }

            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetAverageTime: Success", true, average);
            reply.value = average;
            deferred.resolve(reply);

        }).catch(function(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetAverageTime: Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        });
    }else{
        onGetTotalTime(tenant, company, window, param1, param2).then(function(result){
            totalTime = totalTime + result.value;
            return onGetTotalCount(tenant, company, window, param1, param2);
        }).then(function(result){
            totalCount = result.value;

            if (totalCount === 0) {
                average = 0
            } else {
                average = (totalTime / totalCount);
            }

            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetAverageTime: Success", true, average);
            reply.value = average;
            deferred.resolve(reply);

        }).catch(function(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetAverageTime: Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        });
    }



    return deferred.promise;
};

var onGetQueueDetails = function(tenant, company){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetQueueDetails Internal method ");

    var reply = {};
    var queueDetailList = [];

    var totalCountSearch = util.format('TOTALCOUNT:%s:%s:%s:*:*', tenant, company, 'QUEUE');

    redisHandler.SearchKeys(totalCountSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetQueueDetails: SearchKeys Failed", false, queueDetailList);
            reply.value = queueDetailList;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var queueIdList = [];
                for(var i=0; i< result.length; i++){
                    var keyItems = result[i].split(':');
                    if(keyItems.length >= 5){
                        queueIdList.push(keyItems[4]);
                    }
                }

                queueIdList = UniqueArray(queueIdList);

                if(queueIdList.length > 0){

                    var count = queueIdList.length;
                    for(var j=0; j< queueIdList.length; j++) {
                        var queueId = queueIdList[j];

                        getQueueDetail(tenant, company, queueId).then(function(queueInfo){
                            queueDetailList.push(queueInfo);

                            if(queueDetailList.length === count){
                                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetQueueDetails: Success", true, queueDetailList);
                                reply.value = queueDetailList;
                                deferred.resolve(reply);
                            }
                        });
                    }
                }else{
                    reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetQueueDetails: No Queues Found", false, queueDetailList);
                    reply.value = queueDetailList;
                    deferred.resolve(reply);
                }
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetQueueDetails: No Keys Found", false, queueDetailList);
                reply.value = queueDetailList;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetSingleQueueDetails = function(tenant, company, queueId){
    var deferred = Q.defer();

    var reply = {};
    getQueueDetail(tenant, company, queueId).then(function(queueInfo){
        reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetSingleQueueDetails: Success", true, queueInfo);
        reply.value = queueInfo;
        deferred.resolve(reply);
    });

    return deferred.promise;
};


var OnGetMaxTime = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetMaxTime(tenant, company, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetMaxTime: Error", false, 0));
    });

};

var OnGetCurrentMaxTime = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetCurrentMaxTime(tenant, company, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetCurrentMaxTime: Error", false, 0));
    });

};

var OnGetCurrentCount = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetCurrentCount(tenant, company, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetCurrentCount: Error", false, 0));
    });

};

var OnGetAverageTime = function(req, res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetAverageTime(tenant, company, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetAverageTime: Error", false, 0));
    });
};

var OnGetQueueDetails = function(req, res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetQueueDetails(tenant, company).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetQueueDetails: Error", false, undefined));
    });
};

var OnGetSingleQueueDetails = function(req, res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetSingleQueueDetails(tenant, company, req.params.queueId).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetSingleQueueDetails: Error", false, undefined));
    });
};

var OnGetTotalCount = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetTotalCount(tenant, company, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetTotalCount: Error", false, 0));
    });

};


module.exports.OnGetMaxTime = OnGetMaxTime;
module.exports.OnGetCurrentMaxTime = OnGetCurrentMaxTime;
module.exports.OnGetCurrentCount = OnGetCurrentCount;
module.exports.OnGetAverageTime = OnGetAverageTime;
module.exports.OnGetQueueDetails = OnGetQueueDetails;
module.exports.OnGetSingleQueueDetails = OnGetSingleQueueDetails;
module.exports.OnGetTotalCount = OnGetTotalCount;