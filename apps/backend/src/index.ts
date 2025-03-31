import cors from "cors";
import "dotenv/config";
import express from "express";
import { estimateAge } from "./services/faceplusplus.service";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Example endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.post("/api/estimate-age", async (req, res) => {
  const { imageDataURL } = req.body;

  const { faces } = await estimateAge(imageDataURL);

  if (faces.length === 0) {
    return res.status(400).json({ error: "No face detected" });
  }

  const age = faces[0].attributes.age.value;

  res.json({ age });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
