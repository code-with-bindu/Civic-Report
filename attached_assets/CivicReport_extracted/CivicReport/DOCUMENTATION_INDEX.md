# 📚 Documentation Index

Navigate the Civic Report application setup with these guides:

---

## 🎯 Where to Start?

### 👤 I'm a Windows user and new to development
→ **Read**: [WINDOWS_SETUP_GUIDE.md](./WINDOWS_SETUP_GUIDE.md)
- Step-by-step instructions with screenshots
- Detailed troubleshooting
- 30 minute walkthrough

### ⚡ I know Node.js and want to start NOW
→ **Read**: [QUICK_START.md](./QUICK_START.md)
- 5 minute setup
- Copy-paste commands
- Essential configuration only

### 🔧 I want all the details (development & deployment)
→ **Read**: [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)
- Complete local setup
- Database configuration
- Multiple deployment options (Render, Vercel, Docker)
- Security checklist

### 📋 I just need a quick reference cheatsheet
→ **Read**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- Commands at a glance
- Configuration files
- Troubleshooting quick fixes
- Service URLs

---

## 📖 Documentation Guide

| File | Purpose | Best For | Read Time |
|------|---------|----------|-----------|
| [QUICK_START.md](./QUICK_START.md) | Ultra-quick setup | Experienced developers | 5 min |
| [WINDOWS_SETUP_GUIDE.md](./WINDOWS_SETUP_GUIDE.md) | Windows step-by-step | Windows users, beginners | 30 min |
| [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) | Complete guide | Full project lifecycle | 1 hour |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Command cheatsheet | During development | 5 min |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Backend API reference | Developers extending API | 30 min |
| [README.md](./README.md) | Project overview | Project summary | 10 min |

---

## 🚀 Setup Flowchart

```
┌─────────────────────────────────────────┐
│  Start: Want to run Civic Report?       │
└────────────────────┬────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
    Is Windows?            Experienced?
    Yes│ No                Yes│ No
       │                      │
       ▼                      │
    WINDOWS_        ┌─────────┘
    SETUP_GUIDE    │
       │            │
       │            ▼
       │         QUICK_START
       │            │
       └────┬───────┘
            │
            ▼
    Install Node.js ✓
            │
            ▼
    Create .env files ✓
            │
            ▼
    npm install (server) ✓
            │
            ▼
    npm install (client) ✓
            │
            ▼
    npm run dev (server) ✓
            │
            ▼
    npm run dev (client) ✓
            │
            ▼
    Open http://localhost:5173 ✓
            │
            ▼
    ┌──────────────────────┐
    │  App is Running! 🎉  │
    └──────────────────────┘
            │
            ▼
    Need to deploy?
    Yes│ No
       │  │
       │  └─→ QUIT
       │
       ▼
    SETUP_AND_DEPLOYMENT.md
    (See "Production Deployment" section)
```

---

## 🔑 Quick Commands Reference

### Start

```bash
# Windows: Automated
.\setup.bat

# Windows: Manual
cd server && npm run dev        # Terminal 1
cd client && npm run dev        # Terminal 2

# macOS/Linux
./setup.sh
```

### Development

```bash
# Backend
cd server
npm install                     # First time only
npm run dev                     # Start server

# Frontend  
cd client
npm install                     # First time only
npm run dev                     # Start server
```

### Build

```bash
# Frontend production build
cd client
npm run build                   # Creates dist/ folder
npm run preview                 # Test locally
```

### Troubleshooting

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Kill process on port
# Windows: Get-NetTCPConnection -LocalPort 5173 | Select ProcessId
# macOS/Linux: lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## 📍 Key Folders

```
civic-report/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── CreateTicket        # Issue submission
│   │   │   ├── MyTickets           # Your reports
│   │   │   ├── VerifyIssues        # Verification voting
│   │   │   ├── TicketDetail        # Issue details
│   │   │   ├── Login               # Login form
│   │   │   └── Register            # Registration
│   │   ├── components/             # Reusable components
│   │   │   ├── IssueCard           # Issue display
│   │   │   ├── LocationMap         # Leaflet maps
│   │   │   └── others...
│   │   ├── context/                # Auth state
│   │   ├── hooks/                  # Custom hooks (geolocation)
│   │   └── utils/                  # API client
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.css
│
├── server/                          # Express backend
│   ├── config/                     # Database & Cloudinary setup
│   ├── controllers/                # Route handlers
│   │   ├── authController          # Login/register/tokens
│   │   ├── ticketController        # Issue CRUD
│   │   └── notificationController  # Notifications
│   ├── models/                     # MongoDB schemas
│   │   ├── User                    # User model
│   │   ├── Ticket                  # Issue model
│   │   ├── Notification            # Notification model
│   │   └── AnonSession             # Anonymous user tracking
│   ├── routes/                     # API endpoints
│   │   ├── authRoutes              # /auth endpoints
│   │   ├── ticketRoutes            # /tickets endpoints
│   │   └── notificationRoutes      # /notifications endpoints
│   ├── middleware/                 # Custom middleware
│   │   ├── auth                    # JWT verification
│   │   ├── upload                  # File upload handling
│   │   └── errorHandler            # Error handling
│   ├── server.js                   # Express app entry
│   ├── .env.example                # Environment template
│   └── package.json
│
└── Documentation
    ├── README.md                    # Project overview
    ├── QUICK_START.md              # 5-minute setup
    ├── QUICK_REFERENCE.md          # Command cheatsheet
    ├── WINDOWS_SETUP_GUIDE.md      # Windows-specific guide
    ├── SETUP_AND_DEPLOYMENT.md     # Full setup + deploy
    ├── API_DOCUMENTATION.md        # Backend API reference
    └── DOCUMENTATION_INDEX.md      # THIS FILE
```

