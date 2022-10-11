///////// EMAIL CONFIGURATION /////////
export interface EmailConfigInterface {
    host?: string,
    port: number,
    auth: {
        user?: string,
        pass?: string
    }
}

//////////// EMAIL OPTIONS ////////////
export interface EmailOptionsInterface {
    sender: string,
    from: string,
    to: string[],
    subject: string,
    html: string,
}

//////////// EMAIL RESPONSE ////////////
export interface EmailResponseInterface {
    failed: Error | null,
    receiver: string[]
}

//////////// EMAIL CHECK TRANSPORTER ////////////
export interface EmailCheckTransporterInterface {
    failed: Error | null,
    success: string
}

