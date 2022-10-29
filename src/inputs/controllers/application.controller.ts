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
        this.router.get( "/execute", async (request: Request, response: Response, next: NextFunction) => {
            try {
                const core = new CoreFacade();
                const isOk = await core.execute();
                
                if (isOk) {
                    response.status(200).json({ status: "Application process well executed" });
                } else {
                    response.status(500).json({ status: "Application process failed" });
                }
            } catch (error) {
                const message = "Process application runtime failed";
                logger.error(message, error);
                throw new Error(message);
            }
        }
        );
    }

    public get(): Router {
        return this.router;
    }
}
