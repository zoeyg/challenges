# docker build -t admin-bot-visitor:latest .
# docker tag admin-bot-visitor:latest gcr.io/shakticon-ctf/admin-bot-visitor:latest
# docker push gcr.io/shakticon-ctf/admin-bot-visitor:latest
# gcloud run deploy --image gcr.io/shakticon-ctf/admin-bot-visitor --platform managed
#
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
    NODE_ENV='production'
COPY package.json ./
RUN yarn
COPY . .
CMD ["node", "visit.js"]