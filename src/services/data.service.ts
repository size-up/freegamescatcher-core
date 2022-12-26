import { DriveOutput } from "../outputs/google/drive.output";

import { GameInterface } from "../interfaces/game.interface";
import { ReceiverInterface } from "../interfaces/receiver.interface";
import { ChannelInterface } from "../interfaces/webhook.interface";

import { logger } from "../config/logger.config";

export class DataService {
    private static instance: DataService;
    private drive: DriveOutput;

    private file = {
        client: {
            name: "client.json",
        },
        receiver: {
            name: "receiver.json",
        },
        cache: {
            name: "cache.json",
        },
        channel: {
            name: "channel.json",
        },
    };

    private constructor() {
        this.drive = DriveOutput.getInstance();
    }

    public async getCache(): Promise<GameInterface[] | null> {
        try {
            const cache: GameInterface[] = await Object(this.drive.getDocument(this.file.cache.name));
            return cache;
        } catch (error) {
            logger.error("Error while getting cache", error);
            return null;
        }
    }

    public async updateCache(content: GameInterface[]): Promise<boolean> {
        try {
            const cache = await this.getCache();
            if (cache && cache.length > 0) {
                content = content.concat(cache);
            }

            await this.drive.updateDocument(this.file.cache.name, JSON.stringify(content, null, 4));
            return true;
        } catch (error) {
            logger.error("Error while updating cache", error);
            return false;
        }
    }

    public async getReceivers(): Promise<ReceiverInterface[] | null> {
        try {
            const receivers: ReceiverInterface[] = await Object(this.drive.getDocument(this.file.receiver.name));
            return receivers;
        } catch (error) {
            logger.error("Error while getting receivers", error);
            return null;
        }
    }

    public async createReceiver(receiver: ReceiverInterface): Promise<ReceiverInterface> {
        try {
            const receivers = await this.getReceivers();
            receivers?.push(receiver);
            await this.drive.updateDocument(this.file.receiver.name, JSON.stringify(receivers, null, 4));
            return receiver;
        } catch (error) {
            const message = "Error while creating receiver";
            logger.error(message, error);
            throw new Error(message);
        }
    }

    public async deleteReceiver(uuid: string): Promise<boolean> {
        try {
            const receivers = await this.getReceivers();
            let index;
            if (receivers) {
                index = receivers.findIndex((element) => element.uuid === uuid);
                if (index >= 0) {
                    receivers?.splice(index, 1);
                } else {
                    logger.warn(`Receiver with uuid [${uuid}] not found`);
                    return false;
                }
            }
            await this.drive.updateDocument(this.file.receiver.name, JSON.stringify(receivers, null, 4));
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    public async getChannels(): Promise<ChannelInterface[] | null> {
        try {
            const channels: ChannelInterface[] = await Object(this.drive.getDocument(this.file.channel.name));
            return channels;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    public static getInstance(): DataService {
        return this.instance || (this.instance = new this());
    }
}
