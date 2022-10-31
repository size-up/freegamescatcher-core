import { json, NextFunction, Request, Response, urlencoded } from "express";
import { Express } from "express-serve-static-core";
import cors from "cors";

import { api } from "../config/security.config";
import { logger } from "../config/logger.config";

import UnauthorizedError from "../inputs/errors/unauthorized.error";
import ForbiddenError from "../inputs/errors/forbidden.error";

export default class DefaultMiddleware {
    constructor(http: Express) {
        this.defaultMiddleware(http);
    }

    private defaultMiddleware(http: Express): void {
        /**
         * Use CORS and Body config for `post` requests
         */
        http.use(cors());
        http.use(urlencoded({ extended: true }));
        http.use(json());

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
                    headers: request.headers,
                },
            };

            logger.info("HTTP request received, see http object for details", information);

            /**
             * Check body presence in `POST` and `PUT` methods
             */
            if (["POST", "PUT"].includes(request.method) && !Object.entries(request.body).length) {
                logger.error("Bad request");
                return response.status(400).json({ error: "Bad request", message: "Body is missing" });
            }

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
