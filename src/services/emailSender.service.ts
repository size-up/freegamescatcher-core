import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import { ElementToSendInterface } from "../interfaces/client.interface";

export class EmailSenderService {
    private transporter: nodemailer.Transporter<unknown>;
    
    constructor() {
        const config = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        };
        console.log("ETAPE 1");
        this.transporter = nodemailer.createTransport(config);
        console.log("ETAPE 2");
        this.transporter.verify((error, success) => {
            error ? console.log(error) : console.log(`Mailer is ready to take messages: ${success}`);
            console.log("ETAPE 3");
        });
    }
    
    sendMail() {

        const datas: ElementToSendInterface[] = JSON.parse(fs.readFileSync("src/data/cache.json", { encoding: "utf8" }));
        const templateRead = fs.readFileSync("src/templates/email.template.hbs", { encoding: "utf8" });

        const datasToCompile = this.filterDatasByDate(datas);

        // const datasToCompile = {
        //     availableGames: datas.map(element => {
        //         const elementToReturn = element;
        //         elementToReturn.promotion.endDate = Intl.DateTimeFormat("en-GB")
        //             .format(new Date(element.promotion.endDate))
        //             .split("/").join(" / ");
        //         return elementToReturn;
        //     })
        // };

        const template = handlebars.compile(templateRead);
        const templateToSend = template(datasToCompile);

        // const email = fs.readFileSync("src/templates/third.template.html", { encoding: "utf8" });
        console.log("ETAPE 4");
        const mailOptions = {
            sender: "Free Games Catcher",
            from: "noreply@sizeup.cloud",
            to: "francisco59553@gmail.com",
            subject: "Des jeux Epic Games sont disponibles",
            html: templateToSend,
        };
        
        this.transporter.sendMail(mailOptions, (error, data) => {
            if (error) {
                console.log(`Error : ${error}`);
            } else {
                console.log("Email sent !");
            }
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
            element.promotion.endDate = Intl.DateTimeFormat("en-GB")
                .format(new Date(element.promotion.endDate))
                .split("/").join(" / ");

            element.promotion.startDate = Intl.DateTimeFormat("en-GB")
                .format(new Date(element.promotion.startDate))
                .split("/").join(" / ");

            const gameStartDate = new Date(element.promotion.startDate);

            if (gameStartDate >= new Date()) {
                datasToCompile.nextGames.push(element);
            } else {
                datasToCompile.availableGames.push(element);
            }
        });

        return datasToCompile;
    }

}