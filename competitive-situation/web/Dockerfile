FROM node:lts-alpine3.12

WORKDIR /usr/src/app
ENV SEQUELIZE_CONFIG='{"host":"db","port":3306,"username":"root","password":"CHANGE-ME-IN-PROD","database":"","dialect":"mariadb","dialectOptions":{"timezone":"Etc/GMT0"}}' \
  FLAG='flag{I_0f_7h3_t1g3r}' \
  NODE_ENV='development'
COPY package.json ./
RUN yarn
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]