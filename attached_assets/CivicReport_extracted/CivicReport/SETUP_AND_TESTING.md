# Quick Setup & Testing Guide

## Files Modified

### Client Side
- `client/src/pages/Register.jsx` - Complete rewrite with validation
- `client/src/pages/Login.jsx` - Enhanced with field validation
- `client/src/context/AuthContext.jsx` - Better error handling

### Server Side
- `server/controllers/authController.js` - Improved error messages
- `server/middleware/errorHandler.js` - Enhanced error handling

## How to Test

### 1. Start the Backend
```bash
cd server
npm install  # if needed
npm start    # or npm run dev for development
```

### 2. Start the Frontend
```bash
cd client
npm install  # if needed
npm run dev
```

### 3. Test Registration Flow

**Step 1: Go to Register Page**
- Navigate to `http://localhost:5173/register`

**Step 2: Test Validation Messages**
- Leave name empty → Click submit → See "Full name is required"
- Enter "J" in name → See "Name must be at least 2 characters"
- Enter invalid email → See "Please enter a valid email address"
- Enter password "123" → See "Password must be at least 6 characters"
- Enter mismatched passwords → See "Passwords do not match"

**Step 3: Successful Registration**
- Full Name: `John Doe`
- Email: `john@example.com`
- Password: `password123`
- Confirm Password: `password123`
- Account Type: `Citizen`
- Click "Create Account"
- Should redirect to dashboard after 1.5 seconds

**Step 4: Test Duplicate Email**
- Try registering with same email
- See error: "Email already registered..."

### 4. Test Login Flow

**Step 1: Go to Login Page**
- Navigate to `http://localhost:5173/login`

**Step 2: Test Validation**
- Leave fields empty → See required messages
- Enter invalid email → See "valid email" error

**Step 3: Test Wrong Credentials**
- Email: `john@example.com`
- Password: `wrongpassword`
- Click "Sign In"
- See error: "Invalid email or password"

**Step 4: Successful Login**
- Email: `john@example.com` (from registration)
- Password: `password123`
- Click "Sign In"
- Should redirect to dashboard after 1.5 seconds

## Features to Notice

### Form Improvements
✓ **Real-time validation** - Errors clear as you type
✓ **Loading states** - Button shows spinner, inputs are disabled
✓ **Password visibility** - Toggle to show/hide password
✓ **Error icons** - Visual indicators for errors
✓ **Success messages** - Green banner confirms successful actions
✓ **Auto-redirect** - 1.5 second delay before navigation

### Backend Improvements
✓ **Better error messages** - User-friendly, specific feedback
✓ **Email normalization** - Lowercase, trimmed emails
✓ **Consistent responses** - All responses have `success`, `message`, `data`
✓ **Field validation** - Name, email, password validation
✓ **Duplicate prevention** - Clear error if email exists

## Troubleshooting

### Issue: Form won't submit
**Solution:** Check browser console for errors, ensure backend is running

### Issue: "Cannot find module" errors
**Solution:** Run `npm install` in both client and server directories

### Issue: CORS errors
**Solution:** Check backend has CORS enabled in `server/server.js`

### Issue: Email validation not working
**Solution:** Forms use regex `/^\S+@\S+\.\S+$/` for validation

## Environment Variables

### Server (`.env`)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### Client (`.env.local`)
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## Success Responses

### Register Success
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGc..."
  }
}
```

### Login Success
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGc..."
  }
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Please enter a valid email"
}
```

### Duplicate Email
```json
{
  "success": false,
  "message": "Email already registered. Please use a different email or try logging in."
}
```

### Login Failed
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

✅ **All authentication forms are now fully functional with comprehensive error handling and validation!**
