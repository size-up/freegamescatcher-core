import { httpLogContext } from "../../../../src/inputs/http/middlewares/http-log.context";

describe("httpLogContext", () => {
    const request = {
        method: "GET",
        originalUrl: "/v1/game/epic-games",
        hostname: "fgc.api.sizeup.cloud",
        ip: "192.0.2.1",
        headers: {
            authorization: "Bearer secret",
            "x-api-key": "secret",
        },
    };

    test("returns useful request metadata without headers", () => {
        expect(httpLogContext(request)).toEqual({
            http: {
                method: "GET",
                url: "/v1/game/epic-games",
                host: "fgc.api.sizeup.cloud",
                ip: "192.0.2.1",
            },
        });
    });

    test("includes an HTTP status code when provided", () => {
        expect(httpLogContext(request, 404).http.code).toBe(404);
    });
});
