import { logger } from "../config/logger.config";
import { GameInterface } from "../interfaces/game.interface";
import { ChannelInterface, EmbedObject } from "../interfaces/webhook.interface";
import WebhookOutput from "../outputs/discord/webhook.output";

export class WebhookService {
    private webhook = new WebhookOutput();

    /**
     * Send games to Discord channels.
     * @param channels Discord channels
     * @param games Games to send
     */
    public async send(channels: ChannelInterface[], games: GameInterface[]): Promise<boolean> {
        const embeds: EmbedObject[] = [];

        games.map((game) => {
            // if the game is available from now
            if (new Date(game.promotion.startDate).getTime() < new Date().getTime()) {
                logger.debug(`Pushing game [${game.title}] to embeds array`);

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
                            value: `🗓️ ${new Date(game.promotion.startDate).toLocaleDateString("fr-FR")}`,
                        },
                        {
                            name: "⚠️ Le contenu ne sera plus disponible après le :",
                            value: `🗓️ ${new Date(game.promotion.endDate).toLocaleDateString("fr-FR")}`,
                        },
                    ],
                    image: {
                        url: game.imageUrl,
                    },
                    // timestamp: new Date(),
                    footer: {
                        text: `Message envoyé le ${new Date().toLocaleDateString(
                            "fr-FR"
                        )} à ${new Date().toLocaleTimeString("fr-FR")}`,
                        icon_url: "https://cdn-icons-png.flaticon.com/512/1134/1134154.png",
                    },
                });
            }
        });

        if (embeds != undefined && embeds.length > 0) {
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
            logger.info("No free games available for now, webhook not sent");
            return false;
        }
    }
}
