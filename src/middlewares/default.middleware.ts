import { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";

import { api } from "../config/security";
import { logger } from "../config/logger";

import UnauthorizedError from "../inputs/errors/unauthorized.error";
import ForbiddenError from "../inputs/errors/forbidden.error";

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

            /**
             * Authorize a GET request to /receivers used by email link.
             * It's a GET to avoid blocked popup from the email.
             */
            if (request.method === "GET" && request.originalUrl.startsWith("/receivers/delete")) {
                next(); // call next middleware
                return; // break the execution and do not check API key
            }

            /**
             * Check if the request is authorized.
             */
            if (!request.headers["x-api-key"]) {
                logger.error("Unauthorized request, missing [x-api-key] header");
                throw new UnauthorizedError();
            }

            /**
             * Check if the API key is valid.
             */
            if (request.headers["x-api-key"] && request.headers["x-api-key"] !== api.key) {
                logger.error(`Forbidden request, [x-api-key] header [${request.headers["x-api-key"]}] is not valid`);
                throw new ForbiddenError();
            }

            next(); // call next middleware
        });
    }
}
