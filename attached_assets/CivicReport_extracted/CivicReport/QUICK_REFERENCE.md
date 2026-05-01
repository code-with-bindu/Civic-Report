# 📋 Quick Reference Card

**Civic Report - Setup & Commands Cheatsheet**

---

## 🚀 First Time Setup

```bash
# Windows: Run in PowerShell
.\setup.bat

# macOS/Linux
./setup.sh

# OR manually:
cd server && npm install && npm run dev
# (open new terminal)
cd client && npm install && npm run dev
```

---

## 🔧 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `.env` | Backend config | `server/.env` |
| `.env.local` | Frontend config | `client/.env.local` |

---

## 🔑 Required Credentials

```
MONGODB_URI: mongodb+srv://user:pass@cluster.mongodb.net/civic-report
JWT_SECRET: random-string-here
CLOUDINARY_CLOUD_NAME: your-cloud-name
CLOUDINARY_API_KEY: your-api-key
CLOUDINARY_API_SECRET: your-api-secret
```

---

## 📡 Service URLs

| Service | URL | Default |
|---------|-----|---------|
| Frontend | http://localhost:5173 | http://localhost:5173 |
| Backend | http://localhost:5000/api | http://localhost:5000/api |
| MongoDB | Atlas Cloud | mongodb+srv://... |

---

## 💻 Common Commands

### Backend (server/)
```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm start               # Start production server
```

### Frontend (client/)
```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
```

---

## 🧪 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Citizen | test@example.com | password123 |
| Official | official@example.com | password123 |

---

## 📍 Key Routes

| Page | URL | Purpose |
|------|-----|---------|
| Home | / | Landing page |
| Login | /login | User login |
| Register | /register | Create account |
| Dashboard | /dashboard | Citizen home |
| Create Report | /dashboard/create | Submit issue |
| My Reports | /dashboard/my-tickets | View your issues |
| Verify Issues | /dashboard/verify | Community verification |
| Issue Details | /dashboard/ticket/:id | View specific issue |
| Government | /government | Official dashboard |

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Module not found** | `npm install` |
| **Port in use** | Change .env PORT or kill process |
| **MongoDB error** | Check `.env` connection string |
| **CORS error** | Restart backend after `.env` change |
| **Blank page** | Check browser console (F12) |
| **Image upload fails** | Verify Cloudinary credentials |

---

## 📊 Project Structure

```
civic-report/
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # UI components
│       ├── context/     # Auth state
│       └── utils/       # API client
├── server/              # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── docs/                # Documentation
```

---

## 🚀 Deploy to Production

**Backend**: https://render.com
**Frontend**: https://vercel.com

See [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute setup |
| [WINDOWS_SETUP_GUIDE.md](./WINDOWS_SETUP_GUIDE.md) | Detailed Windows steps |
| [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) | Full setup + deploy |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API endpoints |
| [README.md](./README.md) | Project overview |

---

## 🔐 Security Checklist (Production)

- [ ] Change JWT_SECRET to random string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Restrict database access
- [ ] Use strong passwords
- [ ] Enable rate limiting
- [ ] Monitor error logs
- [ ] Regular backups enabled

---

**Need help?** Check the documentation files above! 📖
