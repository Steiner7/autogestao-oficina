import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { HttpError } from "../utils/HttpError.js";
import { parseId } from "../utils/parseId.js";

const colunas = `id_veiculo AS id, id_cliente AS "clienteId", placa, marca, modelo, ano`;

const veiculoSchema = z.object({
  clienteId: z.number({ error: "Selecione um proprietário válido." }).int().positive("Selecione um proprietário válido."),
  placa: z.string({ error: "Informe a placa." })
    .transform((placa) => placa.trim().toUpperCase().replace(/[-\s]/g, ""))
    .refine((placa) => /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa), "Informe uma placa válida: ABC1234 ou ABC1D23."),
  marca: z.string({ error: "Informe a marca." }).trim().min(1, "Informe a marca e o modelo do veículo.").max(50, "Marca deve ter no máximo 50 caracteres."),
  modelo: z.string({ error: "Informe o modelo." }).trim().min(1, "Informe a marca e o modelo do veículo.").max(50, "Modelo deve ter no máximo 50 caracteres."),
  ano: z.number({ error: "Informe um ano válido." }).int("Informe um ano válido.")
    .refine((ano) => ano >= 1900 && ano <= new Date().getFullYear() + 1, "Informe um ano válido.")
});

async function garantirCliente(clienteId: number) {
  const { rowCount } = await pool.query("SELECT 1 FROM cliente WHERE id_cliente = $1", [clienteId]);
  if (!rowCount) throw new HttpError(400, "Selecione um proprietário válido.");
}

export const veiculosRoutes = Router();

veiculosRoutes.get("/", async (_req, res) => {
  const { rows } = await pool.query(`SELECT ${colunas} FROM veiculo ORDER BY id_veiculo`);
  res.json(rows);
});

veiculosRoutes.get("/:id", async (req, res) => {
  const { rows } = await pool.query(`SELECT ${colunas} FROM veiculo WHERE id_veiculo = $1`, [parseId(req.params.id)]);
  if (!rows[0]) throw new HttpError(404, "Veículo não encontrado.");
  res.json(rows[0]);
});

veiculosRoutes.post("/", async (req, res) => {
  const dados = veiculoSchema.parse(req.body);
  await garantirCliente(dados.clienteId);
  const { rows } = await pool.query(
    `INSERT INTO veiculo (id_cliente, placa, marca, modelo, ano) VALUES ($1, $2, $3, $4, $5) RETURNING ${colunas}`,
    [dados.clienteId, dados.placa, dados.marca, dados.modelo, dados.ano]
  );
  res.status(201).json(rows[0]);
});

veiculosRoutes.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const dados = veiculoSchema.parse(req.body);
  await garantirCliente(dados.clienteId);
  const { rows } = await pool.query(
    `UPDATE veiculo SET id_cliente = $1, placa = $2, marca = $3, modelo = $4, ano = $5
     WHERE id_veiculo = $6 RETURNING ${colunas}`,
    [dados.clienteId, dados.placa, dados.marca, dados.modelo, dados.ano, id]
  );
  if (!rows[0]) throw new HttpError(404, "Veículo não encontrado.");
  res.json(rows[0]);
});

veiculosRoutes.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const { rowCount } = await pool.query("DELETE FROM veiculo WHERE id_veiculo = $1", [id]);
  if (!rowCount) throw new HttpError(404, "Veículo não encontrado.");
  res.status(204).end();
});
