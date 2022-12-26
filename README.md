# 🎮 Free Games Catcher

[![🔄 CI/CD](https://github.com/size-up/freegamescatcher-core/actions/workflows/ci-cd.yaml/badge.svg)](https://github.com/size-up/freegamescatcher-core/actions/workflows/ci-cd.yaml)

**Free Games Catcher** is an application that aims to search for game sites, trigger an alert and send it to users to notify them when a free game is available.

# Prerequisite

To run the **Free Games Catcher** application locally, you need to:

## Environnements variables

This application **needs** some environment variables to provide all its features.

> If you are using Visual Studio Code, the application provide launch configuration contained into `.vscode` directory, that automatically scrap a `.env` file in the root application directory.

`.env` example:

```bash
# Application version
VERSION="development"
API_URL="https://XXX.XXX.XXX"   # URL of the API
API_KEY="XXX-XXX-XXX"           # API key to access to the API, checked by default on all routes

# SMTP
# Used to send email notification
SMTP_HOST="XXX.XXX.XXX"
SMTP_PORT="XXX"
SMTP_USER="XXX@XXX.XXX"
SMTP_PASSWORD="XXX"

# DKIM
# Used to sign email notification
DOMAIN_NAME="XXX.XXX"   # Domain name of the application
DKIM_SELECTOR="XXX.XXX"
DKIM_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n XXX \n-----END RSA PRIVATE KEY-----"

# GOOGLE CREDENTIALS
# Used to store and retrieve application information
GOOGLE_USERNAME="XXX@XXX.XXX"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n XXX \n-----END PRIVATE KEY-----"

# ELASTIC APM
# Used to use the Elastic APM service
ELASTIC_APM_SERVER_URL="https://XXX.XXX.XXX"
ELASTIC_APM_AGENT_KEY="XXX"
```

# Installation

## Install dependencies

```
yarn install
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

# Documentation

## Discord webhook

Free Games Catcher is using Discord webhook to send notifications.
To use the webhook, you need to create a webhook in your Discord server, then a `POST` to the webhook URL will send a message to the Discord channel.

-   [Webhook documentation](https://discord.com/developers/docs/resources/webhook#execute-webhook).
-   [Embed object documentation](https://discord.com/developers/docs/resources/channel#embed-object) (the `embeds` field of the webhook request body, to create some embedded rich message content).

## Application versionning

Free Games Catcher is using [**semantic-release**](https://semantic-release.gitbook.io/) and the semantic gitmoji extension.

-   `.releaserc.js` that contains **semantic-release** configuration.
-   If **semantic-release** determine that there is a new released version, the `"@semantic-release/exec", { publishCmd: "echo ::set-output name=nextVersion::${nextRelease.version}", }` will output the next release version.
-   This variable is retrieved by the CI/CD in the release job: `outputs.version: ${{ steps.version.outputs.nextVersion }}`
-   The CD deploy job will set the `VERSION` image variable environnement to the next release version output.
-   If the application is running in `production` mode, then this is the `VERSION` variable environnement that will print and provide the application version ; instead of the version field contained in the `package.json` file.
