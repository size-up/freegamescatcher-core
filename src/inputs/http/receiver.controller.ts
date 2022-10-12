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
        this.router.get( "/", async (request: Request, response: Response, next: NextFunction) => {
            try {
                // TODO: Secure this route !
                // return response.status(200).json(await this.receiverService.getAll());
                return response.status(200).json({ message: "Not accessible" });
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
        this.router.get( "/delete/:uuid", async (request: Request, response: Response, next: NextFunction) => {
            try {
                const deleted: boolean = await this.receiverService.delete(request.params.uuid);
                if (deleted) {
                    return response.status(200).send("<h2>Votre email ne figurera plus dans la liste des notifiés</h2>");
                }
                throw new Error("Error during deleting receiver from subscribers list");
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
