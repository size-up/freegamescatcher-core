import fs from "fs";
import handlebars from "handlebars";
import packageJson from "../../package.json";
import { logger } from "../config/logger.config";
import { GameInterface } from "../interfaces/game.interface";
import { EmailConfigInterface, EmailOptionsInterface, EmailResponseInterface } from "../interfaces/email.interface";
import { ReceiverInterface } from "../interfaces/receiver.interface";
import { EmailerOutput } from "../outputs/emailer/emailer.output";

interface DatasToCompileInterface {
    url: string | undefined;
    uuid: string | undefined;
    availableGames: GameInterface[];
    nextGames: GameInterface[];
}

export class EmailService {
    private emailer: EmailerOutput;
    private config: EmailConfigInterface;
    private datas: GameInterface[] = [];

    constructor() {
        checkEnvVariables(); // check if all needed env variables are set

        this.config = {
            host: process.env.SMTP_HOST as string,
            port: Number(process.env.SMTP_PORT) as number,
            secure: false, // true for 465, false for other ports ; see https://stackoverflow.com/questions/55167741/nodemailer-ms-exchaneg-server-error-unable-to-verify-the-first-certificate
            auth: {
                user: process.env.SMTP_USER as string,
                pass: process.env.SMTP_PASSWORD as string,
            },
            tls: {
                rejectUnauthorized: false, // do not fail on invalid certs ; see https://stackoverflow.com/questions/55167741/nodemailer-ms-exchaneg-server-error-unable-to-verify-the-first-certificate
            },
            dkim: {
                domainName: process.env.DOMAIN_NAME as string,
                keySelector: process.env.DKIM_SELECTOR as string,
                privateKey: process.env.DKIM_PRIVATE_KEY as string,
            },
        };
        this.emailer = new EmailerOutput(this.config);
    }

    /**
     * Method to call for sending notifications emails.
     * @param receivers List of emails.
     * @param subject Email object.
     * @param datas Datas to compile in template.
     *
     * @author Francisco Fernandez <francisco59553@gmail.com>
     */
    public async sendEmails(subject: string, receivers: ReceiverInterface[], datas: GameInterface[]): Promise<void> {
        try {
            this.datas = datas;
            const emailList = receivers?.map((receiver) => receiver.email);
            if (emailList) {
                logger.info("Preparing transporter...");

                // Create transporter
                const transporterResponse = await this.prepareTransporter();
                logger.info(`Transporter response : ${transporterResponse}`);
                logger.info("Sending emails...");

                // Prepare receiver list with options
                const datasToCompile = this.buildDatasForTemplate();

                const $emailsToSend = emailList.map((email) => {
                    datasToCompile.uuid = receivers?.find((el) => (el.email = email))?.uuid;

                    if (datasToCompile.uuid) {
                        // Create email template
                        const mailOptions: EmailOptionsInterface = this.prepareTemplate(subject, datasToCompile);
                        return this.emailer.sendEmail({ ...mailOptions, to: [email] });
                    } else {
                        throw new Error(`No uuid found for this email for: ${email}`);
                    }
                });

                // Send all emails
                const sendingStatus = await Promise.all($emailsToSend);

                // Check response from every send email
                this.verifyEmailSent(sendingStatus, emailList);
            } else {
                throw new Error("No emails provided");
            }
        } catch (error) {
            // Check if error came from email send...
            if (Array.isArray(error)) {
                error.forEach((emailResponse: EmailResponseInterface, index) => {
                    logger.error(`Email ${++index} : ${emailResponse.failed}`);
                    throw new Error(`Email index ${index} : ${emailResponse.failed}`);
                });
                const message = "Error while sending email : No email could be sent";
                logger.error(message);
                throw new Error(message);
                // ... Or other
            } else {
                const message = `Error while sending emails : ${error}`;
                logger.error(message);
                throw new Error(message);
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

        // Used to custom the "from" field, to retrieve the application name instead of the email address
        const from = `${packageJson.displayName} <${packageJson.author.email}>`;

        const mailOptions: EmailOptionsInterface = {
            sender: packageJson.displayName,
            from: from,
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
    private buildDatasForTemplate(): DatasToCompileInterface {
        const datasToCompile: DatasToCompileInterface = {
            url: process.env.API_URL as string,
            uuid: undefined,
            availableGames: [],
            nextGames: [],
        };

        this.datas.forEach((element) => {
            const gameStartDate = new Date(element.promotion.startDate);
            if (gameStartDate > new Date()) {
                datasToCompile.nextGames.push(element);
            } else {
                datasToCompile.availableGames.push(element);
            }

            element.promotion.endDate = Intl.DateTimeFormat("en-GB")
                .format(new Date(element.promotion.endDate))
                .split("/")
                .join(" / ");

            element.promotion.startDate = Intl.DateTimeFormat("en-GB")
                .format(new Date(element.promotion.startDate))
                .split("/")
                .join(" / ");
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
        sendingStatus.forEach((response) => {
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

/**
 * Function to check if all necessary environment variables are set.
 * @throws Error if one of the environment variable is missing.
 * @returns void
 */
function checkEnvVariables() {
    const envVariables = [
        "API_URL",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASSWORD",
        "DOMAIN_NAME",
        "DKIM_SELECTOR",
        "DKIM_PRIVATE_KEY",
    ];

    envVariables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Missing [${variable}] environment variable`);
        }
    });
}
