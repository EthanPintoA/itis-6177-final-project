// @ts-check

import "dotenv/config";

import app from "./app.js";
import { port } from "./config/config.js";
import { logger } from "./utils/logger.js";

app.listen(port, () => {
  logger.info(`Azure OCR API server listening on port ${port}`);
});
