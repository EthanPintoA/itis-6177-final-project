# Getting Started (Developers)

This guide walks you from **zero** to calling the OCR endpoint in just a few steps.

---

## 1. Prerequisites

- **Node.js** 24.11.0+ installed.
- Access to an **Azure AI Vision / Computer Vision** resource:
  - `VISION_ENDPOINT` – e.g. `https://<your-resource>.cognitiveservices.azure.com`
  - `VISION_KEY` – one of the keys from the Azure portal.

---

## 2. Installation

1. Clone the repo:

   ```bash
   git clone <repo-url> azure-ocr-gateway
   cd azure-ocr-gateway
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your own values:

   ```bash
   PORT=3000
   VISION_ENDPOINT=https://<your-vision-resource>.cognitiveservices.azure.com
   VISION_KEY=<your-vision-key>
   MAX_UPLOAD_SIZE_MB=4
   ```

   > ✅ On startup, the app validates your env vars; if something is wrong, it fails fast with a clear error.

---

## 3. Starting the service

Run in development:

```bash
npm run dev
```

Run in production mode:

```bash
npm start
```

You should see a log similar to:

```text
[INFO] Azure OCR API server listening on port 3000
```

Health check:

```bash
curl http://localhost:3000/health
# -> { "status": "ok", "timestamp": "..." }
```

---

## 4. Your first OCR request

### Option A – Using an image URL

```bash
curl -X POST http://localhost:3000/api/ocr/extract-text \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/document.png",
    "language": "en",
    "includeBoundingPolygons": false
  }'
```

If everything is correct, you’ll receive a JSON response with:

- `source` – how the image was provided
- `ocr.plainText` – the recognized text
- `ocr.lines` – array of lines with words and confidence
- Optional bounding polygons and raw Azure results, depending on flags

### Option B – Uploading an image file

```bash
curl -X POST http://localhost:3000/api/ocr/extract-text \
  -F "file=@/path/to/your-image.png"
```

The API will:

- Validate the file:
  - Must be `image/*`
  - Must be below `MAX_UPLOAD_SIZE_MB`

- Forward it to Azure as binary data.

---

## 5. Minimal client example (Node.js)

```javascript
import axios from "axios";

axios
  .post("http://localhost:3000/api/ocr/extract-text", {
    imageUrl: "https://example.com/document.png",
    language: "en",
  })
  .then(({ data }) => console.log(data.ocr?.plainText))
  .catch((err) => console.error(err));
```

---

## 6. Common setup issues

- **Invalid endpoint or key**
  - Symptom: API starts, but every OCR request fails with an `AZURE_VISION_ERROR`.
  - Check: `VISION_ENDPOINT` and `VISION_KEY` match those in the Azure portal.

- **Image URL is not reachable by Azure**
  - Symptom: Azure returns an error stating the URL is invalid or inaccessible.
  - Solution: Ensure the URL is public or accessible from Azure, or upload the image instead.

- **File too large**
  - Symptom: 413 `FILE_TOO_LARGE`.
  - Solution: Increase `MAX_UPLOAD_SIZE_MB` in `.env` (and consider performance/constraints) or resize/compress input files.

For full error codes and shapes, see
👉 [`API-Reference.md`](./API-Reference.md)
