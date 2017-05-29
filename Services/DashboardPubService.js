/**
 * Created by Heshan.i on 5/3/2017.
 */


var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var util = require('util');
var Q = require('q');
var countService = require('./CountService');
var dbConn = require('dvp-dbmodels');
var config = require('config');
var validator = require('validator');
var request = require('request');

function DoPost (companyInfo, eventName, serviceurl, postData, callback) {
    var jsonStr = JSON.stringify(postData);
    var accessToken = util.format("bearer %s", config.Services.accessToken);
    var options = {
        url: serviceurl,
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'authorization': accessToken,
            'companyinfo': companyInfo,
            'eventname': eventName
        },
        body: jsonStr
    };
    try {
        request.post(options, function optionalCallback(err, httpResponse, body) {
            if (err) {
                console.log('upload failed:', err);
            }
            console.log('Server returned: %j', body);
            callback(err, httpResponse, body);
        });
    }catch(ex){
        callback(ex, undefined, undefined);
    }
}

function RequestToNotify(company, tenant, roomName, eventName, msgData){
    try {
        var notificationUrl = util.format("http://%s/DVP/API/%s/NotificationService/Notification/initiate/%s", config.Services.notificationServiceHost, config.Services.notificationServiceVersion, roomName);
        if (validator.isIP(config.Services.notificationServiceHost)) {
            notificationUrl = util.format("http://%s:%s/DVP/API/%s/NotificationService/Notification/initiate/%s", config.Services.notificationServiceHost, config.Services.notificationServicePort, config.Services.notificationServiceVersion, roomName);
        }
        var companyInfo = util.format("%d:%d", tenant, company);
        DoPost(companyInfo, eventName, notificationUrl, msgData, function (err, res1, result) {
            if(err){
                logger.error('Do Post: Error:: '+err);

            }else{
                if(res1.statusCode === 200) {
                    logger.info('Do Post: Success');
                }else{
                    logger.info('Do Post: Failed');
                }
            }
        });
    }catch(ex){
        logger.error('Do Post: Error:: '+ex);
    }
}





