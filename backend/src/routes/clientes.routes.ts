import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { HttpError } from "../utils/HttpError.js";
import { parseId } from "../utils/parseId.js";

const colunas = `id_cliente AS id, nome, cpf, COALESCE(telefone, '') AS telefone,
  COALESCE(email, '') AS email, COALESCE(endereco, '') AS endereco`;

const textoOpcional = (max: number, campo: string) =>
  z.string().trim().max(max, `${campo} deve ter no máximo ${max} caracteres.`).optional().default("");

const clienteSchema = z.object({
  nome: z.string({ error: "Informe o nome." }).trim().min(1, "Informe o nome.").max(100, "Nome deve ter no máximo 100 caracteres."),
  cpf: z.string({ error: "Informe o CPF." }).trim().min(1, "Informe o CPF.").max(14, "CPF deve ter no máximo 14 caracteres."),
  telefone: textoOpcional(20, "Telefone"),
  email: textoOpcional(100, "E-mail").refine((email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Informe um e-mail válido."),
  endereco: textoOpcional(150, "Endereço")
});

// Campos opcionais vazios são gravados como NULL no banco.
function parametros(dados: z.infer<typeof clienteSchema>) {
  return [dados.nome, dados.cpf, dados.telefone || null, dados.email || null, dados.endereco || null];
}

export const clientesRoutes = Router();

clientesRoutes.get("/", async (_req, res) => {
  const { rows } = await pool.query(`SELECT ${colunas} FROM cliente ORDER BY nome`);
  res.json(rows);
});

clientesRoutes.get("/:id", async (req, res) => {
  const { rows } = await pool.query(`SELECT ${colunas} FROM cliente WHERE id_cliente = $1`, [parseId(req.params.id)]);
  if (!rows[0]) throw new HttpError(404, "Cliente não encontrado.");
  res.json(rows[0]);
});

clientesRoutes.post("/", async (req, res) => {
  const dados = clienteSchema.parse(req.body);
  const { rows } = await pool.query(
    `INSERT INTO cliente (nome, cpf, telefone, email, endereco) VALUES ($1, $2, $3, $4, $5) RETURNING ${colunas}`,
    parametros(dados)
  );
  res.status(201).json(rows[0]);
});

clientesRoutes.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const dados = clienteSchema.parse(req.body);
  const { rows } = await pool.query(
    `UPDATE cliente SET nome = $1, cpf = $2, telefone = $3, email = $4, endereco = $5
     WHERE id_cliente = $6 RETURNING ${colunas}`,
    [...parametros(dados), id]
  );
  if (!rows[0]) throw new HttpError(404, "Cliente não encontrado.");
  res.json(rows[0]);
});

clientesRoutes.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const { rowCount } = await pool.query("DELETE FROM cliente WHERE id_cliente = $1", [id]);
  if (!rowCount) throw new HttpError(404, "Cliente não encontrado.");
  res.status(204).end();
});
