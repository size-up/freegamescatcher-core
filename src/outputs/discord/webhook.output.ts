import axios from "axios";
import packageJson from "../../../package.json";
import { logger } from "../../config/logger.config";
import { EmbedObject, Channel } from "../../interfaces/webhook.interface";

/**
 * Discord Webhook Output class.
 *
 * This class is used to send messages to a Discord channel using a webhook.
 */
export default class WebhookOutput {
    /**
     * Webhook configuration.
     */
    private config = {
        url: "https://discord.com/api/webhooks",
    };

    /**
     * Send content to one of multiple Webhook Discord channel(s).
     * @param channels List of Discord channel(s).
     * @param content Content to send.
     * @param embeds Embed array to send.
     * @param username Username to erase the default one.
     * @returns If the process was successful or not.
     * @throws Error if the process failed.
     */
    public async send(
        channels: Channel[],
        content?: string | null,
        embeds?: EmbedObject[],
        username?: string
    ): Promise<void> {
        if (channels.length > 0) {
            channels.forEach(async (webhook) => {
                logger.info(`Sending message to Discord channel ${webhook.name}...`);
                try {
                    await axios.post(`${this.config.url}/${webhook.id}/${webhook.token}`, {
                        username: username || packageJson.displayName,
                        content: content || null,
                        embeds: embeds || null,
                        avatar_url:
                            "https://raw.githubusercontent.com/size-up/freegamescatcher-core/main/src/assets/freegamescatcher_logo.png",
                    });
                    logger.info(`Message sent to Discord channel ${webhook.name}`);
                } catch (error) {
                    logger.error(`Error while sending message to Discord channel ${webhook.name}`, error);
                }
            });
        } else {
            logger.error("No Discord channel found, message is not sent");
        }
    }
}
