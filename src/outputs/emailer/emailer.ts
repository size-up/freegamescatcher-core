import { EmailCheckTransporterInterface, EmailConfigInterface, EmailOptionsInterface, EmailResponseInterface } from "../../interfaces/email.interface";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class Emailer {
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
                    success: `Mailer is ready to take messages: ${success}`
                });
            });
        });
    }
    
    public sendEmail(mailOptions: EmailOptionsInterface) {
        return new Promise<EmailResponseInterface>((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (error, data) => {
                return resolve({
                    failed: error,
                    receiver: mailOptions.to
                });
            });
        });
    }
}