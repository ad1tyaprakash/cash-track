"""Authentication middleware for Firebase ID token verification."""
from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth
from services.firebase import get_firebase_auth
import logging

logger = logging.getLogger(__name__)

def verify_firebase_token():
    """Extract and verify Firebase ID token from request headers."""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, "No Authorization header provided"
    
    if not auth_header.startswith('Bearer '):
        return None, "Invalid Authorization header format"
    
    token = auth_header.split('Bearer ')[1]
    
    try:
        firebase_auth = get_firebase_auth()
        # Verify the ID token
        decoded_token = firebase_auth.verify_id_token(token)
        user_id = decoded_token['uid']
        user_email = decoded_token.get('email', '')
        
        return {
            'uid': user_id,
            'email': user_email,
            'token': decoded_token
        }, None
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None, f"Invalid token: {str(e)}"

def require_auth(f):
    """Decorator to require Firebase authentication for endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user, error = verify_firebase_token()
        
        if error:
            return jsonify({
                'error': 'Authentication required',
                'message': error
            }), 401
        
        # Store user info in Flask's g object for use in the request
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """Get the current authenticated user from Flask's g object."""
    return getattr(g, 'current_user', None)

def get_current_user_id():
    """Get the current authenticated user's ID."""
    user = get_current_user()
    return user['uid'] if user else None