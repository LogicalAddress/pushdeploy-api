FROM node:latest
WORKDIR /usr/src/app/pushdeploy-api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "server.js" ]