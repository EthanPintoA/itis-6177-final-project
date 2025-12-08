# API Reference

This document describes the public surface of the Azure OCR Gateway.

---

## 1. Base URL

For local development:

```text
http://localhost:<PORT>
```

Default `PORT` is `3000` (configurable via `.env`).

---

## 2. Health

### `GET /health`

Simple “is the service up?” check.

**Response (`200 OK`):**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## 3. OCR – Extract text from image

### `POST /api/ocr/extract-text`

Extracts text from an image using Azure AI Vision OCR (Image Analysis, `Read` feature).

You must provide **exactly one** of:

- `imageUrl` (in JSON body), or
- `file` (as multipart upload).

---

### 3.1 Request formats

#### A. JSON body (image URL)

**Headers:**

- `Content-Type: application/json`

**Body:**

```json
{
  "imageUrl": "https://example.com/invoice.png",
  "language": "en",
  "includeBoundingPolygons": false,
  "includeRawReadResult": false
}
```

**Fields:**

| Field                     | Type    | Required | Description                                                                           |
| ------------------------- | ------- | -------- | ------------------------------------------------------------------------------------- |
| `imageUrl`                | string  | Yes\*    | Publicly reachable URL of the image (_required if no file upload_).                   |
| `language`                | string  | No       | Optional language hint (e.g. `"en"`, `"fr"`).                                         |
| `includeBoundingPolygons` | boolean | No       | If `true`, include bounding polygons (coordinates) for lines/words. Default: `false`. |
| `includeRawReadResult`    | boolean | No       | If `true`, include raw Azure `readResult` in the response. Default: `false`.          |

#### B. Multipart form (image file)

**Headers:**

- `Content-Type: multipart/form-data`

**Form fields:**

- `file` – image file (PNG, JPEG, etc.)
- Optional text fields:
  - `language`
  - `includeBoundingPolygons`
  - `includeRawReadResult`

**Example (curl):**

```bash
curl -X POST http://localhost:3000/api/ocr/extract-text \
  -F "file=@/path/to/img.png" \
  -F "language=en" \
  -F "includeBoundingPolygons=true" \
  -F "includeRawReadResult=false"
```

**Constraints:**

- File type must be `image/*`.
- File size <= `MAX_UPLOAD_SIZE_MB` (see `.env`).

---

### 3.2 Successful response (`200 OK`)

**Shape:**

```json
{
  "source": {
    "type": "url",
    "imageUrl": "https://example.com/invoice.png"
  },
  "ocr": {
    "plainText": "ACME Corp\nInvoice #1234\nTotal: $120.00",
    "lineCount": 3,
    "lines": [
      {
        "text": "ACME Corp",
        "words": [
          { "text": "ACME", "confidence": 0.99 },
          { "text": "Corp", "confidence": 0.98 }
        ]
      },
      {
        "text": "Invoice #1234",
        "words": [
          { "text": "Invoice", "confidence": 0.96 },
          { "text": "#1234", "confidence": 0.95 }
        ]
      }
    ],
    "modelVersion": "2024-02-01",
    "metadata": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

Notes:

- If `source.type` is `"upload"`, you’ll also see:
  - `fileName`
  - `mimeType`
  - `sizeBytes`

- If `includeBoundingPolygons` is `true`, each line/word may contain a `boundingPolygon` array.
- If `includeRawReadResult` is `true`, you’ll see:

  ```json
  "rawReadResult": {
    "blocks": [ "..." ]
  }
  ```

---

### 3.3 Error responses

All errors follow a standard structure:

```jsonc
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": ["..."], // optional
  },
}
```

#### Common error codes

| HTTP    | `error.code`             | When it happens                                                             |
| ------- | ------------------------ | --------------------------------------------------------------------------- |
| 400     | `VALIDATION_ERROR`       | JSON body fails schema validation (e.g. invalid URL).                       |
| 400     | `MISSING_IMAGE`          | Neither `imageUrl` nor `file` provided.                                     |
| 400     | `UNSUPPORTED_MEDIA_TYPE` | Uploaded file is not an image (MIME not `image/*`).                         |
| 400     | `INVALID_JSON`           | Request body contains malformed JSON.                                       |
| 413     | `FILE_TOO_LARGE`         | Uploaded file exceeds `MAX_UPLOAD_SIZE_MB`.                                 |
| 4xx/5xx | `AZURE_VISION_ERROR`     | Azure Vision returns an error (invalid URL, unsupported format, etc.).      |
| 502     | `AZURE_CLIENT_ERROR`     | Network/client-level failure calling Azure (DNS issues, connection errors). |
| 500     | `INTERNAL_SERVER_ERROR`  | Unexpected error on the gateway side.                                       |

#### Example: validation error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body validation failed",
    "details": [
      {
        "path": "imageUrl",
        "message": "imageUrl must be a valid URL"
      }
    ]
  }
}
```

#### Example: Azure error bubble-up

```json
{
  "error": {
    "code": "AZURE_VISION_ERROR",
    "message": "Azure Vision API call failed",
    "details": {
      "status": 400,
      "data": {
        "error": {
          "code": "InvalidImageUrl",
          "message": "The image URL is not accessible."
        }
      },
      "headers": {
        "x-ms-error-code": "InvalidImageUrl"
      }
    }
  }
}
```

> The internal Azure key is **never** exposed in any response or log output.
