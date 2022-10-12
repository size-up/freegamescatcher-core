import fs from "fs";
import handlebars from "handlebars";
import { GameCacheDocumentInterface } from "../interfaces/cache.interface";
import packageJson from "../../package.json";
import { logger } from "../config/logger";
import { Emailer } from "../outputs/emailer/emailer";
import { EmailConfigInterface, EmailOptionsInterface, EmailResponseInterface } from "../interfaces/email.interface";
import { DataService } from "./data.service";
import { ReceiverInterface } from "../interfaces/receiver.interface";

interface DatasToCompileInterface {
    uuid: string | undefined,
    availableGames: GameCacheDocumentInterface[]
    nextGames: GameCacheDocumentInterface[]
}


export class EmailSenderService {
    private dataService: DataService = DataService.getInstance();
    private emailer: Emailer;
    private config: EmailConfigInterface;
    private datas: GameCacheDocumentInterface[] = [];
    private receivers: ReceiverInterface[] | null = [];

    constructor() {
        this.config = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        };
        this.emailer = new Emailer(this.config);
    }

    /**
     * Method to call for sending notifications emails.
     * @param subject Email object.
     * @param receivers List of emails.
     * 
     * @author Francisco Fernandez <francisco59553@gmail.com>
     */
    public async sendEmails(subject: string, datas: GameCacheDocumentInterface[]) {
        try {
            this.datas = datas;
            this.receivers = await this.dataService.getReceivers();
            const emailList = this.receivers?.map(receiver => receiver.email);
            if (emailList) {
                logger.info("Preparing transporter...");
                // Create transporter
                const transporterResponse = await this.prepareTransporter();
                logger.info(`Transporter response : ${transporterResponse}`);
                logger.info("Sending emails...");
                // Prepare receiver list with options
                const datasToCompile = this.buildDatasForTemplate();
                const $emailsToSend = emailList.map(element => {
                    // Create email template
                    datasToCompile.uuid = this.receivers?.find(el => el.email = element)?.uuid;
                    const emailOptions: EmailOptionsInterface = this.prepareTemplate(subject, datasToCompile);
                    return this.emailer.sendEmail({ ...emailOptions, to: [element] });
                });
                // Send all emails
                const sendingStatus = await Promise.all($emailsToSend);
                // Check response from every send email
                this.verifyEmailSent(sendingStatus, emailList);
            } else {
                throw new Error("No emails provided");
            }
        } catch (err) {
            // Check if error came from email send...
            if (Array.isArray(err)) {
                err.forEach((emailResponse: EmailResponseInterface, index) => {
                    logger.error(`Email ${++index} : ${emailResponse.failed}`);
                });
                logger.error("Error while sending email : No email could be sent");
            // ... Or other
            } else {
                logger.error(`Error while sending emails : ${err}`);
            }
        }
    }

    /**
     * Method to verify the availablity of transporter and retry connection if error.
     * 
     * @author Francisco Fernandez <francisco59553@gmail.com>
     */
    private async prepareTransporter(): Promise<string> {
        let retry = 3;
        let availablity = await this.emailer.checkTransporterAvailability();
        while (retry > 0) {
            if (availablity.failed) {
                retry--;
                logger.warn("Checking transporter failed. Retrying...");
                availablity = await this.emailer.checkTransporterAvailability();
            } else {
                retry = 0;
                return (await this.emailer.checkTransporterAvailability()).success;
            }
        }
        throw (await this.emailer.checkTransporterAvailability()).failed;
    }

    /**
     * Method to build template with datas received from constructor.
     * @param subject Email subject.
     * 
     * @author Francisco Fernandez <francisco59553@gmail.com>
     */
    private prepareTemplate(subject: string, datasToCompile: DatasToCompileInterface) {
        const templateRead = fs.readFileSync("src/templates/email.template.hbs", { encoding: "utf8" });
        const template = handlebars.compile(templateRead);
        const templateToSend = template(datasToCompile);
    
        const mailOptions: EmailOptionsInterface = {
            sender: packageJson.displayName,
            from: packageJson.author.email,
            to: [],
            subject: subject,
            html: templateToSend,
        };

        return mailOptions;
    }

    /**
     * Method to separate games available now and next games.
     * 
     * @author Francisco Fernandez <francisco59553@gmail.com>
     */
    private buildDatasForTemplate() {
        const datasToCompile: DatasToCompileInterface = {
            uuid: "",
            availableGames: [],
            nextGames: []
        };

        this.datas.forEach(element => {
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

    /**
     * Method to check if emails are correctly sent.
     * @param sendingStatus Response from transporter after sending emails. 
     * @param receivers List of emails receivers.
     * 
     * @author Francisco Fernandez <francisco59553@gmail.com>
     */
    private verifyEmailSent(sendingStatus: EmailResponseInterface[], receivers: string[]) {
        let countEmailsNoSent = 0;
        sendingStatus.forEach(response => {
            if (response.failed) {
                countEmailsNoSent++;
                logger.error(`Transporter response : ${response.failed} for [${response.receiver}]`);
            } else {
                logger.info(`Transporter response : email sent to [${response.receiver}]`);
            }
        });
    
        if (countEmailsNoSent !== 0 && countEmailsNoSent !== receivers.length) {
            logger.warn(`${countEmailsNoSent} / ${receivers.length} emails couldn't be sent`);
        } else if (countEmailsNoSent === receivers.length) {
            throw sendingStatus;
        }
    }
}