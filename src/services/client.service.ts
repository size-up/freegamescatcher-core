import { EpicGamesMapperHelper } from "../helpers/mappers/epic-games.mapper";
import { GameCacheDocumentInterface } from "../interfaces/cache.interface";
import {  EpicGamesDataInterface } from "../interfaces/client.interface";

import { EpicGamesOutput } from "../outputs/epic-games/client";

import { logger } from "../config/logger";

export class ClientService {
    private epicgames: EpicGamesOutput;

    constructor() {
        this.epicgames = new EpicGamesOutput();
    }

    public async getEpicGamesData(): Promise<GameCacheDocumentInterface[] | undefined> {
        try {
            const data: EpicGamesDataInterface = await Object(this.epicgames.getData());
            const mappedElements: GameCacheDocumentInterface[] = EpicGamesMapperHelper.map(data);
            return mappedElements;
        } catch (error) {
            logger.error("Error while calling Epic Games API", error);
        }
    }
}