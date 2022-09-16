import axios from "axios";
import { ClientInterface, EpicGamesDatasInterface } from "../../interfaces/client.interface";
import { ClientService } from "../../services/client.service";
import clientInformations from "./../../../data/client.json";

export class ClientEpicGames {
    private clientInformations = clientInformations.epicGames;
    private clientParamsConnection: ClientInterface; 
    private clientService: ClientService;

    constructor() {
        this.clientService = new ClientService();
        this.clientParamsConnection = {
            url: `${this.clientInformations.baseUrl}/${this.clientInformations.endpoint}`,
            params: this.clientInformations.params
        };
    }

    /**
     * Retrieve datas from Epic-Games store
     */
    async getDatas() {
        try {
            const data: EpicGamesDatasInterface = await axios.get(this.clientParamsConnection.url, this.clientParamsConnection.params);
            this.clientService.updateCache(data);
        } catch (error) {
            console.log(error);
        }
    }
}
