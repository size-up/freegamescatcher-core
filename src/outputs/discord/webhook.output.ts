import axios from "axios";
import packageJson from "../../../package.json";
import { logger } from "../../config/logger.config";
import { ChannelInterface, EmbedObject } from "../../interfaces/webhook.interface";

/**
 * Discord Webhook Output class.
 *
 * This class is used to send messages to a Discord channel using a webhook.
 */
export class WebhookOutput {
    /**
     * Webhook Discord API configuration.
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
        channels: ChannelInterface[],
        content?: string | null,
        embeds?: EmbedObject[],
        username?: string
    ): Promise<boolean> {
        let responses: Promise<boolean>[] = [];

        const avatarUrl =
            "https://raw.githubusercontent.com/size-up/freegamescatcher-core/main/src/assets/freegamescatcher_logo.png";

        if (channels && channels.length > 0) {
            responses = channels.map(async (channel) => {
                const channelInformations = `server: [${channel.server}], channel: [${channel.name}]`;

                logger.info(`Sending message to Discord webhook ${channelInformations} ...`);

                try {
                    const response = await axios.post(`${this.config.url}/${channel.id}/${channel.token}`, {
                        username: username || packageJson.displayName,
                        content: content || null,
                        embeds: embeds || null,
                        avatar_url: avatarUrl,
                    });

                    /**
                     * Send contact message to Discord channel randomly
                     * with a 25% chance to send it.
                     */
                    if (Math.random() < 0.25) {
                        await axios.post(`${this.config.url}/${channel.id}/${channel.token}`, {
                            username: username || packageJson.displayName,
                            content:
                                "Ces messages sont envoyés automatiquement.\nSi vous détectez quelque chose qui vous semble incorrect (un lien mort 💀 ou un bug 🐛) vous pouvez contacter RAIIIIIN#2304 ou Bediver#5058 sur Discord.",
                            avatar_url: avatarUrl,
                        });
                    }

                    if (response.status === 204) {
                        logger.info(`Message sent to Discord ${channelInformations}`);
                        return true;
                    } else {
                        logger.error(
                            `Error while sending message to Discord ${channelInformations} with status code: ${response.status}`
                        );
                        return false;
                    }
                } catch (error) {
                    logger.error("Error while sending message to Discord channels", error);
                    return false;
                }
            });
        } else {
            logger.error("No Discord channel found, no message sent");
            return false;
        }

        return !(await Promise.all(responses)).includes(false);
    }
}
