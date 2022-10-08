import { drive_v3, google } from "googleapis";
import { GaxiosPromise } from "googleapis/build/src/apis/abusiveexperiencereport";

import { logger } from "../../config/logger";

export class DocumentOutput {
    private from = "from Google Drive API";

    private drive: drive_v3.Drive;
    private schema: drive_v3.Schema$FileList | undefined;

    constructor() {
        this.drive = this.authAndGetService();
    }

    public async getDocument(fileName: string): Promise<Object | null> {
        const id = await this.getFileId(fileName);

        if (id) {
            try {
                return Object((await this.getFile(id)).data);
            } catch (error) {
                throw new Error(`Can not parse data to JavaScript Object ${this.from}`);
            }
        } else {
            logger.warn(`File name [${fileName}] not found ${this.from}`);
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
            throw new Error(`Auth. error ${this.from}`);
        }
    };

    private async getSchemaFileList(): Promise<drive_v3.Schema$FileList> {
        if (this.schema) {
            return this.schema;
        } else {
            try {
                this.schema = (await this.drive.files.list()).data;
                return this.schema;
            } catch (error) {
                throw new Error(`Can not retrieve file schema ${this.from}`);
            }
        }
    }

    private async getFileId(fileName: string) {
        try {
            const id = (await this.getSchemaFileList()).files?.find(schema => schema.name === fileName)?.id;
            if (id) {
                return id;
            }
        } catch (error) {
            throw new Error(`Can not retrieve file from schema file list ${this.from}`);
        }
    }

    private async getFile(id: string): GaxiosPromise<drive_v3.Schema$File> {
        return await this.drive.files.get({ fileId: id }, { params: { alt: "media" } });
    }

    private async updateFile(id: string): GaxiosPromise<drive_v3.Schema$File> {
        return await this.drive.files.update({ fileId: id }, { params: { alt: "media" } });
    }
}
