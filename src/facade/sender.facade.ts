import { logger } from "../config/logger.config";
import { DataService } from "../services/data.service";
import { GameService } from "../services/game.service";
import { EmailService } from "../services/email.service";
import { GameInterface } from "../interfaces/game.interface";

/**
 * This facade class is responsible for:
 * - Retrieving the games list from the API.
 * - Updating the cache.
 * - Retrieving the receivers list.
 * - Send the games list to the receivers.
 */
export default class SenderFacade {
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
     * @returns If the process was successful or not.
     */
    public async send(): Promise<Boolean> {
        let executed = false;

        logger.info("Starting the core application process...");

        // Retrieve game list from games API.
        const games: GameInterface[] = await this.client.getEpicGamesData();

        if (games) {
            // Update games list in the cache.
            this.data.updateCache(games);

            // Retrieve receivers list from the cache.
            const receivers = await this.data.getReceivers();

            // Send game list to receivers.
            if (receivers) {
                try {
                    await this.email.sendEmails(
                        "Les nouveaux jeux de la semaine sur l'Epic Games Store",
                        receivers,
                        games
                    );

                    logger.info("Core application process finished successfully");
                    executed = true;
                } catch (error) {
                    logger.error(error);
                    executed = false;
                }
            } else {
                executed = false;
                logger.error("No receivers found, core application process is aborted");
            }
        } else {
            executed = false;
            logger.error("No games found, core application process is aborted");
        }

        return executed;
    }
}
