import axios from "axios";
import { EpicGamesMapperHelper } from "../../helpers/mappers/epic-games.mapper";
import { ClientInterface, ElementToSendInterface, EpicGamesDatasInterface } from "../../interfaces/client.interface";
import clientInformations from "./../../../data/client.json";
import fs from "fs";

export default class ClientEpicGames {
    private static clientInformations = clientInformations.epicGames;
    private static clientInterface: ClientInterface = {
        url: `${this.clientInformations.baseUrl}/${this.clientInformations.endpoint}`,
        params: this.clientInformations.params
    };
    private static data: EpicGamesDatasInterface;

    static async getDatas() {
        try {
            this.data = await axios.get(this.clientInterface.url, this.clientInterface.params);
            this.saveData();
        } catch (error) {
            console.log(error);
        }
    }

    private static saveData() {
        try {
            const elementsToSave: ElementToSendInterface[] = EpicGamesMapperHelper.map(this.data);
            
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
