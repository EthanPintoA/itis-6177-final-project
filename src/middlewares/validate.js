import { ZodError } from "zod";

/**
 * Create an Express middleware that validates `req.body` using a Zod schema.
 * If validation succeeds the parsed value is attached as `req.validatedBody`.
 * If validation fails, a 400 response with structured details is returned.
 *
 * @param {import('zod').ZodTypeAny} schema - Zod schema to validate the request body against
 * @returns {import('express').RequestHandler} Express middleware
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body || {});
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Request body validation failed",
            details: formatted,
          },
        });
      }
      next(err);
    }
  };
}
