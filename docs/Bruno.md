# Bruno Collection

This repository includes a small set of Bruno request files used for manual API checks and quick local testing. The files are located in the `bruno-collection/` folder at the repository root.

- `bruno-collection/Health.bru` — a simple health-check Bruno request for the running local server.
- `bruno-collection/Extract Text (OCR) - URL.bru` — a POST request that calls the OCR endpoint to extract text from an image.
- `bruno-collection/Extract Text (OCR) - File.bru` — a POST request that calls the OCR endpoint to extract text from an image file upload.

**Extract Text (OCR) - URL - details:**

- Endpoint: `http://localhost:3000/api/ocr/extract-text`
- Request body template (the Bruno file builds the `imageUrl` from `imageName`):

  `{"imageUrl": "https://github.com/EthanPintoA/itis-6177-final-project/blob/main/assets/{{imageName}}.webp?raw=true","language":"en","includeBoundingPolygons": {{includeBoundingPolygons}}}`
  - Note: you can replace the `imageUrl` value with any publicly accessible image URL (for example, `"https://example.com/photo.jpg"`). If you do, the Bruno request will send that URL instead of using the `assets/` file from GitHub. This is useful for quick testing with images hosted elsewhere.

- Variables: the Bruno file includes a `vars:pre-request` block with four variable lines. Two of these set the active default values (for example `imageName: testocr1` and `includeBoundingPolygons: false`) and the other two act as alternate values (for example `~imageName: testocr2` and `~includeBoundingPolygons: true`).

- How to use the variables: enable/disable the alternate variable lines in the `vars` section to choose which image from the `assets/` folder you want to send and whether to request bounding polygons. Set `imageName` to the image filename (without extension) that exists in `assets/`, and set `includeBoundingPolygons` to `true` or `false` as needed.

**Extract Text (OCR) - File - details:**

- Endpoint: `http://localhost:3000/api/ocr/extract-text`
- Request body template (the Bruno file builds the multipart/form-data body with the file upload):

- You can replace the `file` value with any local image file path on your machine (for example, `C:\path\to\photo.jpg`). If you do, the Bruno request will send that file instead of using the `assets/` file from the repository. This is useful for quick testing with images stored locally.
