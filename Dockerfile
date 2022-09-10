FROM node:lts-alpine

WORKDIR /app

COPY build .

CMD node src/app.js