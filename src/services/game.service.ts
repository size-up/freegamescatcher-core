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
        return data.filter((filteredGame) => this.isFreeGame(filteredGame));
    }

    /**
     * For each received game, check if it is free or not, by checking if the `discountPercentage` is equal to 0.
     *
     * @param filteredGame The game to check if it's free.
     * @returns true if the game is free, false if not.
     */
    private isFreeGame(filteredGame: Element): boolean {
        // If the game is currently free, then return true.
        const isCurrentlyFree =
            filteredGame.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage ===
            0;

        // If the game isn't free, with a boolean to false, then check if it'll be free in the future.
        // If is, return true, if not, return false.
        if (!isCurrentlyFree) {
            return (
                filteredGame.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0]?.discountSetting
                    ?.discountPercentage === 0
            );
        }

        // If the game is free, return true. In any case.
        return isCurrentlyFree;
    }
}
