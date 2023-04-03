import { NextFunction, Request, Response, Router } from "express";
import { logger } from "../../config/logger.config";
import CoreFacade from "../../facade/core.facade";

export default class ApplicationController {
    private router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        /**
         * Execute the full application process.
         */
        this.router.get("/execute", async (request: Request, response: Response, next: NextFunction) => {
            try {
                const core = new CoreFacade();
                const isOk = await core.execute();

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
