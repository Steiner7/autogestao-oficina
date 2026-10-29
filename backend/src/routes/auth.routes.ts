import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { pool } from "../db.js";
import { autenticar } from "../middlewares/autenticar.js";
import { HttpError } from "../utils/HttpError.js";

const loginSchema = z.object({
  login: z.string({ error: "Informe o usuário." }).trim().min(1, "Informe o usuário."),
  senha: z.string({ error: "Informe a senha." }).min(1, "Informe a senha.")
});

export const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {
  const { login, senha } = loginSchema.parse(req.body);
  const { rows } = await pool.query<{ id: number; nome: string; login: string; senha: string }>(
    "SELECT id_usuario AS id, nome, login, senha FROM usuario WHERE login = $1",
    [login]
  );
  const usuario = rows[0];
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    throw new HttpError(401, "Usuário ou senha inválidos.");
  }
  const token = jwt.sign({ nome: usuario.nome, login: usuario.login }, config.jwtSecret, {
    subject: String(usuario.id),
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"]
  });
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, login: usuario.login } });
});

authRoutes.get("/me", autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});
