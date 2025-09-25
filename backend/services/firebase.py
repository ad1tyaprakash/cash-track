"""Firebase Admin SDK setup."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

SERVICE_ACCOUNT_PATH = Path(__file__).resolve().parent.parent / "firebase-service-account.json"


class MockAuth:
    """Mock Firebase auth for development without service account."""
    
    def verify_id_token(self, token: str) -> dict[str, Any]:
        """Mock token verification for development."""
        if token == "test-token":
            return {"uid": "test-user", "email": "test@example.com"}
        raise ValueError("Invalid token")


@lru_cache
def initialize_app() -> firebase_admin.App:
    """Initialise and cache the Firebase app instance."""
    if not SERVICE_ACCOUNT_PATH.exists():
        # For development, we'll use a mock instead of raising an error
        print("Warning: Firebase service account file is missing. Using mock for development.")
        return None

    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    return firebase_admin.initialize_app(cred)


@lru_cache
def get_firebase_auth() -> Any:
    """Return the Firebase auth module, ensuring the app is initialised."""
    app = initialize_app()
    if app is None:
        # Return mock auth for development
        return MockAuth()
    return auth
    return auth
