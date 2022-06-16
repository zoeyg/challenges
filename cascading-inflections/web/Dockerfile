FROM node:lts-alpine

RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache  update \
  && apk --no-cache  upgrade \
  && apk add --no-cache --virtual .build-deps ttf-opensans chromium \
  && rm -rf /var/cache/apk/* /tmp/*
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add --no-cache build-base

WORKDIR /usr/src/app
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_PATH=/usr/bin/chromium-browser \
    SEQUELIZE_CONFIG='{"host":"db","port":3306,"username":"root","password":"CHANGE-IN-PROD","database":"","dialect":"mariadb","dialectOptions":{"timezone":"Etc/GMT0"}}' \
    NODE_ENV='development'
COPY package.json ./
RUN yarn
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]