# Frontend-Backend Integration Guide

This document explains how the frontend has been updated to work with the new MongoDB + Express.js backend.

## 🔧 Changes Made to Frontend

### 1. AuthContext.jsx (`src/lib/AuthContext.jsx`)

**Changed from:** Local JSON database
**Changed to:** REST API calls to Express.js backend

**Key Changes:**
- Removed dependency on `localDatabase.js`
- Added API base URL: `http://localhost:5000/api`
- Updated authentication methods to use fetch API:
  - `login()`: POST to `/api/auth/login`
  - `signup()`: POST to `/api/auth/signup`
  - `logout()`: Clears localStorage tokens
  - `forgotPassword()`: POST to `/api/auth/forgot-password`
  - `resetPassword()`: POST to `/api/auth/reset-password`
  - `checkUserAuth()`: GET to `/api/auth/me` with JWT token
- JWT token storage in localStorage as `authToken`
- User data stored in localStorage as `authUser`

### 2. Login.jsx (`src/pages/Login.jsx`)

**Removed:**
- Hardcoded credential validation logic
- `setDemoCredentials()` function
- Field clearing on user type change
- Toolbar removal script
- `useEffect` import (no longer needed)

**Simplified:**
- Login validation now handled by backend
- Only basic frontend validation (empty fields)
- User type selection still available for role-based access
- Backend validates role matching with credentials

### 3. README.md

**Updated:**
- Technology stack to reflect MongoDB + Express.js
- Installation instructions to include backend setup
- Project structure to include backend directory
- Configuration section for backend environment variables

## 🚀 How to Run the Full Stack Application

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Step-by-Step Setup

**1. Install Frontend Dependencies:**
```bash
npm install
```

**2. Install Backend Dependencies:**
```bash
cd backend
npm install
```

**3. Start MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB from Services
```

**4. Start Backend Server:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**5. Start Frontend Server:**
```bash
cd ..
npm run dev
```
Frontend will run on `http://localhost:5173`

**6. Access Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## 🔐 Authentication Flow

### 1. User Signup
1. User fills signup form
2. Frontend sends POST to `/api/auth/signup`
3. Backend validates input and creates user in MongoDB
4. Backend returns JWT token and user data
5. Frontend stores token in localStorage
6. User is automatically logged in

### 2. User Login
1. User fills login form with email, password, and user type
2. Frontend sends POST to `/api/auth/login`
3. Backend validates credentials against MongoDB
4. Backend verifies user role matches selected type
5. Backend returns JWT token and user data
6. Frontend stores token in localStorage
7. User is redirected to dashboard

### 3. Protected Routes
1. Frontend checks for JWT token in localStorage
2. If token exists, frontend sends GET to `/api/auth/me`
3. Backend validates JWT token
4. Backend returns current user data
5. Frontend sets user state and grants access

## 🔄 API Integration Points

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user (protected)

### Resource Endpoints (Protected)
- `GET/POST /api/projects` - Project CRUD
- `GET/PUT/DELETE /api/projects/:id` - Single project operations
- `GET/POST /api/tasks` - Task CRUD
- `GET/PUT/DELETE /api/tasks/:id` - Single task operations
- `GET/POST/DELETE /api/teams` - Team management
- `GET/PUT/DELETE /api/users` - User management

## 🛡️ Security Features

### Backend Security
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control middleware
- Input validation with express-validator
- CORS configuration
- Rate limiting ready

### Frontend Security
- JWT token storage in localStorage
- Token validation on protected routes
- Role-based UI rendering
- Automatic token refresh handling
- Secure error handling

## 📊 Data Flow

### Request Flow:
1. User action in React component
2. AuthContext method called
3. Fetch API request to backend
4. JWT token in Authorization header
5. Backend validates token and processes request
6. Response sent back to frontend
7. Frontend updates state/UI

### Response Handling:
- Success: Update state, redirect if needed
- Error: Display error message to user
- Loading: Show loading indicators
- Authentication: Store/remove tokens appropriately

## 🧪 Testing the Integration

### 1. Test Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123",
    "full_name": "Test User",
    "role": "member"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

### 4. Test Protected Route
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB authentication credentials

**CORS Error:**
- Ensure backend CORS allows frontend URL
- Check `FRONTEND_URL` in backend `.env`

**JWT Token Issues:**
- Clear localStorage tokens
- Check JWT_SECRET in backend `.env`
- Verify token expiration time

**API Connection Issues:**
- Ensure backend is running on port 5000
- Check frontend API base URL in AuthContext
- Verify network connectivity

## 📝 Next Steps

1. **Create Demo Users:**
   - Use the signup endpoint to create admin and member users
   - Test role-based access control

2. **Implement Frontend API Client:**
   - Create reusable API client functions
   - Add error handling and retry logic
   - Implement request/response interceptors

3. **Add Loading States:**
   - Show loading indicators during API calls
   - Handle network errors gracefully
   - Implement optimistic updates where appropriate

4. **Test All Features:**
   - Test authentication flow
   - Test CRUD operations
   - Test role-based permissions
   - Test error handling

---

The frontend is now fully integrated with the MongoDB + Express.js backend! 🎉
