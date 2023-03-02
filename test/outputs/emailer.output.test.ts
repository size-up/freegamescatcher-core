import { EmailerOutput } from "../../src/outputs/emailer/emailer.output";

import nodemailer from "nodemailer";

describe("EmailerOutput", () => {
    jest.mock("nodemailer");
    nodemailer.createTransport = jest.fn().mockReturnValue({
        sendMail: jest.fn().mockImplementation((mailOptions, callback) => {
            callback(null, "any");
        }),
    });

    let emailer: EmailerOutput;

    beforeEach(() => {
        emailer = new EmailerOutput({
            host: "smtp.example.com",
            port: 587,
            secure: false,
            auth: {
                user: "test@example.com",
                pass: "password",
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    });

    test(`given NODE_ENV is set to "production" and standard mail options,
        when sendEmail is called,
        then should send an email with the given options`, async () => {
        // given
        const mailOptions = {
            // eslint-disable-next-line @typescript-eslint/quotes
            from: '"Test" <test@example.com>',
            to: ["john.doe@example.com"],
            subject: "Hello",
            text: "Hello world!",
            html: "<b>Hello world!</b>",
            sender: "Tester",
        };

        const mailOptionsCloned = JSON.parse(JSON.stringify(mailOptions));

        // when
        process.env.NODE_ENV = "production";

        const spyParameter = jest.spyOn(emailer, "sendEmail");
        await emailer.sendEmail(mailOptions);

        // then
        expect(spyParameter.mock.calls.length).toEqual(1);
        const firstCallParameter = spyParameter.mock.calls[0][0];

        expect(firstCallParameter).toBeDefined();
        expect(firstCallParameter).toEqual(mailOptionsCloned);
    });

    test(`given NODE_ENV is set to "development" and standard mail options,
        when sendEmail is called,
        then should send an email with the given options and subject prefixed by (TEST)`, async () => {
        // given
        const mailOptions = {
            // eslint-disable-next-line @typescript-eslint/quotes
            from: '"Test" <test@example.com>',
            to: ["john.doe@example.com"],
            subject: "Hello",
            text: "Hello world!",
            html: "<b>Hello world!</b>",
            sender: "Tester",
        };

        const mailOptionsCloned = JSON.parse(JSON.stringify(mailOptions));

        // when
        process.env.NODE_ENV = "development";

        const spyParameter = jest.spyOn(emailer, "sendEmail");
        await emailer.sendEmail(mailOptions);

        // then
        expect(spyParameter.mock.calls.length).toEqual(1);

        const firstCallParameter = spyParameter.mock.calls[0][0];

        expect(firstCallParameter).toBeDefined();
        expect(firstCallParameter).not.toEqual(mailOptionsCloned);
        expect(firstCallParameter.subject).toEqual(`(TEST) ${mailOptionsCloned.subject}`);
    });
});
