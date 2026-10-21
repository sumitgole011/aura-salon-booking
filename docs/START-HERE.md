# AURA — hiring task handoff

This is an original implementation of the GURU AI Technologies Mini Salon Booking & Billing System task. **It is not yet ready to submit.**

## What is implemented

- Responsive customer booking interface with service menu, live prices, validated name/phone/date, available times and saved-booking summary.
- Server-side validation and duration-aware availability in Asia/Kolkata, 10 AM–8 PM daily, 90-day window.
- Real relational schema: services, bookings, occupied_slots, invoices. Five required services and three sample bookings are initialized idempotently.
- Database uniqueness plus transactional writes prevents overlapping appointments. Failed rescheduling rolls back both the appointment and its slots.
- Protected admin workspace: date-grouped appointments, search/status filter, Pending → Confirmed → Done or Cancelled, rescheduling.
- Persisted invoices with server-owned prices, historical item snapshots, print/Save PDF view.
- Gemini API integration with database-grounded system prompt, English/Hinglish/Marathi instructions, scope limits and honest provider-error handling.
- Missing AI key produces explicitly labelled catalog mode, not simulated AI.

## Verified

23 backend tests passed against the actual route handlers using a D1-compatible adapter over a disk-backed SQLite database. See `test-results.json`. Includes invalid inputs, duration overlap, rollback, admin authorization, invoice snapshots, cancellation and disk reopening.

## Outstanding — do these before submission

1. Install dependencies and run the full React/Worker build. The authoring environment failed to resolve registry.npmjs.org. No successful frontend build or visual QA is claimed.
2. Apply the migration and test the app in a real Cloudflare/Vinext runtime. The SQL migration is hand-authored because Drizzle could not be installed. Regenerate/verify Drizzle metadata before future schema changes; do not reapply the initial migration to an initialized DB.
3. Set a private `ADMIN_TOKEN` and a valid `GEMINI_API_KEY`. Neither is included. Configure `GEMINI_MODEL` if the default model is unavailable for your project.
4. Run the real LLM cases in `chatbot-test-cases.md`, record actual responses and complete `prompt-iteration-note.md`. Do not submit the note as an account of LLM tests that did not happen.
5. Finish GitHub upload and live hosting. A private Sites project was registered, but source push failed with a DNS/thread error. There is NO verified live deployment, and the expected hostname is not a live link.
6. Verify mobile layout, booking/admin/billing/chat, page refresh, and cold start on the actual host.
7. Record the mandatory 2–3 minute video in your own voice. Use `video-walkthrough.md` as preparation, not as a substitute for understanding the code.

## Remaining product limits

- One salon chair/capacity unit; no multi-stylist allocation.
- No payment collection, SMS, email, customer self-service or GST calculation. Reschedule/cancel is admin-side as allowed by the task.
- Admin shared key is appropriate only for this bounded hiring demo; no individual staff roles or audit history.
- Before exposing a public deployment, configure platform rate limits for booking/chat, review abuse handling, and share only synthetic demonstration data. The hosted project is currently private.
- Sample bookings use the first initialization day, not moving daily fixtures. Choose that day in the dashboard if testing later.
- Photo and fonts load externally. The page remains usable with fallback fonts if unavailable.

## Next action on your Windows laptop

Open the extracted folder in a terminal and follow the root README. Set secrets locally in `.dev.vars` without committing them. After installation, send build errors if any; after successful setup, test the checklist above.
