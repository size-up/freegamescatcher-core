import packageJson from "../../package.json";

export function version(): string | undefined {
    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "pre-production") {
        return process.env.VERSION;
    } else {
        return packageJson.version;
    }
}
