# AURA — Mini Salon Booking & Billing System

## Recruiter quick view

**Problem:** Salon appointments, billing and customer inquiries need a consistent workflow.

**Solution:** A deployed React/TypeScript application backed by Cloudflare Workers and D1, with appointment conflict handling, admin management, invoice generation and a Gemini-powered assistant.

**Engineering highlights:** Server-authoritative availability, transactional slot reservations, server-side pricing, protected admin routes and a bounded chatbot context.

**Evidence:** [Live application](https://aura-salon-booking.sumitg.workers.dev/) · [Walkthrough recording](https://drive.google.com/file/d/1LZG9bk0m8E56S3sW8gEAXLP_Nz-yHL_6/view?usp=sharing) · [Backend tests](tests/api.test.mjs) · [Submission checklist](docs/submission-checklist.md)

**Scope:** Hiring-task demo, not a production-ready multi-salon SaaS. See security and operational limitations below.


## Project links

- **Demo video:** [Watch walkthrough](https://drive.google.com/file/d/1LZG9bk0m8E56S3sW8gEAXLP_Nz-yHL_6/view?usp=sharing)

- **Live app:** https://aura-salon-booking.sumitg.workers.dev
- **GitHub:** https://github.com/sumitgole011/aura-salon-booking


Hiring-task implementation for GURU AI Technologies. Deployed on Cloudflare Workers with a hosted D1 database. The live health check confirms database connectivity and AI/admin configuration. A live chatbot reply has been verified by the project owner.

## Stack

React 19 + TypeScript, Vinext, Cloudflare Workers, D1 (SQLite), Gemini REST API. The Sites starter owns the build integration. Business logic is original. No local AI model, Docker or GPU is needed.

## Windows quick start (Node 24 recommended)

Extract this folder and open PowerShell in it:

```powershell
node --version
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_salon.sql
```

Apply the initial migration once to a fresh local database, not on every restart. The first API request seeds the five services and three sample appointments. For a fresh extraction the dashboard samples use the first initialization date in IST.

Create an untracked `.dev.vars` in the project root:

```text
ADMIN_TOKEN=replace-with-a-long-random-private-value
GEMINI_API_KEY=your-own-key
GEMINI_MODEL=gemini-2.5-flash
```

Then:

```powershell
npm run dev
```

Open the Local URL printed by the terminal (normally http://localhost:5173). Enter your ADMIN_TOKEN in the studio workspace login. The key is kept only in page memory; refreshing locks the workspace. Keep `.dev.vars` out of Git and screen recordings.

If `npm` itself has an installation-path error on Windows, invoke its installed entry point explicitly (adjust for your actual Node installation):

```powershell
node 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' ci
```

If a model is not available for your API project, set `GEMINI_MODEL` to a supported text model. Check current provider quotas yourself; the app does not require or initiate a paid subscription. Reference: https://ai.google.dev/api/generate-content

## Validation

The route tests require only Node 24, not npm dependencies:

```powershell
node --disable-warning=ExperimentalWarning tests/api.test.mjs
```

Expected: 23/23 passed. They execute the actual server route code with a D1-compatible adapter over a disk SQLite file. They do not replace testing deployed D1, the React UI or the LLM. Evidence is written to `docs/test-results.json`; isolated test DBs are ignored under `.sites-runtime`.

After dependencies install:

```powershell
npx tsc --noEmit
npm run build
```

Test the UI on a narrow mobile viewport and desktop. Complete `docs/submission-checklist.md` before submission.

## Architecture

- `app/page.tsx`: customer form, admin schedule, billing, print invoice, chat widget.
- `app/globals.css`: responsive visual design, accessibility focus styles, print rules.
- `app/api/[...path]/route.ts`: REST endpoints, authorization, validation, transactions, Gemini request.
- `lib/booking.ts`: dates, business hours, service seed data, interval calculations.
- `lib/prompt.ts`: source of the chatbot system prompt.
- `system-prompt.txt`: standalone submission copy of the exact prompt.
- `db/schema.ts`: declared relational schema.
- `drizzle/0000_salon.sql`: initial schema-only SQL migration.
- `tests/api.test.mjs`: dependency-free backend acceptance checks.

### Booking concurrency

One salon capacity unit. Starts occur every 15 minutes. Each occupied five-minute interval has a unique `(date, minute)` key. All requested intervals and the booking row are inserted in one database batch/transaction. Any collision rolls back everything. Rescheduling removes old intervals, updates the booking, and inserts replacements in one transaction, so a failed move preserves the original reservation. Cancelling frees intervals; completing preserves historical occupancy.

The browser refreshes availability every 20 seconds and after submission. A request counter discards stale responses when the user changes date/service quickly. A slot can still be claimed by another customer before submission, so the server is the final authority and returns HTTP 409 with an actionable message.

### Prices and invoices

The client never controls prices. The server loads service prices/durations from the database for both bookings and invoice creation. Invoice items are copied into the invoice record so historical prices remain stable. The print view is an invoice, not a payment receipt or a GST tax invoice.

### Chatbot

The server loads the current service catalog and injects it with the system prompt. Only the last six conversation messages and a 1000-character input are accepted. The API key stays server-side. The widget explicitly shows catalog mode if no key is configured. A live chatbot reply has been verified by the project owner. Full multilingual and prompt-injection testing should be completed separately.

### REST endpoints

| Method | Route | Access |
|---|---|---|
| GET | /api/services | Customer |
| GET | /api/slots?date=YYYY-MM-DD&service_id=1 | Customer |
| POST | /api/bookings | Customer |
| GET | /api/bookings?date=YYYY-MM-DD | Admin bearer key |
| PATCH | /api/bookings/:id | Admin bearer key |
| GET / POST | /api/invoices | Admin bearer key |
| POST | /api/chat | Customer |
| GET | /api/health | Configuration booleans only |

PATCH accepts either `{ "status": "Confirmed" }` or `{ "date": "YYYY-MM-DD", "time": "HH:mm" }`. Slots support `exclude=booking-id` only with admin authorization for rescheduling.

## Hosting and GitHub

- Live app: https://aura-salon-booking.sumitg.workers.dev
- Repository: https://github.com/sumitgole011/aura-salon-booking

Deployed directly to Cloudflare Workers with D1 bound as DB. Runtime secrets ADMIN_TOKEN, GEMINI_API_KEY and GEMINI_MODEL are configured in Cloudflare.

Keep API keys and admin credentials private. Earlier setup documents may describe pre-deployment limitations.

## Constraints and next improvements

This is a bounded hiring demo, not a production salon platform. Before public production use: add platform rate limiting, per-staff authorization, audit logging, retention policy, robust conflict handling for simultaneous admin edits and an idempotency key for retries. A shared admin key and first-run sample fixtures are intentional demo choices. Payment, SMS and multi-stylist allocation are outside this task's required scope.

Photo: externally loaded salon photo from Unsplash; fonts: Google Fonts with local fallback families. No claim is made that the fictional studio is pictured.
