# First stage is to build the application
FROM node:20-alpine AS build

# Define working directory
WORKDIR /app

# Copy all content into the first stage
COPY ./ ./

# Install app dependencies
RUN yarn install --frozen-lockfile

# Build the application
RUN yarn run build

# Second stage is to run the application
FROM node:lts-alpine AS application

WORKDIR /app

# Copy the build files from the first stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/build ./

ARG VERSION=latest
ENV VERSION=${VERSION}

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 8080

CMD [ "node", "./src/app.js" ]
