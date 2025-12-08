// @ts-check

import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import ocrRoutes from "./routes/ocrRoutes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

/**
 * Configured Express application instance.
 * Middlewares applied: helmet, cors, body parsers, morgan, health route,
 * OCR routes and error handlers. Exported for server startup and tests.
 *
 * @type {import('express').Express}
 */
const app = express();

// Security + CORS
app.use(helmet());
app.use(cors());

// Body parsers
app.use(json({ limit: "1mb" }));
app.use(urlencoded({ extended: true }));

// Logging
app.use(morgan("combined"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// OCR routes
app.use("/api/ocr", ocrRoutes);

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
