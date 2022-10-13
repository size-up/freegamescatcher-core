import express, { Request, Response } from "express";
import { Express } from "express-serve-static-core";
import { readFileSync } from "fs";

import ApplicationController from "./inputs/controllers/application.controller";
import ReceiverController from "./inputs/controllers/receiver.controller";
import DefaultMiddleware from "./middlewares/default.middleware";
import ErrorMiddleware from "./middlewares/error.middleware";

import packageJson from "../package.json";
import { version } from "./config/information";

import { logger } from "./config/logger";

class Application {
    private http: Express = express();
    private port = 8080;

    constructor() {
        this.welcome(); // print welcome message
        this.default(); // define default middleware
        this.routes(); // define all routes
        this.error(); // define error middleware
        this.start(this.port); // start the application
    }

    private welcome(): void {
        console.info(readFileSync("src/assets/banner.txt", { encoding: "utf8" }));
        logger.info(`🔖 Application version: [${version()}]`);
        logger.info(`${packageJson.description}`);
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
                repository: packageJson.repository.url
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
    private start(port: number): void {
        this.http.listen(port, () => {
            logger.info(`${packageJson.displayName} is now listening on port [${port}]`);
        });
    }
}

/**
 * Start the application.
 */
const app = new Application();
