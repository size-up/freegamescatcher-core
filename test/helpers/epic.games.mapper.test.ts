import { logger } from "../../src/config/logger.config";
import { EpicGamesMapper } from "../../src/helpers/epic.games.mapper";
import { GameCacheDocumentInterface } from "../../src/interfaces/cache.interface";
import { Element } from "../../src/interfaces/client.interface";
import gamesJSON from "../data/games.json";

beforeAll(() => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

describe("Test Epic Games mapper", () => {
    /**
     * Deep clone the games.json data.
     */
    let games: Element[];
    beforeEach(() => {
        games = JSON.parse(JSON.stringify(gamesJSON));
    });

    test("given null to map, when map elements, then throw error", () => {
        // given
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data: Element[] = null!;

        try {
            // when
            EpicGamesMapper.map(data);
        } catch (error) {
            // then
            expect(error).toBeInstanceOf(Error);
            expect(error).toStrictEqual(Error("Error while mapping Epic Games data"));
        }
    });

    test("given undefined to map, when map elements, then throw error", () => {
        // given
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data: Element[] = undefined!;

        try {
            // when
            EpicGamesMapper.map(data);
        } catch (error) {
            // then
            expect(error).toBeInstanceOf(Error);
            expect(error).toStrictEqual(Error("Error while mapping Epic Games data"));
        }
    });

    test("given 0 elements to map, when map elements, then return an array of 0", () => {
        // given
        games.splice(0, games.length);
        expect(games).toHaveLength(0);

        // when
        const gameCacheDocuments: GameCacheDocumentInterface[] = EpicGamesMapper.map(games);

        // then
        expect(gameCacheDocuments).toBeInstanceOf(Array);
        expect(gameCacheDocuments).toHaveLength(0);
    });

    test("given 12 elements to map, when map elements, then retrieve 12 game cache documents", () => {
        // given

        // when
        const gameCacheDocuments: GameCacheDocumentInterface[] = EpicGamesMapper.map(games);

        // then
        expect(gameCacheDocuments).toHaveLength(12);
    });
});
