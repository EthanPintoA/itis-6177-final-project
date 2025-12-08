// @ts-check

import { logger } from "../utils/logger.js";
import { maxUploadSizeBytes } from "../config/config.js";

/**
 * Express handler for unmatched routes.
 * Responds with a 404 JSON error describing the missing route.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

/**
 * Global error handler used by Express. It normalizes several known error
 * shapes (JSON parse errors, Multer file size/type errors, etc.)
 * and returns a structured JSON error response.
 *
 * @param {any} err - Error or error-like object
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, _req, res, next) {
  logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  // Invalid JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
    });
  }

  // Multer: file too large
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: {
        code: "FILE_TOO_LARGE",
        message: `Uploaded file is too large. Max allowed size is ${Math.round(
          maxUploadSizeBytes / (1024 * 1024),
        )} MB.`,
      },
    });
  }

  // Multer: wrong file type
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Only image/* content types are supported",
      },
    });
  }

  const status = err.status || err.statusCode || 500;

  let azureDetails;
  if (err.response && typeof err.response === "object") {
    azureDetails = {
      status: err.response.status,
      data: err.response.data,
      headers: err.response.headers && {
        "x-ms-error-code": err.response.headers["x-ms-error-code"],
      },
    };
  }

  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.publicMessage || err.message || "Internal server error",
      ...(azureDetails && { details: azureDetails }),
    },
  });
}
