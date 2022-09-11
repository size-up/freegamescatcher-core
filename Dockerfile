FROM node:lts-alpine

# Define working directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

# Bundle built app source
COPY build .

EXPOSE 8080

CMD [ "node", "./src/app.js" ]