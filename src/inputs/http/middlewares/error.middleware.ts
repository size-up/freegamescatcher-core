import { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";

import { logger } from "../../../config/logger.config";

import ForbiddenError from "../errors/forbidden.error";
import UnauthorizedError from "../errors/unauthorized.error";
import { httpLogContext } from "./http-log.context";

export default class ErrorMiddleware {
    public static init(http: Express): Express {
        /**
         * Catch all not found route.
         * See this https://stackoverflow.com/questions/11500204/how-can-i-get-express-js-to-404-only-on-missing-routes.
         */
        http.use("*", (request: Request, response: Response, next: NextFunction) => {
            const message = `Requested route [${request.baseUrl}] not found.`;
            const code = 404;
            const information = httpLogContext(request, code);

            response.status(code).send({ message });
            logger.warn(message, information);

            next(); // call next middleware
        });

        /**
         * Handle all errors, log it and send response.
         */
        http.use((error: Error, request: Request, response: Response, next: NextFunction) => {
            const message = "Server side error. Please contact team support.";
            const code = 500;
            const information = {
                ...httpLogContext(request, code),
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            };

            /**
             * Handle custom errors.
             */
            if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
                response.status(error.status).send({ message: error.message, details: error.details });
            } else {
                /**
                 * Handle all other errors.
                 */
                response.status(code).send({
                    message: message,
                    error: error.message,
                });
                logger.error(message, information);
            }

            next(); // call next middleware
        });

        return http;
    }
}
