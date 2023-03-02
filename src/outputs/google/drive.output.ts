import { drive_v3, google } from "googleapis";

import { logger } from "../../config/logger.config";

export class DriveOutput {
    private static instance: DriveOutput;
    private from = "from Google Drive API";

    private drive: drive_v3.Drive;
    private schema: drive_v3.Schema$FileList | undefined;

    private constructor() {
        this.drive = this.authAndGetService();
    }

    /**
     * This method will return the content of the file in the Google Drive API.
     * @param fileName The name of the file to retrieve.
     * @returns The content of the file.
     */
    public async getDocument(fileName: string): Promise<Object | null> {
        fileName = this.checkEnvironment(fileName);
        const id = await this.getFileId(fileName);

        if (id) {
            try {
                logger.info(`File [${fileName}] downloaded ${this.from}`);
                return (await this.drive.files.get({ fileId: id }, { params: { alt: "media" } })).data;
            } catch (error) {
                throw new Error(`Can not parse data to JavaScript Object ${this.from}`);
            }
        } else {
            logger.warn(`File name [${fileName}] not found ${this.from}`);
            return null;
        }
    }

    public async updateDocument(fileName: string, content: string): Promise<void> {
        fileName = this.checkEnvironment(fileName);
        const id = await this.getFileId(fileName);

        if (id) {
            try {
                logger.info(`File [${fileName}] updated ${this.from}`);
                await this.drive.files.update({ fileId: id, media: { body: content } });
            } catch (error) {
                throw new Error(`Error while updating file [${fileName}] ${this.from}`);
            }
        } else {
            logger.warn(`File name [${fileName}] not found ${this.from}`);
        }
    }

    private authAndGetService() {
        try {
            const scopes = ["https://www.googleapis.com/auth/drive"];

            if (!process.env.GOOGLE_USERNAME || !process.env.GOOGLE_PRIVATE_KEY) {
                throw new Error("Credentials not found");
            }

            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_USERNAME,
                    private_key: process.env.GOOGLE_PRIVATE_KEY,
                },
                scopes: scopes,
            });

            logger.info(`Drive authenticated ${this.from}`);
            return google.drive({ version: "v3", auth });
        } catch (error) {
            const message = `Can not authenticate to Google Drive API ${this.from}`;
            logger.error(message, error);
            throw new Error(message);
        }
    }

    /**
     * Check if the application is running in production mode or not, if not, prefix the @param fileName with "prep-filename.json".
     * Because Google Drive API not permit to search file by folder, all prep. files are prefixed by "prep-filename.json" in the Google Drive.
     * @param fileName The name of the file to retrieve.
     */
    private checkEnvironment(fileName: string): string {
        if (process.env.NODE_ENV !== "production") {
            fileName = `prep-${fileName}`;
            return fileName;
        }
        return fileName;
    }

    /**
     * This method will return the schema file list from the Google Drive API.
     * If the schema file list is already defined, it will return it.
     * @returns The Google Drive API schema file list.
     */
    private async getSchemaFileList(): Promise<drive_v3.Schema$FileList> {
        if (this.schema) {
            logger.info(`Schema file list already defined, so use cache schema file list ${this.from}`);
            return this.schema;
        } else {
            try {
                this.schema = (await this.drive.files.list()).data;
                logger.info(`Schema file list retrieved ${this.from}`);
                return this.schema;
            } catch (error) {
                throw new Error(`Can not retrieve schema file list ${this.from}`);
            }
        }
    }

    /**
     * This method will return the file id from the Google Drive API.
     * @param fileName The name of the file to retrieve.
     * @returns The id of the file.
     */
    private async getFileId(fileName: string): Promise<string | undefined> {
        try {
            logger.info(`Searching file [${fileName}] ${this.from} ...`);
            const id = (await this.getSchemaFileList()).files?.find((schema) => schema.name === fileName)?.id;
            if (id) {
                logger.info(`File [${fileName}] found ${this.from}`);
                return id;
            }
        } catch (error) {
            throw new Error(`Can not retrieve file ID from schema file list ${this.from}`);
        }
    }

    public static getInstance(): DriveOutput {
        return this.instance || (this.instance = new this());
    }
}
