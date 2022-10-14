FROM node:lts-alpine3.16

# Define working directory
WORKDIR /app

# Install app dependencies
COPY package.json .
COPY yarn.lock .

# Copy cached node_modules
COPY node_modules .

RUN yarn install --frozen-lockfile

# Bundle built app source
COPY build .

ARG VERSION=latest
ENV VERSION=${VERSION}

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 8080

CMD [ "node", "./src/app.js" ]