# 🔐 Cash Track Authentication & User Isolation

The canonical guide for configuring authentication now lives inside the [README](./README.md#authentication--data-isolation). This file remains as a high-level reminder for contributors who bookmarked it previously.

## TL;DR

- **Dual providers**: Email/Password + Google OAuth can be linked to a single Firebase user for easy recovery.
- **Token enforcement**: Every API route (except `/health` and `/api/dashboard/stocks/options`) requires an `Authorization: Bearer <firebase_id_token>` header. Local mocks accept `test-token`.
- **Realtime Database layout**: All data lives under `users/{uid}/transactions`, `stocks`, `investments`, etc., and Firebase rules restrict reads/writes to `auth.uid`.
- **Frontend guardrails**: `ProtectedRoute` (Next.js) redirects unauthenticated visitors to `/login`, and `src/lib/api.ts` automatically attaches the ID token to outgoing requests.
- **Backend helpers**: `services.auth.require_auth` validates tokens via Firebase Admin and exposes `get_current_user_id()` to downstream services.

Refer to the README section for full setup steps, example rules, and Render-specific notes. If you add provider-specific nuances that are too detailed for the README, capture them here and link back.