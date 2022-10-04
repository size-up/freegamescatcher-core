export class DataService {
    private static service: DataService;

    public getCache() {
        throw new Error("Method not implemented.");
    }

    public updateCache() {
        throw new Error("Method not implemented.");
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
        return this.service = this.service || new DataService();
    }
}
