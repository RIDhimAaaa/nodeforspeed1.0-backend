# Flask Authentication API

A comprehensive Flask boilerplate with JWT authentication, user management, email verification, and password reset functionality.

## Features

- **User Registration & Login**
- **JWT Token Authentication** (Access & Refresh tokens)
- **Email Verification**
- **Password Reset via Email**
- **Profile Management**
- **Password Change**
- **Input Validation**
- **Error Handling**
- **Database Models with SQLAlchemy**

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
- Database URL
- JWT Secret Key
- Email settings (for Gmail, use app passwords)

### 3. Initialize Database

```bash
python init_db.py
```

### 4. Run the Application

```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user.

**Request Body:**
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "StrongPass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
}
```

**Response:**
```json
{
    "message": "User created successfully",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "is_verified": false
    },
    "email_verification_sent": true
}
```

#### POST `/auth/login`
Authenticate user and get tokens.

**Request Body:**
```json
{
    "username": "johndoe",
    "password": "StrongPass123"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {...},
    "requires_verification": false
}
```

#### POST `/auth/verify-email`
Verify email with token sent via email.

**Request Body:**
```json
{
    "email": "john@example.com",
    "token": "verification_token_here"
}
```

#### POST `/auth/forgot-password`
Request password reset token.

**Request Body:**
```json
{
    "email": "john@example.com"
}
```

#### POST `/auth/reset-password`
Reset password using token.

**Request Body:**
```json
{
    "email": "john@example.com",
    "token": "reset_token_here",
    "new_password": "NewStrongPass123"
}
```

#### POST `/auth/change-password`
Change password for authenticated users.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "current_password": "StrongPass123",
    "new_password": "NewStrongPass123"
}
```

#### POST `/auth/refresh`
Get new access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

#### GET `/auth/profile`
Get user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### PUT `/auth/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "first_name": "Updated Name",
    "last_name": "Updated Last",
    "phone": "+9876543210"
}
```

#### POST `/auth/logout`
Logout user (blacklist current token).

**Headers:**
```
Authorization: Bearer <access_token>
```

### General Endpoints

#### GET `/`
API information and available endpoints.

#### GET `/health`
Health check endpoint.

#### GET `/protected`
Example protected endpoint requiring authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Email Configuration

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `MAIL_PASSWORD`

## Database Models

### User Model
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Hashed password
- `first_name`: User's first name
- `last_name`: User's last name
- `phone`: Phone number (optional)
- `is_active`: Account status
- `is_verified`: Email verification status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `verification_token`: Email verification token
- `reset_token`: Password reset token

## Error Responses

All error responses follow this format:
```json
{
    "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Security Features

- **Password Hashing**: Using Flask-Bcrypt
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: Access tokens expire in 3 hours
- **Input Validation**: Email format and password strength validation
- **Rate Limiting**: Can be added with Flask-Limiter
- **CORS**: Can be configured with Flask-CORS

## Development

### Project Structure
```
├── app/
│   ├── __init__.py          # App factory and extensions
│   ├── models.py            # Database models
│   ├── auth.py              # Authentication blueprint
│   ├── main.py              # Main blueprint
│   └── config.py            # Configuration classes
├── .env.example             # Environment variables template
├── init_db.py              # Database initialization
├── run.py                  # Application entry point
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

### Adding New Features

1. Create new blueprints in the `app/` directory
2. Register blueprints in `app/__init__.py`
3. Add new models in `app/models.py`
4. Update requirements.txt if adding new dependencies

## Production Deployment

1. Set `FLASK_ENV=production`
2. Use a production database (PostgreSQL recommended)
3. Set strong secret keys
4. Configure proper email service
5. Use a WSGI server like Gunicorn
6. Set up reverse proxy (Nginx)
7. Enable HTTPS

## Testing

You can test the API using tools like:
- Postman
- curl
- Python requests library
- Thunder Client (VS Code extension)

Example curl request:
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```
