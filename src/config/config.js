// @ts-check

import { z } from "zod";

import { logger } from "../utils/logger.js";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  VISION_ENDPOINT: z.url("VISION_ENDPOINT must be a valid URL"),
  VISION_KEY: z.string().min(1, "VISION_KEY is required"),
  MAX_UPLOAD_SIZE_MB: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error(
    "Invalid environment configuration",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

const env = parsed.data;
const maxUploadSizeMb = env.MAX_UPLOAD_SIZE_MB
  ? Number(env.MAX_UPLOAD_SIZE_MB)
  : 4;

/**
 * Port the server listens on.
 * @type {number}
 */
export const port = Number(env.PORT) || 3000;

/**
 * Azure Vision endpoint URL (trailing slash removed).
 * @type {string}
 */
export const visionEndpoint = env.VISION_ENDPOINT.replace(/\/$/, "");

/**
 * Azure Vision API key.
 * @type {string}
 */
export const visionKey = env.VISION_KEY;

/**
 * Maximum upload size in bytes (derived from MAX_UPLOAD_SIZE_MB or default).
 * @type {number}
 */
export const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;
