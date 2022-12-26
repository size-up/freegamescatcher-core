import axios from "axios";
import { logger } from "../../src/config/logger.config";

import { WebhookOutput } from "../../src/outputs/discord/webhook.output";

import channelJson from "../data/channel.json";

jest.mock("axios");

beforeAll(async () => {
    /**
     * Silence the logger to avoid unnecessary output.
     */
    logger.silent = true;
});

afterEach(async () => {
    jest.clearAllMocks();
});

describe("WebhookOutput", () => {
    describe("send()", () => {
        test(`given axios response webhook status with 404 then 204,
        when send content to webhook,
        then response is false with a specific log message`, async () => {
            // given
            logger.error = jest.fn();

            const mockedAxios = axios as jest.Mocked<typeof axios>;
            mockedAxios.post.mockResolvedValueOnce({ status: 404 });
            mockedAxios.post.mockResolvedValueOnce({ status: 204 });

            // when
            const webhookOutput = new WebhookOutput();
            const response: boolean = await webhookOutput.send(channelJson);

            // then
            // because we have 2 channels in the channel.json file
            // and we send 2 messages to each channel (game + contact message)
            // but the contact message isn't sent every time
            expect(mockedAxios.post.mock.calls.length).toBeGreaterThanOrEqual(2);

            expect(logger.error).toHaveBeenCalledWith(
                "Error while sending message to Discord server: [Size Up® Organization], channel: [webhook-testing] with status code: 404"
            );

            expect(response).toBe(false);
        });

        test(`given axios response webhook status with 204,
        when send content to webhook,
        then response is false with a specific log message`, async () => {
            // given
            logger.info = jest.fn();

            const mockedAxios = axios as jest.Mocked<typeof axios>;
            mockedAxios.post.mockResolvedValue({ status: 204 });

            // when
            const webhookOutput = new WebhookOutput();
            const response: boolean = await webhookOutput.send(channelJson);

            // then
            // because we have 2 channels in the channel.json file
            // and we send 2 messages to each channel (game + contact message)
            // but the contact message isn't sent every time
            expect(mockedAxios.post.mock.calls.length).toBeGreaterThanOrEqual(2);

            expect(logger.info).toHaveBeenCalledWith(
                "Sending message to Discord webhook server: [Size Up® Organization], channel: [webhook-testing] ..."
            );
            expect(logger.info).toHaveBeenCalledWith(
                "Message sent to Discord server: [Size Up® Organization], channel: [webhook-testing]"
            );
            expect(logger.info).toHaveBeenCalledWith(
                "Sending message to Discord webhook server: [BarberCrew® Community], channel: [free-game] ..."
            );

            expect(response).toBe(true);
        });
    });
});
