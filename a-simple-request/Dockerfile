# docker build . -t a-simple-request
# docker run --name a-simple-request -d -p 3000:3000 a-simple-request

FROM node:12.18.1-alpine3.12
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node", "server.js" ]