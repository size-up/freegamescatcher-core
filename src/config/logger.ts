import winston from "winston";
import packageJson from "../../package.json";

function setupLogger(): winston.Logger {
    const metadata = {
        "app.name": packageJson.name,
        "app.version": packageJson.version,
    };

    /**
     * If the application is running is production mode,
     * the logger format will be JSON, instead, it will
     * be something more colored and easier to read.
     */
    if (process.env.NODE_ENV === "production") {
        return winston.createLogger({
            level: "info",
            format: winston.format.json(),
            defaultMeta: metadata,
            transports: [new winston.transports.Console({})]
        });
    } else {
        const alignColorsAndTime = winston.format.combine(
            winston.format.colorize({
                all: true,
            }),
            winston.format.timestamp({
                format: "YY-MM-DD HH:mm:ss",
            }),
            winston.format.printf(
                (info) => `${info.timestamp} [${info.level}] ${info.message}`
            )
        );

        return winston.createLogger({
            level: "debug",
            format: winston.format.combine(
                winston.format.colorize(),
                alignColorsAndTime
            ),
            transports: [new winston.transports.Console()],
        });
    }
}

export const logger = setupLogger();