var collectTotalCount = function(company, tenant, window, eventName, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectTotalCount Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {window: window, param1: param1, param2: param2}
    };


    countService.OnGetTotalCountLib(tenant, company, window, '*', '*').then(function(result){
        reply.DashboardData.TotalCountWindow = result.value;
        return countService.OnGetTotalCountLib(tenant, company, window, param1, '*');
    }).then(function(result){
        reply.DashboardData.TotalCountParam1 = result.value;
        return countService.OnGetTotalCountLib(tenant, company, window, '*', param2);
    }).then(function(result){
        reply.DashboardData.TotalCountParam2 = result.value;
        return countService.OnGetTotalCountLib(tenant, company, window, param1, param2);
    }).then(function(result){
        reply.DashboardData.TotalCountAllParams = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectTotalCount: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectCurrentCount = function(company, tenant, window, eventName, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectCurrentCount Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {window: window, param1: param1, param2: param2}
    };


    countService.OnGetCurrentCountLib(tenant, company, window, '*', '*').then(function(result){
        reply.DashboardData.CurrentCountWindow = result.value;
        return countService.OnGetCurrentCountLib(tenant, company, window, param1, '*');
    }).then(function(result){
        reply.DashboardData.CurrentCountParam1 = result.value;
        return countService.OnGetCurrentCountLib(tenant, company, window, '*', param2);
    }).then(function(result){
        reply.DashboardData.CurrentCountParam2 = result.value;
        return countService.OnGetCurrentCountLib(tenant, company, window, param1, param2);
    }).then(function(result){
        reply.DashboardData.CurrentCountAllParams = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectCurrentCount: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectTotalTime = function(company, tenant, window, eventName, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectTotalTime Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {window: window, param1: param1, param2: param2}
    };


    countService.OnGetTotalTimeLib(tenant, company, window, '*', '*').then(function(result){
        reply.DashboardData.TotalTimeWindow = result.value;
        return countService.OnGetTotalTimeLib(tenant, company, window, param1, '*');
    }).then(function(result){
        reply.DashboardData.TotalTimeParam1 = result.value;
        return countService.OnGetTotalTimeLib(tenant, company, window, '*', param2);
    }).then(function(result){
        reply.DashboardData.TotalTimeParam2 = result.value;
        return countService.OnGetTotalTimeLib(tenant, company, window, param1, param2);
    }).then(function(result){
        reply.DashboardData.TotalTimeAllParams = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectTotalTime: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectMaxTime = function(company, tenant, window, eventName, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectMaxTime Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {window: window, param1: param1, param2: param2}
    };


    countService.OnGetMaxTimeLib(tenant, company, window, '*', '*').then(function(result){
        reply.DashboardData.MaxTimeWindow = result.value;
        return countService.OnGetMaxTimeLib(tenant, company, window, param1, '*');
    }).then(function(result){
        reply.DashboardData.MaxTimeParam1 = result.value;
        return countService.OnGetMaxTimeLib(tenant, company, window, '*', param2);
    }).then(function(result){
        reply.DashboardData.MaxTimeParam2 = result.value;
        return countService.OnGetMaxTimeLib(tenant, company, window, param1, param2);
    }).then(function(result){
        reply.DashboardData.MaxTimeAllParams = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectMaxTime: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectCurrentMaxTime = function(company, tenant, window, eventName, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectCurrentMaxTime Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {window: window, param1: param1, param2: param2}
    };


    countService.OnGetCurrentMaxTimeLib(tenant, company, window, '*', '*').then(function(result){
        reply.DashboardData.CurrentMaxTimeWindow = result.value;
        return countService.OnGetCurrentMaxTimeLib(tenant, company, window, param1, '*');
    }).then(function(result){
        reply.DashboardData.CurrentMaxTimeParam1 = result.value;
        return countService.OnGetCurrentMaxTimeLib(tenant, company, window, '*', param2);
    }).then(function(result){
        reply.DashboardData.CurrentMaxTimeParam2 = result.value;
        return countService.OnGetCurrentMaxTimeLib(tenant, company, window, param1, param2);
    }).then(function(result){
        reply.DashboardData.CurrentMaxTimeAllParams = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectCurrentMaxTime: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectAverageTime = function(company, tenant, window, eventName, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectAverageTime Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {window: window, param1: param1, param2: param2}
    };


    countService.OnGetAverageTimeLib(tenant, company, window, '*', '*').then(function(result){
        reply.DashboardData.AverageTimeWindow = result.value;
        return countService.OnGetAverageTimeLib(tenant, company, window, param1, '*');
    }).then(function(result){
        reply.DashboardData.AverageTimeParam1 = result.value;
        return countService.OnGetAverageTimeLib(tenant, company, window, '*', param2);
    }).then(function(result){
        reply.DashboardData.AverageTimeParam2 = result.value;
        return countService.OnGetAverageTimeLib(tenant, company, window, param1, param2);
    }).then(function(result){
        reply.DashboardData.AverageTimeAllParams = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectAverageTime: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectQueueDetails = function(company, tenant, window, eventName){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectQueueDetails Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: []
    };


    countService.OnGetQueueDetailsLib(tenant, company).then(function(result){
        reply.DashboardData = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectQueueDetails: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectSingleQueueDetails = function(company, tenant, window, eventName, queueId){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectSingleQueueDetails Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {}
    };


    countService.OnGetSingleQueueDetailsLib(tenant, company, queueId).then(function(result){
        reply.DashboardData = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectSingleQueueDetails: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};

var collectTotalKeyCount = function(company, tenant, window, eventName, param1, param2){
    var deferred = Q.defer();

    logger.info("DVP-DashboardService.collectTotalKeyCount Internal method ");

    var reply = {
        roomData: { roomName: window+':'+eventName, eventName: eventName },
        DashboardData: {window: window, param1: param1, param2: param2}
    };


    countService.OnGetCountPerKeyLib(tenant, company, window, '*', '*').then(function(result){
        reply.DashboardData.TotalCountWindow = result.value;
        return countService.OnGetCountPerKeyLib(tenant, company, window, param1, '*');
    }).then(function(result){
        reply.DashboardData.TotalCountParam1 = result.value;
        return countService.OnGetCountPerKeyLib(tenant, company, window, '*', param2);
    }).then(function(result){
        reply.DashboardData.TotalCountParam2 = result.value;
        return countService.OnGetCountPerKeyLib(tenant, company, window, param1, param2);
    }).then(function(result){
        reply.DashboardData.TotalCountAllParams = result.value;
        deferred.resolve(reply);
    }).catch(function(err){
        logger.error('collectTotalKeyCount: Error:: '+err);
        deferred.resolve(reply);
    });

    return deferred.promise;
};


var publishDashboardData = function (req, res) {
    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);

    dbConn.DashboardPublishMetaData.findAll({
        where: [{ WindowName: req.params.window }]
    }).then(function (dbPubMeta) {
        if (dbPubMeta) {
            var asyncFuncArray = [];
            dbPubMeta.forEach(function (pubMeta) {
                switch (pubMeta.EventName){
                    case 'TotalCount':
                        asyncFuncArray.push(collectTotalCount(company, tenant, req.params.window, pubMeta.EventName, req.params.param1, req.params.param2));
                        break;
                    case 'CurrentCount':
                        asyncFuncArray.push(collectCurrentCount(company, tenant, req.params.window, pubMeta.EventName, req.params.param1, req.params.param2));
                        break;
                    case 'TotalTime':
                        asyncFuncArray.push(collectTotalTime(company, tenant, req.params.window, pubMeta.EventName, req.params.param1, req.params.param2));
                        break;
                    case 'MaxWaiting':
                        asyncFuncArray.push(collectMaxTime(company, tenant, req.params.window, pubMeta.EventName, req.params.param1, req.params.param2));
                        break;
                    case 'CurrentMaxTime':
                        asyncFuncArray.push(collectCurrentMaxTime(company, tenant, req.params.window, pubMeta.EventName, req.params.param1, req.params.param2));
                        break;
                    case 'AverageTime':
                        asyncFuncArray.push(collectAverageTime(company, tenant, req.params.window, pubMeta.EventName, req.params.param1, req.params.param2));
                        break;
                    case 'QueueDetails':
                        asyncFuncArray.push(collectQueueDetails(company, tenant, 'QUEUE', pubMeta.EventName));
                        break;
                    case 'QueueDetail':
                        asyncFuncArray.push(collectSingleQueueDetails(company, tenant, 'QUEUE', pubMeta.EventName, req.params.param1));
                        break;
                    case 'TotalKeyCount':
                        asyncFuncArray.push(collectTotalKeyCount(company, tenant, req.params.window, pubMeta.EventName, req.params.param1, req.params.param2));
                        break;
                    default :
                        break;
                }
            });

            if(asyncFuncArray && asyncFuncArray.length >0) {
                Q.all(asyncFuncArray).then(function (results) {

                    if(results){
                        results.forEach(function (result) {
                            var postData = {message: result.DashboardData, From: 'DashboardService'};
                            RequestToNotify(company, tenant, result.roomData.roomName, result.roomData.eventName, postData);
                        });
                    }

                    logger.info('Execute Dashboard Publish: Success');
                }).catch(function (err) {
                    logger.error('Execute Dashboard Publish: Error:: ' + err);
                });
            }
            
        }else{
            logger.warn('No Publish metadata found');
        }
    }).error(function (err) {
        logger.error(err);
    });

    res.end(messageFormatter.FormatMessage(undefined, "publishDashboardData: Accepted", true, undefined));
};


module.exports.PublishDashboardData = publishDashboardData;