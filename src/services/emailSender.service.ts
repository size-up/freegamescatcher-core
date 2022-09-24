import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import { ClientPlatformType, ElementToSendInterface } from "../interfaces/client.interface";

export class EmailSenderService {
    private transporter: nodemailer.Transporter<unknown>;
    
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

    private checkEmailAvailability(): Promise<unknown> {
        return new Promise<unknown>((resolve, reject) => {
            this.transporter.verify((error, success) => {
                return error ? reject(error) : resolve(`Mailer is ready to take messages: ${success}`);
            });
        });
    }

    /**
     * Method to send notification emails to subscribers
     * 
     * @param {ClientPlatformType} platform Platform where the datas comming from 
     * @param {string} subject Email's title
     */
    sendMail(platform: ClientPlatformType, subject: string, receivers: string[]) {
        this.checkEmailAvailability().then(res => {
            console.log(res);
            const datas: ElementToSendInterface[] = JSON.parse(fs.readFileSync(`data/cache.${platform}.json`, { encoding: "utf8" }));
    
            const templateRead = fs.readFileSync(`src/templates/email.${platform}.template.hbs`, { encoding: "utf8" });
            const datasToCompile = this.filterDatasByDate(datas);
    
            const template = handlebars.compile(templateRead);
            const templateToSend = template(datasToCompile);
    
            const mailOptions = {
                sender: "Free Games Catcher",
                from: "noreply@sizeup.cloud",
                to: receivers,
                subject: subject,
                html: templateToSend,
            };
            
            this.transporter.sendMail(mailOptions, (error, data) => {
                error ? console.log(`Error : ${error}`) : console.log("Email sent !");
            });
        });
    }

    private filterDatasByDate(datas: ElementToSendInterface[]) {
        interface datasToCompileInterface {
            availableGames: ElementToSendInterface[]
            nextGames: ElementToSendInterface[]
        }
        
        const datasToCompile: datasToCompileInterface = {
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