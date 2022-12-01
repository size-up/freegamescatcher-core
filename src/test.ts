import { EmbedObject } from "./interfaces/webhook.interface";
import { GameInterface } from "./interfaces/game.interface";
import WebhookOutput from "./outputs/discord/webhook.output";
import { GameService } from "./services/game.service";

async function testingEmbeds() {
    const embed: EmbedObject = {
        color: 0x0099ff,
        title: "Some title",
        url: "https://discord.js.org",
        author: {
            name: "Some name",
            icon_url: "https://i.imgur.com/AfFp7pu.png",
            url: "https://discord.js.org",
        },
        description: "Some description here",
        thumbnail: {
            url: "https://i.imgur.com/AfFp7pu.png",
        },
        fields: [
            {
                name: "Regular field title",
                value: "Some value here",
            },
            {
                name: "\u200b",
                value: "\u200b",
                inline: false,
            },
            {
                name: "Inline field title",
                value: "Some value here",
                inline: true,
            },
            {
                name: "Inline field title",
                value: "Some value here",
                inline: true,
            },
            {
                name: "Inline field title",
                value: "Some value here",
                inline: true,
            },
        ],
        image: {
            url: "https://i.imgur.com/AfFp7pu.png",
        },
        timestamp: new Date(),
        footer: {
            text: "Some footer text here",
            icon_url: "https://i.imgur.com/AfFp7pu.png",
        },
    };

    const embeds = [embed];

    const webhook = new WebhookOutput();
    const response = await webhook.send("Hey! A new free game is available on Epic Games Store", embeds);
    console.log(`Webhook sent, status: ${response.status}`);
}

async function testingWebhook() {
    const game = new GameService();
    const games: GameInterface[] = await game.getEpicGamesData();

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

    const webhook = new WebhookOutput();

    if (embeds != undefined && embeds.length > 0) {
        const response = await webhook.send(
            `Hey ! De nouveaux jeux sont disponibles sur l'Epic Games Store !
Clique sur le titre du jeu pour ouvrir directement l'offre sur le site et récupérer son contenu ! 🎮 🔥`,
            embeds
        );
        console.log(`Message(s) webhook about free games sent, status: ${response.status}`);
    } else {
        console.log("No free games available for now, webhook not sent");
    }
}

// testingEmbeds();
testingWebhook();
