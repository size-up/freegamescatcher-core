import { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";

import { logger } from "../config/logger";

export default class DefaultMiddleware {

    constructor(http: Express) {
        this.defaultMiddleware(http);
    }

    private defaultMiddleware(http: Express): void {
        /**
         * Log all API calls.
         */
        http.use((request: Request, response: Response, next: NextFunction) => {
            const information = {
                http: {
                    method: request.method,
                    url: request.originalUrl,
                    host: request.hostname,
                    ip: request.ip,
                    headers: request.headers
                }
            };

            logger.info("HTTP request received, see http object for details", information);
            next();
        });
    }
}
