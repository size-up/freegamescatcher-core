import { drive_v3, google } from "googleapis";
import { GaxiosPromise } from "googleapis/build/src/apis/abusiveexperiencereport";

import { logger } from "../../config/logger";
import { GameCacheDocumentInterface } from "../../interfaces/cache.interface";

const from = "from Google Drive API";

export class DocumentOutput {
    private drive: drive_v3.Drive;

    constructor() {
        this.drive = this.authAndGetService();
    }

    public async getCache(fileName: string): Promise<GameCacheDocumentInterface | null> {
        const id = (await this.getAll()).data.files?.find(schema => schema.name === fileName)?.id;

        if (id) {
            try {
                const document: GameCacheDocumentInterface = Object((await this.getFile(id)).data);
                return document;
            } catch (error) {
                throw new Error(`Can not parse data to JavaScript Object ${from}`);
            }
        } else {
            logger.warn(`File ID [${id}] not found ${from}`);
            return null;
        }
    }

    private authAndGetService() {
        try {
            const scopes = ["https://www.googleapis.com/auth/drive"];

            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_USERNAME,
                    private_key: process.env.GOOGLE_PRIVATE_KEY,
                },
                scopes: scopes,
            });

            return google.drive({ version: "v3", auth });
        } catch (error) {
            throw new Error(`Auth. error ${from}`);
        }
    };

    private async getAll(): GaxiosPromise<drive_v3.Schema$FileList> {
        try {
            return await this.drive.files.list();
        } catch (error) {
            throw new Error(`Can not retrieve files ${from}`);
        }
    }

    private async getFile(id: string) {
        return await this.drive.files.get({ fileId: id }, { params: { alt: "media" } });
    }
}
