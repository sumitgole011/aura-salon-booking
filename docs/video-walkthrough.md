# Mandatory 2–3 minute video

Record only after the live app and chatbot work. Speak naturally in your own words. Do not state pending checks as passed.

**0:00–0:20 — Introduction**

“Hi, I'm [your name]. This is AURA, my Mini Salon Booking and Billing System. I used React with a Vinext/Cloudflare Worker backend and a D1 SQL database. I'll show the complete appointment flow.”

**0:20–0:55 — Customer booking**

Choose a service and point out its live price and duration. Select a future date; explain that only free times appear. Enter a synthetic name and 10-digit phone, submit, and show saved date/time/service/price/reference. Refresh and verify the slot is no longer available. Explain Pending means reserved and awaiting salon review.

**0:55–1:25 — Admin**

Open the workspace without showing the admin key. Select the same day. Show the time-ordered schedule, search/status filter and confirmation. Reschedule to a free time and explain that the original slot is released only when the replacement is committed. Show cancellation on a separate sample booking.

**1:25–1:50 — Billing**

Select the customer, add Haircut and Beard Trim, and show ₹300 auto-calculated on the server. Generate the invoice, use Print/Save PDF, then close/reopen the saved invoice. Explain that historical invoice prices do not change when menu prices change.

**1:50–2:20 — Chatbot**

Ask “Haircut kitne ka hai?” and a Marathi question, then ask about home delivery. Show actual model responses. Explain that prices come from the database and the prompt limits claims to supported facts. Demonstrate that it does not falsely claim to book a slot.

**2:20–2:50 — Tricky part**

“The tricky part was overlapping appointments. A haircut at 11:00 lasts until 11:30, so rejecting only another 11:00 booking is insufficient. I reserve each five-minute interval in a table whose date and minute form a unique key. The booking and its intervals are written in one transaction. If any interval conflicts, the whole transaction rolls back. Rescheduling uses the same atomic approach.”

## Interview preparation in Hinglish

- **Request flow:** Form se POST request aati hai. Server fields validate karta hai, database se price/duration leta hai, phir booking aur occupied intervals ek transaction mein save karta hai. Success ke baad UI confirmation dikhata hai.
- **Frontend checks enough kyun nahi?** Do users ek hi free slot ek saath dekh sakte hain. Final protection database ki unique constraint aur transaction hai.
- **Five-minute buckets kyun?** Required durations 15, 30, 40, 45 aur 120 minutes hain; sab 5 ke multiples hain. Starts 15-minute steps par hain. Adjacent appointments ko unnecessary gap nahi chahiye.
- **Cancelled slots?** Cancellation status aur slots delete ek transaction mein hote hain. Done bookings ke intervals retained hain.
- **AI price hallucination?** Har request mein current catalog system context mein inject hota hai. Prompt guardrails help karte hain, but live evaluation zaroori hai; absolute guarantee claim mat karna.
- **API key browser mein kyun nahi?** Browser bundle sab dekh sakte hain. Key sirf backend environment secret mein hoti hai.
- **Invoice snapshot kyun?** Future price changes purane bill ko alter nahi karne chahiye.
