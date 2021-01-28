FROM node:lts-alpine3.12

RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache  update \
  && apk --no-cache  upgrade \
  && apk add --no-cache --virtual .build-deps ttf-opensans chromium \
  && rm -rf /var/cache/apk/* /tmp/*

WORKDIR /usr/src/app
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_PATH=/usr/bin/chromium-browser \
    FLAG='tdiCTF{i_@ua11y_Pr4C7icE_!Vi013nc3}' \
    NODE_ENV='development' \
    PORT=3000
COPY package.json ./
RUN yarn
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]