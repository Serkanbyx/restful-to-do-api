const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RESTful To-Do API",
      version: "1.0.0",
      description: "A RESTful API for managing to-do items with JWT authentication, priority levels, and pagination.",
      contact: {
        name: "Serkanby",
        url: "https://serkanbayraktar.com/",
      },
    },
    servers:
      process.env.NODE_ENV === "production"
        ? [{ url: process.env.API_URL || "/", description: "Production server" }]
        : [
            { url: `http://localhost:${process.env.PORT || 3000}`, description: "Development server" },
          ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "john" },
            email: { type: "string", format: "email", example: "john@example.com" },
            created_at: { type: "string", example: "2026-02-21 12:00:00" },
          },
        },
        Todo: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            title: { type: "string", example: "Learn Express.js" },
            completed: { type: "integer", enum: [0, 1], example: 0 },
            priority: { type: "string", enum: ["low", "medium", "high"], example: "medium" },
            created_at: { type: "string", example: "2026-02-21 12:00:00" },
            updated_at: { type: "string", example: "2026-02-21 12:00:00" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            currentPage: { type: "integer", example: 1 },
            itemsPerPage: { type: "integer", example: 10 },
            totalItems: { type: "integer", example: 25 },
            totalPages: { type: "integer", example: 3 },
            hasNextPage: { type: "boolean", example: true },
            hasPreviousPage: { type: "boolean", example: false },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error description" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Root", description: "API welcome page" },
      { name: "Health", description: "Health check endpoint" },
      { name: "Auth", description: "Authentication and user management" },
      { name: "Todos", description: "Todo CRUD operations" },
    ],
  },
  apis: ["./src/routes/*.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
