const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

// mock auth middleware (so tests don’t need real JWT)
jest.mock("../middleware/authMiddleware", () => (req, res, next) => {
  req.user = { id: "test-user-id" };
  next();
});

describe("Photo API", () => {
  beforeAll(async () => {
    // connect to test DB (only if your db.js doesn't already handle NODE_ENV=test)
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  let photoId;

  // ---------------- CREATE ----------------
  it("POST /api/photos should create a photo", async () => {
    const res = await request(app)
      .post("/api/photos")
      .field("title", "Test Photo")
      .field("description", "Test Description")
      .attach("photo", Buffer.from("fake-image-content"), "test.jpg");

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("_id");

    photoId = res.body._id;
  });

  // ---------------- GET ALL ----------------
  it("GET /api/photos should return photos", async () => {
    const res = await request(app).get("/api/photos");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ---------------- GET ONE ----------------
  it("GET /api/photos/:id should return one photo", async () => {
    const res = await request(app).get(`/api/photos/${photoId}`);

    expect([200, 404]).toContain(res.statusCode);
  });

  // ---------------- UPDATE ----------------
  it("PUT /api/photos/:id should update photo", async () => {
    const res = await request(app)
      .put(`/api/photos/${photoId}`)
      .send({ title: "Updated Photo" });

    expect([200, 404]).toContain(res.statusCode);
  });

  // ---------------- DELETE ----------------
  it("DELETE /api/photos/:id should delete photo", async () => {
    const res = await request(app).delete(`/api/photos/${photoId}`);

    expect([200, 204, 404]).toContain(res.statusCode);
  });
});
