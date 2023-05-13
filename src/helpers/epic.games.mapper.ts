import { logger } from "../config/logger.config";
import { GameInterface } from "../interfaces/game.interface";
import { Element } from "../interfaces/epic.games.interface";

export class EpicGamesMapper {
    static map(data: Element[]): GameInterface[] {
        try {
            const newElementsToSave: GameInterface[] = data.map((game) => {
                const newElement: GameInterface = {
                    title: game.title,
                    description:
                        game.description === "Mystery Game"
                            ? "Jeu mystère ! Celui-ci ne sera révélé que le jour de sa sortie. Rendez-vous le jour J pour le découvrir !"
                            : game.description,
                    urlSlug: constructUrl(game),
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
                    imageUrl: game.keyImages[1]?.url || game.keyImages[0]?.url,
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
}

function constructUrl(game: Element): string {
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
