import { logger } from "../config/logger.config";
import { GameInterface } from "../interfaces/game.interface";
import { Channel, EmbedObject } from "../interfaces/webhook.interface";
import WebhookOutput from "../outputs/discord/webhook.output";

export default class WebhookService {
    private webhook = new WebhookOutput();

    public async sendGameNotification(channels: Channel[], games: GameInterface[]) {
        const embeds: EmbedObject[] = [];
        games.map((game) => {
            if (new Date(game.promotion.startDate).getTime() < Date.now()) {
                embeds.push({
                    color: 0x9900ff, // purple
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
                            name: "Le contenu est disponible à partir du :",
                            value: new Date(game.promotion.startDate).toLocaleString(),
                        },
                    ],
                    image: {
                        url: game.imageUrl,
                    },
                    timestamp: new Date(game.promotion.endDate),
                    footer: {
                        text: "⚠️ Date de fin de la promotion",
                        icon_url: "https://icon-library.com/images/date-icon/date-icon-1.jpg",
                    },
                });
            }
        });

        if (embeds != undefined && embeds.length > 0) {
            await this.webhook.send(
                channels,
                `Hey ! De nouveaux jeux sont disponibles sur l'Epic Games Store !
Clique sur le titre du jeu pour ouvrir directement l'offre sur le site et récupérer son contenu ! 🎮 🔥`,
                embeds
            );

            logger.info("Message(s) webhook about free games sent");
        } else {
            logger.info("No free games available for now, webhook not sent");
        }
    }
}
