FROM node:latest
MAINTAINER Ye Jinshou <329365307@qq.com>

RUN npm install -g pm2 && mkdir -p /opt/workspace/

RUN apt-get update && apt-get install -y vim

ADD data/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh


WORKDIR /opt/workspace/
ADD data/ecosystem.config.js /opt/workspace/
ADD huiqinzi-srv /opt/workspace/huiqinzi-srv



ENTRYPOINT /docker-entrypoint.sh
