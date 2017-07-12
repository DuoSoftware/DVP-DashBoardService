/**
 * Created by Heshan.i on 12/5/2016.
 */

module.exports = {

    "Redis":
    {
        "mode":"instance",//instance, cluster, sentinel
        "ip": "104.131.67.21",
        "port": 6379,
        "user": "duo",
        "password": "DuoS123",
        "db":8,
        "sentinels":{
            "hosts": "138.197.90.92,45.55.205.92,162.243.81.39",
            "port":16389,
            "name":"redis-cluster"
        }

    },


    "Security":
    {

        "ip" : "45.55.142.207",
        "port": 6389,
        "user": "duo",
        "password": "DuoS123",
        "mode":"instance",//instance, cluster, sentinel
        "sentinels":{
            "hosts": "138.197.90.92,45.55.205.92,162.243.81.39",
            "port":16389,
            "name":"redis-cluster"
        }
    },

    "ArdsRedis":
    {

        "ip" : "45.55.142.207",
        "port": 6389,
        "user": "duo",
        "password": "DuoS123",
        "db": 6,
        "mode":"instance",//instance, cluster, sentinel
        "sentinels":{
            "hosts": "138.197.90.92,45.55.205.92,162.243.81.39",
            "port":16389,
            "name":"redis-cluster"
        }
    },

    //"Redis":
    //{
    //    "ip": "104.131.67.21",
    //    "port": 6379,
    //    "user": "duo",
    //    "password": "DuoS123",
    //    "redisDB":8
    //},
    "DB": {
        "Type": "postgres",
        "User": "duo",
        "Password": "DuoS123",
        "Port": 5432,
        "Host": "104.236.231.11",
        "Database": "duo"
    },




    //"Security":
    //{
    //    "ip" : "45.55.142.207",
    //    "port": 6389,
    //    "user": "duo",
    //    "password": "DuoS123"
    //},


    "Host":
    {
        "resource": "dashboard",
        "vdomain": "127.0.0.1",
        "domain": "127.0.0.1",
        "port": "8874",
        "version": "1.0.0.0"
    },

    "LBServer" : {

        "ip": "192.168.0.101",
        "port": "3636"

    },

    "StatsD":{
        "statsDIp":"45.55.142.207",
        "statsDPort": 8125
    },

    "ServiceConfig":{
        "addCurrentSessions": false
    },
    "Services" : {
        "accessToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo",
        "notificationServiceHost": "notificationservice.app.veery.cloud",
        "notificationServicePort": "8089",
        "notificationServiceVersion": "1.0.0.0"
    }

};
