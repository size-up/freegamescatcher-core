/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../../src/config/logger.config";
import { GameInterface } from "../../src/interfaces/game.interface";
import { ReceiverInterface } from "../../src/interfaces/receiver.interface";
import { DriveOutput } from "../../src/outputs/google/drive.output";
import { DataService } from "../../src/services/data.service";

import receiverJson from "../data/receiver.json";

jest.mock("../../src/outputs/google/drive.output");

beforeAll(async () => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

describe("DataService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getReceivers()", () => {
        test(`given Drive output that return null,
        when calling getReceivers() from data service,
        then retrieve null value`, async () => {
            // given
            const receivers: ReceiverInterface[] | null = null;

            /**
             * Mock the private constructor and the `getInstance()` method of the DriveOutput class.
             */

            const mockedDriveOutput = new (DriveOutput as any)() as jest.Mocked<DriveOutput>; // jest.MockedObject<DriveOutput> is working too

            const mockGetDocument = mockedDriveOutput.getDocument.mockRejectedValue(Object(receivers));

            const mockDriveOutputInstance = jest.spyOn(DriveOutput, "getInstance").mockReturnValue(mockedDriveOutput);

            // when
            const dataService = new (DataService as any)(); // even if the constructor is private, we can still instantiate it, it's to avoid retrieve the instance from the singleton
            const result: ReceiverInterface[] | null = await dataService.getReceivers();

            // then
            expect(mockGetDocument).toBeCalledWith("receiver.json");
            expect(mockDriveOutputInstance).toHaveBeenCalledTimes(1);

            expect(result).toBeNull();
        });

        test(`given Drive output that return receivers data,
        when calling getReceivers() from data service,
        then retrieve receivers list`, async () => {
            // given
            const receivers: ReceiverInterface[] = receiverJson;

            /**
             * Mock the private constructor and the `getInstance()` method of the DriveOutput class.
             */

            const mockedDriveOutput = new (DriveOutput as any)() as jest.Mocked<DriveOutput>; // jest.MockedObject<DriveOutput> is working too

            const mockGetDocument = mockedDriveOutput.getDocument.mockResolvedValue(Object(receivers));

            const mockDriveOutputInstance = jest.spyOn(DriveOutput, "getInstance").mockReturnValue(mockedDriveOutput);

            // when
            const dataService = new (DataService as any)(); // even if the constructor is private, we can still instantiate it, it's to avoid retrieve the instance from the singleton
            const result: ReceiverInterface[] | null = await dataService.getReceivers();

            // then
            expect(mockGetDocument).toHaveBeenCalledWith("receiver.json");
            expect(mockDriveOutputInstance).toHaveBeenCalledTimes(1);

            expect(result).toBeTruthy();
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(2);

            expect(result?.[0].name).toBe("Francisco Fernandez");
            expect(result?.[0].name).not.toBe("Anthony Pillot");
            expect(result?.[0].email).toBe("francisco59553@gmail.com");
            expect(result?.[0].email).not.toBe("pillot.anthony@gmail.com");

            expect(result?.[1].name).toBe("Anthony Pillot");
            expect(result?.[1].name).not.toBe("Francisco Fernandez");
            expect(result?.[1].email).toBe("pillot.anthony@gmail.com");
            expect(result?.[1].email).not.toBe("francisco59553@gmail.com");
        });
    });

    describe("updateCache()", () => {
        test(`given getCache() method that return null,
        when calling updateCache() from data service with an array with 2 GameInterface objects,
        then retrieve an array with 2 GameInterface objects`, async () => {
            // given
            /**
             * Mock the private constructor and the `getInstance()` method of the DriveOutput class.
             */
            const mockedDriveOutput = new (DriveOutput as any)() as jest.Mocked<DriveOutput>; // jest.MockedObject<DriveOutput> is working too

            const mockGetDocument = mockedDriveOutput.getDocument.mockResolvedValue(null); // start with an array with 3 GameInterface objects

            const mockDriveOutputInstance = jest.spyOn(DriveOutput, "getInstance").mockReturnValue(mockedDriveOutput);

            // when
            const dataService: DataService = new (DataService as any)(); // even if the constructor is private, we can still instantiate it, it's to avoid retrieve the instance from the singleton

            const spyGetCache = jest.spyOn(dataService, "getCache");

            const games: GameInterface[] = [
                {
                    title: "Game 1",
                    description: "Description 1",
                    imageUrl: "https://image1.com",
                    urlSlug: "game-1",
                    promotion: {
                        startDate: "2021-01-01",
                        endDate: "2021-01-31",
                    },
                },
                {
                    title: "Game 2",
                    description: "Description 2",
                    imageUrl: "https://image2.com",
                    urlSlug: "game-2",
                    promotion: {
                        startDate: "2021-01-01",
                        endDate: "2021-01-31",
                    },
                },
            ];

            expect(games).toHaveLength(2);
            const result: boolean = await dataService.updateCache(games); // update the cache with an array with 2 GameInterface objects

            // then
            expect(mockGetDocument).toHaveBeenCalledWith("cache.json");
            expect(mockDriveOutputInstance).toHaveBeenCalledTimes(1);

            expect(result).toBe(true);

            expect(spyGetCache).toHaveBeenCalledTimes(1);
            expect(await spyGetCache.mock.results[0].value).toBeNull();

            const spyUpdateDocument = jest.spyOn(mockedDriveOutput, "updateDocument");
            expect(spyUpdateDocument).toHaveBeenCalledTimes(1);
            expect(JSON.parse(spyUpdateDocument.mock.calls[0][1])).toHaveLength(2); // verify that we have now 5 GameInterface objects because we have added 2 new ones to the 3 existing ones
        });

        test(`given getCache() method that return an array with 3 GameInterface objects,
        when calling updateCache() from data service with an array with 2 GameInterface objects,
        then retrieve an array with 5 GameInterface objects`, async () => {
            // given
            const games: GameInterface[] = [
                {
                    title: "Game 1",
                    description: "Description 1",
                    imageUrl: "https://image1.com",
                    urlSlug: "game-1",
                    promotion: {
                        startDate: "2021-01-01",
                        endDate: "2021-01-31",
                    },
                },
                {
                    title: "Game 2",
                    description: "Description 2",
                    imageUrl: "https://image2.com",
                    urlSlug: "game-2",
                    promotion: {
                        startDate: "2021-01-01",
                        endDate: "2021-01-31",
                    },
                },
                {
                    title: "Game 3",
                    description: "Description 3",
                    imageUrl: "https://image3.com",
                    urlSlug: "game-3",
                    promotion: {
                        startDate: "2021-01-01",
                        endDate: "2021-01-31",
                    },
                },
            ];

            /**
             * Mock the private constructor and the `getInstance()` method of the DriveOutput class.
             */
            const mockedDriveOutput = new (DriveOutput as any)() as jest.Mocked<DriveOutput>; // jest.MockedObject<DriveOutput> is working too

            const mockGetDocument = mockedDriveOutput.getDocument.mockResolvedValue(games); // start with an array with 3 GameInterface objects
            expect(games).toHaveLength(3);

            const mockDriveOutputInstance = jest.spyOn(DriveOutput, "getInstance").mockReturnValue(mockedDriveOutput);

            // when
            const dataService: DataService = new (DataService as any)(); // even if the constructor is private, we can still instantiate it, it's to avoid retrieve the instance from the singleton

            const spyGetCache = jest.spyOn(dataService, "getCache");

            const gamesUpdate = games.slice(0, games.length - 1); // remove the first element of the array to retrieve an array with 2 GameInterface objects
            expect(gamesUpdate).toHaveLength(2);

            const result: boolean = await dataService.updateCache(gamesUpdate); // update the cache with an array with 2 GameInterface objects

            // then
            expect(mockGetDocument).toHaveBeenCalledWith("cache.json");
            expect(mockDriveOutputInstance).toHaveBeenCalledTimes(1);

            expect(result).toBe(true);

            expect(spyGetCache).toHaveBeenCalledTimes(1);
            expect(await spyGetCache.mock.results[0].value).toHaveLength(3);

            const spyUpdateDocument = jest.spyOn(mockedDriveOutput, "updateDocument");
            expect(spyUpdateDocument).toHaveBeenCalledTimes(1);
            expect(JSON.parse(spyUpdateDocument.mock.calls[0][1])).toHaveLength(5); // verify that we have now 5 GameInterface objects because we have added 2 new ones to the 3 existing ones
        });
    });
});
