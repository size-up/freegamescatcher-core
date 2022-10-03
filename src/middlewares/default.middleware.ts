import { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";

import { logger } from "../config/logger";

export default class DefaultMiddleware {

    constructor(http: Express) {
        this.defaultMiddleware(http);
        this.errorMiddleware(http);
    }

    private defaultMiddleware(http: Express): void {
        /**
         * Log all API calls.
         */
        http.use((request: Request, response: Response, next: NextFunction) => {
            const message = {
                method: request.method,
                url: request.originalUrl,
                ip: request.ip,
                headers: request.headers
            };

            logger.info(message);
            next();
        });
    }

    private errorMiddleware(http: Express) {
        /**
         * Catch all not found route.
         * See this https://stackoverflow.com/questions/11500204/how-can-i-get-express-js-to-404-only-on-missing-routes.
         */
        http.use("*", (request: Request, response: Response, next: NextFunction) => {
            const information = {
                message: `Requested route [${request.baseUrl}] not found.`,
                http: { code: 404 },
                
            };

            const message = information.message;
            response.status(information.http.code).send({ message });
            
            logger.warn(information);
            next(); // call next middleware
        });

        /**
         * Handle all errors, log it and send response.
         */
        http.use(( error: Error, request: Request, response: Response, next: NextFunction) => {

            const information = {
                message: "Server side error. Please contact team support.",
                http: { code: 500 },
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
            };

            /**
             * HTTP response sent.
             */
            response.status(information.http.code).send({
                message: information.message,
                error: error.message,
            });

            logger.error(information);
            next(); // call next middleware
        }
        );
    }
}
