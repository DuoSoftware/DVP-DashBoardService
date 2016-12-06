#FROM ubuntu
#RUN apt-get update
#RUN apt-get install -y git nodejs npm nodejs-legacy
#RUN git clone git://github.com/DuoSoftware/DVP-DashBoardService.git /usr/local/src/dashboardservice
#RUN cd /usr/local/src/dashboardservice; npm install
#CMD ["nodejs", "/usr/local/src/dashboardservice/app.js"]

#EXPOSE 8883

FROM node:5.10.0
RUN git clone git://github.com/DuoSoftware/DVP-DashBoardService.git /usr/local/src/dashboardservice
RUN cd /usr/local/src/dashboardservice;
WORKDIR /usr/local/src/dashboardservice
RUN npm install
EXPOSE 8883
CMD [ "node", "/usr/local/src/dashboardservice/app.js" ]