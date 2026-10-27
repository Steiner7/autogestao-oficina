import express from "express";
import cors from "cors";
import { config } from "./config.js";

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((_req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});
