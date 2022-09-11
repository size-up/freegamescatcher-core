import client from "../outputs/epic-games/client";

import { ServiceInterface } from "../interfaces/service.interface";

export class EpicGamesService implements ServiceInterface {
    public async getGames(): Promise<string> {
        const data = await client.getDatas();
        return "games";
    }
    public async getPrices(): Promise<string> {
        const data = await client.getDatas();
        return "prices";
    }
}   