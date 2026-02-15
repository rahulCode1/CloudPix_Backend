class HttpError extends Error {
    constructor(message, errorCode, errors = null) {
        super(message),
            this.errorCode = errorCode
        this.errors = errors
    }
}

module.exports = HttpError