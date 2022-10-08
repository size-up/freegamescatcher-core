import { DocumentOutput } from "../outputs/google/drive";

import { GameCacheDocumentInterface } from "../interfaces/cache.interface";

import { logger } from "../config/logger";

export class DataService {
    private static service: DataService;

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

    constructor(private documentOutput = new DocumentOutput()) {}

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

    public getReceivers(name: string) {
        throw new Error("Method not implemented.");
    }

    public updateReceiver() {
        throw new Error("Method not implemented.");
    }

    public deleteReceiver() {
        throw new Error("Method not implemented.");
    }

    public static getInstance(): DataService {
        return (this.service = this.service || new DataService());
    }
}
