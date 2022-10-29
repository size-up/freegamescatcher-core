import axios from "axios";
import { ClientInterface, Element, EpicGamesDataInterface } from "../../interfaces/client.interface";
import clientInformations from "../../../data/client.json";

import { logger } from "../../config/logger.config";

export class EpicGamesOutput {
    private clientInformations = clientInformations.epicGames;
    private clientParamsConnection: ClientInterface; 

    constructor() {
        this.clientParamsConnection = {
            url: `${this.clientInformations.baseUrl}/${this.clientInformations.endpoint}`,
            params: this.clientInformations.params
        };
    }

    /**
     * Retrieve datas from Epic-Games store
     */
    async getData(): Promise<Element[] | undefined> {
        try {
            const response: EpicGamesDataInterface = await axios.get(this.clientParamsConnection.url, {
                params: this.clientParamsConnection.params
            });
            const epicGamesElements: Element[] = response.data.data.Catalog.searchStore.elements;
            return epicGamesElements;
        } catch (error) {
            logger.error("An error has occurred while fetching Epic Games datas", error);
        }
    }
}
