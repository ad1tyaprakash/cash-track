# Deploy Cash Track to Render

## Prerequisites
1. Push your code to GitHub
2. Have a Render account (free at render.com)
3. Your Firebase project configured

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Deploy Backend (API)

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect your GitHub repo**
3. **Configure the service:**
   - **Name**: `cash-track-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn --config gunicorn.conf.py app:create_app()`

4. **Set Environment Variables:**
   ```
   FLASK_ENV=production
   FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.region.firebasedatabase.app
   ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
   ```

5. **Deploy** and copy the backend URL (e.g., `https://cash-track-backend-xxx.onrender.com`)

### 3. Deploy Frontend

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect the same GitHub repo**
3. **Configure the service:**
   - **Name**: `cash-track-frontend`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

### 4. Update Backend CORS

1. **Go back to your backend service**
2. **Update environment variable:**
   ```
   ALLOWED_ORIGINS=https://your-actual-frontend-url.onrender.com
   ```
3. **Redeploy the backend**

### 5. Upload Firebase Service Account

1. **In your backend service** → **Settings** → **Files**
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

### Backend:
- `FLASK_ENV=production`
- `FIREBASE_DATABASE_URL=your-database-url`
- `ALLOWED_ORIGINS=your-frontend-url`

### Frontend:
- `NEXT_PUBLIC_API_URL=your-backend-url`
- All Firebase config variables (copy from your .env.local)

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
- **Frontend**: https://your-frontend-name.onrender.com
- **Backend API**: https://your-backend-name.onrender.com