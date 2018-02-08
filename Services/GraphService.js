/**
 * Created by Heshan.i on 12/5/2016.
 */

var request = require('request');
var util = require('util');
var config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');

var statsDIp = config.StatsD.statsDIp;

var DoGet = function (serviceUrl, callback) {
    logger.info('RouteRequest:: %s', serviceUrl);
    var options = {
        url: serviceUrl,
        headers: {
            'content-type': 'application/json'
        }
    };
    request(options, function optionalCallback(err, httpResponse, body) {
        if (err) {
            logger.error('get graphite data failed:', err);
        }
        logger.info('graphite returned: %j', body);
        callback(err, httpResponse, body);
    });
};


var OnGetCalls = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=sumSeries(stats.event.common.concurrent.%d.%d.%s.*.CALLS)&from=-%dmin&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetCalls: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetCalls: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetCalls: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetChannels = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=sumSeries(stats.event.common.concurrent.%d.%d.%s.*.CALLCHANNELS)&from=-%dmin&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetChannels: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetChannels: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetChannels: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetBridge = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=sumSeries(stats.event.common.concurrent.%d.%d.%s.*.BRIDGE)&from=-%dmin&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetBridge: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetBridge: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetBridge: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetQueued = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=sumSeries(stats.event.common.concurrent.%d.%d.%s.*.QUEUE)&from=-%dmin&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetQueued: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetQueued: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetQueued: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetConcurrentQueue = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=stats.gauges.event.common.concurrent.%d.%d.%s.%s.QUEUE&from=-%dmin&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.queue, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetConcurrentQueue: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetConcurrentQueue: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetConcurrentQueue: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetConcurrentQueueTotal = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=sumSeries(stats.gauges.event.common.concurrent.%d.%d.%s.*.QUEUE)&from=-%dmin&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetConcurrentQueueTotal: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetConcurrentQueueTotal: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetConcurrentQueueTotal: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetTotalNewTicket = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=summarize(sumSeries(stats.gauges.event.ticket.totalcount.%d.%d.%s.total.NEWTICKET),\"1d\",\"max\",true)&from=-%dd&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetTotalNewTicket: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalNewTicket: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalNewTicket: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetTotalClosedTicket = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=summarize(sumSeries(stats.gauges.event.ticket.totalcount.%d.%d.%s.total.CLOSEDTICKET),\"1d\",\"max\",true)&from=-%dd&format=json", statsDIp, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetTotalClosedTicket: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalClosedTicket: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalClosedTicket: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetDiffClosedVsNew = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;

    var jsonString;

    var url = util.format("http://%s/render?target=summarize(diffSeries(stats.gauges.event.ticket.totalcount.%d.%d.%s.total.NEWTICKET,stats.gauges.event.ticket.totalcount.%d.%d.%s.total.CLOSEDTICKET),\"1d\",\"max\",true)&from=-%dd&format=json", statsDIp, tenant, company, req.params.businessUnit, tenant, company, req.params.businessUnit, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetDiffClosedVsNew: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetDiffClosedVsNew: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetDiffClosedVsNew: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetTotalNewTicketByUser = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;
    var iss = req.user.iss;

    iss = iss.replace(/@/g, "");

    var jsonString;

    var url = util.format("http://%s/render?target=summarize(sumSeries(stats.gauges.event.ticket.totalcount.%d.%d.%s.user_%s.NEWTICKET),\"1d\",\"max\",true)&from=-%dd&format=json", statsDIp, tenant, company, req.params.businessUnit, iss, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetTotalNewTicketByUser: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalNewTicketByUser: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalNewTicketByUser: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetTotalClosedTicketByUser = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;
    var iss = req.user.iss;
    iss = iss.replace(/@/g, "");
    var jsonString;

    var url = util.format("http://%s/render?target=summarize(sumSeries(stats.gauges.event.ticket.totalcount.%d.%d.%s.user_%s.CLOSEDTICKET),\"1d\",\"max\",true)&from=-%dd&format=json", statsDIp, tenant, company, req.params.businessUnit, iss, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetTotalClosedTicketByUser: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalClosedTicketByUser: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetTotalClosedTicketByUser: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

var OnGetDiffClosedVsNewByUser = function(req,res){
    var tenant = req.user.tenant;
    var company = req.user.company;
    var iss = req.user.iss;
    iss = iss.replace(/@/g, "");
    var jsonString;

    var url = util.format("http://%s/render?target=summarize(diffSeries(stats.gauges.event.ticket.totalcount.%d.%d.%s.user_%s.NEWTICKET,stats.gauges.event.ticket.totalcount.%d.%d.%s.user_%s.CLOSEDTICKET),\"1d\",\"max\",true)&from=-%dd&format=json", statsDIp, tenant, company, req.params.businessUnit, iss, tenant, company, req.params.businessUnit, iss, req.params.duration);
    DoGet(url, function(err, httpResponse, body){
        if(err){
            jsonString = messageFormatter.FormatMessage(err, "Graph:OnGetDiffClosedVsNewByUser: Failed", false, undefined);
        }else{
            if(httpResponse.statusCode === 200) {
                var result = undefined;
                if(body){
                    result = JSON.parse(body);
                }
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetDiffClosedVsNewByUser: Success", true, result);
            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "Graph:OnGetDiffClosedVsNewByUser: Failed", false, undefined);
            }
        }
        res.end(jsonString);
    });
};

module.exports.OnGetCalls = OnGetCalls;
module.exports.OnGetChannels = OnGetChannels;
module.exports.OnGetBridge = OnGetBridge;
module.exports.OnGetQueued = OnGetQueued;
module.exports.OnGetConcurrentQueue = OnGetConcurrentQueue;
module.exports.OnGetConcurrentQueueTotal = OnGetConcurrentQueueTotal;
module.exports.OnGetTotalNewTicket = OnGetTotalNewTicket;
module.exports.OnGetTotalClosedTicket = OnGetTotalClosedTicket;
module.exports.OnGetDiffClosedVsNew = OnGetDiffClosedVsNew;
module.exports.OnGetTotalNewTicketByUser = OnGetTotalNewTicketByUser;
module.exports.OnGetTotalClosedTicketByUser = OnGetTotalClosedTicketByUser;
module.exports.OnGetDiffClosedVsNewByUser = OnGetDiffClosedVsNewByUser;