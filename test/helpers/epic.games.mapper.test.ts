import { logger } from "../../src/config/logger.config";
import { EpicGamesMapper } from "../../src/helpers/epic.games.mapper";
import { Element, KeyImage } from "../../src/interfaces/epic.games.interface";
import { GameInterface } from "../../src/interfaces/game.interface";

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

    describe("map", () => {
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
            expect(mappedGames).toHaveLength(41);
        });
    });

    describe("getGameImageUrl", () => {
        test("should return the URL of the first acceptable image type", () => {
            const title = "my-game";
            const keyImages: KeyImage[] = [
                {
                    type: "OfferImageTall",
                    url: "https://example.com/OfferImageTall.jpg",
                },
                {
                    type: "Thumbnail",
                    url: "https://example.com/Thumbnail.jpg",
                },
            ];

            expect(EpicGamesMapper["getGameImageUrl"](title, keyImages)).toBe("https://example.com/OfferImageTall.jpg");
            expect(EpicGamesMapper["getGameImageUrl"](title, keyImages)).not.toBe("https://example.com/Thumbnail.jpg");
        });

        test("should return the URL of the first acceptable image type", () => {
            const title = "my-game";
            const keyImages: KeyImage[] = [
                {
                    type: "Screenshot",
                    url: "https://example.com/Screenshot.jpg",
                },
                {
                    type: "Background",
                    url: "https://example.com/Background.jpg",
                },
                {
                    type: "VaultClosed",
                    url: "https://example.com/VaultClosed.jpg",
                },
                {
                    type: "OfferImageWide",
                    url: "https://example.com/OfferImageWide.jpg",
                },
            ];

            expect(EpicGamesMapper["getGameImageUrl"](title, keyImages)).toBe("https://example.com/OfferImageWide.jpg");
        });

        test("should throw an error if no acceptable image type is found", () => {
            const title = "my-game";
            const keyImages: KeyImage[] = [
                {
                    type: "Screenshot",
                    url: "https://example.com/Screenshot.jpg",
                },
                {
                    type: "Background",
                    url: "https://example.com/Background.jpg",
                },
                {
                    type: "VaultClosed",
                    url: null as unknown as string,
                },
                {
                    type: "OfferImageWide",
                    url: null as unknown as string,
                },
            ];

            expect(() => EpicGamesMapper["getGameImageUrl"](title, keyImages)).toThrowError(
                "No keyImage found for game [my-game]"
            );
        });

        test("should throw an error if no acceptable image type is found", () => {
            const title = "my-game";
            const keyImages: KeyImage[] = [
                {
                    type: "Screenshot",
                    url: "https://example.com/Screenshot.jpg",
                },
                {
                    type: "Background",
                    url: "https://example.com/Background.jpg",
                },
            ];

            expect(() => EpicGamesMapper["getGameImageUrl"](title, keyImages)).toThrowError(
                "No keyImage found for game [my-game]"
            );
        });
    });
});
