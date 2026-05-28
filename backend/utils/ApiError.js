class ApiError extends Error {
  constructor(statusCode, message, code = "INTERNAL_SERVER_ERROR", details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export default ApiError;
