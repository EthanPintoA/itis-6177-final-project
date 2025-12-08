import ImageAnalysisClient from "@azure-rest/ai-vision-image-analysis";
import { AzureKeyCredential } from "@azure/core-auth";

import { visionEndpoint, visionKey } from "../config/config.js";

function extractLinesFromReadResult(readResult, options) {
  const includePolygons = options.includeBoundingPolygons;
  if (!readResult || !Array.isArray(readResult.blocks)) {
    return { lines: [], plainText: "" };
  }

  const lines = [];

  for (const block of readResult.blocks) {
    if (!block || !Array.isArray(block.lines)) continue;

    for (const line of block.lines) {
      if (!line) continue;

      const lineText =
        line.text ||
        (Array.isArray(line.words)
          ? line.words.map((w) => w.text).join(" ")
          : "");

      const mappedLine = { text: lineText };

      if (includePolygons) {
        if (Array.isArray(line.boundingPolygon)) {
          mappedLine.boundingPolygon = line.boundingPolygon;
        }
        if (Array.isArray(line.words)) {
          mappedLine.words = line.words.map((w) => ({
            text: w.text,
            confidence: w.confidence,
            boundingPolygon: w.boundingPolygon,
          }));
        }
      } else if (Array.isArray(line.words)) {
        mappedLine.words = line.words.map((w) => ({
          text: w.text,
          confidence: w.confidence,
        }));
      }

      lines.push(mappedLine);
    }
  }

  const plainText = lines.map((l) => l.text).join("\n");
  return { lines, plainText };
}

// Create a single client instance (reused for all requests)
const credential = new AzureKeyCredential(visionKey);
const client = ImageAnalysisClient.default(visionEndpoint, credential);

/**
 * Calls Azure AI Vision Image Analysis 4.0 Read feature using
 * the official REST client (@azure-rest/ai-vision-image-analysis).
 *
 * @param {Object} params
 * @param {string} [params.imageUrl] - Public image URL.
 * @param {Buffer} [params.imageBuffer] - Binary image buffer.
 * @param {string} [params.language] - Optional language hint (e.g. "en").
 * @param {boolean} [params.includeBoundingPolygons]
 * @param {boolean} [params.includeRawReadResult]
 */
export async function analyzeImage({
  imageUrl,
  imageBuffer,
  language,
  includeBoundingPolygons = false,
  includeRawReadResult = false,
}) {
  if (!imageUrl && !imageBuffer) {
    const err = new Error("Either imageUrl or imageBuffer must be provided");
    err.status = 400;
    err.code = "MISSING_IMAGE";
    throw err;
  }

  const features = ["Read"]; // we only need OCR; gateway keeps this focused

  const queryParameters = {
    features,
    ...(language ? { language } : {}),
  };

  let result;

  try {
    if (imageBuffer) {
      // Analyze image bytes
      result = await client.path("/imageanalysis:analyze").post({
        body: imageBuffer,
        queryParameters,
        contentType: "application/octet-stream",
      });
    } else {
      // Analyze image URL
      result = await client.path("/imageanalysis:analyze").post({
        body: { url: imageUrl },
        queryParameters,
        contentType: "application/json",
      });
    }
  } catch (err) {
    // Network / client-level error (e.g. DNS, connection issues)
    const wrapped = new Error("Azure Vision client call failed");
    wrapped.status = 502;
    wrapped.code = "AZURE_CLIENT_ERROR";
    wrapped.cause = err;
    throw wrapped;
  }

  // The REST client returns HttpResponse-like objects with status & body.
  // Non-200 means Azure returned an error payload.
  if (String(result.status) !== "200") {
    const body = result.body || {};
    const azureError = body.error || {};

    const err = new Error(azureError.message || "Azure Vision API call failed");
    err.status = Number(result.status) || 502;
    err.code = azureError.code || "AZURE_VISION_ERROR";

    // Shape an error.response object so our errorHandler can surface details
    err.response = {
      status: err.status,
      data: body,
      headers: result.headers || {},
    };

    throw err;
  }

  const iaResult = result.body; // ImageAnalysisResultOutput
  const { readResult, modelVersion, metadata } = iaResult;

  const { lines, plainText } = extractLinesFromReadResult(readResult, {
    includeBoundingPolygons,
  });

  const response = {
    plainText,
    lineCount: lines.length,
    lines,
    modelVersion,
    metadata,
  };

  if (includeRawReadResult) {
    response.rawReadResult = readResult;
  }

  return response;
}
