# 🎮 Free Games Catcher

[![CI/CD and release](https://github.com/size-up/freegamescatcher-core/actions/workflows/onPushMainPrMain.yaml/badge.svg)](https://github.com/size-up/freegamescatcher-core/actions/workflows/onPushMainPrMain.yaml)

Free Games Catcher is an application that aims to search for game sites, trigger an alert and send it to users to notify them when a free game is available.

# Prerequisite

To run Free Games Catcher locally, you need to

## Environnements variables

This application **needs** some environment variables to provide all its features.

> If you are usind Visual Studio Code, the application provide launch configuration contained into `.vscode` directory, that automatically scrap a `.env` file in the root application directory.

`.env` example:

```sh
# Application version
VERSION="1.0.0"
API_KEY="api-key-value" # API key to access to the API, checked by default on all routes

# SMTP
# Used to send email notification
SMTP_HOST="smtp_host"
SMTP_PORT="smtp_port"
SMTP_USER="smtp_email"
SMTP_PASSWORD="smtp_password"

# GOOGLE CREDENTIALS
# Used to store and retrieve application information
GOOGLE_USERNAME="noreply@sizeup.cloud"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY----- ***"
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

# Extra

## Application versionning

Free Games Catcher is using [**semantic-release**](https://semantic-release.gitbook.io/) and the semantic gitmoji extension.

-   `.releaserc.js` that contains **semantic-release** configuration.
-   If **semantic-release** determine that there is a new released version, the `"@semantic-release/exec", { publishCmd: "echo ::set-output name=nextVersion::${nextRelease.version}", }` will output the next release version.
-   This variable is retrieved by the CI/CD in the release job: `outputs.version: ${{ steps.version.outputs.nextVersion }}`
-   The CD deploy job will set the `VERSION` image variable environnement to the next release version output.
-   If the application is running in `production` mode, then this is the `VERSION` variable environnement that will print and provide the application version ; instead of the version field contained in the `package.json` file.
