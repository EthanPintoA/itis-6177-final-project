/**
 * Simple logger abstraction used across the app.
 * Methods mirror console methods but are provided so the logger
 * can be swapped or extended later (e.g., to use a structured logger).
 *
 * @type {{info: (...args: any[]) => void, warn: (...args: any[]) => void, error: (...args: any[]) => void}}
 */
export const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};
