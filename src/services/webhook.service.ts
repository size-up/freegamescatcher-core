import { logger } from "../config/logger.config";
import { GameInterface } from "../interfaces/game.interface";
import { ChannelInterface, EmbedObject } from "../interfaces/webhook.interface";
import { WebhookOutput } from "../outputs/discord/webhook.output";

export class WebhookService {
    private webhook = new WebhookOutput();

    /**
     * Send games to Discord channels.
     * @param channels Discord channels
     * @param games Games to send
     */
    public async send(channels: ChannelInterface[], games: GameInterface[]): Promise<boolean> {
        const embeds: EmbedObject[] = [];

        const today = new Date();
        logger.debug(`Today is [${today.toLocaleDateString("fr-FR")}]`);

        games.forEach((game) => {
            // check if the promotion date is inferior to today
            // and if the promotion date is superior to today
            if (new Date(game.promotion.startDate) < today && new Date(game.promotion.endDate) > today) {
                logger.debug(
                    `[${game.title}] with promotion start date (${new Date(game.promotion.startDate).toLocaleDateString(
                        "fr-FR"
                    )}) is lower than today (${today.toLocaleDateString("fr-FR")})`
                );

                embeds.push({
                    color: 0x113c55, // blue color
                    title: game.title,
                    url: game.urlSlug,
                    author: {
                        name: "Epic Games Store",
                        icon_url: "https://static-00.iconduck.com/assets.00/epic-games-icon-512x512-7qpmojcd.png",
                        url: "https://store.epicgames.com/fr/",
                    },
                    description: `Description : ${game.description}`,
                    thumbnail: {
                        url: game.imageUrl,
                    },
                    fields: [
                        {
                            name: "🏁 Le contenu est disponible depuis le :",
                            value: `🗓️ ${new Date(game.promotion.startDate).toLocaleDateString("fr-FR", {
                                dateStyle: "full",
                            })}`,
                        },
                        {
                            name: "⚠️ Le contenu ne sera plus disponible après le :",
                            value: `🗓️ ${new Date(game.promotion.endDate).toLocaleDateString("fr-FR", {
                                dateStyle: "full",
                            })}`,
                        },
                    ],
                    image: {
                        url: game.imageUrl,
                    },
                    // timestamp: new Date(),
                    footer: {
                        text: `Message envoyé le ${today.toLocaleDateString("fr-FR", {
                            dateStyle: "full",
                        })} à ${today.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" })}`,
                        icon_url: "https://cdn-icons-png.flaticon.com/512/1134/1134154.png",
                    },
                });
            }
        });

        if (embeds !== undefined && embeds.length > 0 && channels !== undefined && channels.length > 0) {
            try {
                return await this.webhook.send(
                    channels,
                    "Hey ! De nouveaux jeux sont disponibles sur l'Epic Games Store !\nClique sur le titre du jeu pour ouvrir directement l'offre sur le site et récupérer son contenu ! 🎮 🔥",
                    embeds
                );
            } catch (error) {
                logger.error(error);
                return false;
            }
        } else {
            const message = "No free games available for now, webhook not sent";
            if (embeds !== undefined && embeds.length === 0)
                logger.info(`${message} because there is no embeds to send`);
            if (channels !== undefined && channels.length === 0)
                logger.info(`${message} because there is no channels to send`);

            return false;
        }
    }
}
