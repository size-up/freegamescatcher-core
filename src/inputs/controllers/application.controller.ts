import { Request, Response, Router } from "express";
import { logger } from "../../config/logger.config";
import CoreFacade from "../../facade/core.facade";
import { CoreProcessInterface } from "../../interfaces/core.interface";

export default class ApplicationController {
    private router = Router();
    private failed = { message: "Core application process failed, error occurred" };

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        /**
         * Execute the full application process.
         */
        this.router.post("/execute", async (request: Request, response: Response) => {
            const processOptions : CoreProcessInterface = request.body;

            try {
                const core = new CoreFacade();
                const isOk = await core.execute(processOptions);

                if (isOk) {
                    response.status(200).json({ status: "Core application process well executed" });
                } else {
                    response.status(500).json({ status: "Core application process failed" });
                }
            } catch (error) {
                logger.error(this.failed.message, error);
                throw new Error(this.failed.message);
            }
        });
    }

    public get(): Router {
        return this.router;
    }
}
