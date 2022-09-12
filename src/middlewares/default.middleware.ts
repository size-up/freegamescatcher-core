import { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";

export default class DefaultMiddleware {

    constructor(http: Express) {
        this.initMiddleware(http);
    }

    private initMiddleware(http: Express) {
        /**
         * Catch all not found route.
         * See this https://stackoverflow.com/questions/11500204/how-can-i-get-express-js-to-404-only-on-missing-routes.
         */
        http.use("*", (request: Request, response: Response, next: NextFunction) => {
            response.status(404).send({ message: `Requested route [${request.baseUrl}] is not found.` });
            next(); // call next middleware
        });

        /**
         * Catch all errors.
         */
        http.use(( error: Error, request: Request, response: Response, next: NextFunction) => {
            response.status(500).send({
                message: "Error from the server. Please contact team support.",
                error: error.message,
            });
            next(); // call next middleware
        }
        );
    }
}
