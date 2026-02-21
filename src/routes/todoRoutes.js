const express = require("express");
const { body, param, query } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { createTodo, findTodoById, findTodos, updateTodo, deleteTodo, toggleTodoCompleted } = require("../models/todoModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

const router = express.Router();

router.use(authenticate);

// GET /api/todos
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
    query("completed").optional().isBoolean().withMessage("Completed must be a boolean."),
    query("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high."),
    query("sortBy").optional().isIn(["created_at", "updated_at", "priority", "title"]).withMessage("Invalid sort field."),
    query("order").optional().isIn(["ASC", "DESC", "asc", "desc"]).withMessage("Order must be ASC or DESC."),
    validate,
  ],
  (req, res) => {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const { completed, priority, sortBy, order } = req.query;

      const parsedCompleted = completed !== undefined ? completed === "true" : undefined;

      const { todos, total } = findTodos(req.user.id, {
        limit,
        offset,
        completed: parsedCompleted,
        priority,
        sortBy,
        order,
      });

      const meta = buildPaginationMeta(page, limit, total);

      return sendSuccess(res, { data: todos, meta });
    } catch (error) {
      return sendError(res, { message: "Failed to fetch todos." });
    }
  }
);

// GET /api/todos/:id
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("Todo ID must be a positive integer."), validate],
  (req, res) => {
    try {
      const todo = findTodoById(req.params.id, req.user.id);

      if (!todo) {
        return sendError(res, { message: "Todo not found.", statusCode: 404 });
      }

      return sendSuccess(res, { data: todo });
    } catch (error) {
      return sendError(res, { message: "Failed to fetch todo." });
    }
  }
);

// POST /api/todos
router.post(
  "/",
  [
    body("title").trim().isLength({ min: 1, max: 255 }).withMessage("Title is required and must be under 255 characters."),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high."),
    validate,
  ],
  (req, res) => {
    try {
      const { title, priority } = req.body;
      const todo = createTodo(req.user.id, title, priority);

      return sendSuccess(res, {
        message: "Todo created successfully.",
        statusCode: 201,
        data: todo,
      });
    } catch (error) {
      return sendError(res, { message: "Failed to create todo." });
    }
  }
);

// PUT /api/todos/:id
router.put(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("Todo ID must be a positive integer."),
    body("title").optional().trim().isLength({ min: 1, max: 255 }).withMessage("Title must be under 255 characters."),
    body("completed").optional().isBoolean().withMessage("Completed must be a boolean."),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high."),
    validate,
  ],
  (req, res) => {
    try {
      const existing = findTodoById(req.params.id, req.user.id);
      if (!existing) {
        return sendError(res, { message: "Todo not found.", statusCode: 404 });
      }

      const todo = updateTodo(req.params.id, req.user.id, req.body);

      return sendSuccess(res, { message: "Todo updated successfully.", data: todo });
    } catch (error) {
      return sendError(res, { message: "Failed to update todo." });
    }
  }
);

// PATCH /api/todos/:id/toggle
router.patch(
  "/:id/toggle",
  [param("id").isInt({ min: 1 }).withMessage("Todo ID must be a positive integer."), validate],
  (req, res) => {
    try {
      const existing = findTodoById(req.params.id, req.user.id);
      if (!existing) {
        return sendError(res, { message: "Todo not found.", statusCode: 404 });
      }

      const todo = toggleTodoCompleted(req.params.id, req.user.id);

      return sendSuccess(res, { message: "Todo toggled successfully.", data: todo });
    } catch (error) {
      return sendError(res, { message: "Failed to toggle todo." });
    }
  }
);

// DELETE /api/todos/:id
router.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("Todo ID must be a positive integer."), validate],
  (req, res) => {
    try {
      const existing = findTodoById(req.params.id, req.user.id);
      if (!existing) {
        return sendError(res, { message: "Todo not found.", statusCode: 404 });
      }

      deleteTodo(req.params.id, req.user.id);

      return sendSuccess(res, { message: "Todo deleted successfully." });
    } catch (error) {
      return sendError(res, { message: "Failed to delete todo." });
    }
  }
);

module.exports = router;
