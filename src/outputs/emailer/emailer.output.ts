import {
    EmailCheckTransporterInterface,
    EmailConfigInterface,
    EmailOptionsInterface,
    EmailResponseInterface,
} from "../../interfaces/email.interface";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class EmailerOutput {
    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    private config: EmailConfigInterface;

    constructor(config: EmailConfigInterface) {
        this.config = config;
        this.transporter = nodemailer.createTransport(this.config);
    }

    public checkTransporterAvailability(): Promise<EmailCheckTransporterInterface> {
        return new Promise<EmailCheckTransporterInterface>((resolve, reject) => {
            this.transporter.verify((error, success) => {
                return resolve({
                    failed: error,
                    success: `Mailer is ready to take messages: ${success}`,
                });
            });
        });
    }

    public async sendEmail(mailOptions: EmailOptionsInterface) {
        mailOptions = await this.checkEnvironment(mailOptions);

        return new Promise<EmailResponseInterface>((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (error, data) => {
                return resolve({
                    failed: error,
                    receiver: mailOptions.to,
                });
            });
        });
    }

    /**
     * Verify if the application is running in production mode or not, if not, prefix the @param mailOptions.subject with "[TEST]".
     */
    private async checkEnvironment(mailOptions: EmailOptionsInterface): Promise<EmailOptionsInterface> {
        if (process.env.NODE_ENV !== "production") {
            mailOptions.subject = `(TEST) ${mailOptions.subject}`;
        }
        return mailOptions;
    }
}
