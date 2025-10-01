"""User authentication and profile routes."""
from __future__ import annotations

from datetime import datetime
from flask import Blueprint, jsonify, request
from firebase_admin import firestore

from services.firebase import get_firebase_auth, get_firestore_client

users_bp = Blueprint("users", __name__)


def _mock_user(uid: str) -> dict[str, str]:
    """Temporary helper until real Firebase integration is wired up."""
    return {"uid": uid, "email": f"{uid}@example.com", "displayName": "Test User"}


@users_bp.post("/login")
def login():
    """Authenticate a user with Firebase ID token and sync to Firestore."""
    data = request.get_json(force=True, silent=True) or {}
    token = data.get("token")
    if not token:
        return {"error": "token is required"}, 400

    auth = get_firebase_auth()
    try:
        decoded = auth.verify_id_token(token)
        
        # Sync user info to Firestore regardless of auth method
        db = get_firestore_client()
        if db is not None:
            try:
                # Check if user has password provider (completed profile)
                firebase_providers = decoded.get("firebase", {}).get("sign_in_provider", "")
                has_password_auth = "password" in str(firebase_providers) or decoded.get("firebase", {}).get("identities", {}).get("password")
                
                user_data = {
                    'uid': decoded["uid"],
                    'email': decoded.get("email", ""),
                    'displayName': decoded.get("name", decoded.get("display_name", "")),
                    'authMethod': 'firebase_auth',  # Both Google and email/password use Firebase Auth
                    'lastLogin': datetime.utcnow().isoformat(),
                    'emailVerified': decoded.get("email_verified", False),
                    'authTime': datetime.utcfromtimestamp(decoded.get("auth_time", 0)).isoformat(),
                    'hasPasswordAuth': bool(has_password_auth),
                    'profileCompleted': bool(has_password_auth)  # Profile is complete when user has password auth
                }
                
                users_ref = db.collection('users')
                users_ref.document(decoded["uid"]).set(user_data, merge=True)
            except Exception as e:
                print(f"Firestore sync failed: {e}")
                # Don't fail login if Firestore update fails
        
        return jsonify({
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
            "displayName": decoded.get("name", decoded.get("display_name", "")),
            "authMethod": "firebase_auth",
            "emailVerified": decoded.get("email_verified", False)
        })
    except Exception as exc:  # pragma: no cover - simple prototype
        return {"error": str(exc)}, 401


@users_bp.get("/me")
def current_user():
    """Return the mock current user profile."""
    # Replace with real authentication middleware later.
    return jsonify(_mock_user("demo"))
