# Azure OCR Gateway – Overview

## 1. What problem does this solve?

Many organisations receive important information as **images**:

- Scanned invoices and purchase orders
- Photos of receipts and expense reports
- ID documents, permits, forms, reports
- Screenshots or photos from mobile apps

Today, this often means:

- People **re-typing** information by hand
- Copy-pasting from PDFs
- Inconsistent accuracy and formatting
- Fragmented solutions: each team “does its own thing”

The **Azure OCR Gateway** provides a **single, well-documented API** for converting those images into structured text, using **Azure AI Vision’s OCR capabilities**.

---

## 2. What does the API do?

At its core, the API does exactly one thing **very well**:

> **“Given an image, return the text in that image as clean, structured JSON.”**

It supports:

- **Images by URL**  
  Example: an invoice stored in blob storage or a public CDN.

- **Images by upload**  
  Example: a mobile app sending a photo taken by the user.

The service:

1. Validates the incoming request.
2. Forwards the image to **Azure AI Vision OCR (Image Analysis Read)**.
3. Normalises the response to a simple JSON format:
   - Full text (`plainText`)
   - Text broken into lines
   - Optional bounding polygons (coordinates)
   - Confidence scores

---

## 3. Why not use Azure directly?

You can – and sometimes should. But a gateway adds value:

### For business stakeholders

- **Consistency**: every team gets the _same_ behaviour and error handling.
- **Governance**: a single place to implement security controls, logging, and audit.
- **Flexibility**: the backend model (or even cloud resource) can change without breaking consumers.
- **Reuse**: once built, the same service can power:
  - invoice automation
  - internal tools
  - customer-facing portals
  - analytics pipelines

### For technical teams

- No one has to:
  - Re-learn Azure API nuances.
  - Copy/paste similar code across multiple repos.
  - Re-implement input validation and edge-case handling.

- You get:
  - A **single REST endpoint** to integrate with.
  - Documentation that’s **API-first** and **example-rich**.
  - A codebase that’s designed to be **read and extended**, not just “made to work”.

---

## 4. Typical use cases

Here are some example scenarios where this API fits naturally:

1. **Invoice & billing automation**
   - Upload invoice images → extract vendor, dates, totals → feed into billing system.
   - Handle mixed sources (scans, photos, PDFs converted to images).

2. **Claims & application processing**
   - Automate extraction from forms and supporting documents in an insurance or HR context.

3. **Back-office document search**
   - OCR scanned archives, then index `plainText` in a search system or data warehouse.

4. **KYC / onboarding**
   - Extract text from identity documents, then use additional logic to validate and compare fields.

5. **Field operations & inspections**
   - Team members snap photos of labels, gauges, notes.
   - The app sends images to this API, receives text, and logs it centrally.

---

## 5. What the API does _not_ do (on purpose)

The gateway is intentionally **focused**:

- It **does not**:
  - Decide what your fields mean (e.g. “this is an invoice total”).
  - Validate business rules (e.g. tax calculations, approval limits).
  - Store documents or text long-term (that’s left to your systems).

- It **does**:
  - Provide consistent OCR results.
  - Make integration with Azure Vision simple and predictable.
  - Keep responsibilities clearly separated.

This keeps the service small, testable, and easy to reason about.

---

## 6. How to dive deeper

- Want to **set it up locally** or in dev?  
  → See [`Getting-Started.md`](./Getting-Started.md)

- Want to know **exact request/response formats**?  
  → See [`API-Reference.md`](./API-Reference.md)

- Curious how it’s built and how errors are handled?  
  → See [`Architecture-and-Design.md`](./Architecture-and-Design.md)

- Have questions like “How accurate is it?” or “What about costs?”  
  → See [`FAQ.md`](./FAQ.md)
