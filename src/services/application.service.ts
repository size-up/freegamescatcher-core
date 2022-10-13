import { logger } from "../config/logger";
import { ClientService } from "./client.service";
import { DataService } from "./data.service";
import { EmailSenderService } from "./emailSender.service";

/**
 * This class is responsible for get games data
 * from the API and send it to the receivers.
 */
export default class ApplicationService {

    public async execute(): Promise<Boolean> {
        let executed = false;
        
        // Retrieve game list from games API.
        const client = new ClientService();
        const games = await client.getEpicGamesData();
        
        // Update games list in the cache.
        const data = DataService.getInstance();
        if (games) {
            data.updateCache(games);

            // Retrieve receivers list from the cache.
            const receivers = await data.getReceivers();
    
            // Send game list to receivers.
            const email = new EmailSenderService();
            if (receivers) {
                try {
                    await email.sendEmails("Epic Games Store - Nouveaux jeux", receivers, games);
                    executed = true;
                } catch (error) {
                    logger.error(error);
                    executed = false;
                }
            } else {
                executed = false;
                logger.error("No games or receivers found, process is aborted");
            }
        }

        return executed;
    }
}