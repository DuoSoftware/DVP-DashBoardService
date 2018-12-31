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
    var queueParams = queue.split(':');
    var queuePriority = queueParams.pop();
    var queueSettingId = queueParams.join(':');
    console.log('QueueId:: '+ queue);
    console.log('QueueSettingId:: '+ queueSettingId);
    redisHandler.GetHashField('QueueNameHash', queueSettingId, function(err, result){
        if(err){
            deferred.resolve(queueId);
        }else{
            if(result) {
                var queueSetting = JSON.parse(result);

                if(queueSetting && queueSetting.QueueName) {
                    var queueName = queueSetting.QueueName;
                    queueName = (queuePriority !== '0')? util.format('%s-P%s', queueName, queuePriority): queueName;
                    deferred.resolve(queueName);
                }else{
                    deferred.resolve(queueId);
                }
            }else{
                deferred.resolve(queueId);
            }
        }
    });

    return deferred.promise;
};

var getQueueDetail = function(tenant, company, businessUnit, queueId){
    var deferred = Q.defer();

    var queueDetail = {QueueId: queueId, QueueInfo: {}};

    getQueueName(queueId).then(function(queueName){
        queueDetail.QueueName = queueName;
        return onGetTotalCount(tenant, company, businessUnit, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.TotalQueued = result.value;
        return onGetTotalCount(tenant, company, businessUnit, 'QUEUEANSWERED', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.TotalAnswered = result.value;
        return onGetTotalCount(tenant, company, businessUnit, 'QUEUEDROPPED', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.QueueDropped = result.value;
        return onGetMaxTime(tenant, company, businessUnit, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.MaxWaitTime = result.value;
        return onGetCurrentMaxTime(tenant, company, businessUnit, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.EventTime = moment().format();
        queueDetail.QueueInfo.CurrentMaxWaitTime = result.value;
        return onGetCurrentCount(tenant, company, businessUnit, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.CurrentWaiting = result.value;
        return onGetAverageTime(tenant, company, businessUnit, 'QUEUE', queueId, '*');
    }).then(function(result){
        queueDetail.QueueInfo.AverageWaitTime = result.value;
        deferred.resolve(queueDetail);
    }).catch(function(err){
        console.log('getQueueDetail: Error:: '+err);
        deferred.resolve(queueDetail);
    });

    return deferred.promise;
};

var onGetMaxTime = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetMaxTime Internal method ");

    var reply = {};

    var maxTimeSearch = util.format('MAXTIME:%s:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1, param2);

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

var onGetCurrentMaxTime = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetCurrentMaxTime Internal method ");

    var reply = {};

    var currentSessionSearch = util.format('SESSION:%s:%s:%s:%s:*:%s:%s', tenant, company, businessUnit, window, param1, param2);

    redisHandler.SearchHashes(currentSessionSearch, 'time', function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetCurrentMaxTime: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){
                var tempMaxTime = 0;
                var maxTimeStamp = undefined;
                var timeNow = moment();



                result.sort(function (time1, time2){
                    return moment(time1).diff(moment(time2))
                });
                //for(var i = 0; i< result.length; i++){
                //    var sessionTime = moment(result[i]);
                //    var timeDiff = timeNow.diff(sessionTime, 'seconds');
                //    if (tempMaxTime < timeDiff) {
                //        tempMaxTime = timeDiff;
                //        maxTimeStamp = result[i];
                //    }
                //}

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentMaxTime: Success", true, result[0]);
                reply.value = result[0];
                deferred.resolve(reply);
            }else{
                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentMaxTime: No Keys Found", false, undefined);
                reply.value = 0;
                deferred.resolve(reply);
            }
        }
    });

    return deferred.promise;
};

var onGetCurrentCount = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetCurrentCount Internal method ");

    var reply = {};
    var currentCountSearch;

    if(businessUnit && businessUnit !== '*'){
        if (param1 && param2) {
            if (param1 !== '*' && param2 !== '*') {
                currentCountSearch = util.format('CONCURRENT:%s:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1, param2);
            } else if (param1 !== '*') {
                currentCountSearch = util.format('CONCURRENTWSPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1);
            } else if (param2 !== '*') {
                currentCountSearch = util.format('CONCURRENTWLPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param2);
            } else {
                currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else if (param1) {
            if (param1 !== '*') {
                currentCountSearch = util.format('CONCURRENTWSPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1);
            } else {
                currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else if (param2) {
            if (param2 !== '*') {
                currentCountSearch = util.format('CONCURRENTWLPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param2);
            } else {
                currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else {
            currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
        }
    }else {
        if (param1 && param2) {
            if (param1 !== '*' && param2 !== '*') {
                currentCountSearch = util.format('CONCURRENT:%s:%s:%s:%s:%s', tenant, company, window, param1, param2);
            } else if (param1 !== '*') {
                currentCountSearch = util.format('CONCURRENTWSPARAM:%s:%s:%s:%s', tenant, company, window, param1);
            } else if (param2 !== '*') {
                currentCountSearch = util.format('CONCURRENTWLPARAM:%s:%s:%s:%s', tenant, company, window, param2);
            } else {
                currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else if (param1) {
            if (param1 !== '*') {
                currentCountSearch = util.format('CONCURRENTWSPARAM:%s:%s:%s:%s', tenant, company, window, param1);
            } else {
                currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else if (param2) {
            if (param2 !== '*') {
                currentCountSearch = util.format('CONCURRENTWLPARAM:%s:%s:%s:%s', tenant, company, window, param2);
            } else {
                currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else {
            currentCountSearch = util.format('CONCURRENTWOPARAMS:%s:%s:%s', tenant, company, window);
        }
    }

    redisHandler.GetObject(currentCountSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetCurrentCount: Get Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result){
                var tempTotal = parseInt(result);

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

    //redisHandler.SearchObjects(currentCountSearch, function(err, result){
    //    if(err){
    //        reply.jsonString = messageFormatter.FormatMessage(err, "OnGetCurrentCount: SearchKeys Failed", false, 0);
    //        reply.value = 0;
    //        deferred.resolve(reply);
    //    }else{
    //        if(result && result.length > 0){
    //            var tempTotal = 0;
    //            for(var i = 0; i< result.length; i++){
    //                var value = parseInt(result[i]);
    //                tempTotal = tempTotal+ value;
    //            }
    //
    //            if (tempTotal < 0) {
    //                tempTotal = 0;
    //            }
    //
    //            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentCount: Success", true, tempTotal);
    //            reply.value = tempTotal;
    //            deferred.resolve(reply);
    //        }else{
    //            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentCount: No Keys Found", false, 0);
    //            reply.value = 0;
    //            deferred.resolve(reply);
    //        }
    //    }
    //});

    return deferred.promise;
};

var onGetTotalCount = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetTotalCount Internal method ");

    var reply = {};
    var totalCountSearch;

    if(businessUnit && businessUnit !== '*'){
        if (param1 && param2) {
            if (param1 !== '*' && param2 !== '*') {
                totalCountSearch = util.format('TOTALCOUNT:%s:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1, param2);
            } else if (param1 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWSPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1);
            } else if (param2 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWLPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param2);
            } else {
                totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else if (param1) {
            if (param1 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWSPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1);
            } else {
                totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else if (param2) {
            if (param2 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWLPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param2);
            } else {
                totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else {
            totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
        }
    }else {
        if (param1 && param2) {
            if (param1 !== '*' && param2 !== '*') {
                totalCountSearch = util.format('TOTALCOUNT:%s:%s:%s:%s:%s', tenant, company, window, param1, param2);
            } else if (param1 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWSPARAM:%s:%s:%s:%s', tenant, company, window, param1);
            } else if (param2 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWLPARAM:%s:%s:%s:%s', tenant, company, window, param2);
            } else {
                totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else if (param1) {
            if (param1 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWSPARAM:%s:%s:%s:%s', tenant, company, window, param1);
            } else {
                totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else if (param2) {
            if (param2 !== '*') {
                totalCountSearch = util.format('TOTALCOUNTWLPARAM:%s:%s:%s:%s', tenant, company, window, param2);
            } else {
                totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else {
            totalCountSearch = util.format('TOTALCOUNTWOPARAMS:%s:%s:%s', tenant, company, window);
        }
    }

    redisHandler.GetObject(totalCountSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalCount: Get Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result){
                var tempTotal = parseInt(result);

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

    //redisHandler.SearchObjects(totalCountSearch, function(err, result){
    //    if(err){
    //        reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalCount: SearchKeys Failed", false, 0);
    //        reply.value = 0;
    //        deferred.resolve(reply);
    //    }else{
    //        if(result && result.length > 0){
    //            var tempTotal = 0;
    //            for(var i = 0; i< result.length; i++){
    //                var value = parseInt(result[i]);
    //                tempTotal = tempTotal+ value;
    //            }
    //
    //            if (tempTotal < 0) {
    //                tempTotal = 0;
    //            }
    //
    //            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalCount: Success", true, tempTotal);
    //            reply.value = tempTotal;
    //            deferred.resolve(reply);
    //        }else{
    //            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalCount: No Keys Found", false, 0);
    //            reply.value = 0;
    //            deferred.resolve(reply);
    //        }
    //    }
    //});

    return deferred.promise;
};

var onGetTotalTime = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetTotalTime Internal method ");

    var reply = {};
    var totalTimeSearch;

    if(businessUnit && businessUnit !== '*'){
        if (param1 && param2) {
            if (param1 !== '*' && param2 !== '*') {
                totalTimeSearch = util.format('TOTALTIME:%s:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1, param2);
            } else if (param1 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWSPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1);
            } else if (param2 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWLPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param2);
            } else {
                totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else if (param1) {
            if (param1 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWSPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1);
            } else {
                totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else if (param2) {
            if (param2 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWLPARAM:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param2);
            } else {
                totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
            }
        } else {
            totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s:%s', tenant, company, businessUnit, window);
        }
    }else {

        if (param1 && param2) {
            if (param1 !== '*' && param2 !== '*') {
                totalTimeSearch = util.format('TOTALTIME:%s:%s:%s:%s:%s', tenant, company, window, param1, param2);
            } else if (param1 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWSPARAM:%s:%s:%s:%s', tenant, company, window, param1);
            } else if (param2 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWLPARAM:%s:%s:%s:%s', tenant, company, window, param2);
            } else {
                totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else if (param1) {
            if (param1 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWSPARAM:%s:%s:%s:%s', tenant, company, window, param1);
            } else {
                totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else if (param2) {
            if (param2 !== '*') {
                totalTimeSearch = util.format('TOTALTIMEWLPARAM:%s:%s:%s:%s', tenant, company, window, param2);
            } else {
                totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s', tenant, company, window);
            }
        } else {
            totalTimeSearch = util.format('TOTALTIMEWOPARAMS:%s:%s:%s', tenant, company, window);
        }
    }

    redisHandler.GetObject(totalTimeSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalTime: Get Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result){
                var tempTotal = parseInt(result);

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


    //redisHandler.SearchObjects(totalTimeSearch, function(err, result){
    //    if(err){
    //        reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalTime: SearchKeys Failed", false, 0);
    //        reply.value = 0;
    //        deferred.resolve(reply);
    //    }else{
    //        if(result && result.length > 0){
    //            var tempTotal = 0;
    //            for(var i = 0; i< result.length; i++){
    //                var value = parseInt(result[i]);
    //                tempTotal = tempTotal+ value;
    //            }
    //
    //            if (tempTotal < 0) {
    //                tempTotal = 0;
    //            }
    //
    //            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalTime: Success", true, tempTotal);
    //            reply.value = tempTotal;
    //            deferred.resolve(reply);
    //        }else{
    //            reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalTime: No Keys Found", false, 0);
    //            reply.value = 0;
    //            deferred.resolve(reply);
    //        }
    //    }
    //});

    return deferred.promise;
};

var onGetTotalTimeWithCurrentSessions = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.onGetTotalTimeWithCurrentSessions Internal method ");

    var reply = {};

    var totalTime = 0;

    onGetCurrentTotalTime(tenant, company, businessUnit, window, param1, param2).then(function(result){
        totalTime = totalTime + result.value;
        return onGetTotalTime(tenant, company, businessUnit, window, param1, param2);
    }).then(function(result){
        totalTime = totalTime + result.value;

        reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetTotalTimeWithCurrentSessions: Success", true, totalTime);
        reply.value = totalTime;
        deferred.resolve(reply);

    }).catch(function(err){
        reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalTimeWithCurrentSessions: Failed", false, 0);
        reply.value = 0;
        deferred.resolve(reply);
    });




    return deferred.promise;
};

var onGetCurrentTotalTime = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetCurrentMaxTime Internal method ");

    var reply = {};

    var currentSessionSearch = util.format('SESSION:%s:%s:%s:%s:*:%s:%s', tenant, company, businessUnit, window, param1, param2);

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

var onGetTotalKeyCount = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetTotalKeyCount Internal method ");

    var reply = {};

    var totalKeyCountSearch = util.format('TOTALCOUNT:%s:%s:%s:%s:%s:%s', tenant, company, businessUnit, window, param1, param2);

    redisHandler.SearchKeys(totalKeyCountSearch, function(err, result){
        if(err){
            reply.jsonString = messageFormatter.FormatMessage(err, "OnGetTotalKeyCount: SearchKeys Failed", false, 0);
            reply.value = 0;
            deferred.resolve(reply);
        }else{
            if(result && result.length > 0){

                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetCurrentMaxTime: Success", true, result.length);
                reply.value = result.length;
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

var onGetAverageTime = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetAverageTime Internal method ");

    var reply = {};

    var totalTime = 0;
    var totalCount = 0;
    var average = 0;


    onGetTotalTime(tenant, company, businessUnit, window, param1, param2).then(function(result){
        totalTime = totalTime + result.value;
        return onGetTotalCount(tenant, company, businessUnit, window, param1, param2);
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



    return deferred.promise;
};

var onGetAverageCountPerKey = function(tenant, company, businessUnit, countWindow, countParam1, countParam2, keyWindow, keyParam1, keyParam2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetAverageCountPerKey Internal method ");

    var reply = {};

    var totalCount = 0;
    var totalKeys = 0;
    var average = 0;


    onGetTotalCount(tenant, company, businessUnit, countWindow, countParam1, countParam2).then(function(result){
        totalCount = totalCount + result.value;
        return onGetTotalKeyCount(tenant, company, businessUnit, keyWindow, keyParam1, keyParam2);
    }).then(function(result){
        totalKeys = result.value;

        if (totalKeys === 0) {
            average = 0
        } else {
            average = (totalCount / totalKeys);
        }

        reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetAverageCountPerKey: Success", true, average);
        reply.value = average;
        deferred.resolve(reply);

    }).catch(function(err){
        reply.jsonString = messageFormatter.FormatMessage(err, "OnGetAverageCountPerKey: Failed", false, 0);
        reply.value = 0;
        deferred.resolve(reply);
    });



    return deferred.promise;
};

var onGetAverageTimeWithCurrentSessions = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetAverageTime Internal method ");

    var reply = {};

    var totalTime = 0;
    var totalCount = 0;
    var average = 0;

    onGetCurrentTotalTime(tenant, company, businessUnit, window, param1, param2).then(function(result){
        totalTime = totalTime + result.value;
        return onGetTotalTime(tenant, company, businessUnit, window, param1, param2);
    }).then(function(result){
        totalTime = totalTime + result.value;
        return onGetTotalCount(tenant, company, businessUnit, window, param1, param2);
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




    return deferred.promise;
};

var onGetAverageTimePerKeyWithCurrentSessions = function(tenant, company, businessUnit, window, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetAverageTime Internal method ");

    var reply = {};

    var totalTime = 0;
    var totalCount = 0;
    var average = 0;

    onGetCurrentTotalTime(tenant, company, businessUnit, window, param1, param2).then(function(result){
        totalTime = totalTime + result.value;
        return onGetTotalTime(tenant, company, businessUnit, window, param1, param2);
    }).then(function(result){
        totalTime = totalTime + result.value;
        return onGetTotalKeyCount(tenant, company, businessUnit, window, param1, param2);
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




    return deferred.promise;
};

var onGetQueueDetails = function(tenant, company, businessUnit){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.OnGetQueueDetails Internal method ");

    var reply = {};
    var queueDetailList = [];

    var totalCountSearch = util.format('TOTALCOUNT:%s:%s:%s:%s:*:*', tenant, company, businessUnit, 'QUEUE');

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
                    if(keyItems.length >= 6){
                        queueIdList.push(keyItems[5]);
                    }
                }

                queueIdList = UniqueArray(queueIdList);

                if(queueIdList.length > 0){

                    var count = queueIdList.length;
                    queueIdList.forEach(function (queueId) {
                        getQueueDetail(tenant, company, businessUnit, queueId).then(function(queueInfo){
                            queueDetailList.push(queueInfo);

                            if(queueDetailList.length === count){
                                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetQueueDetails: Success", true, queueDetailList);
                                reply.value = queueDetailList;
                                deferred.resolve(reply);
                            }
                        });
                    });
                    /*for(var j=0; j< queueIdList.length; j++) {
                        var queueId = queueIdList[j];

                        getQueueDetail(tenant, company, queueId).then(function(queueInfo){
                            queueDetailList.push(queueInfo);

                            if(queueDetailList.length === count){
                                reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetQueueDetails: Success", true, queueDetailList);
                                reply.value = queueDetailList;
                                deferred.resolve(reply);
                            }
                        });
                    }*/
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

var onGetSingleQueueDetails = function(tenant, company, businessUnit, queueId){
    var deferred = Q.defer();

    var reply = {};
    getQueueDetail(tenant, company, businessUnit, queueId).then(function(queueInfo){
        reply.jsonString = messageFormatter.FormatMessage(undefined, "OnGetSingleQueueDetails: Success", true, queueInfo);
        reply.value = queueInfo;
        deferred.resolve(reply);
    });

    return deferred.promise;
};



var OnGetMaxTime = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetMaxTime(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetMaxTime: Error", false, 0));
    });

};

var OnGetCurrentMaxTime = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetCurrentMaxTime(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetCurrentMaxTime: Error", false, 0));
    });

};

var OnGetCurrentCount = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetCurrentCount(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetCurrentCount: Error", false, 0));
    });

};

var OnGetAverageTime = function(req, res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetAverageTime(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetAverageTime: Error", false, 0));
    });
};

var OnGetQueueDetails = function(req, res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetQueueDetails(tenant, company, req.params.businessUnit).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetQueueDetails: Error", false, undefined));
    });
};

var OnGetSingleQueueDetails = function(req, res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetSingleQueueDetails(tenant, company, req.params.businessUnit, req.params.queueId).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetSingleQueueDetails: Error", false, undefined));
    });
};

var OnGetTotalCount = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetTotalCount(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetTotalCount: Error", false, 0));
    });

};

var OnGetTotalTime = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetTotalTime(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetTotalTime: Error", false, 0));
    });

};

var OnGetTotalTimeWithCurrentSessions = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetTotalTimeWithCurrentSessions(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetTotalTimeWithCurrentSessions: Error", false, 0));
    });

};

var OnGetAverageTimeWithCurrentSessions = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetAverageTimeWithCurrentSessions(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetAverageTimeWithCurrentSessions: Error", false, 0));
    });

};

var OnGetAverageTimePerKeyWithCurrentSessions = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetAverageTimePerKeyWithCurrentSessions(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetAverageTimeWithCurrentSessions: Error", false, 0));
    });

};

var OnGetAverageCountPerKey = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetAverageCountPerKey(tenant, company, req.params.businessUnit, req.params.countWindow, req.params.countParam1, req.params.countParam2, req.params.keyWindow, req.params.keyParam1, req.params.keyParam2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetAverageCountPerKey: Error", false, 0));
    });

};

var OnGetCountPerKey = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    onGetTotalKeyCount(tenant, company, req.params.businessUnit, req.params.window, req.params.param1, req.params.param2).then(function(result){
        res.end(result.jsonString);
    }).catch(function(err){
        console.log(err);
        res.end(messageFormatter.FormatMessage(err, "OnGetCountPerKey: Error", false, 0));
    });

};




//------------------------Library Functions---------------------------------------------------

module.exports.OnGetTotalCountLib = onGetTotalCount;
module.exports.OnGetCurrentCountLib = onGetCurrentCount;
module.exports.OnGetTotalTimeLib = onGetTotalTime;
module.exports.OnGetMaxTimeLib = onGetMaxTime;
module.exports.OnGetCurrentMaxTimeLib = onGetCurrentMaxTime;
module.exports.OnGetAverageTimeLib = onGetAverageTime;
module.exports.OnGetQueueDetailsLib = onGetQueueDetails;
module.exports.OnGetSingleQueueDetailsLib = onGetSingleQueueDetails;
module.exports.OnGetTotalTimeWithCurrentSessionsLib = onGetTotalTimeWithCurrentSessions;
module.exports.OnGetAverageTimeWithCurrentSessionsLib = onGetAverageTimeWithCurrentSessions;
module.exports.OnGetAverageTimePerKeyWithCurrentSessionsLib = onGetAverageTimePerKeyWithCurrentSessions;
module.exports.OnGetAverageCountPerKeyLib = onGetAverageCountPerKey;
module.exports.OnGetCountPerKeyLib = onGetTotalKeyCount;


//------------------------http----------------------------------------------------------------
module.exports.OnGetMaxTime = OnGetMaxTime;
module.exports.OnGetCurrentMaxTime = OnGetCurrentMaxTime;
module.exports.OnGetCurrentCount = OnGetCurrentCount;
module.exports.OnGetAverageTime = OnGetAverageTime;
module.exports.OnGetQueueDetails = OnGetQueueDetails;
module.exports.OnGetSingleQueueDetails = OnGetSingleQueueDetails;
module.exports.OnGetTotalCount = OnGetTotalCount;
module.exports.OnGetTotalTimeWithCurrentSessions = OnGetTotalTimeWithCurrentSessions;
module.exports.OnGetAverageTimeWithCurrentSessions = OnGetAverageTimeWithCurrentSessions;
module.exports.OnGetTotalTime = OnGetTotalTime;
module.exports.OnGetAverageTimePerKeyWithCurrentSessions = OnGetAverageTimePerKeyWithCurrentSessions;
module.exports.OnGetAverageCountPerKey = OnGetAverageCountPerKey;
module.exports.OnGetCountPerKey = OnGetCountPerKey;