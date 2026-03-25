const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");

describe("Auth API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  // ---------------- REGISTER ----------------
  it("POST /api/auth/register should create a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created successfully");

    const user = await User.findOne({ email: "test@example.com" });
    expect(user).not.toBeNull();
  });

  // ---------------- LOGIN SUCCESS ----------------
  it("POST /api/auth/login should return token", async () => {
    // create user first
    await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "login@example.com",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("username");
  });

  // ---------------- LOGIN WRONG EMAIL ----------------
  it("POST /api/auth/login should fail if user not found", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(404);
  });

  // ---------------- LOGIN WRONG PASSWORD ----------------
  it("POST /api/auth/login should reject invalid password", async () => {
    await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "wrongpass@example.com",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrongpass@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });
});
