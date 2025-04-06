import express from "express";
import apiRouter from "./router/api";

const app = express();

app.use(express.json());
app.use("/api", apiRouter);

export { app };
