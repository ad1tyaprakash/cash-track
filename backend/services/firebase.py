"""Firebase Admin SDK setup."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

SERVICE_ACCOUNT_PATH = Path(__file__).resolve().parent.parent / "firebase-service-account.json"


@lru_cache
def initialize_app() -> firebase_admin.App:
    """Initialise and cache the Firebase app instance."""
    if not SERVICE_ACCOUNT_PATH.exists():
        raise FileNotFoundError(
            "Firebase service account file is missing. "
            "Add backend/firebase-service-account.json or update the path."
        )

    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    return firebase_admin.initialize_app(cred)


@lru_cache
def get_firebase_auth() -> Any:
    """Return the Firebase auth module, ensuring the app is initialised."""
    initialize_app()
    return auth
