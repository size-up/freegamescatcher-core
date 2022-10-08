import { NextFunction, Request, Response, Router } from "express";
import ReceiverService from "../../services/receiver.service";

export default class ReceiverController {
    private router = Router();
    private receiverService: ReceiverService = new ReceiverService();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        /**
         * Get all receivers
         */
        this.router.get( "/", (request: Request, response: Response, next: NextFunction) => {
            try {
                response.status(200).json(this.receiverService.getAll());
            } catch (error) {
                next(error);
            }
        }
        );

        /**
         * Create one receiver
         */
        this.router.post( "/", (request: Request, response: Response, next: NextFunction) => {
            try {
                this.receiverService.create(request.body);
                response.status(200).json({ status: "Receiver created." });
            } catch (error) {
                next(error);
            }
        }
        );

        /**
         * Delete one receiver
         */
        this.router.delete( "/:id", (request: Request, response: Response, next: NextFunction) => {
            try {
                this.receiverService.delete(request.params.id);
                response.status(200).json({ status: "Receiver deleted." });
            } catch (error) {
                next(error);
            }
        }
        );
    }

    public get(): Router {
        return this.router;
    }
}
