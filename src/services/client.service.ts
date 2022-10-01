import { EpicGamesMapperHelper } from "../helpers/mappers/epic-games.mapper";
import { ElementToSendInterface, EpicGamesDatasInterface } from "../interfaces/client.interface";
import fs from "fs";

export class ClientService {

    /**
     * Update `cache.epicgames.json` with fresh datas from Epic Games
     * @param {EpicGamesDatasInterface} data Datas from Epic Games
     */
    public updateCache(data: EpicGamesDatasInterface) {
        try {
            const elementsToSave: ElementToSendInterface[] = EpicGamesMapperHelper.map(data);
            
            if (elementsToSave.length) {
                fs.writeFileSync("data/cache.epicgames.json", JSON.stringify(elementsToSave, null, 4));
                console.log("EpicGames cache file was updated");
            }
        } catch (error) {
            console.log("An error has occurred while update EpicGames cache file", error);
        }        
    }
}