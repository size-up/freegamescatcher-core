import { logger } from "../config/logger.config";
import { DataService } from "../services/data.service";
import { GameService } from "../services/game.service";
import { EmailService } from "../services/email.service";

/**
 * This facade class is responsible for get games data
 * from the API and send it to the receivers.
 */
export default class CoreFacade {
    private client: GameService;
    private data: DataService;
    private email: EmailService;

    constructor() {
        this.client = new GameService();
        this.data = DataService.getInstance();
        this.email = new EmailService();
    }

    /**
     * This method is responsible to do all the process of the application.
     * It will get the games data from the API, filter it and send it to the receivers.
     * @returns If the process was successful.
     */
    public async execute(): Promise<Boolean> {
        let executed = false;
        
        // Retrieve game list from games API.
        const games = await this.client.getEpicGamesData();
        
        if (games) {

            // Update games list in the cache.
            this.data.updateCache(games);

            // Retrieve receivers list from the cache.
            const receivers = await this.data.getReceivers();
    
            // Send game list to receivers.
            if (receivers) {
                try {
                    await this.email.sendEmails("Epic Games Store - Nouveaux jeux", receivers, games);
                    executed = true;
                } catch (error) {
                    logger.error(error);
                    executed = false;
                }
            } else {
                executed = false;
                logger.error("No receivers found, process is aborted");
            }
        } else {
            executed = false;
            logger.error("No games found, process is aborted");
        }

        return executed;
    }
}