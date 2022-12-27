import { logger } from "../config/logger.config";
import { CoreProcessInterface } from "../interfaces/core.interface";
import { GameInterface } from "../interfaces/game.interface";
import { ReceiverInterface } from "../interfaces/receiver.interface";
import { ChannelInterface } from "../interfaces/webhook.interface";
import { DataService } from "../services/data.service";
import { EmailService } from "../services/email.service";
import { GameService } from "../services/game.service";
import { WebhookService } from "../services/webhook.service";

/**
 * This facade class is responsible for get games data
 * from the API and send it to the receivers.
 */
export default class CoreFacade {
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
     * @returns If the process was successful or not.
     */
    public async execute(process: CoreProcessInterface): Promise<Boolean> {
        let isExecuted = false;

        logger.info("Starting core application process...");

        // Retrieve game list from games API.
        const games: GameInterface[] = await this.client.getEpicGamesData();

        if (games) {
            // Update game list in the cache.
            this.data.updateCache(games);

            if (process.email) {
                logger.info("Email process is true, so sending game list to the receivers");
                isExecuted = await this.emails(isExecuted, games);
            } else {
                logger.info("Email process is false, so skipping receivers");
            }

            if (process.webhook) {
                logger.info("Webhook process is true, so sending game list to the Discord channels");
                isExecuted = await this.webhooks(isExecuted, games);
            } else {
                logger.info("Webhook process is false, so skipping Discord channels");
            }
        } else {
            isExecuted = false;
            logger.error("No games found, core application process is aborted");
        }

        // Log the result of the process.
        if (isExecuted) {
            logger.info("Core application process is well executed");
        } else {
            logger.error("Core application process failed");
        }

        return isExecuted;
    }

    /**
     * This method is responsible to send the games list to the receivers.
     * @param games List of games to send.
     * @param executed If the process was successful or not.
     * @returns If the process was successful or not.
     * @throws Error if the process failed.
     */
    private async emails(executed: boolean, games: GameInterface[]): Promise<boolean> {
        // Retrieve receivers list from the cache.
        const receivers: ReceiverInterface[] | null = await this.data.getReceivers();

        // Send game list to receivers.
        if (receivers) {
            try {
                await this.email.sendEmails("Epic Games Store - Nouveaux jeux disponibles !", receivers, games);
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
     * This method is responsible to send the games list to the Discord channels.
     * @param games List of games to send.
     * @param executed If the process was successful or not.
     * @returns If the process was successful or not.
     * @throws Error if the process failed.
     */
    private async webhooks(executed: boolean, games: GameInterface[]): Promise<boolean> {
        // Retrieve channels list from data.
        const channels: ChannelInterface[] | null = await this.data.getChannels();

        // Send game list to Discord channels via webhook.
        if (channels) {
            try {
                await this.webhook.sendMessageForEpicGames(channels, games);
                executed = true;
            } catch (error) {
                logger.error(error);
                executed = false;
            }
        } else {
            executed = false;
            logger.error("No channels found, core application process is aborted");
        }

        return executed;
    }
}
