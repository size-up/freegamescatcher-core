import { ClientEpicGames } from "../outputs/epic-games/client";

import { GameServiceInterface } from "../interfaces/service.interface";

export class EpicGamesService implements GameServiceInterface {
    public async getGames(): Promise<string> {
        try {
            const clientEpicGames = new ClientEpicGames();
            const data = clientEpicGames.getDatas();

            // TODO: change temporary return Promise to data from client
            return Promise.resolve("client data");
        } catch (error) {
            throw new Error("Cannot get Epic Games data from client");
        }
    }
}
