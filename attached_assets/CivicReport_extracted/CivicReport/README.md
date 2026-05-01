# 🏛️ Civic Issue Reporting Platform

A full-stack MERN application that empowers citizens to report civic issues (road damage, garbage, water leakage, street light failures, etc.) and track their resolution. Government officials manage, update, and resolve tickets through a dedicated dashboard with analytics and real-time verification voting.

---

## ⚡ Quick Start (5 minutes)

### 🎯 Choose Your Setup Method:

**Windows User?** → [WINDOWS_SETUP_GUIDE.md](./WINDOWS_SETUP_GUIDE.md) (Step-by-step)

**Already familiar?** → [QUICK_START.md](./QUICK_START.md) (Ultra-quick)

**Full details?** → [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) (Complete guide)

**Just need commands?** → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (Cheatsheet)

---

## ✨ Features

### Citizen Features
- **Register / Login** with JWT authentication (Citizen, Government Official, Guest roles)
- **Report civic issues** with geolocation, photos/videos, category, description
- **Verify community reports** - upvote issues from other citizens to boost authenticity
- **Track issue status** with visual progress (Pending Verification → Verified → In Progress → Resolved)
- **Community verification system** - 5 confirmations needed for government review
- **Offline submission support** - submit issues without internet (queued for sync)
- **Anonymous reporting** - report issues without creating account
- **My Reports dashboard** - filter by status, sort by urgency/verification, grid/list views
- **Real-time notifications** - get updates when issues are verified or resolved
- **Media support** - up to 5 photos/videos per issue

### Government Official Features
- **Dashboard** - view all verified civic issues ready for action
- **Smart filtering** - by status (pending, in progress, resolved), category, urgency
- **Sorting options** - by authenticity score, deadline, date reported, category
- **Issue assignment** - assign tickets to specific departments
- **Status updates** - mark as "In Progress" or "Resolved"
- **Progress notes** - add updates and notes visible to citizens
- **Analytics** - view statistics and charts (issue distribution, resolution rate)
- **Deadline management** - set resolution deadlines for accountability

### Technical Highlights
- **Geolocation-first design** - GPS coordinates with interactive Leaflet maps
- **Community-driven verification** - proximity-weighted votes (closer users = more weight)
- **Authenticity scoring** - calculated automatically based on verification count
- **JWT-based authentication** with role-based access control (citizen/official/admin)
- **Cloudinary integration** for image & video storage
- **Responsive UI** - mobile-first design with Tailwind CSS
- **RESTful API** - well-structured endpoints for all operations
- **PostgreSQL/MongoDB** - flexible database support
- **Offline support** - IndexedDB queue for submissions
- **Real-time updates** - WebSocket-ready architecture

---

## 🛠️ Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS 3      |
| Backend     | Node.js, Express.js                  |
| Database    | MongoDB (Mongoose ODM)               |
| Auth        | JSON Web Tokens (JWT), bcryptjs      |
| File Upload | Multer + Cloudinary                  |
| State       | Context API                          |
| HTTP Client | Axios                                |

---

## 📁 Project Structure

```
civic-issue-platform/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context provider
│   │   ├── pages/              # Page-level components
│   │   ├── utils/              # Axios API instance
│   │   ├── App.jsx             # Router
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind + custom styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Express backend
│   ├── config/                 # DB & Cloudinary config
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth, upload, error handler
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── server.js               # Entry point
│   └── package.json
├── API_DOCUMENTATION.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account ([sign up free](https://cloudinary.com))

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/civic-issue-platform.git
cd civic-issue-platform
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env      # Fill in your values
npm install
npm run dev                # Starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
cp .env.example .env       # Optionally adjust API URL
npm install
npm run dev                # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/civic-issue-platform
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📸 Screenshots

> Add screenshots here after running the app locally.

| Page             | Screenshot                  |
|------------------|-----------------------------|
| Landing Page     | *screenshot placeholder*    |
| Login            | *screenshot placeholder*    |
| User Dashboard   | *screenshot placeholder*    |
| Create Ticket    | *screenshot placeholder*    |
| Ticket Detail    | *screenshot placeholder*    |
| Admin Dashboard  | *screenshot placeholder*    |
| Admin Tickets    | *screenshot placeholder*    |

---

## 🚢 Deployment

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and whitelist your IP (or `0.0.0.0/0` for any)
3. Copy the connection string into `MONGO_URI`

### Backend → Render / Railway
1. Push your repo to GitHub
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app)
3. Set root directory to `server`, build command `npm install`, start command `npm start`
4. Add all env vars from `server/.env`

### Frontend → Vercel
1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set root directory to `client`
3. Set `VITE_API_URL` to your deployed backend URL (e.g. `https://your-api.onrender.com/api`)
4. Deploy

---

## 🔧 Git Commands
```bash
# Initialize and push to GitHub
git init
git add .
git commit -m "Initial commit: Civic Issue Reporting Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/civic-issue-platform.git
git push -u origin main
```

---

## 🔮 Future Improvements
- Email/SMS notifications on ticket status changes
- Google Maps integration for precise location tagging
- Real-time updates with WebSockets
- User profile management & password reset
- Dark mode toggle
- Export analytics as PDF/CSV
- Mobile app (React Native)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
