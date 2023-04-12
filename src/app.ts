const hrstart = process.hrtime(); // Used to calculate the time it takes to run the application

/*
 * APM initialization must be the first thing required in the application.
 */
import apm from "elastic-apm-node";
apm.start({
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_AGENT_KEY,
    environment: process.env.NODE_ENV,
    logLevel: "off",
});

import { readFileSync } from "fs";
import { version } from "./config/application.config";
import { logger } from "./config/logger.config";

import Router from "./inputs/http/router";

class Application {
    /**
     * Check, print welcome message and start the application with all inputs.
     * @returns void
     */
    public static start(): void {
        this.check(); // check if all needed environment variables are set
        this.welcome(); // print welcome message
        this.inputs(); // define all inputs
    }

    /**
     * Function to check if all necessary environment variables are set.
     * @throws Error if one of the environment variable is missing.
     * @returns void
     */
    private static check(): void {
        logger.debug("Checking environment variables...");

        const envs = [
            "VERSION",
            "API_URL",
            "API_KEY",

            "SMTP_HOST",
            "SMTP_PORT",
            "SMTP_USER",
            "SMTP_PASSWORD",

            "DOMAIN_NAME",
            "DKIM_SELECTOR",
            "DKIM_PRIVATE_KEY",

            "GOOGLE_USERNAME",
            "GOOGLE_PRIVATE_KEY",

            "ELASTIC_APM_SERVER_URL",
            "ELASTIC_APM_AGENT_KEY",
        ];

        const missing: string[] = envs.filter((variable) => {
            return !process.env[variable];
        });

        if (missing.length) {
            const message = `Missing environment variables: [${missing.join(", ")}]`;
            logger.error(message);
            throw new Error(message);
        } else {
            logger.debug("All environment variables are set.");
        }
    }

    private static welcome(): void {
        logger.info(readFileSync("src/assets/banner.txt", { encoding: "utf8" }));
        logger.info(`Application is starting with version: [${version()}]`);
    }

    private static inputs(): void {
        Router.listen(8080); // start and listen to the HTTP input
    }
}

/**
 * Start the application.
 */
Application.start();

const hrend = process.hrtime(hrstart); // Used to calculate the time it takes to run the application
logger.info(`Application started in [${hrend[0]}s ${hrend[1] / 1000000}ms]`);
