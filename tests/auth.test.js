const request = require("supertest");
const app = require("../src/app");

describe("Auth endpoints", () => {
  const validUser = {
    username: "alice",
    email: "alice@example.com",
    password: "secret123",
  };

  describe("POST /api/auth/register", () => {
    it("registers a new user and returns a token", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("rejects duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, username: "alice2" });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("rejects invalid input with 422", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "a", email: "not-an-email", password: "123" });

      expect(res.status).toBe(422);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it("rejects wrong password with 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "wrongpass" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns the current user with a valid token", async () => {
      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${login.body.data.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.username).toBe(validUser.username);
    });
  });
});
