# RESTful To-Do API

A RESTful API for managing to-do items with JWT authentication, built with Express.js and SQLite.

## Features

- **JWT Authentication** — Register, login, and access user-specific data
- **Todo CRUD** — Create, read, update, and delete todos
- **Priority Levels** — low, medium, high
- **Completed Flag** — Toggle completion status
- **Pagination** — Page-based pagination with configurable limits
- **Filtering & Sorting** — Filter by completed status and priority; sort by various fields
- **Input Validation** — Request validation via express-validator

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (via better-sqlite3)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** express-validator

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Running

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check

| Method | Endpoint       | Description     |
|--------|---------------|-----------------|
| GET    | `/api/health` | Health check    |

### Authentication

| Method | Endpoint             | Description          |
|--------|---------------------|----------------------|
| POST   | `/api/auth/register` | Register a new user  |
| POST   | `/api/auth/login`    | Login                |
| GET    | `/api/auth/me`       | Get current user     |

### Todos (requires Bearer token)

| Method | Endpoint                 | Description          |
|--------|-------------------------|----------------------|
| GET    | `/api/todos`            | List todos (paginated) |
| GET    | `/api/todos/:id`        | Get a single todo    |
| POST   | `/api/todos`            | Create a todo        |
| PUT    | `/api/todos/:id`        | Update a todo        |
| PATCH  | `/api/todos/:id/toggle` | Toggle completed     |
| DELETE | `/api/todos/:id`        | Delete a todo        |

### Query Parameters (GET /api/todos)

| Parameter   | Type    | Default      | Description                          |
|------------|---------|--------------|--------------------------------------|
| `page`     | number  | 1            | Page number                          |
| `limit`    | number  | 10           | Items per page (max 100)             |
| `completed`| boolean | —            | Filter by completion status          |
| `priority` | string  | —            | Filter by priority (low/medium/high) |
| `sortBy`   | string  | `created_at` | Sort field                           |
| `order`    | string  | `DESC`       | Sort order (ASC/DESC)                |

## Example Requests

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "secret123"}'
```

### Create Todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Learn Express.js", "priority": "high"}'
```

### List Todos with Pagination

```bash
curl "http://localhost:3000/api/todos?page=1&limit=5&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response Format

### Success

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Project Structure

```
src/
├── app.js              # Entry point
├── config/
│   └── database.js     # SQLite setup
├── middleware/
│   ├── auth.js         # JWT authentication
│   ├── errorHandler.js # Error handling
│   └── validate.js     # Validation middleware
├── models/
│   ├── todoModel.js    # Todo data access
│   └── userModel.js    # User data access
├── routes/
│   ├── authRoutes.js   # Auth endpoints
│   └── todoRoutes.js   # Todo endpoints
└── utils/
    ├── apiResponse.js  # Response helpers
    └── pagination.js   # Pagination helpers
```
