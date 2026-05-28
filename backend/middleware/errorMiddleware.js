const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || res.statusCode;
  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  const response = {
    message: error.message || "Server Error",
    code: error.code || undefined,
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
    if (error.details) response.details = error.details;
  }

  return res.status(statusCode).json(response);
};

export { notFound, errorHandler };
