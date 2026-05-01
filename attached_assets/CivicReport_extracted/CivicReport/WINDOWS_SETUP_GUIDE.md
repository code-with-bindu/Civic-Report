# 🖥️ Windows Setup Guide (Step-by-Step)

Complete instructions for setting up the Civic Report application on Windows.

---

## ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org))
- [ ] Visual Studio Code or text editor
- [ ] Git (optional, for version control)
- [ ] MongoDB account ([Sign up free](https://www.mongodb.com/cloud/atlas))
- [ ] Cloudinary account ([Sign up free](https://cloudinary.com/signup))

---

## 📥 Step 1: Install Node.js

1. **Download**: https://nodejs.org/
   - Click "LTS" button (Long Term Support)
   - Should be version 18 or higher

2. **Install**: Run the installer
   - Choose "Add to PATH" (important!)
   - Click "Install" → "Finish"

3. **Verify installation**:
   - Open **PowerShell** (Win + X → Windows PowerShell)
   - Type: `node --version`
   - Type: `npm --version`
   - Both should show version numbers ✓

---

## 🗂️ Step 2: Prepare Project

1. **Extract/Clone project**:
   - Extract the civic-report folder to your desired location
   - Or: `git clone <repository-url>`

2. **Open in VS Code**:
   - Open VS Code
   - File → Open Folder
   - Select the `civic-report` folder
   - Click "Select Folder"

3. **Open Terminal in VS Code**:
   - View → Terminal (or Ctrl + `)
   - You should see the project folder path

---

## 🔧 Step 3: Automated Setup (Easiest)

1. **Run setup script**:
   - In VS Code terminal, type:
   ```powershell
   .\setup.bat
   ```

2. **Wait for installation**:
   - This installs all dependencies (takes 2-3 minutes)
   - You'll see a window asking if you want to continue - click "Yes"

3. **Environment files created**:
   - `server/.env` will be created
   - `client/.env.local` will be created

---

## 📝 Step 4: Configure Credentials

### 4A: Create MongoDB Database

1. **Go to**: https://www.mongodb.com/cloud/atlas
2. **Sign Up** (free account)
3. **Create Organization** → **Create Project**
4. **Create Cluster**:
   - Choose "Free" tier
   - Select your closest region
   - Click "Create Deployment"
   - Wait ~5 minutes for cluster to initialize

5. **Create Database User**:
   - Go to "Database Access"
   - "Add New Database User"
   - Username: `admin`
   - Password: Generate strong password (copy it!)
   - Click "Create User"

6. **Configure IP Whitelist**:
   - Go to "Network Access"
   - "Add IP Address"
   - Select "Allow access from anywhere"
   - Confirm

7. **Get Connection String**:
   - Go to "Databases" → "Connect"
   - "Connect your application"
   - Select "Node.js"
   - Copy the connection string
   - Replace `<password>` with your user password

**Example**:
```
mongodb+srv://admin:myPassword@cluster0.xxxxx.mongodb.net/civic-report?retryWrites=true&w=majority
```

### 4B: Create Cloudinary Account

1. **Go to**: https://cloudinary.com/signup
2. **Sign Up** (free account)
3. **Verify email**
4. **Go to**: https://cloudinary.com/console
5. **Copy these values**:
   - Cloud Name
   - API Key
   - API Secret

### 4C: Update .env File

1. **Open** `server/.env` in VS Code
2. **Fill in your credentials**:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://admin:yourPasswordHere@cluster0.xxxxx.mongodb.net/civic-report?retryWrites=true&w=majority

JWT_SECRET=MySecretKey12345AndSomeMoreRandomText

CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

CORS_ORIGIN=http://localhost:5173
```

3. **Save** (Ctrl + S)

---

## 🚀 Step 5: Start the Application

### 5A: Start Backend Server

1. **In VS Code Terminal**:
   ```powershell
   cd server
   npm run dev
   ```

2. **Wait for message**:
   ```
   Server running on port 5000
   Connected to MongoDB
   ```

3. **Don't close this terminal!** Keep it running.

### 5B: Start Frontend Server

1. **Open NEW terminal**:
   - Click "+" icon next to terminal tab
   - Or: Ctrl + Shift + `

2. **Navigate to frontend**:
   ```powershell
   cd client
   npm run dev
   ```

3. **Wait for message**:
   ```
   ➜  Local: http://localhost:5173/
   ```

4. **Keep this terminal open too!**

---

## 🌐 Step 6: Open in Browser

1. **Click on URL** or copy-paste: http://localhost:5173

2. **You should see**:
   - Civic Report landing page
   - Options to login or sign up as citizen/official/guest

---

## 🧪 Step 7: Test the App

### Test Registration:

1. **Click "Get Started as Citizen"**
2. **Fill in form**:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Account Type: `Citizen`
3. **Click "Create Account"**
4. **Expected**: Redirect to dashboard ✓

### Test Issue Submission:

1. **Click "New Report"** button
2. **Allow geolocation** when prompted
3. **Fill in issue details**:
   - Title: `Large pothole on Main St`
   - Category: `Pothole`
   - Description: `Dangerous pothole`
   - Click "Continue"
4. **Add optional photo** or skip
5. **Click "Submit Report"**
6. **Expected**: Success confirmation ✓

### Test Issue Verification:

1. **Go to "Help Verify Issues"**
2. **Click "I Can Confirm This"** on any issue
3. **Expected**: Issue verification count increases ✓

---

## 📊 Terminal Reference

### Backend Terminal

**If you see**:
```
Server running on port 5000
Connected to MongoDB
```
✅ Backend is working!

**If you see errors**:
- Check `.env` file credentials
- Verify MongoDB connection string
- Restart with `npm run dev`

### Frontend Terminal

**If you see**:
```
➜  Local: http://localhost:5173/
```
✅ Frontend is working!

**If you see "Cannot GET /"**:
- Make sure backend is running
- Refresh the browser page

---

## 🔴 Troubleshooting

### Issue: "Port 5173 already in use"

**Solution**: Kill the process using port 5173
```powershell
# Find process on port 5173
Get-NetTCPConnection -LocalPort 5173 | Select ProcessId

# Kill it (replace XXXX with PID)
Stop-Process -Id XXXX -Force

# Or: Use different port
npm run dev -- --port 5174
```

### Issue: "Cannot find module"

**Solution**: Reinstall dependencies
```powershell
rm node_modules -Recurse
rm package-lock.json
npm install
```

### Issue: "Cannot connect to MongoDB"

**Solution**: Check connection string
1. Go to MongoDB Atlas
2. Databases → Connect
3. Copy fresh connection string
4. Update `.env` with correct credentials
5. Restart backend: `npm run dev`

### Issue: "CORS error"

**Solution**: Restart backend after `.env` changes
```powershell
# Stop: Press Ctrl + C in backend terminal
# Restart:
npm run dev
```

### Issue: "Image upload fails"

**Solution**: Verify Cloudinary credentials
1. Go to https://cloudinary.com/console
2. Copy correct Cloud Name, API Key, API Secret
3. Update `.env`
4. Restart backend

---

## 🎯 Next Steps

Once everything is working:

1. **Explore features**:
   - Submit issues with photos
   - Verify community reports
   - View analytics (as official user)

2. **Deploy to production**:
   - See [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)

3. **Customize**:
   - Modify colors in `tailwind.config.js`
   - Add your branding
   - Customize issue categories

---

## 💬 Need Help?

**Check error message**:
- Browser console: Press **F12** → Console tab
- Terminal: Check red error text

**Most common issues**:
1. MongoDB credentials wrong → Check `.env`
2. Port in use → Kill process or use different port
3. Dependencies missing → Run `npm install` again
4. CORS errors → Restart backend

**See detailed docs**:
- [QUICK_START.md](./QUICK_START.md) - Ultra-quick overview
- [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) - Full guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints

---

**Congratulations!** Your Civic Report application is now running locally! 🎉
