# Deploy Cash Track to Render (superseded)

Render deployment guidance now lives in [README → Deploying to Render](./README.md#deploying-to-render). This file sticks around for anyone who bookmarked the old step-by-step guide.

## Quick reminder

- Use the `render.yaml` blueprint for a two-service deployment (Python backend + Node frontend) that mirrors local dev.
- Provide the Firebase service account JSON as a single-line environment variable (`FIREBASE_SERVICE_ACCOUNT_JSON`).
- Keep the `ALLOWED_ORIGINS` list in sync with whatever Render domains you receive after provisioning.
- When the backend URL changes, redeploy the frontend with an updated `NEXT_PUBLIC_API_URL`.

If you need a printable or internal runbook, feel free to recreate the detailed instructions based on the README section and link it here.