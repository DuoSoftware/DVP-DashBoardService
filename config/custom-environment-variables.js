/**
 * Created by Heshan.i on 12/5/2016.
 */

module.exports = {

    EmailSendMethod: "SYS_EMAIL_SEND_METHOD",

    "Redis":
    {
        "mode": "SYS_DASHBOARD_REDIS_MODE",
        "ip": "SYS_DASHBOARD_REDIS_HOST",
        "port": "SYS_DASHBOARD_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "db": "SYS_REDIS_DB_DASHBOARD",
        "password": "SYS_DASHBOARD_REDIS_PASSWORD",
        "sentinels": {
            "hosts": "SYS_REDIS_DASHBOARD_SENTINEL_HOSTS",
            "port": "SYS_REDIS_DASHBOARD_SENTINEL_PORT",
            "name": "SYS_REDIS_DASHBOARD_SENTINEL_NAME"
        }

    },

    "Security":
    {

        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD",
        "mode": "SYS_REDIS_MODE",
        "sentinels": {
            "hosts": "SYS_REDIS_SENTINEL_HOSTS",
            "port": "SYS_REDIS_SENTINEL_PORT",
            "name": "SYS_REDIS_SENTINEL_NAME"
        }

    },

    "SMSServer": {
        "ip": "SYS_SMSSERVER_HOST",
        "port": "SYS_SMSSERVER_PORT",
        "password": "SYS_SMSSERVER_PASSWORD",
        "user": "SYS_SMSSERVER_USER",
    },

    "SMTP": {
        "ip": "SYS_SMTP_HOST",
        "port": "SYS_SMTP_PORT",
        "user": "SYS_SMTP_USER",
        "password": "SYS_SMTP_PASSWORD",
    },

    "DB": {
        "Type": "SYS_DATABASE_TYPE",
        "User": "SYS_DATABASE_POSTGRES_USER",
        "Password": "SYS_DATABASE_POSTGRES_PASSWORD",
        "Port": "SYS_SQL_PORT",
        "Host": "SYS_DATABASE_HOST",
        "Database": "SYS_DATABASE_NAME"
    },

    "ArdsRedis":
    {
        "mode": "SYS_REDIS_MODE",
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD",
        "db": "SYS_REDIS_DB_ARDS",
        "sentinels": {
            "hosts": "SYS_REDIS_SENTINEL_HOSTS",
            "port": "SYS_REDIS_SENTINEL_PORT",
            "name": "SYS_REDIS_SENTINEL_NAME"
        }

    },

    "Mongo": {
        "ip": "SYS_MONGO_HOST",
        "port": "SYS_MONGO_PORT",
        "dbname": "SYS_MONGO_DB",
        "password": "SYS_MONGO_PASSWORD",
        "user": "SYS_MONGO_USER",
        "type": "SYS_MONGO_TYPE"

    },


    "Host":
    {
        "vdomain": "LB_FRONTEND",
        "domain": "HOST_NAME",
        "port": "HOST_DASHBOARDSERVICE_PORT",
        "version": "HOST_VERSION",
        "smsQueueName": "SYS_SMS_QUEUE_NAME",
        "defaultMailHost": "SYS_DEFAULT_MAIL_HOST",
        "emailQueueName": "SYS_EMAIL_QUEUE_NAME",
    },

    "LBServer": {

        "ip": "LB_FRONTEND",
        "port": "LB_PORT"

    },

    "StatsD": {
        "statsDIp": "SYS_STATSD_HOST",
        "statsDPort": "SYS_STATSD_PORT"
    },

    "ServiceConfig": {
        "addCurrentSessions": "HOST_DASHBOARDSERVICE_ADDSESSION"
    },

    "RabbitMQ": {
        "ip": "SYS_RABBIMQ_HOST",
        "port": "SYS_RABBITMQ_PORT",
        "user": "SYS_RABBITMQ_USER",
        "password": "SYS_RABBITMQ_PASSWORD",
        "type": "SYS_RABBITMQ_TYPE",
        "vhost": "SYS_RABBITMQ_VHOSt"
    },

    "Services": {
        "accessToken": "HOST_TOKEN",
        "notificationServiceHost": "SYS_NOTIFICATIONSERVICE_HOST",
        "notificationServicePort": "SYS_NOTIFICATIONSERVICE_PORT",
        "notificationServiceVersion": "SYS_NOTIFICATIONSERVICE_VERSION",

        "resourceServiceHost": "SYS_RESOURCESERVICE_HOST",
        "resourceServicePort": "SYS_RESOURCESERVICE_PORT",
        "resourceServiceVersion": "SYS_RESOURCESERVICE_VERSION",

        "uploadurl": "SYS_FILESERVICE_HOST",
        "uploadport": "SYS_FILESERVICE_PORT",
        "uploadurlVersion": "SYS_FILESERVICE_VERSION",

        "interactionurl": "SYS_INTERACTIONS_HOST",
        "interactionport": "SYS_INTERACTIONS_PORT",
        "interactionversion": "SYS_INTERACTIONS_VERSION",


        "cronurl": "SYS_SCHEDULEWORKER_HOST",
        "cronport": "SYS_SCHEDULEWORKER_PORT",
        "cronversion": "SYS_SCHEDULEWORKER_VERSION",


        "ticketServiceHost": "SYS_LITETICKET_HOST",
        "ticketServicePort": "SYS_LITETICKET_PORT",
        "ticketServiceVersion": "SYS_LITETICKET_VERSION",
    }
};
