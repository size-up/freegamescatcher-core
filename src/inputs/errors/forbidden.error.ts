export default class ForbiddenError extends Error {
    status = 403;
    message = "Forbidden: API key is invalid, access denied";
    details = "Please provide a valid API key";

    constructor() {
        super();
    }
}