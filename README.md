# Cash Track

Cash Track is a personal finance tracker that combines a Flask REST API, a Next.js (App Router) dashboard UI, and Firebase (Auth + Realtime Database) for user-isolated data that can be deployed end-to-end on Render.

## Table of contents

1. [Architecture & tech stack](#architecture--tech-stack)
2. [Repository layout](#repository-layout)
3. [System requirements](#system-requirements)
4. [Environment variables](#environment-variables)
5. [Firebase setup](#firebase-setup)
6. [Local development](#local-development)
7. [Authentication & data isolation](#authentication--data-isolation)
8. [API surface](#api-surface)
9. [Deploying to Render](#deploying-to-render)
10. [Quality & troubleshooting](#quality--troubleshooting)
11. [Next steps](#next-steps)

## Architecture & tech stack

| Layer | Stack | Notes |
| --- | --- | --- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Radix UI, TanStack Table, Recharts | Auth-guarded dashboard, charts, drag-and-drop cards. |
| Backend | Flask + Gunicorn, Python 3.11, Firebase Admin SDK | REST API with per-user isolation backed by Firebase RTDB. |
| Data & Auth | Firebase Realtime Database + Firebase Auth (Email/Password + Google OAuth) | Enforced via security rules + backend token verification. |
| Hosting | Render (Backend: Python web service, Frontend: Node web service) | `render.yaml` blueprint supports one-click deploys. |

## Repository layout

```text
cash-track/
├── backend/            # Flask app, blueprints, services
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── build.sh
│   ├── requirements.txt
│   └── firebase-service-account.json (local dev only)
├── frontend/           # Next.js app
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   ├── package.json
│   └── tailwind.config.js
├── render.yaml         # Render Blueprint (deploys frontend + backend)
├── AUTHENTICATION.md   # (legacy) see README section below
├── DEPLOY.md           # (legacy) see README section below
└── README.md
```

## System requirements

- Python 3.11+
- Node.js 18+ (Next.js requirement) and npm 9+
- Firebase project with Auth + Realtime Database enabled
- Render account (free tier works; expect cold starts)
- macOS/Linux shell (commands below use zsh/bash)

## Environment variables

### Backend (`backend/.env`)

```dotenv
FLASK_ENV=development
PORT=5001
FIREBASE_DATABASE_URL=https://<project-id>-default-rtdb.asia-southeast1.firebasedatabase.app
# Either paste a service account JSON blob or point to firebase-service-account.json
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
ALLOWED_ORIGINS=http://localhost:3000,https://cash-track-frontend.onrender.com
```

- In development you can drop the downloaded service account file into `backend/firebase-service-account.json` instead of setting the JSON env variable.
- On Render, **only** use the env variable form (single-line JSON) and keep files out of the repo.

### Frontend (`frontend/.env.local`)

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase-web-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://<project-id>-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<measurement-id>
```

Copy `frontend/.env.local.example` if present or create the file manually. Missing keys will prevent Firebase Auth from initialising on the client.

## Firebase setup

1. **Create a Firebase project** (console.firebase.google.com).
2. **Enable Authentication** → Email/Password and Google providers.
3. **Enable Realtime Database** → `asia-southeast1` or your closest region.
4. **Set security rules** for per-user isolation:

```json
{
	"rules": {
		"users": {
			"$uid": {
				".read": "$uid === auth.uid",
				".write": "$uid === auth.uid"
			}
		}
	}
}
```

5. **Generate a service account JSON** (`Project settings → Service accounts → Generate new private key`).
6. **Local dev**: save the JSON to `backend/firebase-service-account.json` or paste into `FIREBASE_SERVICE_ACCOUNT_JSON`.
7. **Render**: paste the JSON as a single-line string into the backend service environment variable.

## Local development

### 1. Backend API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # if provided, otherwise create manually
python app.py
```

- Runs on `http://localhost:5001` by default with hot reload disabled (to keep Firebase singleton stable).
- `GET /health` is a simple probe to verify the service is up.

### 2. Frontend dashboard

```bash
cd frontend
npm install
npm run dev
```

- App router lives at `src/app`. Key routes include `/dashboard`, `/accounts`, `/analytics`, `/profile`, and `/login`.
- `ProtectedRoute` wraps every authenticated page and automatically redirects to `/login` when no Firebase ID token is present.

### 3. Linked workflow

1. Ensure the backend is running (and connected to Firebase or using the mock seed data if auth is disabled).
2. Start the frontend dev server; update `NEXT_PUBLIC_API_URL` if you map the backend to a different origin.
3. Sign in via Firebase Auth UI (Google or Email/Password). The frontend automatically attaches the ID token to every API request via `src/lib/api.ts`.

## Authentication & data isolation

- Dual auth: users can link Google OAuth and Email/Password on the same Firebase account.
- Every API route (except `/health` and `/api/dashboard/stocks/options`) requires an `Authorization: Bearer <firebase_id_token>` header.
- `services.auth.require_auth` verifies the token using Firebase Admin and injects the user context.
- All persisted data lives under `users/{uid}/...` paths in Realtime Database; backend helpers enforce the same path isolation.
- For local testing without Firebase you can send the header `Authorization: Bearer test-token` to use the `MockAuth` implementation.

## API surface

| Method & Path | Description | Auth |
| --- | --- | --- |
| `GET /health` | Health probe | ❌ |
| `GET /api/posts/` | Legacy sample transactions | ❌ |
| `POST /api/posts/` | Create legacy transaction | ❌ |
| `DELETE /api/posts/<id>` | Delete legacy transaction | ❌ |
| `POST /api/users/login` | Verifies Firebase ID token and returns profile | ✅ token payload |
| `GET /api/dashboard/overview` | Aggregate net worth widgets | ✅ |
| `POST /api/dashboard/income` | Add income transaction | ✅ |
| `POST /api/dashboard/expense` | Add expense transaction | ✅ |
| `GET /api/dashboard/transactions` | Fetch all transactions | ✅ |
| `DELETE /api/dashboard/transaction/<id>` | Delete transaction | ✅ |
| `POST /api/dashboard/stock` | Add stock position | ✅ |
| `DELETE /api/dashboard/stock/<ticker>` | Delete stock | ✅ |
| `GET /api/dashboard/stocks/options` | Public list of ticker suggestions | ❌ |
| `GET /api/dashboard/investments` | Fetch investments | ✅ |
| `POST /api/dashboard/investment` | Create investment | ✅ |
| `PUT /api/dashboard/investment/<id>` | Update investment | ✅ |
| `DELETE /api/dashboard/investment/<id>` | Delete investment | ✅ |

## Deploying to Render

### Option A – Blueprint (recommended)

1. Fork this repository.
2. In Render, choose **New → Blueprint** and point to `render.yaml`.
3. Render creates two services:
	 - `cash-track-backend` (Python, rootDir `backend`, build `./build.sh`, start `gunicorn --config gunicorn.conf.py app:app`).
	 - `cash-track-frontend` (Node, rootDir `frontend`, build `npm install && npm run build`, start `npm start`).
4. Fill in the required environment variables listed in [Environment variables](#environment-variables). For secrets (Firebase service account) mark them as non-synced.
5. Deploy and wait for health checks to pass. The backend exposes `/health`; the frontend serves the Next.js app.

### Option B – Manual services

If you prefer manual control:

1. Create a **Python Web Service** on Render that points to `backend/` with the same build/start commands and env vars.
2. Upload the service account JSON as a single-line env var (`FIREBASE_SERVICE_ACCOUNT_JSON`).
3. Capture the backend URL and set `NEXT_PUBLIC_API_URL` on the frontend service.
4. Create a **Node Web Service** for `frontend/`, ensure the same Firebase client env vars are present, and redeploy when they change.

### CORS & origins

- Backend uses `flask_cors` with localhost + Render defaults. Override or extend via `ALLOWED_ORIGINS`.
- Remember to redeploy the backend whenever you change the allowed origins.

## Quality & troubleshooting

| What | Command |
| --- | --- |
| Frontend dev server | `npm run dev` |
| Frontend lint | `npm run lint` |
| Frontend production build | `npm run build` |
| Backend run (dev) | `python app.py` |
| Backend dependencies audit | `pip install -r requirements.txt` |

There is no automated backend test suite yet. Consider adding `pytest` coverage around the blueprints and Firebase service for confidence before expanding beyond Firebase mocks.

Common issues:

- **Firebase init fails locally** – ensure the service account file is valid and not the placeholder template.
- **401 from API** – confirm the frontend user session exists and `auth.currentUser.getIdToken()` resolves.
- **CORS errors** – double-check `ALLOWED_ORIGINS` and make sure the backend has been redeployed after updating env vars.
- **Render free tier sleeps** – expect 30–60s cold start the first request after inactivity.

## Next steps

- Add automated tests (pytest for backend, Playwright or React Testing Library for frontend) and wire them into CI.
- Consider enabling Firebase Firestore or Storage if you need document uploads or richer analytics.
- Expand docs in [`AUTHENTICATION.md`](AUTHENTICATION.md) and [`DEPLOY.md`](DEPLOY.md) only if you need deep-dive guides—this README now contains the canonical setup instructions.