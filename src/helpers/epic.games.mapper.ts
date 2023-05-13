import { logger } from "../config/logger.config";
import { GameInterface } from "../interfaces/game.interface";
import { Element } from "../interfaces/epic.games.interface";

export class EpicGamesMapper {
    static map(data: Element[]): GameInterface[] {
        try {
            const newElementsToSave: GameInterface[] = data.map((game) => {
                const newElement: GameInterface = {
                    title: game.title,
                    description: game.description,
                    urlSlug: `https://store.epicgames.com/fr/p/${
                        game.productSlug || game.catalogNs.mappings[0]?.pageSlug
                    }`,
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
