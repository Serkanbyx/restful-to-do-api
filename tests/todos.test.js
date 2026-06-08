const request = require("supertest");
const app = require("../src/app");

const registerAndLogin = async (user) => {
  await request(app).post("/api/auth/register").send(user);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  return res.body.data.token;
};

describe("Todo endpoints", () => {
  let token;

  beforeAll(async () => {
    token = await registerAndLogin({
      username: "bob",
      email: "bob@example.com",
      password: "secret123",
    });
  });

  const auth = (req) => req.set("Authorization", `Bearer ${token}`);

  it("requires authentication", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(401);
  });

  it("creates a todo", async () => {
    const res = await auth(request(app).post("/api/todos")).send({
      title: "Write tests",
      priority: "high",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Write tests");
    expect(res.body.data.priority).toBe("high");
    expect(res.body.data.completed).toBe(0);
  });

  it("validates todo creation", async () => {
    const res = await auth(request(app).post("/api/todos")).send({ title: "" });
    expect(res.status).toBe(422);
  });

  it("lists todos with pagination meta", async () => {
    const res = await auth(request(app).get("/api/todos?page=1&limit=5"));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.itemsPerPage).toBe(5);
  });

  it("filters by priority", async () => {
    await auth(request(app).post("/api/todos")).send({ title: "Low task", priority: "low" });
    const res = await auth(request(app).get("/api/todos?priority=low"));

    expect(res.status).toBe(200);
    expect(res.body.data.every((todo) => todo.priority === "low")).toBe(true);
  });

  it("gets, updates, toggles and deletes a todo", async () => {
    const created = await auth(request(app).post("/api/todos")).send({ title: "Lifecycle" });
    const id = created.body.data.id;

    const fetched = await auth(request(app).get(`/api/todos/${id}`));
    expect(fetched.status).toBe(200);

    const updated = await auth(request(app).put(`/api/todos/${id}`)).send({ title: "Updated" });
    expect(updated.body.data.title).toBe("Updated");

    const toggled = await auth(request(app).patch(`/api/todos/${id}/toggle`));
    expect(toggled.body.data.completed).toBe(1);

    const deleted = await auth(request(app).delete(`/api/todos/${id}`));
    expect(deleted.status).toBe(200);

    const missing = await auth(request(app).get(`/api/todos/${id}`));
    expect(missing.status).toBe(404);
  });

  it("does not expose another user's todos", async () => {
    const created = await auth(request(app).post("/api/todos")).send({ title: "Bob private" });
    const id = created.body.data.id;

    const otherToken = await registerAndLogin({
      username: "carol",
      email: "carol@example.com",
      password: "secret123",
    });

    const res = await request(app)
      .get(`/api/todos/${id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});
