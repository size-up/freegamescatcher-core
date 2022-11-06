import { EpicGamesMapper } from "../helpers/epic.games.mapper";
import { GameCacheDocumentInterface } from "../interfaces/cache.interface";
import { Element } from "../interfaces/client.interface";

import { EpicGamesOutput } from "../outputs/epic-games/epic.games.output";

import { logger } from "../config/logger.config";

export class GameService {
    private epicgames: EpicGamesOutput;

    constructor() {
        this.epicgames = new EpicGamesOutput();
    }

    public async getEpicGamesData(): Promise<GameCacheDocumentInterface[]> {
        try {
            const data: Element[] = await Object(this.epicgames.getData());
            const filteredElements: Element[] = this.filterElements(data);
            const mappedElements: GameCacheDocumentInterface[] = EpicGamesMapper.map(filteredElements);
            return mappedElements;
        } catch (error) {
            const message = "Error while filtering or mapping Epic Games data";
            logger.error(message, error);
            throw new Error(message);
        }
    }

    private filterElements(data: Element[]): Element[] {
        return data.filter((filteredGame) => {
            const freeNowOrAfter = this.isFreeGame(filteredGame);
            if (freeNowOrAfter === "now") {
                filteredGame["free"] = true;
                return true;
            } else if (freeNowOrAfter === "after") {
                filteredGame["free"] = false;
                return true;
            }
        });
    }

    /**
     * For each received game, check if it is free or not, by checking if the `discountPercentage` is equal to 0.
     *
     * @param filteredGame The game to check if it's free.
     * @returns "now" for free game now, "after" for free game next week, "none" if not free
     */
    private isFreeGame(filteredGame: Element): string {
        let freeNowOrAfter = "none";

        const isCurrentlyFree =
            filteredGame.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage ===
            0;

        // The game is free now ? return "now"
        if (isCurrentlyFree) {
            return freeNowOrAfter = "now";
        } 
        const isAfterFree = filteredGame.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0]?.discountSetting
            ?.discountPercentage === 0;
        // The game is free after ? return "after"
        if (isAfterFree) {
            return freeNowOrAfter = "after";
        }
        // If no condition is filled, return "none"
        return freeNowOrAfter;
    }
}
