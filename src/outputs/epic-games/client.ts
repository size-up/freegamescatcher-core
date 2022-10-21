import axios from "axios";
import { ClientInterface } from "../../interfaces/client.interface";
import clientInformations from "./../../../data/client.json";

import { logger } from "../../config/logger";

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
    async getData() {
        try {
            return axios.get(this.clientParamsConnection.url, {
                params: this.clientParamsConnection.params
            });
        } catch (error) {
            logger.error("An error has occurred while fetching Epic Games datas", error);
        }
    }
}
