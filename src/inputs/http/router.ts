import express, { Request, Response, Router as ExpressRouter } from "express";
import { Express } from "express-serve-static-core";

import packageJson from "../../../package.json";
import { version } from "../../config/application.config";
import { logger } from "../../config/logger.config";

import ReceiverController from "./controllers/receiver.controller";
import SenderController from "./controllers/sender.controller";
import DefaultMiddleware from "./middlewares/default.middleware";
import ErrorMiddleware from "./middlewares/error.middleware";

export default class Router {
    public static listen(port: number): void {
        const http: Express = express();

        this.configure(http).listen(port, () => {
            logger.info(`Application is listening on port [${port}]`);
        });
    }

    /**
     * Configure the application.
     *
     * **The order of the methods is important**, because middlewares are executed in the order they are defined.
     * @param http Express instance
     * @returns Express instance
     */
    private static configure(http: Express): Express {
        DefaultMiddleware.init(http);
        this.defineDefaultRoutes(http);
        http.use("/v1", RouterV1.init());
        ErrorMiddleware.init(http);

        return http;
    }

    /**
     * Define default routes.
     */
    private static defineDefaultRoutes(http: Express): Express {
        return http.get("/", (request: Request, response: Response) => {
            const application = {
                name: packageJson.displayName,
                version: version(),
                description: packageJson.description,
                repository: packageJson.repository.url,
            };
            response.status(200).json(application);
        });
    }
}

class RouterV1 {
    public static init(): ExpressRouter {
        const router: ExpressRouter = ExpressRouter();
        router.use("/send", new SenderController().get());
        router.use("/receivers", new ReceiverController().get());
        return router;
    }
}
