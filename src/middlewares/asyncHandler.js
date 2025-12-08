/**
 * Wrap an async Express handler so that rejected promises
 * are forwarded to next(), and picked up by the error handler.
 */
export function asyncHandler(fn) {
  return function wrappedAsyncHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
