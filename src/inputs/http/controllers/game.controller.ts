import { NextFunction, Request, Response, Router } from "express";
import { GameService } from "../../../services/game.service";
import { GameInterface } from "../../../interfaces/game.interface";

export default class GameController {
    private router = Router();
    private gameService: GameService = new GameService();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        /**
         * Get all receivers.
         */
        this.router.get("/epic-games", async (request: Request, response: Response, next: NextFunction) => {
            try {
                const games: GameInterface[] | null = await this.gameService.getEpicGamesData();
                if (games) {
                    return response.status(200).json({ receivers: games });
                } else {
                    return response.status(404);
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
