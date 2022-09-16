import { EpicGamesMapperHelper } from "../helpers/mappers/epic-games.mapper";
import { ElementToSendInterface, EpicGamesDatasInterface } from "../interfaces/client.interface";
import fs from "fs";

export class ClientService {

    /**
     * Update `cache.json` with fresh datas from Epic Games
     * @param {EpicGamesDatasInterface} data Datas from Epic Games
     */
    public async updateCache(data: EpicGamesDatasInterface): Promise<void> {
        try {
            const elementsToSave: ElementToSendInterface[] = EpicGamesMapperHelper.map(data);
            
            if (elementsToSave.length) {
                fs.writeFile("src/data/cache.json", JSON.stringify(elementsToSave, null, 4), () => {
                    console.log("Cache Updated !");
                });
                // TODO: Send mail with `elementsToSave`
            }
        } catch (err) {
            console.log(err);
        }        
    }
}