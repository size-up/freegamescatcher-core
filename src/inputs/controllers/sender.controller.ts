import { NextFunction, Request, Response, Router } from "express";
import { logger } from "../../config/logger.config";
import SenderFacade from "../../facade/sender.facade";

export default class SenderController {
    private router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        /**
         * Execute the full application process.
         */
        this.router.get("/send", async (request: Request, response: Response, next: NextFunction) => {
            try {
                const sender = new SenderFacade();
                const isOk = await sender.send();

                if (isOk) {
                    response.status(200).json({ status: "Core application process well executed" });
                } else {
                    response.status(500).json({ status: "Core application process failed" });
                }
            } catch (error) {
                const message = "Core application process failed";
                logger.error(message, error);
                next(error);
            }
        });
    }

    public get(): Router {
        return this.router;
    }
}
