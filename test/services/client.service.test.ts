import { logger } from "../../src/config/logger";
import { Element } from "../../src/interfaces/client.interface";
import { ClientService } from "../../src/services/client.service";

import gamesJSON from "../data/games.json";

const data = jest.fn();
jest.mock("../../src/outputs/epic-games/client", () => {
    return {
        EpicGamesOutput: jest.fn().mockImplementation(() => {
            return {
                getData: data
            };
        })
    };
});

beforeAll(() => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

describe("Test Game Client service", () => {

    /**
     * Deep clone the games.json data.
     */
    let games: Element[];
    beforeEach(() => {
        games = JSON.parse(JSON.stringify(gamesJSON));
    });

    test(`given Epic Games client that return undefined,
    when get Epic Games data,
    then throw error`, async () => {
        // given
        data.mockResolvedValue(undefined);
        
        const clientService = new ClientService();
        const spyService = jest.spyOn(clientService, "getEpicGamesData");

        // when
        try {
            const epicGamesData = await clientService.getEpicGamesData();
        } catch (error) {
            // then
            expect(spyService).toHaveBeenCalledTimes(1);
        
            expect(error).toBeInstanceOf(Error);
            expect(error).toStrictEqual(Error("Error while filtering or mapping Epic Games data"));
        }
    });
    
    test(`given Epic Games client that return 12 games,
    when get Epic Games data,
    then expect to receive 4 games, with 2 games actually free and 2 games that they're going to be free`, async () => {
        // given
        expect(games).toHaveLength(12);

        // Actual free games.
        const freeGames = games.filter(game => game.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage === 0);
        expect(freeGames).toHaveLength(2);

        // Upcoming free games.
        const upcomingFreeGames = games.filter(game => game.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage === 0);
        expect(upcomingFreeGames).toHaveLength(2);

        data.mockResolvedValue(games);

        // when
        const clientService = new ClientService();

        const spyGetEpicGames = jest.spyOn(clientService, "getEpicGamesData");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyFilter = jest.spyOn(clientService as any, "filterElements");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyIsFreeGames = jest.spyOn(clientService as any, "isFreeGame");

        const epicGamesData = await clientService.getEpicGamesData();
        
        // then
        expect(spyGetEpicGames).toHaveBeenCalledTimes(1);
        expect(spyFilter).toHaveBeenCalledTimes(1);
        expect(spyIsFreeGames).toHaveBeenCalledTimes(12); // because there is 12 games.

        expect(epicGamesData).toBeTruthy();
        expect(epicGamesData).toBeDefined();
        expect(epicGamesData).toHaveLength(4);

        epicGamesData?.forEach(game => {
            expect(game).toHaveProperty("title");
            expect(game).toHaveProperty("description");
            expect(game).toHaveProperty("imageUrl");
            expect(game).toHaveProperty("promotion");
            expect(game).toHaveProperty("urlSlug");
        });
    });

    test(`given Epic Games client that return data with 5 games and only 2 free games,
    when get Epic Games data,
    then expect to receive only 2 free games`, async () => {
        // given

        /**
         * Retrieve all games that have a discount percentage greater than 0.
         * That means that the game is potentially free.
         * If it's greater than 0, then it's not free.
         */
        games = games.filter(game => game.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage >= 0);

        games.forEach(game => {
            expect(game.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage).toBeGreaterThanOrEqual(0);
        });

        expect(games).toHaveLength(5);

        data.mockResolvedValue(games);

        // when
        const clientService = new ClientService();

        const spyGetEpicGames = jest.spyOn(clientService, "getEpicGamesData");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyFilter = jest.spyOn(clientService as any, "filterElements");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyIsFreeGames = jest.spyOn(clientService as any, "isFreeGame");

        const epicGamesData = await clientService.getEpicGamesData();

        // then
        expect(spyGetEpicGames).toHaveBeenCalledTimes(1);
        expect(spyFilter).toHaveBeenCalledTimes(1);
        expect(spyIsFreeGames).toHaveBeenCalledTimes(5); // because there is 5 games.

        expect(epicGamesData).toBeTruthy();
        expect(epicGamesData).toBeDefined();
        expect(epicGamesData).toHaveLength(2);
    });
});
