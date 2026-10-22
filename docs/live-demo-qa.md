# Live demo verification and screenshot capture

Use this checklist to collect **real evidence** from the deployed AURA app. Do not check off an item merely because it appears in the README or an earlier test report.

**Live app:** https://aura-salon-booking.sumitg.workers.dev/

## Before starting

- Open the URL in a private/incognito window and record the date/time and browser.
- Use only fictional customer names and phone numbers in demo data.
- Never capture or publish the admin token, Gemini API key, browser network authorization headers, or personal customer data.
- If a test fails, record the exact error and keep the item marked as pending.

## Manual acceptance checks

| ID | Check | Evidence to save |
|---|---|---|
| UI-01 | Customer booking page loads on desktop and mobile widths | `docs/screenshots/booking-desktop.png`, `booking-mobile.png` |
| API-01 | Service catalog and slots load for a selected future date | `docs/screenshots/available-slots.png` |
| API-02 | Booking with fictional demo details succeeds and appears in admin view | Screenshot with demo data only |
| API-03 | Attempt an overlapping booking and confirm the server rejects the collision | Error message screenshot (no secrets) |
| ADM-01 | Admin workspace rejects invalid token and accepts a valid token | Record pass/fail; do not screenshot the token |
| ADM-02 | Status changes, rescheduling and cancellation behave as expected | Sanitized admin screenshot |
| BILL-01 | Invoice totals match selected service prices | `docs/screenshots/invoice-preview.png` |
| BILL-02 | Browser Print → Save as PDF produces a readable invoice | Local PDF inspection; do not upload customer data |
| CHAT-01 | Ask about available services/prices; compare answer with displayed catalog | `docs/screenshots/chatbot-demo.png` |
| CHAT-02 | Test a second language and an out-of-scope request | Record prompt, observed response and outcome |
| MOB-01 | On narrow viewport, booking controls, admin view and chat remain usable | `booking-mobile.png` |

## Add verified images to README

After committing **real, sanitized** screenshots to `docs/screenshots/`, add this section near the top of the README:

```md
## Product preview

![AURA customer booking interface](docs/screenshots/booking-desktop.png)

![AURA admin dashboard](docs/screenshots/admin-dashboard.png)

![AURA chatbot demo](docs/screenshots/chatbot-demo.png)
```

Only include links to files that actually exist. Do not use AI-generated mockups as evidence of the running app.

## Test report note

The committed `docs/test-results.json` records 23 passing backend route tests using a D1-compatible SQLite adapter. Those results are not a substitute for the live deployment checks above.