---

## 🧪 Testing Features

### Test Account (Auto-created)
```
Email: test@example.com
Password: password123
Role: Citizen
```

### Test Workflows

1. **Submit Issue**
   - Click "New Report"
   - Allow geolocation
   - Fill form & submit

2. **Verify Issue**
   - Go to "Help Verify Issues"
   - Click "I Can Confirm This"

3. **View Reports**
   - Go to "My Reports"
   - Filter by status
   - Click to view details

4. **View as Official**
   - Register as "Government Official"
   - Department: Any value
   - Go to "Government Dashboard"

---

## 🌐 API Endpoints Cheatsheet

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.

**Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/anonymous` - Generate guest token
- `GET /api/auth/me` - Current user

**Tickets**
- `POST /api/tickets` - Create issue
- `GET /api/tickets/citizen/my-issues` - My reports
- `GET /api/tickets/location/nearby` - Nearby issues (verify)
- `GET /api/tickets/:id` - Get issue detail
- `POST /api/tickets/:id/verify` - Verify issue
- `PUT /api/tickets/:id` - Update issue
- `DELETE /api/tickets/:id` - Delete issue

**Notifications**
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

---

## 🔐 Environment Variables Needed

### Backend (.env)
```
MONGODB_URI         - MongoDB connection string
JWT_SECRET          - Secret for token generation
CLOUDINARY_CLOUD_NAME   - Cloudinary account
CLOUDINARY_API_KEY  - Cloudinary auth
CLOUDINARY_API_SECRET   - Cloudinary auth
```

### Frontend (.env.local)
```
VITE_API_URL        - Backend API base URL
```

---

## 🚀 Deployment Options

### Recommended (Free Tier)
- **Backend**: Render.com (Node.js)
- **Frontend**: Vercel.com (React)
- **Database**: MongoDB Atlas (free tier)
- **Files**: Cloudinary (free tier)

See [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md#production-deployment) for step-by-step deployment.

---

## 💡 Common Issues & Solutions

| Problem | Solution | Doc |
|---------|----------|-----|
| "Cannot find module" | `npm install` | QUICK_REFERENCE |
| Port already in use | Kill process or different port | WINDOWS_SETUP |
| MongoDB connection error | Check .env credentials | SETUP_AND_DEPLOYMENT |
| CORS error | Restart backend | QUICK_REFERENCE |
| Image upload fails | Verify Cloudinary keys | SETUP_AND_DEPLOYMENT |
| Blank page | Check browser console (F12) | WINDOWS_SETUP |

---

## 📞 Support Resources

1. **Check documentation** - Most answers in the docs above
2. **Browser console** - Press F12 → Console for frontend errors
3. **Terminal output** - Check backend/frontend terminal for server errors
4. **Error messages** - Usually descriptive, Google the exact error
5. **API docs** - See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 📊 Project Statistics

- **Frontend**: React 18.3, Vite 5.3, Tailwind CSS 3.4
- **Backend**: Node.js 21, Express 4.21, MongoDB 8.5
- **Components**: 10+ reusable React components
- **Pages**: 8 main pages (landing, login, register, create, my-tickets, verify, detail, government)
- **API Endpoints**: 20+ endpoints
- **Database Models**: 4 models (User, Ticket, Notification, AnonSession)
- **Features**: 20+ user features implemented

---

## 🎯 What's Built vs. What's Remaining

### ✅ Completed
- Backend API (all endpoints)
- Authentication system
- Issue submission with geolocation
- Community verification voting
- Issue detail view
- Citizen dashboard with filters
- Offline submission support (backend)
- Notification system (backend)

### 🔄 Partially Done
- Notification UI component (ready for implementation)
- Government dashboard (backend ready, UI pending)

### ⏳ Planned
- WebSocket real-time updates
- Index DB offline support UI
- Advanced analytics with charts
- Email notifications
- Mobile app

---

**Ready to start?** Pick your guide from the top and begin! 🚀
