# Cash Track Monorepo

This repository now follows a two-tier architecture:

- **`backend/`** — Flask REST API with Firebase integration
- **`frontend/`** — React (Next.js) client using shadcn/ui styled with Tailwind CSS

```text
cash-track/
├── backend/
│   ├── app.py
│   ├── routes/
│   │   ├── posts.py
│   │   └── users.py
│   ├── services/
│   │   └── firebase.py
│   ├── firebase-service-account.json
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── app/page.tsx
│       ├── components/
│       │   ├── CreatePostForm.tsx
│       │   └── PostsList.tsx
│       ├── lib/api.ts
│       └── styles/globals.css
├── .gitignore
└── README.md
```

## Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API exposes:

- `GET /api/posts/` — list posts (in-memory store for now)
- `POST /api/posts/` — create a post (`{"title": "...", "content": "..."}`)
- `DELETE /api/posts/<id>` — delete a post
- `POST /api/users/login` — verify a Firebase ID token
- `GET /api/users/me` — mock current user profile
- `GET /health` — service health probe

To enable Firebase auth replace the placeholder values in `firebase-service-account.json`.

## Frontend (Next.js + shadcn/ui)

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in a `.env.local` file if the backend runs somewhere other than `http://localhost:5000`.

Key components:

- `CreatePostForm` — submits posts to the Flask API
- `PostsList` — fetches posts on mount via `src/lib/api.ts`

## Development Workflow

1. Start the Flask server (`python app.py`) from the backend virtualenv
2. Start the Next.js dev server (`npm run dev`) inside `frontend`
3. Update `frontend/src/lib/api.ts` if backend URL changes

This structure keeps backend and frontend concerns isolated while allowing shared tooling (linting, tests, CI) at the repo root.