# 📝 RESTful To-Do API

A modern, secure RESTful API for managing to-do items. Built with Express.js, SQLite, and JWT authentication — featuring priority levels, pagination, filtering, sorting, and interactive Swagger documentation.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **JWT Authentication** — Secure user registration, login, and token-based access control
- **Full CRUD Operations** — Create, read, update, and delete to-do items with ease
- **Priority Levels** — Organize tasks with `low`, `medium`, and `high` priority tags
- **Completion Toggle** — Quickly mark tasks as completed or uncompleted
- **Pagination** — Page-based pagination with configurable limits (up to 100 items per page)
- **Filtering & Sorting** — Filter by completion status and priority; sort by any field in ASC/DESC order
- **Input Validation** — Robust request validation powered by express-validator
- **Swagger Documentation** — Interactive API docs with Swagger UI for easy testing
- **Graceful Shutdown** — Clean server shutdown handling for SIGTERM and SIGINT signals
- **CORS Enabled** — Cross-origin resource sharing out of the box

## Live Demo

[🚀 View Live API](https://restful-to-do-api.onrender.com/)

[📖 Swagger Documentation](https://restful-to-do-api.onrender.com/api-docs)

## Technologies

- **Node.js (20.x)**: JavaScript runtime environment
- **Express.js 5**: Fast, minimalist web framework
- **SQLite (better-sqlite3)**: Lightweight, serverless SQL database
- **JWT (jsonwebtoken)**: Stateless token-based authentication
- **bcryptjs**: Secure password hashing
- **express-validator**: Declarative input validation and sanitization
- **Swagger (swagger-jsdoc + swagger-ui-express)**: Auto-generated interactive API documentation
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing middleware
- **Nodemon**: Development hot-reload (dev dependency)

## Installation

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/Serkanbyx/s3.3_RESTful-To-Do-API.git
cd s3.3_RESTful-To-Do-API
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

4. Start the server:

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

5. Open your browser and navigate to `http://localhost:3000` to see the welcome page, or `http://localhost:3000/api-docs` for Swagger documentation.

## Usage

1. **Register** a new user via `POST /api/auth/register`
2. **Login** with your credentials via `POST /api/auth/login` to receive a JWT token
3. **Add the token** to the `Authorization: Bearer <token>` header for all protected routes
4. **Create todos** with a title and optional priority level
5. **List, filter, and sort** your todos with query parameters
6. **Toggle completion** status or update/delete individual todos

## How It Works?

### Authentication Flow

The API uses JSON Web Tokens (JWT) for stateless authentication. Passwords are hashed with bcryptjs before being stored in the database.

```
Register → Password hashed → User saved → Login → JWT issued → Token sent in headers
```

### Database

SQLite is used as a lightweight, file-based database via `better-sqlite3`. The database file is automatically created in the `data/` directory on first run. Two tables are managed:

- **users** — Stores user credentials and profile info
- **todos** — Stores to-do items linked to users via `user_id`

### API Response Format

All responses follow a consistent JSON structure:

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

## API Endpoints

### Health Check

| Method | Endpoint       | Description  |
| ------ | -------------- | ------------ |
| GET    | `/api/health`  | Health check |

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login               |
| GET    | `/api/auth/me`       | Get current user    |

### Todos (requires Bearer token)

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| GET    | `/api/todos`             | List todos (paginated) |
| GET    | `/api/todos/:id`         | Get a single todo      |
| POST   | `/api/todos`             | Create a todo          |
| PUT    | `/api/todos/:id`         | Update a todo          |
| PATCH  | `/api/todos/:id/toggle`  | Toggle completed       |
| DELETE | `/api/todos/:id`         | Delete a todo          |

### Query Parameters (GET /api/todos)

| Parameter   | Type    | Default      | Description                          |
| ----------- | ------- | ------------ | ------------------------------------ |
| `page`      | number  | 1            | Page number                          |
| `limit`     | number  | 10           | Items per page (max 100)             |
| `completed` | boolean | —            | Filter by completion status          |
| `priority`  | string  | —            | Filter by priority (low/medium/high) |
| `sortBy`    | string  | `created_at` | Sort field                           |
| `order`     | string  | `DESC`       | Sort order (ASC/DESC)                |

## Example Requests

### Register

```bash
curl -X POST https://restful-to-do-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "secret123"}'
```

### Login

```bash
curl -X POST https://restful-to-do-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'
```

### Create Todo

```bash
curl -X POST https://restful-to-do-api.onrender.com/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Learn Express.js", "priority": "high"}'
```

### List Todos with Filtering

```bash
curl "https://restful-to-do-api.onrender.com/api/todos?page=1&limit=5&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Project Structure

```
src/
├── app.js                # Entry point & server configuration
├── config/
│   ├── database.js       # SQLite connection & table initialization
│   └── swagger.js        # Swagger/OpenAPI configuration
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   ├── errorHandler.js   # Global error handling
│   └── validate.js       # Request validation middleware
├── models/
│   ├── todoModel.js      # Todo data access layer
│   └── userModel.js      # User data access layer
├── routes/
│   ├── authRoutes.js     # Authentication endpoints
│   └── todoRoutes.js     # Todo CRUD endpoints
└── utils/
    ├── apiResponse.js    # Standardized response helpers
    └── pagination.js     # Pagination utility functions
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactoring
- `docs:` — Documentation changes
- `chore:` — Maintenance tasks

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Contact

- [Open an Issue](https://github.com/Serkanbyx/s3.3_RESTful-To-Do-API/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
