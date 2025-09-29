"""Firebase Admin SDK setup with Realtime Database support."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials, db

SERVICE_ACCOUNT_PATH = Path(__file__).resolve().parent.parent / "firebase-service-account.json"


class MockAuth:
    """Mock Firebase auth for development without service account."""
    
    def verify_id_token(self, token: str) -> dict[str, Any]:
        """Mock token verification for development."""
        if token == "test-token":
            return {"uid": "test-user", "email": "test@example.com"}
        raise ValueError("Invalid token")


@lru_cache
def initialize_app() -> firebase_admin.App | None:
    """Initialise and cache the Firebase app instance with Realtime Database support."""
    
    # Try environment variable first (for production/Render deployment)
    service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    if service_account_json:
        try:
            service_account_dict = json.loads(service_account_json)
            
            # Get database URL from environment or construct from project ID
            project_id = service_account_dict.get('project_id')
            database_url = os.getenv('FIREBASE_DATABASE_URL', f'https://{project_id}-default-rtdb.asia-southeast1.firebasedatabase.app/')
            
            cred = credentials.Certificate(service_account_dict)
            app = firebase_admin.initialize_app(cred, {
                'databaseURL': database_url
            })
            print(f"✅ Firebase initialized from environment variable with database: {database_url}")
            return app
        except (json.JSONDecodeError, Exception) as e:
            print(f"❌ Error parsing Firebase service account from environment: {e}")
    
    # Fallback to file-based approach for local development
    if SERVICE_ACCOUNT_PATH.exists():
        try:
            with open(SERVICE_ACCOUNT_PATH, 'r') as f:
                config = json.load(f)
                
            # Check if it's still placeholder values
            if config.get('project_id', '').startswith('TODO_'):
                print("⚠️  Firebase service account file contains placeholders")
                print("💡 For local development, set FIREBASE_SERVICE_ACCOUNT_JSON environment variable")
                print("💡 Or replace firebase-service-account.json with real credentials")
                return None
            
            # Get database URL from environment or construct from project ID
            project_id = config.get('project_id')
            database_url = os.getenv('FIREBASE_DATABASE_URL', f'https://{project_id}-default-rtdb.asia-southeast1.firebasedatabase.app/')
            
            cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
            app = firebase_admin.initialize_app(cred, {
                'databaseURL': database_url
            })
            print(f"✅ Firebase initialized from service account file with database: {database_url}")
            return app
        except Exception as e:
            print(f"❌ Error initializing Firebase from file: {e}")
    
    print("🔥 Firebase initialization failed - neither environment variable nor valid service account file found")
    print("📝 To fix this:")
    print("   1. Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable with your service account JSON")
    print("   2. Or replace firebase-service-account.json with real Firebase credentials") 
    print("   3. Make sure FIREBASE_DATABASE_URL is set to your database URL")
    return None


@lru_cache
def get_firebase_auth() -> Any:
    """Return the Firebase auth module, ensuring the app is initialised."""
    app = initialize_app()
    if app is None:
        # Return mock auth for development
        return MockAuth()
    return auth


def get_firebase_db():
    """Return the Firebase Realtime Database module, ensuring the app is initialised."""
    app = initialize_app()
    if app is None:
        return None
    return db
