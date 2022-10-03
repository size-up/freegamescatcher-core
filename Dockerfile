FROM node:lts-alpine3.16

# Define working directory
WORKDIR /app

# Install app dependencies
COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

# Bundle built app source
COPY build .
COPY data ./data

ENV NODE_ENV=production

EXPOSE 8080

CMD [ "node", "./src/app.js" ]