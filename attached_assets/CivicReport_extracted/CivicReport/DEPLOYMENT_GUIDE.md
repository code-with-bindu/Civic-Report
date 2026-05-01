# 🚀 Deployment Guide

Your code is now live on GitHub:  
👉 **[https://github.com/imrazzaditya/CivicReport](https://github.com/imrazzaditya/CivicReport)**

Follow these steps to deploy your full-stack app.

---

## 1. Backend Deployment (Render)

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Connect your GitHub account and select the `CivicReport` repo.
5. Configure the service:
   - **Name:** `civic-issue-platform-api`
   - **Region:** Closest to you (e.g. Singapore or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `server` (Important!)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Scroll down to **Environment Variables** and add these EXACT values:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://imrazzaditya:Adiraj123@cluster1.jnio3kl.mongodb.net/civic-issue-platform?retryWrites=true&w=majority&appName=Cluster1`
   - `JWT_SECRET` = `civic_platform_jwt_secret_key_2026_secure`
   - `CLOUDINARY_CLOUD_NAME` = `d...` (Copy from Cloudinary Dashboard)
   - `CLOUDINARY_API_KEY` = `...` (Copy from Cloudinary Dashboard)
   - `CLOUDINARY_API_SECRET` = `...` (Copy from Cloudinary Dashboard)
7. Click **Create Web Service**.
8. Wait for the deploy to finish. Copy the **onrender.com URL** (e.g. `https://civic-issue-platform-api.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

1. Go to your [Vercel Dashboard](https://vercel.com/imrazzaditya-gmailcoms-projects).
2. Click **Add New...** → **Project**.
3. Import the `CivicReport` repository.
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** Click "Edit" and select `client`.
5. Open **Environment Variables**:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://civicreport-monk.onrender.com/api`
     > **Note:** Make sure to append `/api` at the end!
6. Click **Deploy**.

---

## 3. Final Verification

Once Vercel finishes:
1. Open your new Vercel app URL.
2. Try registering a new user.
3. If it works, your full-stack app is live! 🚀
