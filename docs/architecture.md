# AURA architecture and booking workflow

This document summarizes the architecture described in the repository README. Diagrams are conceptual; they are not runtime traces or evidence of a deployed end-to-end test.

## System overview

```mermaid
flowchart LR
  U[Customer browser] --> UI[React / TypeScript UI]
  A[Admin browser] --> UI
  UI --> API[Cloudflare Worker API routes]
  API --> DB[(Cloudflare D1 / SQLite)]
  API --> GEM[Gemini REST API]
  API --> P[Service catalog and chatbot prompt]
```

- **UI:** `app/page.tsx` handles customer booking, studio workspace, invoice printing and chat.
- **API:** `app/api/[...path]/route.ts` validates requests, checks authorization, calculates pricing and coordinates database operations.
- **Database:** D1 stores services, bookings, occupied intervals and invoices.
- **AI:** The server constructs chatbot context using the service catalog and `lib/prompt.ts`; the API key stays on the server.

## Booking flow

```mermaid
sequenceDiagram
  participant C as Customer
  participant UI as React UI
  participant API as Worker API
  participant DB as D1
  C->>UI: Choose service and date
  UI->>API: GET /api/slots
  API->>DB: Read service duration and occupancy
  DB-->>API: Available data
  API-->>UI: Candidate time slots
  C->>UI: Submit booking
  UI->>API: POST /api/bookings
  API->>DB: Insert booking and occupied intervals atomically
  alt Slot remains available
    DB-->>API: Commit
    API-->>UI: Booking confirmed by server
  else Interval collision
    DB-->>API: Rollback
    API-->>UI: HTTP 409 conflict
  end
```

## What is and is not verified

The committed `docs/test-results.json` records **23/23 backend route tests passing** on 2026-10-21 with a D1-compatible disk-backed SQLite adapter. This does **not** independently establish a passing deployed Cloudflare D1 test, full browser UI test, or live Gemini model test. For manual validation, follow `docs/submission-checklist.md`.

## Visual evidence to add

Capture **real application** screenshots only after opening the live app: (1) customer booking screen, (2) selected service and available slots, (3) admin dashboard with non-sensitive demo data, (4) invoice preview with sample details, (5) chatbot response with no API keys visible. Store sanitized images under `docs/screenshots/` and link them from the README. Do not use concept mockups as screenshots.
