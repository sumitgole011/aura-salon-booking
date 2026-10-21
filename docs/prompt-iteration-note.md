# Prompt design and live validation

The system prompt defines the assistant's salon role, language
behavior and action limits. The server supplies the current service
catalog from D1, keeping prices and durations grounded in database data.
The chatbot directs customers to the booking form for live availability
and does not create or confirm appointments.

Live checks on 22 October 2026:
- Hinglish price query: returned Haircut at INR 200 for 30 minutes.
- Price override and booking request: rejected the user's INR 50 price,
  retained INR 200, and declined to confirm tomorrow's 4 PM appointment.
  It directed the customer to the date/time picker.
- Marathi query: answered in Roman Marathi with Hair Spa at INR 800
  for 45 minutes and directed the customer to the booking form.
- Home-delivery test: exact response was not captured in this note.

An integration failure initially prevented hosted chatbot responses.
Private server logs showed HTTP 400: invalid API key. Uploading the
working local key to the Cloudflare runtime secret resolved the issue,
and the deployed chatbot subsequently returned a correct response.

This was a configuration fix, not a prompt revision. The checks above
validate the current prompt. No baseline-versus-revised prompt experiment
has been completed, so no prompt improvement claim is made.
