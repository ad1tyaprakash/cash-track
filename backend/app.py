"""Flask application entry point for the backend service."""
import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

# Load environment variables first
load_dotenv()

# Import routes after env variables are loaded
from routes.dashboard import dashboard_bp
from routes.posts import posts_bp
from routes.users import users_bp


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Configure Flask app
    app.config['DEBUG'] = os.getenv('FLASK_ENV') == 'development'
    
    # Enable CORS for frontend integration - allow production domains
    cors_origins = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://cash-track-frontend.onrender.com",  # Production frontend
        "https://*.onrender.com",  # Allow any Render subdomain
    ]
    
    # Get allowed origins from environment for production
    allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')
    if allowed_origins and allowed_origins[0]:
        cors_origins.extend(allowed_origins)
    
    CORS(app, origins=cors_origins)

    # Blueprint registration keeps the code modular and easier to test.
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    @app.get("/health")
    def health_check() -> dict[str, str]:
        """Simple health-check endpoint."""
        return {"status": "ok"}
    
    # Initialize Firebase connection on app startup
    with app.app_context():
        from services.firebase_db import get_firebase_store
        firebase_store = get_firebase_store()

    return app


# Create single app instance
app = create_app()


def run() -> None:
    """Run the server using the single app instance."""
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=False)


if __name__ == "__main__":
    run()
