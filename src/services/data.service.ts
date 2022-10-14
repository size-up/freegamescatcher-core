import { DocumentOutput } from "../outputs/google/drive";

import { GameCacheDocumentInterface } from "../interfaces/cache.interface";

import { logger } from "../config/logger";
import { ReceiverInterface } from "../interfaces/receiver.interface";

export class DataService {
    private static instance: DataService;

    private metadata = {
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

    constructor(private documentOutput = DocumentOutput.getInstance()) {}

    public async getCache(): Promise<GameCacheDocumentInterface[] | null> {
        try {
            const cache: GameCacheDocumentInterface[] = await Object(this.documentOutput.getDocument(this.metadata.cache.name));
            return cache;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    public async updateCache(content: GameCacheDocumentInterface[]): Promise<boolean> {
        try {
            await this.documentOutput.updateDocument(
                this.metadata.cache.name,
                JSON.stringify(content, null, 4)
            );
            return true;
        } catch (error) {
            logger.error("Error while updating cache", error);
            return false;
        }
    }

    public deleteCache() {
        throw new Error("Method not implemented.");
    }

    public getClients() {
        throw new Error("Method not implemented.");
    }

    public getClient(name: string) {
        throw new Error("Method not implemented.");
    }

    public updateClient(name: string) {
        throw new Error("Method not implemented.");
    }

    public deleteClient(name: string) {
        throw new Error("Method not implemented.");
    }

    public async getReceivers(): Promise<ReceiverInterface[] | null> {
        try {
            const receivers: ReceiverInterface[] = await Object(this.documentOutput.getDocument(this.metadata.receivers.name));
            return receivers;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    public updateReceiver() {
        throw new Error("Method not implemented.");
    }

    public async deleteReceiver(uuid: string): Promise<boolean> {
        try {
            const receivers = await this.getReceivers();
            let index;
            if (receivers) {
                index = receivers.findIndex(element => element.uuid === uuid);
                if (index >= 0) {
                    receivers?.splice(index, 1);
                } else {
                    throw new Error("UUID doesn't exist");
                }
            }
            await this.documentOutput.updateDocument(
                this.metadata.receivers.name,
                JSON.stringify(receivers, null, 4)
            );
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
