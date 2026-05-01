# Backend Setup Guide - Ethara Project Management System

This guide will help you set up the MongoDB + Express.js backend infrastructure.

## 📋 Prerequisites

- **Node.js** 18+ installed
- **MongoDB** installed and running locally or MongoDB Atlas account
- **npm** or **yarn** package manager

## 🚀 Installation Steps

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
The `.env` file is already configured for development:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ethara
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**For Production:**
- Change `NODE_ENV` to `production`
- Update `JWT_SECRET` to a strong, random string
- Use MongoDB Atlas connection string for `MONGODB_URI`
- Update `FRONTEND_URL` to your production frontend URL

### 4. Start MongoDB

**Local MongoDB:**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB from Services
```

**MongoDB Atlas:**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string
- Update `MONGODB_URI` in `.env` file

### 5. Start Backend Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🔐 REST API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
- **Description**: Register a new user
- **Body**: 
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "full_name": "John Doe",
  "role": "member"
}
```
- **Response**: User object with JWT token

#### POST /api/auth/login
- **Description**: Login user
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```
- **Response**: User object with JWT token

#### POST /api/auth/forgot-password
- **Description**: Request password reset
- **Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response**: Reset token

#### POST /api/auth/reset-password
- **Description**: Reset password with token
- **Body**:
```json
{
  "token": "reset-token-here",
  "password": "NewPassword123"
}
```
- **Response**: Success message

#### GET /api/auth/me
- **Description**: Get current logged-in user
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Current user object

### Project Endpoints (Protected)

#### GET /api/projects
- **Description**: Get all projects (filtered by role)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of projects

#### GET /api/projects/:id
- **Description**: Get single project
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Single project object

#### POST /api/projects
- **Description**: Create new project (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Project Name",
  "description": "Project description",
  "status": "active",
  "priority": "medium",
  "team_members": ["user-id-1", "user-id-2"]
}
```
- **Response**: Created project object

#### PUT /api/projects/:id
- **Description**: Update project (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Project update fields
- **Response**: Updated project object

#### DELETE /api/projects/:id
- **Description**: Delete project (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Task Endpoints (Protected)

#### GET /api/tasks
- **Description**: Get all tasks (filtered by role)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of tasks

#### GET /api/tasks/:id
- **Description**: Get single task
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Single task object

#### POST /api/tasks
- **Description**: Create new task (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "project": "project-id",
  "assigned_to": "user-id",
  "due_date": "2024-12-31"
}
```
- **Response**: Created task object

#### PUT /api/tasks/:id
- **Description**: Update task
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Task update fields
- **Response**: Updated task object

#### DELETE /api/tasks/:id
- **Description**: Delete task (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### Team Endpoints (Protected)

#### GET /api/teams
- **Description**: Get all team memberships
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of team memberships

#### POST /api/teams
- **Description**: Add team member to project (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "user": "user-id",
  "project": "project-id",
  "role": "member"
}
```
- **Response**: Created team membership

#### DELETE /api/teams/:id
- **Description**: Remove team member (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### User Endpoints (Protected)

#### GET /api/users
- **Description**: Get all users (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of users

#### GET /api/users/:id
- **Description**: Get single user
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Single user object

#### PUT /api/users/:id
- **Description**: Update user
- **Headers**: `Authorization: Bearer <token>`
- **Body**: User update fields
- **Response**: Updated user object

#### DELETE /api/users/:id
- **Description**: Delete user (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## 🔒 Role-Based Access Control

### Admin Role
- ✅ Create, edit, delete projects
- ✅ Create, edit, delete tasks
- ✅ Manage team members
- ✅ View all projects and tasks
- ✅ Manage users

### Member Role
- ✅ View own projects and tasks
- ✅ Update task status only
- ✅ View own profile
- ❌ Cannot create/edit/delete projects
- ❌ Cannot create/delete tasks
- ❌ Cannot manage team members
- ❌ Cannot manage other users

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  full_name: String,
  role: String ('admin' | 'member'),
  is_active: Boolean,
  timestamps: true
}
```

### Projects Collection
```javascript
{
  name: String,
  description: String,
  status: String ('active' | 'completed' | 'on-hold' | 'cancelled'),
  created_by: ObjectId (ref: User),
  team_members: [ObjectId] (ref: User),
  start_date: Date,
  end_date: Date,
  priority: String ('low' | 'medium' | 'high'),
  timestamps: true
}
```

### Tasks Collection
```javascript
{
  title: String,
  description: String,
  status: String ('todo' | 'in-progress' | 'completed' | 'cancelled'),
  priority: String ('low' | 'medium' | 'high' | 'urgent'),
  project: ObjectId (ref: Project),
  assigned_to: ObjectId (ref: User),
  created_by: ObjectId (ref: User),
  due_date: Date,
  completed_at: Date,
  timestamps: true
}
```

### Teams Collection
```javascript
{
  user: ObjectId (ref: User),
  project: ObjectId (ref: Project),
  role: String ('owner' | 'admin' | 'member' | 'viewer'),
  joined_at: Date,
  is_active: Boolean,
  timestamps: true
}
```

## 🧪 Testing the API

You can test the API using:
- **Postman**: Import the API endpoints
- **cURL**: Use command-line requests
- **Thunder Client**: VS Code extension

### Example cURL Commands:

**Signup:**
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

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

**Get Projects (Protected):**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB authentication credentials

### JWT Token Error
- Ensure JWT_SECRET is set in `.env`
- Check token expiration time
- Verify token is being sent in Authorization header

### Validation Errors
- Check request body format
- Verify required fields are present
- Ensure data types are correct

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethara
JWT_SECRET=your-strong-random-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.com
```

### Deployment Platforms
- **Heroku**: Use MongoDB Atlas for database
- **DigitalOcean**: Deploy with MongoDB droplet
- **AWS**: Use EC2 with MongoDB Atlas
- **Render**: Free tier deployment with MongoDB Atlas

## 📝 Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days by default
- All routes are protected with authentication middleware
- Role-based access control is enforced on all protected routes
- Database indexes are optimized for common queries
- Input validation is performed on all API endpoints

---

**Backend setup complete! Your MongoDB + Express.js API is ready to use.**
