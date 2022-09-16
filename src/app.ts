import express, { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";
import { readFileSync } from "fs";
import packageJson from "../package.json";
import ReceiverRouter from "./inputs/http/receiver.controller";
import DefaultMiddleware from "./middlewares/default.middleware";
import { EmailSenderService } from "./services/emailSender.service";

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
        console.info(`🔖 Application version: [${packageJson.version}].\n`);
        console.info(`${packageJson.description}\n`);
    }
    
    /**
     * Define all available routes.
     */
    private routes(): void {
        /**
         * Log all API calls.
         */
        this.http.use((request: Request, response: Response, next: NextFunction) => {
            const date = new Date().toISOString();
            let message = `${date} - `;
            
            if (request.method) {
                message += `${request.method} `;
            }
            if (request.originalUrl) {
                message += `${request.originalUrl} - `;
            }
            if (request.ip) {
                message += `IP: [${request.ip}] - `;
            }
            if (request.headers.host) {
                message += `Host header: [${request.headers.host}]`;
            }

            console.info(message);
            next();
        });
        
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
     * Init input express HTTP controller
     */
    private start(port: number): void {
        this.http.listen(port, () => {
            console.info(`${packageJson.displayName} is now listening on port [${port}].\n`);
            console.info("--- --- --- --- --- --- --- --- --- --- --- --- ---\n");
        });
    }
    

    /**
     * Define all middlewares.
     */
    private middlewares(): void {
        new DefaultMiddleware(this.http);
    }
}

/**
 * Start the application.
 */
const app = new Application();

const emailSenderService = new EmailSenderService();
emailSenderService.sendMail();