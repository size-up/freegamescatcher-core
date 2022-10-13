import { ReceiverInterface } from "../interfaces/receiver.interface";
import { DataService } from "./data.service";

export default class ReceiverService {
    private dataService = DataService.getInstance();

    public getAll(): Promise<ReceiverInterface[] | null> {
        return this.dataService.getReceivers();
    }

    public create(body: ReceiverInterface): boolean | unknown {
        throw new Error("Method not implemented.");
    }

    public delete(uuid: string): Promise<boolean> {
        return this.dataService.deleteReceiver(uuid);
    }
}
