import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/HttpError.js";

// Códigos de erro do PostgreSQL: https://www.postgresql.org/docs/current/errcodes-appendix.html
const mensagensUnique: Record<string, string> = {
  cliente_cpf_key: "Já existe um cliente cadastrado com esse CPF."
};

export const errorHandler: ErrorRequestHandler = (erro, _req, res, _next) => {
  if (erro instanceof HttpError) {
    res.status(erro.status).json({ mensagem: erro.message });
    return;
  }
  if (erro instanceof ZodError) {
    res.status(400).json({ mensagem: erro.issues[0]?.message ?? "Dados inválidos." });
    return;
  }
  if (erro?.type === "entity.parse.failed") {
    res.status(400).json({ mensagem: "JSON inválido no corpo da requisição." });
    return;
  }
  if (erro?.code === "23505") {
    res.status(409).json({ mensagem: mensagensUnique[erro.constraint] ?? "Registro duplicado." });
    return;
  }
  console.error(erro);
  res.status(500).json({ mensagem: "Erro interno do servidor." });
};
