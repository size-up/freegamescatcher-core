export default class UnauthorizedError extends Error {
    status = 401;
    message = "Unauthorized request";
    details = "Please provide an API key";

    constructor() {
        super();
    }
}