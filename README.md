# User Management System

A comprehensive Node.js/Express user management system with authentication, authorization, and advanced security features.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Refresh token mechanism
  - Password hashing with bcrypt

- **Security Features**
  - Rate limiting
  - Helmet security headers
  - XSS protection
  - NoSQL injection protection
  - Input validation and sanitization
  - CORS configuration

- **Advanced Features**
  - Pagination and search
  - Comprehensive logging with Winston
  - Error handling middleware
  - Health check endpoint
  - Graceful shutdown

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/user-management
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "gmail": "john@example.com",
  "password": "password123",
  "sdt": "0123456789",
  "gender": "male",
  "age": 25
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "gmail": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access-token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "John Updated",
  "age": 26,
  "gender": "male"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

### User Management Endpoints (Admin Only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&search=john&sort=name&order=asc
Authorization: Bearer <admin-token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <access-token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "age": 30
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

#### Update User Role
```http
PUT /api/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "admin"
}
```

### Health Check
```http
GET /get
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | * |
| `LOG_LEVEL` | Logging level | info |

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📝 Scripts

```bash
# Development
npm run dev

# Production
npm start

# Testing
npm test

# Linting
npm run lint
npm run lint:fix
```

## 🏗️ Project Structure

```
user-management/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── userController.js     # User management logic
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── adminMiddleware.js    # Admin authorization
│   ├── errorHandler.js       # Error handling
│   ├── securityMiddleware.js # Security features
│   └── validationMiddleware.js # Input validation
├── models/
│   └── User.js              # User model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── user.js              # User management routes
├── utils/
│   └── logger.js            # Logging configuration
├── logs/                    # Log files
├── server.js                # Main application file
└── package.json
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive validation with express-validator
- **XSS Protection**: Sanitize user input
- **NoSQL Injection Protection**: Sanitize MongoDB queries
- **Security Headers**: Helmet for security headers
- **CORS**: Configurable cross-origin requests

## 📊 Logging

The application uses Winston for comprehensive logging:

- **Error logs**: Stored in `logs/error.log`
- **Combined logs**: Stored in `logs/combined.log`
- **Console output**: In development mode
- **Structured logging**: JSON format with timestamps

## 🚨 Error Handling

- **Centralized error handling**: All errors are caught and formatted
- **Validation errors**: Detailed validation error messages
- **Database errors**: Proper error handling for database operations
- **JWT errors**: Token validation and expiration handling

## 🔄 Database Schema

### User Model
```javascript
{
  id: Number,           // Auto-increment ID
  name: String,         // User's full name
  gmail: String,        // Email (unique)
  password: String,     // Hashed password
  sdt: String,          // Phone number (unique)
  gender: String,       // male/female/other
  age: Number,          // User's age
  role: String          // user/admin (default: user)
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.