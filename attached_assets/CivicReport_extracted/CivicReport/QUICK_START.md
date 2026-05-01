# ⚡ Quick Start Guide

Get the Civic Report application running in **5 minutes**.

---

## 🎯 TL;DR (Ultra-Quick)

```bash
# Windows: Run this in PowerShell
.\setup.bat

# macOS/Linux: Run this in terminal
chmod +x setup.sh
./setup.sh

# Then configure:
# 1. Edit server/.env with your MongoDB & Cloudinary credentials
# 2. Terminal 1: cd server && npm run dev
# 3. Terminal 2: cd client && npm run dev
# 4. Open http://localhost:5173
```

---

## 📋 Prerequisites

- **Node.js 18+**: [Download](https://nodejs.org)
- **MongoDB**: [Atlas (cloud)](https://www.mongodb.com/cloud/atlas) or [local](https://www.mongodb.com/try/download/community)
- **Cloudinary account**: [Free signup](https://cloudinary.com/signup)

Check installation:
```bash
node --version     # Should be v18+
npm --version      # Should be v9+
```

---

## 🚀 3-Step Startup

### Step 1: Copy Environment File

```bash
# In the server folder
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

### Step 2: Fill in Credentials

**Open `server/.env`** and add:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civic-report?retryWrites=true&w=majority
JWT_SECRET=generated-secret-key-here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Getting credentials:**
- **MongoDB**: [Atlas Dashboard](https://cloud.mongodb.com) → Create free cluster → Copy connection string
- **JWT_SECRET**: Use `openssl rand -hex 32` (or any random string)
- **Cloudinary**: [Console](https://cloudinary.com/console) → Account tab → Copy keys

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

Expected output:
```
Server running on port 5000
Connected to MongoDB
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

Expected output:
```
➜  Local: http://localhost:5173/
```

**Open** http://localhost:5173 in your browser ✅

---

## 🧪 Test It Works

### Try These Actions:

1. **Register**: Sign up as a citizen
   - Use: test@example.com / password123

2. **Report Issue**: 
   - Click "New Report"
   - Allow geolocation
   - Fill in issue details
   - Submit

3. **Verify Issue**:
   - Go to "Help Verify Issues"
   - Click "I Can Confirm This"

4. **View Reports**:
   - Go to "My Reports"
   - See your submitted issue

---

## 🛒 Installation Options

### Option A: Automated Setup (Recommended)

```bash
# Windows:
.\setup.bat

# macOS/Linux:
./setup.sh
```

Then configure `.env` file.

### Option B: Manual Install

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

### Option C: With Docker

```bash
docker-compose up
```

---

## 📁 Project Structure

```
civic-report/
├── client/                 # React frontend (port 5173)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context
│   │   ├── hooks/         # Custom hooks (geolocation)
│   │   └── utils/         # API client
│   ├── .env.local         # Frontend config
│   └── package.json
│
├── server/                # Express backend (port 5000)
│   ├── controllers/       # Route handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, validation
│   ├── config/            # DB & Cloudinary setup
│   ├── .env               # Backend config
│   └── package.json
│
└── Documentation files
    ├── SETUP_AND_DEPLOYMENT.md   # Full setup guide
    ├── API_DOCUMENTATION.md       # API endpoints
    └── README.md                  # Project overview
```

---

## 🔑 Environment Variables

### Backend (.env)

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |
| `JWT_SECRET` | Auth token secret | `generated-random-string` |
| `CLOUDINARY_CLOUD_NAME` | File upload service | From Cloudinary |
| `CLOUDINARY_API_KEY` | Cloudinary auth | From Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary auth | From Cloudinary |

### Frontend (.env.local)

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **Port 5173 in use** | Kill process or use different port: `npm run dev -- --port 5174` |
| **Port 5000 in use** | Edit `server/package.json`: change `PORT=5000` to `PORT=5001` in `.env` |
| **CORS errors** | Restart backend after `.env` changes |
| **"Cannot connect to MongoDB"** | Check connection string, IP whitelist in MongoDB Atlas |
| **Cloudinary upload fails** | Verify API keys, check upload quota |
| **Module not found** | Run `npm install` in that folder |
| **Blank page** | Check browser console (F12) for errors, verify backend is running |

---

## 📚 Full Documentation

For detailed setup, API endpoints, and deployment instructions, see:
- **Setup & Deployment**: [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Project Overview**: [README.md](./README.md)

---

## 🚀 Next: Deploy to Production

Once working locally, deploy to Render (free) or Vercel:

1. **Push to GitHub**
2. **Backend**: Deploy `server/` to [Render](https://render.com)
3. **Frontend**: Deploy `client/` to [Vercel](https://vercel.com)
4. **Update `.env` with production URLs**

See [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md#production-deployment) for full instructions.

---

**Need help?** Check the error message in the terminal or browser console (F12). Most issues are environment variable or port conflicts!
