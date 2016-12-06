/**
 * Created by Heshan.i on 12/5/2016.
 */

var restify = require('restify');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
var util = require('util');
var countService = require('./Services/CountService.js');
var port = config.Host.port || 8874;

var server = restify.createServer({
    name: "DVP Dashboard Service"
});


server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({ mapParams: false }));

restify.CORS.ALLOW_HEADERS.push('authorization');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

server.use(jwt({secret: secret.Secret}));

server.get('/DashboardEvent/MaxWaiting/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetMaxTime);
server.get('/DashboardEvent/CurrentMaxTime/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetCurrentMaxTime);
server.get('/DashboardEvent/CurrentCount/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetCurrentCount);
server.get('/DashboardEvent/AverageTime/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetAverageTime);
server.get('/DashboardEvent/QueueDetails', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetQueueDetails);
server.get('/DashboardEvent/QueueSingleDetail/:queueId', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetSingleQueueDetails);
server.get('/DashboardEvent/TotalCount/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetTotalCount);

server.listen(port, function () {
    logger.info("DVP-DashboardService.main Server %s listening at %s", server.name, server.url);
});