# Authentication API Documentation

## Base URL
`http://localhost:3000/api/v1`

## Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "eloRating": 1000,
      "totalGames": 0,
      "wins": 0,
      "losses": 0,
      "winRate": 0,
      "createdAt": "2025-11-10T12:00:00.000Z"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "eloRating": 1000,
      "totalGames": 0,
      "wins": 0,
      "losses": 0,
      "winRate": 0,
      "createdAt": "2025-11-10T12:00:00.000Z"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired refresh token"
}
```

---

### 4. Get User Profile
**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "eloRating": 1000,
    "totalGames": 5,
    "wins": 3,
    "losses": 2,
    "winRate": 0.6,
    "createdAt": "2025-11-10T12:00:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

### 5. Get Public User Profile
**GET** `/users/:userId`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "eloRating": 1000,
    "totalGames": 5,
    "wins": 3,
    "losses": 2,
    "winRate": 0.6,
    "createdAt": "2025-11-10T12:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## Error Responses

All endpoints may return these standard error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication error message"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful registration or login, you will receive:

1. **Access Token**: Short-lived token (7 days default) for API requests
2. **Refresh Token**: Long-lived token (30 days default) to get new access tokens

Include the access token in the `Authorization` header for protected endpoints:
```
Authorization: Bearer <your-access-token>
```

When the access token expires, use the refresh token endpoint to get a new pair of tokens.

---

## Validation Rules

### Username
- Minimum length: 3 characters
- Maximum length: 50 characters
- Allowed characters: letters, numbers, underscores, hyphens
- Must be unique

### Email
- Must be valid email format
- Maximum length: 255 characters
- Must be unique

### Password
- Minimum length: 8 characters
- Must contain at least one letter
- Must contain at least one number

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Window: 15 minutes (900000ms)
- Max requests per window: 100

Exceeding the rate limit will result in a 429 (Too Many Requests) response.
