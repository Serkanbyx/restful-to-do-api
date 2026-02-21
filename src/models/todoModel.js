const { getDatabase } = require("../config/database");

const createTodo = (userId, title, priority = "medium") => {
  const db = getDatabase();
  const stmt = db.prepare("INSERT INTO todos (user_id, title, priority) VALUES (?, ?, ?)");
  const result = stmt.run(userId, title, priority);
  return findTodoById(result.lastInsertRowid, userId);
};

const findTodoById = (id, userId) => {
  const db = getDatabase();
  return db.prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?").get(id, userId);
};

const findTodos = (userId, { limit, offset, completed, priority, sortBy = "created_at", order = "DESC" }) => {
  const db = getDatabase();
  const conditions = ["user_id = ?"];
  const params = [userId];

  if (completed !== undefined) {
    conditions.push("completed = ?");
    params.push(completed ? 1 : 0);
  }

  if (priority) {
    conditions.push("priority = ?");
    params.push(priority);
  }

  const allowedSortFields = ["created_at", "updated_at", "priority", "title"];
  const safeSort = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
  const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const whereClause = conditions.join(" AND ");

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM todos WHERE ${whereClause}`);
  const { total } = countStmt.get(...params);

  const dataStmt = db.prepare(
    `SELECT * FROM todos WHERE ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`
  );
  const todos = dataStmt.all(...params, limit, offset);

  return { todos, total };
};

const updateTodo = (id, userId, updates) => {
  const db = getDatabase();
  const fields = [];
  const params = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    params.push(updates.title);
  }
  if (updates.completed !== undefined) {
    fields.push("completed = ?");
    params.push(updates.completed ? 1 : 0);
  }
  if (updates.priority !== undefined) {
    fields.push("priority = ?");
    params.push(updates.priority);
  }

  if (fields.length === 0) return findTodoById(id, userId);

  fields.push("updated_at = datetime('now')");
  params.push(id, userId);

  const stmt = db.prepare(`UPDATE todos SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`);
  stmt.run(...params);

  return findTodoById(id, userId);
};

const deleteTodo = (id, userId) => {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?");
  return stmt.run(id, userId);
};

const toggleTodoCompleted = (id, userId) => {
  const db = getDatabase();
  const stmt = db.prepare(
    "UPDATE todos SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  );
  stmt.run(id, userId);
  return findTodoById(id, userId);
};

module.exports = { createTodo, findTodoById, findTodos, updateTodo, deleteTodo, toggleTodoCompleted };
