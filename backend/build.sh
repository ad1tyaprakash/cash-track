#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Python version:"
python --version

echo "Pip version:"
pip --version

# Update pip to latest version
pip install --upgrade pip

echo "Installing dependencies from requirements.txt:"
cat requirements.txt

# Install dependencies
pip install -r requirements.txt

# Create a dummy firebase service account file if it doesn't exist
# This prevents import errors during build
if [ ! -f "firebase-service-account.json" ]; then
    echo "Creating dummy firebase service account file..."
    echo '{"type": "service_account", "project_id": "dummy"}' > firebase-service-account.json
fi

echo "Build completed successfully!"