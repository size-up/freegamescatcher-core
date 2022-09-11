export interface ServiceInterface {
    getGames(): Promise<string>
    getPrices(): Promise<string>;
}