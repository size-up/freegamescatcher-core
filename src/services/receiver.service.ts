import { ReceiverInterface } from "../interfaces/receiver.interface";
import { DataService } from "./data.service";
import crypto from "crypto";
import { logger } from "../config/logger.config";

export default class ReceiverService {
    private dataService = DataService.getInstance();

    public async getAll(): Promise<ReceiverInterface[] | null> {
        return await this.dataService.getReceivers();
    }

    public async create(receiver: ReceiverInterface): Promise<ReceiverInterface> {
        const regex = /\S+@\S+\.\S+/;
        const isValidEmail = regex.test(receiver.email);
        if (!isValidEmail) {
            const message = "Email doesn't match the validation regex";
            logger.error(message);
            throw new Error(message);
        }

        if ((await this.dataService.getReceivers())?.find((element) => element.email === receiver.email)) {
            const message = `Email [${receiver.email}] already exists`;
            logger.error(message);
            throw new Error(message);
        }

        receiver.uuid = crypto.randomUUID();
        return this.dataService.createReceiver(receiver);
    }

    public delete(uuid: string): Promise<boolean> {
        return this.dataService.deleteReceiver(uuid);
    }
}
