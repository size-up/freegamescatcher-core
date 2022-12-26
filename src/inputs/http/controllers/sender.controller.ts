import { NextFunction, Request, Response, Router } from "express";
import { logger } from "../../../config/logger.config";
import SenderFacade from "../../../facade/sender.facade";
import { SendOptionsInterface } from "../../../interfaces/send.interface";

export default class SenderController {
    private router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        /**
         * Execute the full application process.
         */
        this.router.get("/", async (request: Request, response: Response, next: NextFunction) => {
            if (request.query.email || request.query.webhook) {
                if (
                    (request.query.email && request.query.email !== "true" && request.query.email !== "false") ||
                    (request.query.webhook && request.query.webhook !== "true" && request.query.webhook !== "false")
                ) {
                    response.status(400).json({ status: "Bad query parameter value, must be true or false" });
                    return;
                }
            }

            /**
             * Options to send to the sender facade.
             * By default, both email and webhook are enabled.
             */
            const options: SendOptionsInterface = {
                email: request.query.email !== "false",
                webhook: request.query.webhook !== "false",
            };

            try {
                const sender = new SenderFacade();
                const isOk = await sender.send(options);

                if (isOk) {
                    response.status(200).json({ status: "Core application process well executed" });
                } else {
                    response.status(500).json({ status: "Core application process failed" });
                }
            } catch (error) {
                const message = "Core application process failed";
                logger.error(message, error);
                response.status(500).json({ status: message });

                next(error);
            }
        });
    }

    public get(): Router {
        return this.router;
    }
}
