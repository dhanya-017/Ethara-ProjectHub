# Ethara Project - Project Management System

A modern, responsive project management application built with React, Vite, and Tailwind CSS.

## 🚀 Features

### 📋 Project Management
- **Dashboard**: Overview with project statistics and quick access to all modules
- **Projects**: Create, view, edit, and delete projects
- **Tasks**: Comprehensive task management with status tracking
- **Team**: Team member management and role-based access control
- **Authentication**: Complete login/signup system with role-based permissions

### 🔐 Authentication System
- **User Roles**: Admin and Member access levels
- **Secure Login**: Email/password authentication with validation
- **Password Recovery**: Forgot password and reset functionality
- **Session Management**: Persistent login sessions
- **Role-Based Access**: Different permissions for Admin vs Member roles

### 🎨 Technology Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router v6 for navigation
- **Build Tool**: Vite for fast development
- **UI Components**: Custom component library with shadcn/ui
- **Backend**: Express.js REST API
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing

### 📱 Responsive Design
- **Mobile Friendly**: Fully responsive interface
- **Modern UI**: Clean, professional design
- **Accessibility**: ARIA labels and semantic HTML
- **Dark Mode Support**: Consistent theming system

## 📋 Requirements

### 🔌 REST APIs + Database (SQL/NoSQL)

**Current Implementation:**
- **Local JSON Database**: Development-friendly local storage system
- **REST-like API Structure**: Modular API layer in `src/api/`
- **Base44 Client Integration**: External API connectivity
- **Data Models**: Structured entities for Users, Projects, Tasks, Team Members

**Production Requirements:**
- **SQL Database**: PostgreSQL/MySQL for relational data
- **NoSQL Option**: MongoDB for flexible document storage
- **REST API Endpoints**: Full CRUD operations for all entities
- **API Documentation**: Swagger/OpenAPI specifications
- **Authentication Middleware**: JWT token validation
- **Rate Limiting**: API protection against abuse

**Database Schema:**
```
Users Table:
- id, username, email, password, full_name, role, created_at, updated_at

Projects Table:
- id, name, description, status, created_by, created_at, updated_at

Tasks Table:
- id, project_id, title, description, status, priority, assigned_to, created_at, updated_at

Team_Members Table:
- id, user_id, project_id, role, joined_at
```

### ✅ Proper Validations & Relationships

**Data Validation:**
- **Input Validation**: Client-side form validation
- **Server-Side Validation**: Backend validation rules
- **Email Validation**: RFC-compliant email format checking
- **Password Strength**: Minimum length, complexity requirements
- **Field Constraints**: Required fields, data types, length limits

**Database Relationships:**
- **User → Projects**: One-to-many (admin creates projects)
- **Project → Tasks**: One-to-many (projects have multiple tasks)
- **User → Tasks**: Many-to-many (users assigned to tasks)
- **User → Project**: Many-to-many (team members in projects)
- **Foreign Keys**: Referential integrity constraints
- **Cascade Operations**: Proper delete/update cascading

**Validation Implementation:**
```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength validation
const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// Form validation
const validateProject = (data) => {
  if (!data.name || data.name.length < 3) return false;
  if (!data.description || data.description.length < 10) return false;
  return true;
};
```

### 🔐 Role-Based Access Control

**User Roles:**
- **Admin**: Full system access, project management, team administration
- **Member**: Limited access, assigned tasks only, project view permissions

**Access Control Implementation:**
- **Frontend Guards**: Route protection based on user role
- **Backend Middleware**: API endpoint authorization
- **Database-Level Security**: Row-level access control
- **Resource Ownership**: Users can only access their own resources

**Permission Matrix:**
```
Action              | Admin | Member
--------------------|-------|--------
Create Projects     | ✅    | ❌
Edit Projects       | ✅    | ❌
Delete Projects     | ✅    | ❌
View All Projects   | ✅    | ❌
View Own Projects   | ✅    | ✅
Create Tasks        | ✅    | ❌
Edit Own Tasks      | ✅    | ✅
Edit All Tasks      | ✅    | ❌
Manage Team Members | ✅    | ❌
View Analytics      | ✅    | ❌
```

**Authentication Flow:**
1. **Login**: User credentials validated against database
2. **Token Generation**: JWT token issued upon successful login
3. **Role Assignment**: User role stored in token payload
4. **Request Authorization**: Token verified on each API request
5. **Permission Check**: Role-based access control applied
6. **Resource Access**: Data filtered based on user permissions

**Security Features:**
- **Password Hashing**: Bcrypt/Argon2 for secure password storage
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Token refresh and expiration
- **CORS Configuration**: Cross-origin resource sharing controls
- **Rate Limiting**: Protection against brute force attacks
- **Input Sanitization**: Prevent SQL injection and XSS attacks

## 🛠 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas account)
- Modern web browser

### Setup Instructions

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/ethara-project.git
cd ethara-project
```

**2. Install frontend dependencies:**
```bash
npm install
```

**3. Setup backend:**
```bash
cd backend
npm install
```

**4. Configure environment variables:**
The backend `.env` file is pre-configured for development. For production, update the MongoDB URI and JWT secret.

**5. Start MongoDB:**
```bash
# Local MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

**6. Start backend server:**
```bash
cd backend
npm run dev
```

**7. Start frontend development server:**
```bash
cd ..
npm run dev
```

**8. Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
ethara-project/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/
│   │   └── base44Client.js
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── team/
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   └── PageNotFound.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   └── Dashboard.jsx
│   └── App.jsx
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── Team.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── teams.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   └── BACKEND_SETUP.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
The backend `.env` file is located in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ethara
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration
The frontend API base URL is configured in `src/lib/AuthContext.jsx`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production deployment, update this to your backend API URL.

## 🎯 Usage

### Admin Features
- **Full Access**: Create projects, manage team members, view all tasks
- **Team Management**: Add/remove team members
- **Analytics**: View project and team statistics
- **Settings**: Configure application settings

### Member Features
- **Assigned Tasks**: View and update assigned tasks
- **Project Access**: View projects you're assigned to
- **Limited Scope**: Focused interface based on role

### 🔐 Authentication

#### Demo Credentials
- **Admin**: `admin@projecthub.com` / `admin123`
- **Member**: `member@projecthub.com` / `member123`

#### Login Flow
1. Navigate to `/login`
2. Select user type (Admin/Member)
3. Enter credentials
4. Access dashboard with role-based permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m "Add feature"`)
5. Push to your fork (`git push origin feature-name`)
6. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React and modern web technologies.
