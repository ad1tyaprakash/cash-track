# Deploy Cash Track to Render

## Architecture Overview
- **Frontend**: Next.js app with shadcn/ui components
- **Backend**: Flask API with gunicorn
- **Database**: Firebase Realtime Database (fully replaces in-memory storage)
- **Authentication**: Firebase Auth

## Prerequisites
1. Push your code to GitHub
2. Have a Render account (free at render.com)  
3. Firebase project with Realtime Database enabled
4. Firebase service account JSON key

## Deployment Steps

### 1. Firebase Setup
1. **Enable Realtime Database** in your Firebase project
2. **Set database rules** (for development, you can use test rules):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. **Get your database URL** from Firebase Console → Realtime Database
   - Format: `https://cashtrack-182df-default-rtdb.asia-southeast1.firebasedatabase.app`

### 2. Push to GitHub
```bash
git add .
git commit -m "Switch to Firebase Realtime Database"
git push origin main
```

### 3. Deploy Backend (API)

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect your GitHub repo**
3. **Configure the service:**
   - **Name**: `cash-track-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python` (select from dropdown)
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn --config gunicorn.conf.py app:app`

4. **Set Environment Variables:**
   ```
   FLASK_ENV=production
   FIREBASE_DATABASE_URL=https://cashtrack-182df-default-rtdb.asia-southeast1.firebasedatabase.app
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   ALLOWED_ORIGINS=https://cash-track-frontend.onrender.com
   ```
   
   ⚠️ **Important**: Use your actual Firebase service account JSON for FIREBASE_SERVICE_ACCOUNT_JSON

5. **Deploy** and copy the backend URL (e.g., `https://cash-track-backend.onrender.com`)

### 4. Deploy Frontend

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect the same GitHub repo**
3. **Configure the service:**
   - **Name**: `cash-track-frontend`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node` (select from dropdown)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://cash-track-backend.onrender.com
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAZbOv2vN_gz5uop7XxN7AaG3MJv91LRKg
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cashtrack-182df.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://cashtrack-182df-default-rtdb.asia-southeast1.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=cashtrack-182df
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cashtrack-182df.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=789777829329
   NEXT_PUBLIC_FIREBASE_APP_ID=1:789777829329:web:b1003bc3fe328f8909e4f0
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-P5DCF2QQ8D
   ```

### 5. Update Backend CORS

1. **Go back to your backend service**
2. **Update environment variable:**
   ```
   ALLOWED_ORIGINS=https://cash-track-frontend.onrender.com
   ```
3. **Redeploy the backend**

### 6. Upload Firebase Service Account

**Important:** You need to download your actual Firebase service account from the Firebase Console before proceeding.

**Option A: Environment Variable (Recommended for Free Tier)**
1. **Go to Firebase Console** → **Project Settings** → **Service accounts**
2. **Click "Generate new private key"** → **Download the JSON file**
3. **Copy the entire JSON content** and paste it as the `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable in your backend service
4. **Format as single line** (remove all line breaks)

**Option B: File Upload (If Available)**
1. **In your backend service** → **Settings** → **Files** (may not be available on free tier)
2. **Add a new file**: `firebase-service-account.json`
3. **Paste your actual Firebase service account JSON content**

## Database Migration Complete ✅

Your Cash Track app now uses **Firebase Realtime Database** exclusively:

- ✅ **No more in-memory storage** - all data persists in Firebase
- ✅ **Data seeding** - New Firebase databases get automatically seeded with sample data
- ✅ **Real-time sync** - Changes are immediately saved to the cloud
- ✅ **Cross-device access** - Your data syncs across all devices
- ✅ **Backup included** - Firebase provides automatic backups

The app will automatically:
1. **Check Firebase availability** on startup
2. **Seed with sample data** if database is empty
3. **Fall back gracefully** to local data if Firebase is unavailable (development only)
3. **Convert the JSON to a single line** (remove all newlines and spaces between elements)
4. **In your backend service** → **Environment**
5. **Add environment variable:**
   ```
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"cashtrack-182df","private_key_id":"your-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@cashtrack-182df.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40cashtrack-182df.iam.gserviceaccount.com"}
   ```
   **Note:** Replace the placeholder values with your actual Firebase service account data.

**Option B: File Upload (If Available)**
1. **In your backend service** → **Settings** → **Files** (may not be available on free tier)
2. **Add a new file**: `firebase-service-account.json`
3. **Paste your actual Firebase service account JSON content**

## Alternative: One-Click Deploy

Use the render.yaml file:

1. **Fork this repository**
2. **Go to Render Dashboard** → **New** → **Blueprint**
3. **Connect your forked repository**
4. **Render will auto-deploy both services**
5. **Set the environment variables as described above**

## Environment Variables Summary

### Backend (Required):
- `FLASK_ENV=production`
- `FIREBASE_DATABASE_URL=https://cashtrack-182df-default-rtdb.asia-southeast1.firebasedatabase.app`
- `FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}` (complete JSON as single line)
- `ALLOWED_ORIGINS=https://cash-track-frontend.onrender.com`

### Frontend (Required):
- `NEXT_PUBLIC_API_URL=https://cash-track-backend.onrender.com`
- `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAZbOv2vN_gz5uop7XxN7AaG3MJv91LRKg`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cashtrack-182df.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://cashtrack-182df-default-rtdb.asia-southeast1.firebasedatabase.app`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=cashtrack-182df`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cashtrack-182df.firebasestorage.app`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=789777829329`
- `NEXT_PUBLIC_FIREBASE_APP_ID=1:789777829329:web:b1003bc3fe328f8909e4f0`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-P5DCF2QQ8D`

## Troubleshooting

### Backend Issues:
- Check logs in Render dashboard
- Ensure build script is executable
- Verify Firebase credentials

### Frontend Issues:
- Check environment variables are set
- Verify API_URL points to backend
- Check CORS configuration

### CORS Errors:
- Make sure ALLOWED_ORIGINS includes your frontend URL
- Redeploy backend after changing CORS settings

## Free Tier Limitations
- Services sleep after inactivity
- Limited build minutes
- Slower cold starts

Your app will be available at:
- **Frontend**: https://cash-track-frontend.onrender.com
- **Backend API**: https://cash-track-backend.onrender.com