import { ReceiverInterface } from "../interfaces/receiver.interface";
import { DataService } from "./data.service";
import crypto from "crypto";
import { logger } from "../config/logger";

export default class ReceiverService {
    private dataService = DataService.getInstance();

    public getAll(): Promise<ReceiverInterface[] | null> {
        return this.dataService.getReceivers();
    }

    public async create(body: ReceiverInterface): Promise<ReceiverInterface> {
        const regex = /\S+@\S+\.\S+/;
        const isValidEmail = regex.test(body.email);
        if (!isValidEmail) {
            logger.error("Invalid Email");
            throw new Error("Verifying email failed");
        }
        if ((await this.dataService.getReceivers())?.find(element => element.email === body.email)) {
            logger.error("Receiver already exists");
            throw new Error("Failed to update receivers list");
        }
        body.uuid = crypto.randomUUID();
        return this.dataService.updateReceiver(body);
    }

    public delete(uuid: string): Promise<boolean> {
        return this.dataService.deleteReceiver(uuid);
    }
}
