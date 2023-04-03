import { NextFunction, Request, Response, Router } from "express";
import ReceiverService from "../../services/receiver.service";
import { ReceiverInterface } from "../../interfaces/receiver.interface";

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
                const receiver: ReceiverInterface = await this.receiverService.create(request.body);
                return response.status(201).json({ receiver: receiver });
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
                    return response.status(200).send(
                        `<h1>Désinscription réussie.</h1>
                        <h2>Votre demande de désinscription a bien été prise en compte.</h2>`
                    );
                } else {
                    return response.status(404).send(
                        `<h1>Désinscription impossible.</h1>
                        <h2>La désinscription n'a pas pu être effectuée.</h2>`
                    );
                }
            } catch (error) {
                next(error);
            }
        });
    }

    public get(): Router {
        return this.router;
    }
}
