import { ReceiverInterface } from "../interfaces/receiver.interface";

export default class ReceiverService {
    public getAll(): Array<ReceiverInterface> | unknown {
        throw new Error("Method not implemented.");
    }

    public create(body: ReceiverInterface): boolean | unknown {
        throw new Error("Method not implemented.");
    }

    public delete(id: string): boolean | unknown {
        throw new Error("Method not implemented.");
    }
}
