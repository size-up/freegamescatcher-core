import cors from "cors";
import { json, NextFunction, Request, Response, urlencoded } from "express";
import { Express } from "express-serve-static-core";

import { logger } from "../../../config/logger.config";
import { api } from "../../../config/security.config";

import ForbiddenError from "../errors/forbidden.error";
import UnauthorizedError from "../errors/unauthorized.error";

export default class DefaultMiddleware {
    public static init(http: Express): Express {
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
                logger.warn("Bad request: body is missing");
                return response.status(400).json({ error: "Bad request", message: "Body is missing" });
            }

            /**
             * Authorize a GET request to /receivers used by email link.
             * It's a GET to avoid blocked popup from the email.
             */
            if (request.method === "GET" && request.originalUrl.startsWith("/v1/receivers/delete")) {
                logger.debug("GET request authorized to /v1/receivers/delete");
                next();
                return; // break the execution and do not check API key
            }

            /**
             * Check if the request is authorized.
             */
            if (!request.headers["x-api-key"]) {
                logger.warn("Unauthorized request: missing [x-api-key] header");
                throw new UnauthorizedError();
            }

            /**
             * Check if the API key is valid.
             */
            if (request.headers["x-api-key"] && request.headers["x-api-key"] !== api.key) {
                logger.warn(`Forbidden request: [${request.headers["x-api-key"]}] is not valid`);
                throw new ForbiddenError();
            }

            next(); // call next middleware
        });

        return http;
    }
}
