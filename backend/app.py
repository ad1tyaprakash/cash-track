"""Flask application entry point for the backend service."""
from flask import Flask
from flask_cors import CORS

from routes.dashboard import dashboard_bp
from routes.posts import posts_bp
from routes.users import users_bp


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Enable CORS for frontend integration
    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

    # Blueprint registration keeps the code modular and easier to test.
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    @app.get("/health")
    def health_check() -> dict[str, str]:
        """Simple health-check endpoint."""
        return {"status": "ok"}

    return app

    return app


def run() -> None:
    """Run the development server."""
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)


if __name__ == "__main__":
    run()
