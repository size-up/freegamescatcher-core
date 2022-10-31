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
         * Create one receiver.
         */
        this.router.post("/", async (request: Request, response: Response, next: NextFunction) => {
            try {
                const res = await this.receiverService.create(request.body);
                return response.status(200).json({ status: "Receiver created.", receiver: res });
            } catch (error) {
                next(error);
            }
        });

        /**
         * Delete one receiver.
         *
         * Warning: this route should be a DELETE request, but for the sake of email links security, it's a GET request.
         */
        this.router.get("/delete/:uuid", async (request: Request, response: Response, next: NextFunction) => {
            try {
                const deleted: boolean = await this.receiverService.delete(request.params.uuid);
                if (deleted) {
                    return response
                        .status(200)
                        .send("<h2>Votre email ne figurera plus dans la liste des notifiés.</h2>");
                }
                throw new Error("Error during deleting receiver from subscribers list");
            } catch (error) {
                next(error);
            }
        });
    }

    public get(): Router {
        return this.router;
    }
}
