import { logger } from "../../src/config/logger.config";
import { ReceiverInterface } from "../../src/interfaces/receiver.interface";
import { DriveOutput } from "../../src/outputs/google/drive.output";
import { DataService } from "../../src/services/data.service";

import receiversJson from "../data/receivers.json";

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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedDriveOutput = new (DriveOutput as any)() as jest.Mocked<DriveOutput>; // jest.MockedObject<DriveOutput> is working too

            mockedDriveOutput.getDocument.mockRejectedValue(Object(receivers));

            const mockDriveOutputInstance = jest.spyOn(DriveOutput, "getInstance").mockReturnValue(mockedDriveOutput);

            // when
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataService = new (DataService as any)(); // even if the constructor is private, we can still instantiate it, it's to avoid retrieve the instance from the singleton
            const result: ReceiverInterface[] | null = await dataService.getReceivers();

            expect(mockDriveOutputInstance).toHaveBeenCalledTimes(1);

            // then
            expect(result).toBeNull();
        });

        test(`given Drive output that return receivers data,
        when calling getReceivers() from data service,
        then retrieve receivers list`, async () => {
            // given
            const receivers: ReceiverInterface[] = receiversJson;

            /**
             * Mock the private constructor and the `getInstance()` method of the DriveOutput class.
             */

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockedDriveOutput = new (DriveOutput as any)() as jest.Mocked<DriveOutput>; // jest.MockedObject<DriveOutput> is working too

            mockedDriveOutput.getDocument.mockResolvedValue(Object(receivers));

            const mockDriveOutputInstance = jest.spyOn(DriveOutput, "getInstance").mockReturnValue(mockedDriveOutput);

            // when
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataService = new (DataService as any)(); // even if the constructor is private, we can still instantiate it, it's to avoid retrieve the instance from the singleton
            const result: ReceiverInterface[] | null = await dataService.getReceivers();

            expect(mockDriveOutputInstance).toHaveBeenCalledTimes(1);

            // then
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
});
