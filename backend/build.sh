#!/usr/bin/env bash#!/usr/bin/env bash

# exit on error# exit on error

set -o errexitset -o errexit



echo "Python version:"echo "Python version:"

python --versionpython --version



echo "Pip version:"echo "Pip version:"

pip --versionpip --version



# Update pip to latest version# Update pip to latest version

pip install --upgrade pippip install --upgrade pip



echo "Installing dependencies from requirements.txt:"echo "Installing dependencies from requirements.txt:"

cat requirements.txtcat requirements.txt



# Install dependencies# Install dependencies

pip install -r requirements.txtpip install -r requirements.txt



# Create a dummy firebase service account file if it doesn't exist# Create a dummy firebase service account file if it doesn't exist

# This prevents import errors during build# This prevents import errors during build

if [ ! -f "firebase-service-account.json" ]; thenif [ ! -f "firebase-service-account.json" ]; then

    echo "Creating dummy firebase service account file..."    echo "Creating dummy firebase service account file..."

    echo '{"type": "service_account", "project_id": "dummy"}' > firebase-service-account.json    echo '{"type": "service_account", "project_id": "dummy"}' > firebase-service-account.json

fifi



echo "Build completed successfully!"echo "Build completed successfully!"