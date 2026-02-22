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
          font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0b0f19;
          color: #c8d6e5;
          position: relative;
          overflow: hidden;
        }

        body::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(52, 211, 153, 0.06) 1px, transparent 0);
          background-size: 32px 32px;
          pointer-events: none;
        }

        body::after {
          content: "";
          position: absolute;
          top: -40%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .deco-check {
          position: absolute;
          width: 22px;
          height: 22px;
          border: 2px solid rgba(52, 211, 153, 0.15);
          border-radius: 5px;
          pointer-events: none;
        }
        .deco-check::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 6px;
          width: 6px;
          height: 10px;
          border: solid rgba(52, 211, 153, 0.25);
          border-width: 0 2.5px 2.5px 0;
          transform: rotate(45deg);
        }
        .deco-check:nth-child(1) { top: 12%; left: 8%; transform: rotate(-12deg); }
        .deco-check:nth-child(2) { top: 25%; right: 10%; transform: rotate(18deg); }
        .deco-check:nth-child(3) { bottom: 20%; left: 12%; transform: rotate(8deg); }
        .deco-check:nth-child(4) { bottom: 15%; right: 15%; transform: rotate(-6deg); }
        .deco-check:nth-child(5) { top: 60%; left: 5%; transform: rotate(22deg); }

        .deco-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.12), transparent);
          border-radius: 1px;
          pointer-events: none;
        }
        .deco-line:nth-child(6) { top: 18%; left: 15%; width: 80px; }
        .deco-line:nth-child(7) { top: 35%; right: 8%; width: 100px; }
        .deco-line:nth-child(8) { bottom: 30%; left: 6%; width: 60px; }

        .container {
          text-align: center;
          padding: 2.5rem;
          max-width: 560px;
          position: relative;
          z-index: 1;
        }

        h1 {
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #34d399 0%, #6ee7b7 40%, #a7f3d0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 60px rgba(52, 211, 153, 0.2);
          position: relative;
        }
        h1::before {
          content: "\\2713";
          position: absolute;
          top: -10px;
          right: -28px;
          font-size: 1.2rem;
          -webkit-text-fill-color: #34d399;
          opacity: 0.5;
        }

        .version {
          color: #4a5568;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 2.5rem;
        }

        .links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .links a {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.6rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.3px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
        }
        .btn-primary:hover {
          box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
          transform: translateY(-2px) scale(1.03);
        }
        .btn-primary::before {
          content: "\\1F4D6";
          font-size: 1rem;
        }

        .btn-secondary {
          background: rgba(52, 211, 153, 0.08);
          color: #6ee7b7;
          border: 1.5px solid rgba(52, 211, 153, 0.2);
        }
        .btn-secondary:hover {
          background: rgba(52, 211, 153, 0.15);
          border-color: rgba(52, 211, 153, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(52, 211, 153, 0.15);
        }
        .btn-secondary::before {
          content: "\\2764";
          font-size: 0.85rem;
        }

        footer.sign {
          margin-top: 2rem;
          font-size: 0.85rem;
          color: #4a5568;
        }

        footer.sign a {
          color: #34d399;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s, text-shadow 0.2s;
        }
        footer.sign a:hover {
          color: #6ee7b7;
          text-shadow: 0 0 12px rgba(52, 211, 153, 0.3);
        }

        @media (max-width: 480px) {
          h1 { font-size: 2rem; }
          h1::before { display: none; }
          .container { padding: 1.5rem; }
          .links { flex-direction: column; align-items: center; }
        }
      </style>
    </head>
    <body>
      <div class="deco-check"></div>
      <div class="deco-check"></div>
      <div class="deco-check"></div>
      <div class="deco-check"></div>
      <div class="deco-check"></div>
      <div class="deco-line"></div>
      <div class="deco-line"></div>
      <div class="deco-line"></div>

      <div class="container">
        <h1>RESTful To-Do API</h1>
        <p class="version">v1.0.0</p>
        <div class="links">
          <a href="/api-docs" class="btn-primary">API Documentation</a>
          <a href="/api/health" class="btn-secondary">Health Check</a>
        </div>
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
