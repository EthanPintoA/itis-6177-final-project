import { Router } from "express";
import multer, { memoryStorage } from "multer";

import { validateBody } from "../middlewares/validate.js";
import { ocrRequestSchema } from "../validation/ocrSchemas.js";
import { extractText } from "../controllers/ocrController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { maxUploadSizeBytes } from "../config/config.js";

/**
 * Router for OCR endpoints mounted under `/api/ocr`.
 *
 * Routes:
 * - POST `/extract-text` accepts an optional file upload (field `file`)
 *   and/or a JSON body validated by `ocrRequestSchema`.
 */
const router = Router();

// In-memory file storage; size limit from config
/**
 * Multer instance used for single-file uploads. Accepts only image/*
 * content types and enforces `maxUploadSizeBytes`.
 */
const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: maxUploadSizeBytes },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      const err = new Error("Only image files are allowed");
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

// POST /api/ocr/extract-text
router.post(
  "/extract-text",
  upload.single("file"), // optional file field
  validateBody(ocrRequestSchema),
  asyncHandler(extractText),
);

export default router;
