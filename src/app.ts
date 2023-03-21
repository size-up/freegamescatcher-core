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

import express, { Request, Response } from "express";
import { Express } from "express-serve-static-core";
import { readFileSync } from "fs";

import ApplicationController from "./inputs/controllers/application.controller";
import ReceiverController from "./inputs/controllers/receiver.controller";
import DefaultMiddleware from "./middlewares/default.middleware";
import ErrorMiddleware from "./middlewares/error.middleware";

import packageJson from "../package.json";
import { version } from "./config/application.config";

import { logger } from "./config/logger.config";

class Application {
    private http: Express = express();
    private port = 8080;

    public start() {
        this.check(); // check if all needed environment variables are set
        this.welcome(); // print welcome message
        this.default(); // define default middleware
        this.routes(); // define all routes
        this.error(); // define error middleware
        this.application(this.port); // start the application
    }

    private welcome(): void {
        console.info(readFileSync("src/assets/banner.txt", { encoding: "utf8" }));
        logger.info(packageJson.displayName);
        logger.info(`🔖 Application version: [${version()}]`);
        logger.info(packageJson.description);
    }

    /**
     * Function to check if all necessary environment variables are set.
     * @throws Error if one of the environment variable is missing.
     * @returns void
     */
    private check(): void {
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

    /**
     * Define default middlewares.
     */
    private default(): void {
        new DefaultMiddleware(this.http);
    }

    /**
     * Define all available routes.
     */
    private routes(): void {
        /**
         * Default application message response.
         */
        this.http.get("/", (request: Request, response: Response) => {
            const application = {
                name: packageJson.displayName,
                version: version(),
                description: packageJson.description,
                repository: packageJson.repository.url,
            };
            response.status(200).json(application);
        });

        this.http.use("/", new ApplicationController().get());
        this.http.use("/receivers", new ReceiverController().get());
    }

    /**
     * Define error middlewares.
     */
    private error(): void {
        new ErrorMiddleware(this.http);
    }

    /**
     * Init input express HTTP controller.
     */
    private application(port: number): void {
        this.http.listen(port, () => {
            logger.info(`Application listening on port [${port}]`);
        });
    }
}

/**
 * Start the application.
 */
new Application().start();

const hrend = process.hrtime(hrstart); // Used to calculate the time it takes to run the application
logger.info(`Application started in [${hrend[0]}s ${hrend[1] / 1000000}ms]`);
