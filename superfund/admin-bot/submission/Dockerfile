# docker build -t admin-bot-submit:latest .
# docker tag admin-bot-submit:latest gcr.io/shakticon-ctf/admin-bot-submit:latest
# docker push gcr.io/shakticon-ctf/admin-bot-submit:latest
# gcloud run deploy --image gcr.io/shakticon-ctf/admin-bot-submit --platform managed
#
FROM node:14.16-buster-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY public public

RUN npm install --only=production

COPY submit.js .

ENV NODE_ENV="production"
USER node
CMD [ "node", "submit.js" ]