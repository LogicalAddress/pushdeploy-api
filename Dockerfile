FROM node:8
WORKDIR /usr/src/app/pushdeploy-api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD [ "node", "server.js" ]