import { EpicGamesMapper } from "../helpers/epic.games.mapper";
import { Element } from "../interfaces/epic.games.interface";
import { GameInterface } from "../interfaces/game.interface";
import { EpicGamesOutput } from "../outputs/epic-games/epic.games.output";

import { logger } from "../config/logger.config";

export class GameService {
    private epicgames: EpicGamesOutput;

    constructor() {
        this.epicgames = new EpicGamesOutput();
    }

    public async getEpicGamesData(): Promise<GameInterface[]> {
        try {
            const data: Element[] = await Object(this.epicgames.getData());
            const filteredElements: Element[] = this.filterElements(data);
            const mappedElements: GameInterface[] = EpicGamesMapper.map(filteredElements);
            return mappedElements;
        } catch (error) {
            const message = "Error while filtering or mapping Epic Games data";
            logger.error(message, error);
            throw new Error(message);
        }
    }

    private filterElements(data: Element[]): Element[] {
        return data.filter((filteredGame) => {
            const state = this.isFreeGame(filteredGame);
            if (state === "now") {
                filteredGame.free = true;
                return true;
            } else if (state === "upcoming") {
                filteredGame.free = false;
                return true;
            }
        });
    }

    /**
     * For each received game, check if it is free or not, by checking if the `discountPercentage` is equal to 0.
     *
     * @param filteredGame The game to check if it's free.
     * @returns The state of the free game: "now" for free game now, "after" for free game next week, "none" if not free.
     */
    private isFreeGame(filteredGame: Element): string {
        let state = "none";

        const isCurrentlyFree = filteredGame.promotions?.promotionalOffers[0]?.promotionalOffers.some((element) => {
            return element.discountSetting?.discountPercentage === 0;
        });

        // If the game is free now, return "now"
        if (isCurrentlyFree) {
            return (state = "now");
        }

        const isUpcomingFree = filteredGame.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers.some(
            (element) => {
                return element.discountSetting?.discountPercentage === 0;
            }
        );

        // If the game will be free, return "upcoming"
        if (isUpcomingFree) {
            return (state = "upcoming");
        }

        // If no condition is filled, return "none"
        return state;
    }
}
