import { z } from "zod";

/**
 * Zod schema for OCR request payloads. The body may include either
 * an `imageUrl` or an uploaded file (handled by multer). Optional flags
 * control which extra data is returned by the OCR service.
 *
 * Properties:
 * - `imageUrl` {string} optional URL to an image
 * - `language` {string} optional language hint
 * - `includeBoundingPolygons` {boolean} whether to include polygons
 * - `includeRawReadResult` {boolean} whether to include raw engine output
 *
 * @type {import('zod').ZodObject}
 */
export const ocrRequestSchema = z.object({
  imageUrl: z.string().url("imageUrl must be a valid URL").optional(),
  language: z
    .string()
    .min(2, "language must be at least 2 characters")
    .max(10)
    .optional(),
  includeBoundingPolygons: z.boolean().default(false),
  includeRawReadResult: z.boolean().default(false),
});
