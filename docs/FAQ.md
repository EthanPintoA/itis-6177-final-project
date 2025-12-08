# FAQ – Azure OCR Gateway

A mix of **business** and **technical** questions we expect to come up.

---

## Business-oriented questions

### Q1. What do we actually gain from this, beyond “cool tech”?

You gain:

- **Speed** – less manual typing and re-typing.
- **Accuracy** – fewer copy-paste errors.
- **Consistency** – one OCR process across multiple teams and apps.
- **Flexibility** – you can adjust OCR behaviour without rewriting every integration.

In practice, this supports:

- Faster invoice processing and approvals.
- Reduced onboarding and claims handling times.
- Better searchable archives of documents.

---

### Q2. Does this store our documents or data?

**By default, no.**

- The API receives your image, sends it to Azure OCR, and returns the result.
- The gateway does not persist images or text to a database.
- Logs contain high-level information (e.g., success/failure, timings) but not the document contents.

If you need storage:

- That should be implemented in your own systems (e.g. data lake, CRM, ERP), not in the gateway.

---

### Q3. How accurate is the OCR?

Accuracy depends on:

- Image quality (sharpness, resolution, lighting).
- Font type, language, and layout complexity.

The gateway itself does not change Azure’s OCR quality. It ensures:

- The image is passed correctly.
- You get a consistent structure back.
- You can adjust settings (like language hints) centrally.

---

### Q4. What about cost?

Azure charges per OCR usage (per transaction / per unit of analysis). The gateway:

- Does not add direct cloud cost beyond its own hosting.
- Can help you **monitor usage** via logs and metrics so you can forecast and control costs.

---

## Developer-oriented questions

### Q5. Why Node.js and Express?

- Popular, well understood in many teams.
- Excellent ecosystem for HTTP APIs.
- Easy to containerise and deploy.
- Simple async model for calling Azure services.

If your stack is different (e.g. Java, .NET), you can still consume this service as a simple HTTP API.

---

### Q6. Can I add authentication?

Yes – the gateway is built to be **extended**.

Typical approach:

1. Add a middleware before the routes to:
   - Validate an API key header.
   - Validate a JWT token (e.g. from Azure AD).
2. Reject unauthorised requests with `401/403`.

Because the API surface is small (one primary endpoint), auth is straightforward to add without changing the core logic.

---

### Q7. How do I deal with rate limiting?

Recommended options:

- Implement rate limiting at:
  - Your **API gateway** (e.g., Azure API Management, NGINX, Kong).
  - Or inside Express using a library like `express-rate-limit`.

Rate limiting decisions (who to limit, at what threshold) are business-specific, so they’re not hard-coded in this project.

---

### Q8. How can I trace problems back to Azure?

The gateway’s error responses:

- Include Azure’s HTTP status (if applicable).
- Include Azure’s error payload and selected headers (e.g. `x-ms-error-code`) in `error.details`.

This helps you distinguish:

- Network issues
- Bad configuration
- Azure rejections (e.g. invalid image URLs, unsupported format)

For deeper troubleshooting, you can:

- Enable more detailed logging.
- Integrate with observability tools (App Insights, OpenTelemetry, etc.).

---

### Q9. Can this handle PDFs?

Azure OCR often expects **images**, not full PDFs, in this particular call pattern. A common approach:

1. Convert PDFs to images (one per page) upstream.
2. Send each page image to this API.
3. Combine the text on your side if needed.

If your use case is heavily PDF-focused, you may consider:

- A separate PDF pipeline, or
- Extending this gateway to add PDF handling logic.

---

If your question isn’t covered here, consider opening an issue in the repo so we can improve the docs.
