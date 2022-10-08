import fs from "fs";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import { GameCacheDocumentInterface } from "../interfaces/cache.interface";
import { ClientPlatformType } from "../interfaces/client.interface";
import { DatasToCompileInterface } from "../interfaces/data.interface";

import packageJson from "../../package.json";
import { logger } from "../config/logger";

export class EmailSenderService {
    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    
    constructor() {
        // TODO: Delocate this in env or config file
        const config = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        };
        this.transporter = nodemailer.createTransport(config);
    }

    private checkEmailAvailability(): Promise<string | Error> {
        return new Promise<string | Error>((resolve, reject) => {
            this.transporter.verify((error, success) => {
                return error ? reject(`Error while verifying transporter. Error: ${error.message}`) : resolve(`Mailer is ready to take messages: ${success}`);
            });
        });
    }

    /**
     * Method to send notification emails to subscribers
     * 
     * @param {ClientPlatformType} platform Platform where the datas comming from 
     * @param {string} subject Email's title
     */
    sendMail(platform: ClientPlatformType, subject: string, receivers: string[]): void {
        this.checkEmailAvailability().then(res => {
            logger.info(res);
            const datas: GameCacheDocumentInterface[] = JSON.parse(fs.readFileSync(`data/cache.${platform}.json`, { encoding: "utf8" }));
    
            const templateRead = fs.readFileSync(`src/templates/email.${platform}.template.hbs`, { encoding: "utf8" });
            const datasToCompile = this.filterDatasByDate(datas);
    
            const template = handlebars.compile(templateRead);
            const templateToSend = template(datasToCompile);
    
            const mailOptions = {
                sender: packageJson.displayName,
                from: packageJson.author.email,
                to: receivers,
                subject: subject,
                html: templateToSend,
            };
            
            this.transporter.sendMail(mailOptions, (error, data) => {
                error ? logger.error(`Error while sending emails: ${error}`) : logger.info("Emails are sent correctly");
            });
        });
    }

    private filterDatasByDate(datas: GameCacheDocumentInterface[]): DatasToCompileInterface {
        const datasToCompile: DatasToCompileInterface = {
            availableGames: [],
            nextGames: []
        };

        datas.forEach(element => {
            const gameStartDate = new Date(element.promotion.startDate);
            if (gameStartDate > new Date()) {
                datasToCompile.nextGames.push(element);
            } else {
                datasToCompile.availableGames.push(element);
            }

            element.promotion.endDate = Intl.DateTimeFormat("en-GB")
                .format(new Date(element.promotion.endDate))
                .split("/").join(" / ");

            element.promotion.startDate = Intl.DateTimeFormat("en-GB")
                .format(new Date(element.promotion.startDate))
                .split("/").join(" / ");
        });

        return datasToCompile;
    }
}