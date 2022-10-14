import packageJson from "../../package.json";

export function version(): string | undefined {
    return process.env.NODE_ENV === "production" ? process.env.VERSION : packageJson.version;
}