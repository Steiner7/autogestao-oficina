import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { autenticar } from "./middlewares/autenticar.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRoutes } from "./routes/auth.routes.js";
import { clientesRoutes } from "./routes/clientes.routes.js";
import { veiculosRoutes } from "./routes/veiculos.routes.js";

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/clientes", autenticar, clientesRoutes);
app.use("/api/veiculos", autenticar, veiculosRoutes);

app.use((_req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

app.use(errorHandler);
