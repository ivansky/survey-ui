FROM node:9
MAINTAINER Surved

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV PORT 3101

# install and cache app dependencies
COPY package.json package-lock.json /usr/src/app/
RUN npm i --silent

COPY src /usr/src/app/src
COPY scripts /usr/src/app/scripts
COPY public /usr/src/app/public
COPY config /usr/src/app/config

EXPOSE 3101

# start app
CMD ["npm", "start"]
