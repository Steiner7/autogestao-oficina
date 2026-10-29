import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { HttpError } from "../utils/HttpError.js";

export type UsuarioToken = { id: number; nome: string; login: string };

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

export const autenticar: RequestHandler = (req, _res, next) => {
  const [tipo, token] = req.headers.authorization?.split(" ") ?? [];
  if (tipo !== "Bearer" || !token) throw new HttpError(401, "Token de autenticação não informado.");
  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload & Omit<UsuarioToken, "id">;
    req.usuario = { id: Number(payload.sub), nome: payload.nome, login: payload.login };
  } catch {
    throw new HttpError(401, "Sessão inválida ou expirada. Faça login novamente.");
  }
  next();
};
