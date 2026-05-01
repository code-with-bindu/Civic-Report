# 🚀 Setup & Deployment Guide

Complete instructions for running the Civic Report application locally and deploying to production.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** (local or cloud via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account ([sign up free](https://cloudinary.com/signup))
- **Git** installed
- **npm** or **yarn** package manager

---

## 🏃 Quick Start (Local Development)

### 1. Frontend Setup (React + Vite)

```bash
cd client
npm install
npm run dev
```

**Output:**
```
  VITE v5.3.4  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 in your browser.

### 2. Backend Setup (Express + Node)

```bash
cd server
npm install
npm run dev
```

**Output:**
```
Server running on port 5000
Connected to MongoDB
```

**Note:** Backend must be running before frontend can make API requests. Requests go to `http://localhost:5000/api`

---

## ⚙️ Environment Configuration

### Backend (.env file)

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/civic-report?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_key_change_this_in_production

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Where to get credentials:**

1. **MongoDB URI**: [Atlas Dashboard](https://cloud.mongodb.com) → Create cluster → Connect → Copy connection string
2. **Cloudinary credentials**: [Cloudinary Console](https://cloudinary.com/console) → Account → Copy cloud name, API key, and secret
3. **JWT_SECRET**: Use any random string (e.g., from `openssl rand -hex 32`)

### Frontend (.env.local file)

Create a `.env.local` file in the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🧪 Testing the Application

### 1. Registration Flow

```bash
# Start both server and client
cd server && npm run dev
cd client && npm run dev  # in another terminal
```

Navigate to: http://localhost:5173/register

**Test account:**
- Name: `Test User`
- Email: `test@example.com`
- Password: `password123`
- Account Type: `Citizen`
- Department: (leave empty for citizen)

Expected: Redirects to dashboard after successful registration

### 2. Login Flow

Navigate to: http://localhost:5173/login

**Test login:**
- Email: `test@example.com`
- Password: `password123`

Expected: Redirects to dashboard with user info loaded

### 3. Submit an Issue

1. Login as citizen
2. Click "New Report" or navigate to `/dashboard/create`
3. Allow geolocation access
4. Fill form: Title, Category, Description, Location override, Photos
5. Click "Submit Report"
6. Should see success confirmation with issue ID

### 4. Verify an Issue

1. Navigate to `/dashboard/verify` (Community Verification)
2. See nearby pending issues
3. Click "I Can Confirm This" to verify
4. Check issue authenticity score increases

### 5. View My Reports

1. Navigate to `/dashboard/my-tickets` (My Reports)
2. See all your submitted issues with status
3. Use filters: Status, Sort by (Recent, Urgent, Verified)
4. Toggle between Grid/List view
5. Click on any issue to see details

---

## 📦 Production Deployment

### Option 1: Deploy to Render (Recommended for Free Tier)

#### Backend Deployment

1. **Create Render account**: https://render.com

2. **Connect GitHub repository**:
   - Click "New" → "Web Service"
   - Connect your Git repo
   - Select `server` as root directory

3. **Configure environment**:
   - **Name**: `civic-issue-server`
   - **Runtime**: `Node`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Plan**: Free

4. **Add environment variables** in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate secure random string
   - `CLOUDINARY_CLOUD_NAME`: From Cloudinary
   - `CLOUDINARY_API_KEY`: From Cloudinary
   - `CLOUDINARY_API_SECRET`: From Cloudinary
   - `NODE_ENV`: `production`
   - `PORT`: `5000`

5. **Deploy**: Render auto-deploys on git push

**Backend URL**: `https://civic-issue-server.onrender.com/api`

#### Frontend Deployment (Vercel or Render)

**Option A: Vercel (Recommended)**

1. **Import project**: https://vercel.com/import
   - Select your GitHub repo
   - Select `client` as root directory

2. **Environment variables**:
   - `VITE_API_BASE_URL`: https://civic-issue-server.onrender.com/api

3. **Deploy**: Vercel auto-deploys on push

**Frontend URL**: `https://civic-report.vercel.app` (example)

**Option B: Render**

1. Same as backend, but:
   - Select `client` as root directory
   - **Build command**: `npm run build`
   - **Start command**: `npm preview`

---

### Option 2: Deploy to Docker

#### Dockerfile for Backend

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

#### Docker Compose (Local)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo-data:/data/db

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://root:password@mongo:27017/civic-report?authSource=admin
      JWT_SECRET: your_secret
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    depends_on:
      - mongo

  client:
    build: ./client
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:5000/api

volumes:
  mongo-data:
```

**Run locally with Docker**:

```bash
docker-compose up
```

---

## 📊 Database Setup

### MongoDB Atlas (Cloud)

1. **Create account**: https://www.mongodb.com/cloud/atlas
2. **Create cluster**:
   - Choose "Free" tier
   - Select your region
   - Wait for cluster to initialize (5 mins)
3. **Create database user**:
   - "Database Access" → "Add New Database User"
   - Username: `admin`
   - Password: Generate secure password
4. **Whitelist IP**:
   - "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` (allow all) or your IP
5. **Get connection string**:
   - "Databases" → "Connect" → "Connect your application"
   - Copy URI and paste in `.env`

**Connection String**:
```
mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/civic-report?retryWrites=true&w=majority
```

### Local MongoDB

```bash
# Install MongoDB Community Edition
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Windows
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/civic-report
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL on production URLs
- [ ] Restrict MongoDB IP whitelist to specific IPs
- [ ] Use strong passwords for all accounts
- [ ] Set `CORS_ORIGIN` to your production frontend URL
- [ ] Enable rate limiting on API endpoints
- [ ] Regular database backups enabled
- [ ] Monitor error logs and performance
- [ ] Use environment variables, never hardcode secrets

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Troubleshooting

### Issue: `Cannot GET /`

**Solution**: Make sure you're accessing the correct port
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api (not root)

### Issue: CORS errors in browser console

**Solution**: Check backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

For production, update to your frontend URL.

### Issue: "MongoDB connection failed"

**Solution**:
- Verify `MONGODB_URI` is correct
- Check MongoDB IP whitelist includes your IP
- Ensure MongoDB credentials are correct
- Test connection: `mongosh "mongodb+srv://..."` (if installed)

### Issue: Image upload fails (Cloudinary)

**Solution**:
- Verify Cloudinary credentials in `.env`
- Check Cloudinary account has upload space remaining
- Ensure file size < 100MB
- Verify CORS is enabled on Cloudinary

### Issue: "Cannot find module" errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Frontend shows blank page

**Solution**:
- Check browser console for errors (F12)
- Verify API_BASE_URL in `.env.local` matches backend
- Ensure backend is running: `npm run dev` in server/
- Check network tab for failed API requests

---

## 📝 Available Scripts

### Backend

```bash
npm start                    # Production: Run server
npm run dev                 # Development: Run with auto-reload
npm test                    # Run tests (if configured)
```

### Frontend

```bash
npm run dev                 # Start dev server (port 5173)
npm run build              # Build for production
npm run preview            # Preview production build locally
npm test                   # Run tests (if configured)
```

---

## 🎯 Next Steps

After successful deployment:

1. **Set up monitoring**: Use Render/Vercel dashboards to monitor logs
2. **Configure notifications**: Test email/SMS notifications for alerts
3. **Performance optimization**: Monitor API response times
4. **User feedback**: Gather feedback and iterate
5. **Advanced features**: Add WebSocket for real-time updates, offline support with IndexedDB

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [MongoDB Docs](https://docs.mongodb.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Render Deployment Guide](https://render.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

**Questions?** Check the API documentation in `API_DOCUMENTATION.md` or review error logs in the terminal.
