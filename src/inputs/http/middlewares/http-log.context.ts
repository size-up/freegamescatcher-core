import { Request } from "express";

type HttpLogRequest = Pick<Request, "method" | "originalUrl" | "hostname" | "ip">;

export function httpLogContext(request: HttpLogRequest, code?: number) {
    return {
        http: {
            method: request.method,
            url: request.originalUrl,
            host: request.hostname,
            ip: request.ip,
            ...(code === undefined ? {} : { code }),
        },
    };
}
