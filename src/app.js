require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { getDatabase, closeDatabase } = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
getDatabase();

// Global middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "RESTful To-Do API Docs",
}));

/**
 * @swagger
 * /:
 *   get:
 *     summary: API welcome page
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: Welcome HTML page with API info and author signature
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>RESTful To-Do API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #e2e8f0;
        }
        .container {
          text-align: center;
          padding: 2rem;
          max-width: 600px;
        }
        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .version { color: #64748b; margin-bottom: 2rem; }
        .links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .links a {
          display: inline-block;
          padding: 0.6rem 1.4rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .links a:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .btn-primary { background: #3b82f6; color: #fff; }
        .btn-secondary { background: #334155; color: #cbd5e1; }
        footer.sign {
          margin-top: 2rem;
          font-size: 0.875rem;
          color: #64748b;
        }
        footer.sign a {
          color: #38bdf8;
          text-decoration: none;
          transition: color 0.15s;
        }
        footer.sign a:hover { color: #818cf8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>RESTful To-Do API</h1>
        <p class="version">v1.0.0</p>
        <div class="links">
          <a href="/api-docs" class="btn-primary">API Documentation</a>
          <a href="/api/health" class="btn-secondary">Health Check</a>
        </div>
        <!-- Footer -->
        <footer class="sign">
          Created by
          <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
          |
          <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
        </footer>
      </div>
    </body>
    </html>
  `);
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

module.exports = app;
