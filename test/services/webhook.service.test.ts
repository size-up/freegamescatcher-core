import { logger } from "../../src/config/logger.config";
import { GameInterface } from "../../src/interfaces/game.interface";
import { ChannelInterface } from "../../src/interfaces/webhook.interface";
import { WebhookOutput } from "../../src/outputs/discord/webhook.output";
import { WebhookService } from "../../src/services/webhook.service";

jest.mock("../../src/outputs/discord/webhook.output");

beforeAll(() => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

describe("WebhookService", () => {
    let webhookService: WebhookService;

    beforeEach(() => {
        webhookService = new WebhookService();
    });

    describe("send", () => {
        // Mock the send method of the WebhookOutput class to always return true.
        const spyWebhookOutput = jest.spyOn(WebhookOutput.prototype, "send").mockResolvedValue(true);

        // Prepare date mocks.
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
        const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString();
        const nextWeek = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString();
        const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
        const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
        const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();

        test("should return false if no games are provided", async () => {
            const channels: ChannelInterface[] = [];
            const games: GameInterface[] = [];

            const result = await webhookService.send(channels, games);

            expect(result).toBe(false);
        });

        test("should return false if no channels are provided", async () => {
            const channels: ChannelInterface[] = [];
            const games: GameInterface[] = [
                {
                    title: "Test Game",
                    urlSlug: "test-game",
                    description: "This is a test game",
                    imageUrl: "https://example.com/test-game.jpg",
                    promotion: {
                        startDate: yesterday,
                        endDate: tomorrow,
                    },
                },
            ];

            const result = await webhookService.send(channels, games);

            expect(result).toBe(false);
        });

        test("should return true if games are provided and at least one channel is provided", async () => {
            const channels: ChannelInterface[] = [
                {
                    id: "123",
                    name: "test-channel",
                    server: "test-server",
                    token: "123",
                },
            ];
            const games: GameInterface[] = [
                {
                    title: "Test Game",
                    urlSlug: "test-game",
                    description: "This is a test game",
                    imageUrl: "https://example.com/test-game.jpg",
                    promotion: {
                        startDate: yesterday,
                        endDate: tomorrow,
                    },
                },
            ];

            const result = await webhookService.send(channels, games);

            expect(result).toBe(true);
        });

        test("should return true and call just one time the WebhookOutput.send method if one channel is provided", async () => {
            // Reset the mock to avoid counting the previous calls.
            spyWebhookOutput.mockClear();

            const channels: ChannelInterface[] = [
                {
                    id: "123",
                    name: "test-channel",
                    server: "test-server",
                    token: "123",
                },
            ];
            const games: GameInterface[] = [
                {
                    title: "Test Game",
                    urlSlug: "test-game",
                    description: "This is a test game",
                    imageUrl: "https://example.com/test-game.jpg",
                    promotion: {
                        startDate: yesterday,
                        endDate: tomorrow,
                    },
                },
            ];

            const result = await webhookService.send(channels, games);

            expect(spyWebhookOutput).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);
        });

        test("should not include games that are not currently free", async () => {
            const channels: ChannelInterface[] = [
                {
                    id: "123",
                    name: "test-channel",
                    server: "test-server",
                    token: "123",
                },
            ];
            const games: GameInterface[] = [
                {
                    title: "Test Game",
                    urlSlug: "test-game",
                    description: "This is a test game",
                    imageUrl: "https://example.com/test-game.jpg",
                    promotion: {
                        startDate: "2023-06-08T15:00:00.000Z",
                        endDate: "2023-06-15T15:00:00.000Z",
                    },
                },
                {
                    title: "Expired Game",
                    urlSlug: "expired-game",
                    description: "This game has already expired",
                    imageUrl: "https://example.com/expired-game.jpg",
                    promotion: {
                        startDate: lastMonth,
                        endDate: lastWeek,
                    },
                },
                {
                    title: "Future Game",
                    urlSlug: "future-game",
                    description: "This game will be free in the future",
                    imageUrl: "https://example.com/future-game.jpg",
                    promotion: {
                        startDate: nextWeek,
                        endDate: nextMonth,
                    },
                },
            ];

            const result = await webhookService.send(channels, games);

            expect(result).toBe(true);
            expect(webhookService["webhook"].send).toHaveBeenCalledWith(
                channels,
                expect.any(String),
                expect.arrayContaining([
                    expect.objectContaining({
                        title: "Test Game",
                    }),
                ])
            );
            expect(webhookService["webhook"].send).not.toHaveBeenCalledWith(
                channels,
                expect.any(String),
                expect.arrayContaining([
                    expect.objectContaining({
                        title: "Expired Game",
                    }),
                ])
            );
            expect(webhookService["webhook"].send).not.toHaveBeenCalledWith(
                channels,
                expect.any(String),
                expect.arrayContaining([
                    expect.objectContaining({
                        title: "Future Game",
                    }),
                ])
            );
        });

        test("should return false if the webhook fails to send", async () => {
            const channels: ChannelInterface[] = [
                {
                    id: "123",
                    name: "test-channel",
                    server: "test-server",
                    token: "123",
                },
            ];
            const games: GameInterface[] = [
                {
                    title: "Test Game",
                    urlSlug: "test-game",
                    description: "This is a test game",
                    imageUrl: "https://example.com/test-game.jpg",
                    promotion: {
                        startDate: yesterday,
                        endDate: tomorrow,
                    },
                },
            ];

            // Mock the send method of the WebhookOutput class to return false.
            spyWebhookOutput.mockResolvedValue(false);

            const result = await webhookService.send(channels, games);

            expect(result).toBe(false);
        });
    });
});
