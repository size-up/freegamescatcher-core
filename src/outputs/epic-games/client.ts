import axios from "axios";

import { ClientInterface } from "../../interfaces/client.interface";

import clientInformations from "./../../data/client.json";

export default class ClientEpicGames {
    private static clientInformations = clientInformations.epicGames;
    private static clientInterface: ClientInterface = {
        url: `${this.clientInformations.baseUrl}/${this.clientInformations.endpoint}`,
        params: this.clientInformations.params
    };

    static async getDatas() {
        try {
            const data = await axios.get(this.clientInterface.url, this.clientInterface.params);
            console.log(data);
            return data;
        } catch (error) {
            console.log(error);
        }
    }
}
