export class APIError extends Error {
    constructor(statusCode, success, error, errors) {
        super(error);
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = success;
    }
}

export const createAPIError = (statusCode, success, error, errors) => {
    return new APIError(statusCode, success, error, errors);
}