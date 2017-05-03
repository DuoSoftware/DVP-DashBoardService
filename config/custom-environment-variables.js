/**
 * Created by Heshan.i on 12/5/2016.
 */

module.exports = {
    "Redis":
    {
        "ip": "SYS_DASHBOARD_REDIS_HOST",
        "port": "SYS_DASHBOARD_REDIS_PORT",
        "user": "SYS_DASHBOARD_REDIS_USER",
        "password": "SYS_DASHBOARD_REDIS_PASSWORD",
        "redisDB":"SYS_REDIS_DB_DASHBOARD"

    },
    "DB": {
        "Type": "SYS_DATABASE_TYPE",
        "User": "SYS_DATABASE_POSTGRES_USER",
        "Password": "SYS_DATABASE_POSTGRES_PASSWORD",
        "Port": "SYS_SQL_PORT",
        "Host": "SYS_DATABASE_HOST",
        "Database": "SYS_DATABASE_POSTGRES_USER"
    },

    "ArdsRedis":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD",
        "ardsRedisDB": "SYS_REDIS_DB_ARDS"

    },

    "Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },

    "Host":
    {
        "vdomain": "LB_FRONTEND",
        "domain": "HOST_NAME",
        "port": "HOST_DASHBOARDSERVICE_PORT",
        "version": "HOST_VERSION"
    },

    "LBServer" : {

        "ip": "LB_FRONTEND",
        "port": "LB_PORT"

    },

    "StatsD":{
        "statsDIp":"SYS_STATSD_HOST",
        "statsDPort": "SYS_STATSD_PORT"
    },

    "ServiceConfig":{
        "addCurrentSessions": "HOST_DASHBOARDSERVICE_ADDSESSION"
    },

    "Services" : {
        "accessToken": "HOST_TOKEN",
        "notificationServiceHost": "SYS_NOTIFICATIONSERVICE_HOST",
        "notificationServicePort": "SYS_NOTIFICATIONSERVICE_PORT",
        "notificationServiceVersion": "SYS_NOTIFICATIONSERVICE_VERSION"
    }
};
