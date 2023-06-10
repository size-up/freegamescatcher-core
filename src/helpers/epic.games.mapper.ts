import { logger } from "../config/logger.config";
import { GameInterface } from "../interfaces/game.interface";
import { Element, KeyImage } from "../interfaces/epic.games.interface";

export class EpicGamesMapper {
    public static map(data: Element[]): GameInterface[] {
        try {
            const newElementsToSave: GameInterface[] = data.map((game) => {
                const newElement: GameInterface = {
                    title: game.title,
                    description:
                        game.description === "Mystery Game"
                            ? "Jeu mystère ! Celui-ci ne sera révélé que le jour de sa sortie. Rendez-vous le jour J pour le découvrir !"
                            : game.description,
                    urlSlug: this.constructUrl(game),
                    promotion: {
                        startDate: game.free
                            ? game.promotions.promotionalOffers[0].promotionalOffers[0].startDate.toString()
                            : game.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0].startDate.toString(),
                        endDate: game.free
                            ? game.promotions.promotionalOffers[0].promotionalOffers[0].endDate.toString()
                            : game.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0].endDate.toString(),
                    },
                    // we're using the second keyImage because the first one is too small, we generally prefer the second one
                    // when it's a "Mystery Game", the second keyImage is empty, so we take the first one
                    imageUrl: this.getGameImageUrl(game.title, game.keyImages),
                };
                return newElement;
            });
            return newElementsToSave;
        } catch (error) {
            const message = "Error while mapping Epic Games data";
            logger.error(message, error);
            throw new Error(message);
        }
    }

    private static constructUrl(game: Element): string {
        const productGamePage = "https://store.epicgames.com/fr/p";
        const freeGamePage = "https://store.epicgames.com/fr/free-games";

        // sometimes, productSlug is an empty array, so we need to check it,
        // in the case of a "Mystery Game", for example
        if (game.productSlug && game.productSlug != "[]") {
            return `${productGamePage}/${game.productSlug}`;
        } else if (game.catalogNs.mappings[0]?.pageSlug) {
            return `${productGamePage}/${game.catalogNs.mappings[0]?.pageSlug}`;
        } else {
            return freeGamePage;
        }
    }

    private static getGameImageUrl(title: string, keyImages: KeyImage[]): string {
        // imageTypes are ordered by priority, the first one is the most acceptable
        const imageTypes = ["OfferImageTall", "Thumbnail", "OfferImageWide", "VaultClosed"];

        for (const type of imageTypes) {
            const keyImage = keyImages.find((image) => image.type === type);
            if (keyImage && keyImage.url) {
                return keyImage.url;
            }
        }

        const message = `No keyImage found for game [${title}]`;
        logger.error(message);
        throw new Error(message);
    }
}
