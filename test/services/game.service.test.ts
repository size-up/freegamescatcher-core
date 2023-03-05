import { logger } from "../../src/config/logger.config";
import { Element } from "../../src/interfaces/epic.games.interface";
import { EpicGamesOutput } from "../../src/outputs/epic-games/epic.games.output";
import { GameService } from "../../src/services/game.service";

import gamesJson from "../data/games.json";

jest.mock("../../src/outputs/epic-games/epic.games.output.ts");

beforeAll(() => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

describe("GameService", () => {
    test(`given Epic Games client that return undefined,
    when get Epic Games data,
    then throw error`, async () => {
        // given
        const data = jest.spyOn(EpicGamesOutput.prototype, "getData");
        data.mockResolvedValue(undefined);

        const gamesClient = new GameService();
        const spyService = jest.spyOn(gamesClient, "getEpicGamesData");

        // when
        try {
            await gamesClient.getEpicGamesData();
        } catch (error) {
            // then
            expect(spyService).toHaveBeenCalledTimes(1);

            expect(error).toBeInstanceOf(Error);
            expect(error).toStrictEqual(Error("Error while filtering or mapping Epic Games data"));
        }
    });

    test(`given Epic Games client that return 26 games with 8 free games with 4 actually free and 4 upcoming, 
    when get Epic Games data,
    then expect to receive 4 games, with 2 games actually free and 2 games that they're going to be free`, async () => {
        // given
        const games: Element[] = Object(gamesJson);
        expect(games).toHaveLength(41);

        // Actual and upcoming free games.
        expect(
            games.filter(
                (game) =>
                    game.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage ===
                        0 ||
                    game.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers.some((element) => {
                        return element.discountSetting?.discountPercentage === 0;
                    })
            )
        ).toHaveLength(12);

        // Actual free games.
        expect(
            games.filter(
                (game) =>
                    game.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage ===
                    0
            )
        ).toHaveLength(7);

        // Upcoming free games.
        expect(
            games.filter((game) =>
                game.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers.some((element) => {
                    return element.discountSetting?.discountPercentage === 0;
                })
            )
        ).toHaveLength(5);

        const data = jest.spyOn(EpicGamesOutput.prototype, "getData");
        data.mockResolvedValue(games);

        // when
        const gamesClient = new GameService();

        const spyGetEpicGames = jest.spyOn(gamesClient, "getEpicGamesData");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyFilter = jest.spyOn(gamesClient as any, "filterElements");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyIsFreeGames = jest.spyOn(gamesClient as any, "isFreeGame");

        const epicGamesData = await gamesClient.getEpicGamesData();

        // then
        expect(spyGetEpicGames).toHaveBeenCalledTimes(1);
        expect(spyFilter).toHaveBeenCalledTimes(1);
        expect(spyIsFreeGames).toHaveBeenCalledTimes(41); // because there is 41 games

        expect(spyIsFreeGames.mock.results.filter((result) => result.value === "now")).toHaveLength(7);
        expect(spyIsFreeGames.mock.results.filter((result) => result.value === "upcoming")).toHaveLength(5);
        expect(spyIsFreeGames.mock.results.filter((result) => result.value === "none")).toHaveLength(29);

        expect(epicGamesData).toBeTruthy();
        expect(epicGamesData).toHaveLength(12); // because there is 12 free games

        epicGamesData?.forEach((game) => {
            expect(game).toHaveProperty("title");
            expect(game).toHaveProperty("description");
            expect(game).toHaveProperty("imageUrl");
            expect(game).toHaveProperty("promotion");
            expect(game).toHaveProperty("urlSlug");
        });
    });
});
