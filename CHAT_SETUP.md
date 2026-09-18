# Lui online chat

Deploy this repository to Vercel with GEMINI_API_KEY set for Production.
The /api/chat Node function reads the deployed index.html as its reference.
No API key belongs in client JavaScript, HTML, or committed environment files.

Default model: gemini-2.5-flash. Set GEMINI_MODEL in Vercel to override it
with a compatible text generateContent model. A models/ prefix and surrounding
spaces are normalized. On a model-not-found response, the server checks the
Google model catalog and tries up to three listed text Flash models, preferring stable and Lite models.
Vercel function logs show the requested model and discovered candidates, never keys.
Availability does not guarantee free quota; check your Google project limits.
Redeploy after changing environment variables.

Online chat sends the current question and up to five recent exchanges to Gemini.
History stays in browser memory, clears on reload or fallback, and is not logged by
this application. Google's processing policies still apply.

The local npm start server remains offline-only. Use Vercel development tooling
with the server environment variable configured to test the API locally.

Validation: npm test uses mocked Gemini responses, without credentials or charges.
After deployment, ask about Accenture, then 'Which tools did she use?'.
Check an unknown detail such as salary and confirm it is not invented.

Requests and output are bounded. Burst throttling is per function instance, not a
global quota. Configure Vercel Firewall rate limits and provider quotas for stronger
public traffic controls. API grounding reduces, but cannot eliminate, inaccurate answers.
