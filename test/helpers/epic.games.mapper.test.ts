import { logger } from "../../src/config/logger.config";
import { EpicGamesMapper } from "../../src/helpers/epic.games.mapper";
import { GameInterface } from "../../src/interfaces/game.interface";
import { Element } from "../../src/interfaces/client.interface";
import gamesJSON from "../data/games.json";

beforeAll(() => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

describe("EpicGamesMapper", () => {
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
        const mappedGames: GameInterface[] = EpicGamesMapper.map(games);

        // then
        expect(mappedGames).toBeInstanceOf(Array);
        expect(mappedGames).toHaveLength(0);
    });

    test("given 26 elements to map, when map elements, then retrieve 26 games cache documents", () => {
        // given

        // when
        const mappedGames: GameInterface[] = EpicGamesMapper.map(games);

        // then
        expect(mappedGames).toHaveLength(26);
    });
});
