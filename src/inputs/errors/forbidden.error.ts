export default class ForbiddenError extends Error {
    status = 403;
    message = "Forbidden request";
    details = "API key is invalid, please provide a valid API key";

    constructor() {
        super();
    }
}
