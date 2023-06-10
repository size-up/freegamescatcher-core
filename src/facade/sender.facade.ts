import { logger } from "../config/logger.config";

import { GameInterface } from "../interfaces/game.interface";
import { ReceiverInterface } from "../interfaces/receiver.interface";
import { SendOptionsInterface } from "../interfaces/send.interface";
import { ChannelInterface } from "../interfaces/webhook.interface";
import { DataService } from "../services/data.service";
import { EmailService } from "../services/email.service";
import { GameService } from "../services/game.service";
import { WebhookService } from "../services/webhook.service";

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
    private webhook: WebhookService;

    constructor() {
        this.client = new GameService();
        this.data = DataService.getInstance();
        this.email = new EmailService();
        this.webhook = new WebhookService();
    }

    /**
     * This method is responsible to do all the process of the application.
     * It will get the games data from the API, filter it and send it to the receivers list.
     * @returns If the process was successful or not.
     */
    public async send(options: SendOptionsInterface): Promise<boolean> {
        let executed = false;

        logger.info("Starting the core application process...");

        // Retrieve game list from games API.
        const games: GameInterface[] = await this.client.getEpicGamesData();

        if (games && games.length > 0) {
            // Update games list in the cache asynchronously.
            this.data.updateCache(games);

            if (options.email) {
                logger.info("Sending emails to receivers...");
                executed = await this.sendEmails(games, executed);
            } else {
                logger.info("Emails sending is disabled");
                executed = true;
            }

            if (options.webhook) {
                logger.info("Sending webhooks to channels...");
                executed = await this.sendWebhooks(games, executed);
            } else {
                logger.info("Webhooks sending is disabled");
                executed = true;
            }

            logger.info("Core application process finished successfully");
        } else {
            executed = false;
            logger.error("No games found, core application process is aborted");
        }

        return executed;
    }

    /**
     * This method is responsible to send the games list to the email receivers list.
     * @param games Games list to send.
     * @param executed If the process was successful or not.
     * @returns If the process was successful or not.
     */
    private async sendEmails(games: GameInterface[], executed: boolean): Promise<boolean> {
        // Retrieve receivers list from the cache.
        const receivers: ReceiverInterface[] | null = await this.data.getReceivers();

        // Send game list to receivers.
        if (receivers) {
            try {
                await this.email.sendEmails("Les nouveaux jeux de la semaine sur l'Epic Games Store", receivers, games);
                executed = true;
            } catch (error) {
                logger.error(error);
                executed = false;
            }
        } else {
            executed = false;
            logger.error("No receivers found, core application process is aborted");
        }

        return executed;
    }

    /**
     * This method is responsible to send the games list to the webhook channel list.
     * @param games Games list to send.
     * @param executed If the process was successful or not.
     * @returns If the process was successful or not.
     */
    private async sendWebhooks(games: GameInterface[], executed: boolean): Promise<boolean> {
        // Retrieve channels list from the cache.
        const channels: ChannelInterface[] | null = await this.data.getChannels();

        if (channels) {
            // Post game list to channels.
            executed = await this.webhook.send(channels, games);
        } else {
            executed = false;
            logger.error("No channels found, core application process is aborted");
        }

        return executed;
    }
}
