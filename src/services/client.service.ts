import { EpicGamesMapperHelper } from "../helpers/mappers/epic-games.mapper";
import { GameCacheDocumentInterface } from "../interfaces/cache.interface";
import {  EpicGamesDatasInterface } from "../interfaces/client.interface";
import fs from "fs";

import { logger } from "../config/logger";

export class ClientService {

    /**
     * Update `cache.epicgames.json` with fresh datas from Epic Games
     * @param {EpicGamesDatasInterface} data Datas from Epic Games
     */
    public updateCache(data: EpicGamesDatasInterface) {
        try {
            const elementsToSave: GameCacheDocumentInterface[] = EpicGamesMapperHelper.map(data);
            
            if (elementsToSave.length) {
                fs.writeFileSync("data/cache.epicgames.json", JSON.stringify(elementsToSave, null, 4));
                logger.info("EpicGames cache file was updated");
            }
        } catch (error) {
            logger.error("An error has occurred while update EpicGames cache file", error);
        }        
    }
}