const express = require("express");
const { body, param, query } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { createTodo, findTodoById, findTodos, updateTodo, deleteTodo, toggleTodoCompleted } = require("../models/todoModel");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: List all todos with pagination and filters
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority level
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, priority, title]
 *           default: created_at
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Not authenticated
 */
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

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a single todo by ID
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Todo not found
 */
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

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: Learn Express.js
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 example: high
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Todo created successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Not authenticated
 *       422:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update an existing todo
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: Updated title
 *               completed:
 *                 type: boolean
 *                 example: true
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Todo updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Todo not found
 *       422:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /api/todos/{id}/toggle:
 *   patch:
 *     summary: Toggle todo completed status
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Todo toggled successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Todo not found
 */
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

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Todo deleted successfully.
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Todo not found
 */
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
