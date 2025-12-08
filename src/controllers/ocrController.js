import { analyzeImage } from "../services/azureOcrService.js";

/**
 * POST /api/ocr/extract-text
 */
export async function extractText(req, res) {
  const { imageUrl, language, includeBoundingPolygons, includeRawReadResult } =
    req.validatedBody || {};

  const file = req.file;

  if (!imageUrl && !file) {
    const error = new Error(
      'Either imageUrl in JSON body or image file upload (field name "file") is required',
    );
    error.status = 400;
    error.code = "MISSING_IMAGE";
    throw error;
  }

  const source = {};

  if (imageUrl) {
    source.type = "url";
    source.imageUrl = imageUrl;
  } else if (file) {
    source.type = "upload";
    source.fileName = file.originalname;
    source.mimeType = file.mimetype;
    source.sizeBytes = file.size;
  }

  const result = await analyzeImage({
    imageUrl,
    imageBuffer: file ? file.buffer : undefined,
    language,
    includeBoundingPolygons,
    includeRawReadResult,
  });

  res.status(200).json({
    source,
    ocr: result,
  });
}
