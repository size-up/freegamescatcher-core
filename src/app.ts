import express, { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";
import { readFileSync } from "fs";

import ReceiverRouter from "./inputs/http/receiver.controller";
import DefaultMiddleware from "./middlewares/default.middleware";

import { logger } from "./config/logger";
import packageJson from "../package.json";

class Application {
    private http: Express = express();
    private port = 8080;

    constructor() {
        this.welcome(); // print welcome message
        this.routes(); // define all routes
        this.middlewares(); // define all middlewares
        this.start(this.port); // start the application
    }

    private welcome(): void {
        console.info(readFileSync("src/assets/banner.txt", { encoding: "utf8" }));
        logger.info(`🔖 Application version: [${packageJson.version}].`);
        logger.info(`${packageJson.description}`);
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
                description: packageJson.description,
                version: packageJson.version,
            };
            response.json(application);
        });

        this.http.use("/receivers", new ReceiverRouter().get());
    }

    /**
     * Define all middlewares.
     */
    private middlewares(): void {
        new DefaultMiddleware(this.http);
    }

    /**
     * Init input express HTTP controller
     */
    private start(port: number): void {
        this.http.listen(port, () => {
            logger.info(`${packageJson.displayName} is now listening on port [${port}].`);
            logger.info("--- --- --- --- --- --- --- --- --- --- --- --- --");
        });
    }
}

/**
 * Start the application.
 */
const app = new Application();
