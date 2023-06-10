import { logger } from "../../src/config/logger.config";
import SenderFacade from "../../src/facade/sender.facade";
import { GameInterface } from "../../src/interfaces/game.interface";
import { ReceiverInterface } from "../../src/interfaces/receiver.interface";
import { SendOptionsInterface } from "../../src/interfaces/send.interface";
import { ChannelInterface } from "../../src/interfaces/webhook.interface";
import { DataService } from "../../src/services/data.service";
import { EmailService } from "../../src/services/email.service";
import { GameService } from "../../src/services/game.service";
import { WebhookService } from "../../src/services/webhook.service";

jest.mock("../../src/services/data.service");
jest.mock("../../src/services/email.service");
jest.mock("../../src/services/game.service");
jest.mock("../../src/services/webhook.service");

beforeAll(() => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

describe("SenderFacade", () => {
    let senderFacade: SenderFacade;
    let gameService: jest.Mocked<GameService>;
    let dataService: jest.Mocked<DataService>;
    let emailService: jest.Mocked<EmailService>;
    let webhookService: jest.Mocked<WebhookService>;

    beforeEach(() => {
        gameService = new GameService() as jest.Mocked<GameService>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataService = new (DataService as any)(); // even if the constructor is private, we can still instantiate it, it's to avoid retrieve the instance from the singleton
        emailService = new EmailService() as jest.Mocked<EmailService>;
        webhookService = new WebhookService() as jest.Mocked<WebhookService>;

        senderFacade = new SenderFacade();
        senderFacade["client"] = gameService;
        senderFacade["data"] = dataService;
        senderFacade["email"] = emailService;
        senderFacade["webhook"] = webhookService;
    });

    describe("send", () => {
        const options: SendOptionsInterface = {
            email: true,
            webhook: true,
        };

        const games: GameInterface[] = [
            {
                title: "Game 1",
                description: "Description 1",
                imageUrl: "https://example.com/image1.jpg",
                urlSlug: "game-1",
                promotion: {
                    startDate: new Date().toLocaleString(),
                    endDate: new Date().toLocaleString(),
                },
            },
            {
                title: "Game 2",
                description: "Description 2",
                imageUrl: "https://example.com/image2.jpg",
                urlSlug: "game-2",
                promotion: {
                    startDate: new Date().toLocaleString(),
                    endDate: new Date().toLocaleString(),
                },
            },
        ];

        const receivers: ReceiverInterface[] = [
            {
                uuid: "1",
                email: "test1@example.com",
                name: "Test 1",
            },
            {
                uuid: "2",
                email: "test2@example.com",
                name: "Test 2",
            },
        ];

        const channels: ChannelInterface[] = [
            {
                id: "1",
                name: "channel1",
                server: "server1",
                token: "token1",
            },
            {
                id: "1",
                name: "channel1",
                server: "server1",
                token: "token1",
            },
        ];

        test("should send emails and webhooks if games are found", async () => {
            gameService.getEpicGamesData.mockResolvedValue(games);
            dataService.updateCache.mockResolvedValue(true);
            dataService.getReceivers.mockResolvedValue(receivers);
            emailService.sendEmails.mockResolvedValue(undefined);
            dataService.getChannels.mockResolvedValue(channels);
            webhookService.send.mockResolvedValue(true);

            const result = await senderFacade.send(options);

            expect(result).toBe(true);
            expect(gameService.getEpicGamesData).toHaveBeenCalled();
            expect(dataService.updateCache).toHaveBeenCalledWith(games);
            expect(dataService.getReceivers).toHaveBeenCalled();
            expect(emailService.sendEmails).toHaveBeenCalledWith(
                "Les nouveaux jeux de la semaine sur l'Epic Games Store",
                receivers,
                games
            );
            expect(dataService.getChannels).toHaveBeenCalled();
            expect(webhookService.send).toHaveBeenCalledWith(channels, games);
        });

        test("should not send emails if email option is false", async () => {
            gameService.getEpicGamesData.mockResolvedValue(games);
            dataService.updateCache.mockResolvedValue(true);
            dataService.getReceivers.mockResolvedValue(receivers);
            emailService.sendEmails.mockResolvedValue(undefined);
            dataService.getChannels.mockResolvedValue(channels);
            webhookService.send.mockResolvedValue(true);

            const result = await senderFacade.send({ ...options, email: false });

            expect(result).toBe(true);
            expect(gameService.getEpicGamesData).toHaveBeenCalled();
            expect(dataService.updateCache).toHaveBeenCalledWith(games);
            expect(dataService.getReceivers).not.toHaveBeenCalled();
            expect(emailService.sendEmails).not.toHaveBeenCalled();
            expect(dataService.getChannels).toHaveBeenCalled();
            expect(webhookService.send).toHaveBeenCalledWith(channels, games);
        });

        test("should not send webhooks if webhook option is false", async () => {
            gameService.getEpicGamesData.mockResolvedValue(games);
            dataService.updateCache.mockResolvedValue(true);
            dataService.getReceivers.mockResolvedValue(receivers);
            emailService.sendEmails.mockResolvedValue(undefined);
            dataService.getChannels.mockResolvedValue(channels);
            webhookService.send.mockResolvedValue(true);

            const result = await senderFacade.send({ ...options, webhook: false });

            expect(result).toBe(true);
            expect(gameService.getEpicGamesData).toHaveBeenCalled();
            expect(dataService.updateCache).toHaveBeenCalledWith(games);
            expect(dataService.getReceivers).toHaveBeenCalled();
            expect(emailService.sendEmails).toHaveBeenCalledWith(
                "Les nouveaux jeux de la semaine sur l'Epic Games Store",
                receivers,
                games
            );
            expect(dataService.getChannels).not.toHaveBeenCalled();
            expect(webhookService.send).not.toHaveBeenCalled();
        });

        test("should return false if no games are found", async () => {
            gameService.getEpicGamesData.mockResolvedValue([]);
            dataService.updateCache.mockResolvedValue(true);

            const result = await senderFacade.send(options);

            expect(result).toBe(false);
            expect(gameService.getEpicGamesData).toHaveBeenCalled();
            expect(dataService.updateCache).not.toHaveBeenCalled();
            expect(dataService.getReceivers).not.toHaveBeenCalled();
            expect(emailService.sendEmails).not.toHaveBeenCalled();
            expect(dataService.getChannels).not.toHaveBeenCalled();
            expect(webhookService.send).not.toHaveBeenCalled();
        });

        test("should return false if no receivers are found", async () => {
            gameService.getEpicGamesData.mockResolvedValue(games);
            dataService.updateCache.mockResolvedValue(true);
            dataService.getReceivers.mockResolvedValue(null);

            const result = await senderFacade.send(options);

            expect(result).toBe(false);
            expect(gameService.getEpicGamesData).toHaveBeenCalled();
            expect(dataService.updateCache).toHaveBeenCalledWith(games);
            expect(dataService.getReceivers).toHaveBeenCalled();
            expect(emailService.sendEmails).not.toHaveBeenCalled();
            expect(dataService.getChannels).toHaveBeenCalled();
            expect(webhookService.send).not.toHaveBeenCalled();
        });

        test("should return false if webhooks fail to send", async () => {
            gameService.getEpicGamesData.mockResolvedValue(games);
            dataService.updateCache.mockResolvedValue(true);
            dataService.getReceivers.mockResolvedValue(receivers);
            emailService.sendEmails.mockResolvedValue(undefined);
            dataService.getChannels.mockResolvedValue(channels);
            webhookService.send.mockResolvedValue(false);

            const result = await senderFacade.send(options);

            expect(result).toBe(false);
            expect(gameService.getEpicGamesData).toHaveBeenCalled();
            expect(dataService.updateCache).toHaveBeenCalledWith(games);
            expect(dataService.getReceivers).toHaveBeenCalled();
            expect(emailService.sendEmails).toHaveBeenCalledWith(
                "Les nouveaux jeux de la semaine sur l'Epic Games Store",
                receivers,
                games
            );
            expect(dataService.getChannels).toHaveBeenCalled();
            expect(webhookService.send).toHaveBeenCalledWith(channels, games);
        });

        test("should send the same games to email and webhook functions", async () => {
            gameService.getEpicGamesData.mockResolvedValue(games);
            dataService.updateCache.mockResolvedValue(true);
            dataService.getReceivers.mockResolvedValue(receivers);
            emailService.sendEmails.mockResolvedValue(undefined);
            dataService.getChannels.mockResolvedValue(channels);
            webhookService.send.mockResolvedValue(true);

            const result = await senderFacade.send(options);

            expect(result).toBe(true);
            expect(gameService.getEpicGamesData).toHaveBeenCalled();
            expect(dataService.updateCache).toHaveBeenCalledWith(games);
            expect(dataService.getReceivers).toHaveBeenCalled();
            expect(emailService.sendEmails).toHaveBeenCalledWith(
                "Les nouveaux jeux de la semaine sur l'Epic Games Store",
                receivers,
                games
            );
            expect(dataService.getChannels).toHaveBeenCalled();
            expect(webhookService.send).toHaveBeenCalledWith(channels, games);
            expect(emailService.sendEmails.mock.calls[0][2]).toEqual(webhookService.send.mock.calls[0][1]);
        });
    });
});
