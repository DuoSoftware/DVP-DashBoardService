/**
 * Created by Heshan.i on 12/5/2016.
 */

module.exports = {
    "Redis":
    {
        "ip": "45.55.142.207",
        "port": 6389,
        "user": "duo",
        "password": "DuoS123",
        "redisDB":8,
        "ardsRedisDB": 6
    },


    "Security":
    {
        "ip" : "45.55.142.207",
        "port": 6389,
        "user": "duo",
        "password": "DuoS123"
    },


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
    }

};