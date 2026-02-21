const { getDatabase } = require("../config/database");

const createUser = (username, email, hashedPassword) => {
  const db = getDatabase();
  const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
  const result = stmt.run(username, email, hashedPassword);
  return findUserById(result.lastInsertRowid);
};

const findUserById = (id) => {
  const db = getDatabase();
  return db.prepare("SELECT id, username, email, created_at FROM users WHERE id = ?").get(id);
};

const findUserByEmail = (email) => {
  const db = getDatabase();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
};

const findUserByUsername = (username) => {
  const db = getDatabase();
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
};

module.exports = { createUser, findUserById, findUserByEmail, findUserByUsername };
