import { logger } from "../../src/config/logger.config";

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
    describe("send()", () => {
        test("should have promotion start date inferior to end date", async () => {
            const channels: ChannelInterface[] = [
                {
                    id: "1",
                    token: "XXX",
                    name: "first",
                    server: "first",
                },
                {
                    id: "2",
                    token: "XXX",
                    name: "second",
                    server: "second",
                },
            ];

            const today = new Date();

            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const yesterdayToISOString = yesterday.toISOString();

            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            const tomorrowToISOString = tomorrow.toISOString();

            const games = [
                {
                    title: "my-game-1",
                    urlSlug: "test",
                    description: "my-game-description-1",
                    imageUrl: "test",
                    promotion: {
                        startDate: yesterdayToISOString,
                        endDate: tomorrowToISOString,
                    },
                },
                {
                    title: "my-game-2",
                    urlSlug: "test",
                    description: "my-game-description-2",
                    imageUrl: "test",
                    promotion: {
                        startDate: yesterdayToISOString,
                        endDate: tomorrowToISOString,
                    },
                },
            ];

            const output = jest.spyOn(WebhookOutput.prototype, "send").mockResolvedValue(true);
            const webhookService = new WebhookService();

            const isDone: boolean = await webhookService.send(channels, games);

            expect(isDone).toBe(true);

            expect(output).toHaveBeenCalledTimes(1);
            expect(output.mock.calls[0][2]?.length).toBe(2);

            const yesterdayToLocaleDateString = yesterday.toLocaleDateString("fr-FR", { dateStyle: "full" });
            const tomorrowToLocaleDateString = tomorrow.toLocaleDateString("fr-FR", { dateStyle: "full" });

            const fields = output.mock.calls[0][2]?.map((embed) => embed.fields);
            expect(fields?.[0]?.[0].name).toEqual("🏁 Le contenu est disponible depuis le :");
            expect(fields?.[0]?.[0].value).toEqual(`🗓️ ${yesterdayToLocaleDateString}`);

            expect(fields?.[0]?.[1].name).toEqual("⚠️ Le contenu ne sera plus disponible après le :");
            expect(fields?.[0]?.[1].value).toEqual(`🗓️ ${tomorrowToLocaleDateString}`);

            const footer = output.mock.calls[0][2]?.map((embed) => embed.footer);
            expect(footer?.[0]?.text).toEqual(
                `Message envoyé le ${today.toLocaleDateString("fr-FR", {
                    dateStyle: "full",
                })} à ${today.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" })}`
            );
        });
    });
});
