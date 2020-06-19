/**
 * Created by Heshan.i on 12/5/2016.
 */

var restify = require("restify");
var logger = require("dvp-common-lite/LogHandler/CommonLogHandler.js").logger;
var config = require("config");
var jwt = require("restify-jwt");
var secret = require("dvp-common-lite/Authentication/Secret.js");
var authorization = require("dvp-common-lite/Authentication/Authorization.js");
var util = require("util");
var countService = require("./Services/CountService.js");
var graphService = require("./Services/GraphService.js");
var port = config.Host.port || 8874;
var dashboardPubService = require("./Services/DashboardPubService");
var healthcheck = require("dvp-healthcheck/DBHealthChecker");
var redisHandler = require("./RedisHandler.js");

var server = restify.createServer({
  name: "DVP Dashboard Service",
});

server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({ mapParams: false }));

restify.CORS.ALLOW_HEADERS.push("authorization");
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

server.use(jwt({ secret: secret.Secret }));

var hc = new healthcheck(server, {
  redis: redisHandler.redisClient,
});
hc.Initiate();

//---------------------------DashboardEvent--------------------------------------

server.get(
  "/DashboardEvent/MaxWaiting/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetMaxTime
);
server.get(
  "/DashboardEvent/CurrentMaxTime/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetCurrentMaxTime
);
server.get(
  "/DashboardEvent/CurrentCount/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetCurrentCount
);
server.get(
  "/DashboardEvent/AverageTime/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetAverageTime
);
server.get(
  "/DashboardEvent/QueueDetails/:businessUnit",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetQueueDetails
);
server.get(
  "/DashboardEvent/QueueSingleDetail/:businessUnit/:queueId",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetSingleQueueDetails
);
server.get(
  "/DashboardEvent/TotalCount/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetTotalCount
);
server.get(
  "/DashboardEvent/TotalTimeWithCurrentSessions/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetTotalTimeWithCurrentSessions
);
server.get(
  "/DashboardEvent/AverageTimeWithCurrentSessions/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetAverageTimeWithCurrentSessions
);
server.get(
  "/DashboardEvent/TotalTime/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetTotalTime
);
server.get(
  "/DashboardEvent/AverageTimePerKeyWithCurrentSessions/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetAverageTimePerKeyWithCurrentSessions
);
server.get(
  "/DashboardEvent/AverageCountPerKey/:businessUnit/count/:countWindow/:countParam1/:countParam2/key/:keyWindow/:keyParam1/:keyParam2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetAverageCountPerKey
);
server.get(
  "/DashboardEvent/CountPerKey/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  countService.OnGetCountPerKey
);

//---------------------------DashboardGraph--------------------------------------

server.get(
  "/DashboardGraph/Calls/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetCalls
);
server.get(
  "/DashboardGraph/Channels/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetChannels
);
server.get(
  "/DashboardGraph/Bridge/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetBridge
);
server.get(
  "/DashboardGraph/Queued/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetQueued
);
server.get(
  "/DashboardGraph/ConcurrentQueued/:businessUnit/:queue/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetConcurrentQueue
);
server.get(
  "/DashboardGraph/AllConcurrentQueued/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetConcurrentQueueTotal
);
server.get(
  "/DashboardGraph/NewTicket/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetTotalNewTicket
);
server.get(
  "/DashboardGraph/ClosedTicket/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetTotalClosedTicket
);
server.get(
  "/DashboardGraph/ClosedVsOpenTicket/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetDiffClosedVsNew
);
server.get(
  "/DashboardGraph/NewTicketByUser/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetTotalNewTicketByUser
);
server.get(
  "/DashboardGraph/ClosedTicketByUser/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetTotalClosedTicketByUser
);
server.get(
  "/DashboardGraph/ClosedVsOpenTicketByUser/:businessUnit/:duration",
  authorization({ resource: "dashboardgraph", action: "read" }),
  graphService.OnGetDiffClosedVsNewByUser
);

//---------------------------DashboardPublish--------------------------------------

server.post(
  "/DashboardEvent/Publish/:businessUnit/:window/:param1/:param2",
  authorization({ resource: "dashboardevent", action: "read" }),
  dashboardPubService.PublishDashboardData
);
server.post(
  "/DashboardEvent/ResetAll/:businessUnit",
  authorization({ resource: "dashboardevent", action: "read" }),
  dashboardPubService.publishResetAll
);

server.listen(port, function () {
  logger.info(
    "DVP-DashboardService.main Server %s listening at %s",
    server.name,
    server.url
  );
});
