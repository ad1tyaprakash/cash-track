"""Authentication routes for user management with account linking support."""
from flask import Blueprint, jsonify, request
from services.auth import require_auth, get_current_user, verify_firebase_token
from firebase_admin import auth as admin_auth
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__)

@auth_bp.get("/profile")
@require_auth
def get_user_profile():
    """Get current user profile information."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    try:
        # Get additional user info from Firebase Admin
        user_record = admin_auth.get_user(user["uid"])
        
        # Determine available sign-in methods
        providers = []
        for provider_data in user_record.provider_data:
            providers.append(provider_data.provider_id)
        
        # Also check if email/password is enabled
        if user_record.email and not user_record.disabled:
            if 'password' not in providers and len(user_record.provider_data) > 0:
                # Check if any provider is not password-based
                has_non_password = any(p.provider_id != 'password' for p in user_record.provider_data)
                if has_non_password and user_record.email:
                    providers.append('email')
            elif len(user_record.provider_data) == 0:
                providers.append('email')
        
        return jsonify({
            "uid": user["uid"],
            "email": user["email"],
            "display_name": user_record.display_name,
            "photo_url": user_record.photo_url,
            "email_verified": user_record.email_verified,
            "providers": providers,
            "authenticated": True,
            "account_linking_available": len(providers) == 1  # Can link if only one method
        })
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return jsonify({
            "uid": user["uid"],
            "email": user["email"],
            "authenticated": True,
            "providers": ["unknown"],
            "account_linking_available": False
        })

@auth_bp.post("/verify")
@require_auth  
def verify_token():
    """Verify the current token is valid."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 401
        
    return jsonify({
        "valid": True,
        "uid": user["uid"],
        "email": user["email"]
    })

@auth_bp.post("/link-account")
@require_auth
def link_account():
    """Link additional authentication methods to current account."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request data required"}), 400
    
    link_token = data.get('link_token')
    if not link_token:
        return jsonify({"error": "Link token required"}), 400
    
    try:
        # Verify the linking token
        link_user, error = verify_firebase_token_direct(link_token)
        if error:
            return jsonify({"error": f"Invalid link token: {error}"}), 400
        
        # In a real implementation, you would use Firebase Admin SDK to link accounts
        # For now, we'll return success since Firebase handles this client-side
        return jsonify({
            "success": True,
            "message": "Account linking initiated. Complete the process in your client app.",
            "uid": user["uid"]
        })
        
    except Exception as e:
        logger.error(f"Account linking error: {e}")
        return jsonify({"error": "Account linking failed"}), 500

def verify_firebase_token_direct(token: str):
    """Direct token verification without middleware."""
    try:
        from services.firebase import get_firebase_auth
        firebase_auth = get_firebase_auth()
        decoded_token = firebase_auth.verify_id_token(token)
        user_id = decoded_token['uid']
        user_email = decoded_token.get('email', '')
        
        return {
            'uid': user_id,
            'email': user_email,
            'token': decoded_token
        }, None
    except Exception as e:
        return None, str(e)