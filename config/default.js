/**
 * Created by Heshan.i on 12/5/2016.
 */

module.exports = {
  Redis: {
    mode: "sentinel", //instance, cluster, sentinel
    ip: "",
    port: 6379,
    user: "",
    password: "",
    db: 8,
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster",
    },
  },

  Security: {
    ip: "",
    port: 6389,
    user: "",
    password: "",
    mode: "sentinel", //instance, cluster, sentinel
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster",
    },
  },

  ArdsRedis: {
    ip: "",
    port: 6389,
    user: "",
    password: "",
    db: 6,
    mode: "sentinel", //instance, cluster, sentinel
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster",
    },
  },

  //"Redis":
  //{
  //    "ip": "",
  //    "port": 6379,
  //    "user": "",
  //    "password": "",
  //    "redisDB":8
  //},
  DB: {
    Type: "postgres",
    User: "",
    Password: "",
    Port: 5432,
    Host: "",
    Database: "",
  },

  //"Security":
  //{
  //    "ip" : "",
  //    "port": 6389,
  //    "user": "",
  //    "password": ""
  //},

  Host: {
    resource: "dashboard",
    vdomain: "127.0.0.1",
    domain: "127.0.0.1",
    port: "8874",
    version: "1.0.0.0",
  },

  LBServer: {
    ip: "",
    port: "3636",
  },

  StatsD: {
    statsDIp: "",
    statsDPort: 8125,
  },

  ServiceConfig: {
    addCurrentSessions: false,
  },
  Services: {
    accessToken: "",
    notificationServiceHost: "",
    notificationServicePort: "8089",
    notificationServiceVersion: "1.0.0.0",
    dynamicPort: true,
  },
};
