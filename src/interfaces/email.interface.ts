export interface EmailConfigInterface {
    host: string;
    port: number;
    auth: {
        user: string;
        pass: string;
    };
    secure: boolean;
    tls: {
        rejectUnauthorized: boolean;
    };
    dkim?: {
        domainName: string;
        keySelector: string;
        privateKey: string;
    };
}

export interface EmailOptionsInterface {
    sender: string;
    from: string;
    to: string[];
    subject: string;
    html: string;
}

export interface EmailResponseInterface {
    failed: Error | null;
    receiver: string[];
}

export interface EmailCheckTransporterInterface {
    failed: Error | null;
    success: string;
}
