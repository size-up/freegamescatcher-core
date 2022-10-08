# 🎮 Free Games Catcher

[![CI/CD and release](https://github.com/size-up/freegamescatcher/actions/workflows/onPushMainPrMain.yaml/badge.svg)](https://github.com/size-up/freegamescatcher/actions/workflows/onPushMainPrMain.yaml)

Free Games Catcher is an application that aims to search for game sites, trigger an alert and send it to users to notify them when a free game is available.

# Installation

## Install dependencies

```
yarn
```

## Local development

```
yarn run dev
```

This command starts a local development server. Most changes are reflected live without having to restart the server.

## Build application

```
yarn run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Start built application

```
yarn run start
```

## Sample `.env`

```.env
# SMTP
SMTP_HOST="host_to_smtp"
SMTP_PORT="port_for_smtp"
SMTP_USER="email_login_for_smtp"
SMTP_PASSWORD="password_smtp"

# GOOGLE CREDENTIALS
GOOGLE_USERNAME="svc-email@sizeup.com"
GOOGLE_PRIVATE_KEY="BEGIN PRIVATE KEYDQSdqsdqsdqsdqsdffsesf"
```