import { DriveOutput } from "../outputs/google/drive.output";

import { GameCacheDocumentInterface } from "../interfaces/cache.interface";
import { ReceiverInterface } from "../interfaces/receiver.interface";

import { logger } from "../config/logger.config";

export class DataService {
    private static instance: DataService;
    private drive: DriveOutput;

    private file = {
        client: {
            name: "client.json",
        },
        receivers: {
            name: "receivers.json",
        },
        cache: {
            name: "cache.json",
        },
    };

    private constructor() {
        this.drive = DriveOutput.getInstance();
    }

    public async getCache(): Promise<GameCacheDocumentInterface[] | null> {
        try {
            const cache: GameCacheDocumentInterface[] = await Object(this.drive.getDocument(this.file.cache.name));
            return cache;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    public async updateCache(content: GameCacheDocumentInterface[]): Promise<boolean> {
        try {
            await this.drive.updateDocument(this.file.cache.name, JSON.stringify(content, null, 4));
            return true;
        } catch (error) {
            logger.error("Error while updating cache", error);
            return false;
        }
    }

    public async getReceivers(): Promise<ReceiverInterface[] | null> {
        try {
            const receivers: ReceiverInterface[] = await Object(this.drive.getDocument(this.file.receivers.name));
            return receivers;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    public async updateReceiver(receiver: ReceiverInterface) {
        try {
            const receivers = await this.getReceivers();
            receivers?.push(receiver);
            await this.drive.updateDocument(this.file.receivers.name, JSON.stringify(receivers, null, 4));
            return receiver;
        } catch (error) {
            throw new Error("Error during updating receivers list");
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
                    throw new Error("UUID doesn't exist");
                }
            }
            await this.drive.updateDocument(this.file.receivers.name, JSON.stringify(receivers, null, 4));
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    public static getInstance(): DataService {
        return this.instance || (this.instance = new this());
    }
}
