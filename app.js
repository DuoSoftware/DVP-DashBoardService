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
var graphService = require('./Services/GraphService.js');
var port = config.Host.port || 8874;
var dashboardPubService = require('./Services/DashboardPubService');

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

//---------------------------DashboardEvent--------------------------------------

server.get('/DashboardEvent/MaxWaiting/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetMaxTime);
server.get('/DashboardEvent/CurrentMaxTime/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetCurrentMaxTime);
server.get('/DashboardEvent/CurrentCount/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetCurrentCount);
server.get('/DashboardEvent/AverageTime/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetAverageTime);
server.get('/DashboardEvent/QueueDetails', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetQueueDetails);
server.get('/DashboardEvent/QueueSingleDetail/:queueId', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetSingleQueueDetails);
server.get('/DashboardEvent/TotalCount/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetTotalCount);
server.get('/DashboardEvent/TotalTimeWithCurrentSessions/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetTotalTimeWithCurrentSessions);
server.get('/DashboardEvent/AverageTimeWithCurrentSessions/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetAverageTimeWithCurrentSessions);
server.get('/DashboardEvent/TotalTime/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetTotalTime);
server.get('/DashboardEvent/AverageTimePerKeyWithCurrentSessions/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetAverageTimePerKeyWithCurrentSessions);
server.get('/DashboardEvent/AverageCountPerKey/count/:countWindow/:countParam1/:countParam2/key/:keyWindow/:keyParam1/:keyParam2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetAverageCountPerKey);
server.get('/DashboardEvent/CountPerKey/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), countService.OnGetCountPerKey);

//---------------------------DashboardGraph--------------------------------------

server.get('/DashboardGraph/Calls/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetCalls);
server.get('/DashboardGraph/Channels/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetChannels);
server.get('/DashboardGraph/Bridge/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetBridge);
server.get('/DashboardGraph/Queued/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetQueued);
server.get('/DashboardGraph/ConcurrentQueued/:queue/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetConcurrentQueue);
server.get('/DashboardGraph/AllConcurrentQueued/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetConcurrentQueueTotal);
server.get('/DashboardGraph/NewTicket/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetTotalNewTicket);
server.get('/DashboardGraph/ClosedTicket/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetTotalClosedTicket);
server.get('/DashboardGraph/ClosedVsOpenTicket/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetDiffClosedVsNew);
server.get('/DashboardGraph/NewTicketByUser/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetTotalNewTicketByUser);
server.get('/DashboardGraph/ClosedTicketByUser/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetTotalClosedTicketByUser);
server.get('/DashboardGraph/ClosedVsOpenTicketByUser/:duration', authorization({resource:"dashboardgraph", action:"read"}), graphService.OnGetDiffClosedVsNewByUser);

//---------------------------DashboardPublish--------------------------------------

server.post('/DashboardEvent/Publish/:window/:param1/:param2', authorization({resource:"dashboardevent", action:"read"}), dashboardPubService.PublishDashboardData);


server.listen(port, function () {
    logger.info("DVP-DashboardService.main Server %s listening at %s", server.name, server.url);
});