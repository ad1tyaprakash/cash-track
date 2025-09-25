"""User authentication and profile routes."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from services.firebase import get_firebase_auth

users_bp = Blueprint("users", __name__)


def _mock_user(uid: str) -> dict[str, str]:
    """Temporary helper until real Firebase integration is wired up."""
    return {"uid": uid, "email": f"{uid}@example.com", "displayName": "Test User"}


@users_bp.post("/login")
def login():
    """Authenticate a user with Firebase ID token."""
    data = request.get_json(force=True, silent=True) or {}
    token = data.get("token")
    if not token:
        return {"error": "token is required"}, 400

    auth = get_firebase_auth()
    try:
        decoded = auth.verify_id_token(token)
    except Exception as exc:  # pragma: no cover - simple prototype
        return {"error": str(exc)}, 401

    return jsonify(_mock_user(decoded["uid"]))


@users_bp.get("/me")
def current_user():
    """Return the mock current user profile."""
    # Replace with real authentication middleware later.
    return jsonify(_mock_user("demo"))
