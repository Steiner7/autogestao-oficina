import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { HttpError } from "../utils/HttpError.js";
import { parseId } from "../utils/parseId.js";

const colunas = `id_os AS id, id_veiculo AS "veiculoId", id_usuario AS "usuarioId",
  data_abertura AS "dataAbertura", data_fechamento AS "dataFechamento",
  COALESCE(descricao, '') AS descricao, status, valor`;

const STATUS = ["Aberta", "Em andamento", "Concluída", "Cancelada"] as const;

const ordemSchema = z.object({
  veiculoId: z.number({ error: "Selecione um veículo." }).int().positive("Selecione um veículo."),
  descricao: z.string({ error: "Informe a descrição do serviço." }).trim().min(1, "Informe a descrição do serviço."),
  // decimal(10,2): até 99.999.999,99 e no máximo duas casas decimais.
  valor: z.number().nullable().optional().default(null)
    .refine((valor) => valor === null || (Number.isFinite(valor) && valor >= 0 && valor < 1e8 && Math.round(valor * 100) / 100 === valor),
      "Informe um valor válido, com no máximo duas casas decimais.")
});

const atualizacaoSchema = ordemSchema.extend({
  status: z.enum(STATUS, { error: "Status inválido." })
});

async function garantirVeiculo(veiculoId: number) {
  const { rowCount } = await pool.query("SELECT 1 FROM veiculo WHERE id_veiculo = $1", [veiculoId]);
  if (!rowCount) throw new HttpError(400, "O veículo selecionado não existe.");
}

export const ordensServicoRoutes = Router();

ordensServicoRoutes.get("/", async (_req, res) => {
  const { rows } = await pool.query(`SELECT ${colunas} FROM ordem_servico ORDER BY id_os`);
  res.json(rows);
});

ordensServicoRoutes.get("/:id", async (req, res) => {
  const { rows } = await pool.query(`SELECT ${colunas} FROM ordem_servico WHERE id_os = $1`, [parseId(req.params.id)]);
  if (!rows[0]) throw new HttpError(404, "Ordem de serviço não encontrada.");
  res.json(rows[0]);
});

// Toda OS nasce "Aberta", com a data de hoje e vinculada ao usuário autenticado.
ordensServicoRoutes.post("/", async (req, res) => {
  const dados = ordemSchema.parse(req.body);
  await garantirVeiculo(dados.veiculoId);
  const { rows } = await pool.query(
    `INSERT INTO ordem_servico (id_veiculo, id_usuario, data_abertura, descricao, status, valor)
     VALUES ($1, $2, CURRENT_DATE, $3, 'Aberta', $4) RETURNING ${colunas}`,
    [dados.veiculoId, req.usuario!.id, dados.descricao, dados.valor]
  );
  res.status(201).json(rows[0]);
});

// Ao concluir, mantém a data de fechamento já existente ou usa a de hoje; outros status limpam a data.
ordensServicoRoutes.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const dados = atualizacaoSchema.parse(req.body);
  await garantirVeiculo(dados.veiculoId);
  const { rows } = await pool.query(
    `UPDATE ordem_servico SET id_veiculo = $1, descricao = $2, valor = $3, status = $4::varchar,
       data_fechamento = CASE WHEN $4::varchar = 'Concluída' THEN COALESCE(data_fechamento, CURRENT_DATE) ELSE NULL END
     WHERE id_os = $5 RETURNING ${colunas}`,
    [dados.veiculoId, dados.descricao, dados.valor, dados.status, id]
  );
  if (!rows[0]) throw new HttpError(404, "Ordem de serviço não encontrada.");
  res.json(rows[0]);
});

ordensServicoRoutes.patch("/:id/concluir", async (req, res) => {
  const id = parseId(req.params.id);
  const { rows } = await pool.query(
    `UPDATE ordem_servico SET status = 'Concluída', data_fechamento = CURRENT_DATE
     WHERE id_os = $1 AND status NOT IN ('Concluída', 'Cancelada') RETURNING ${colunas}`,
    [id]
  );
  if (rows[0]) {
    res.json(rows[0]);
    return;
  }
  const existe = await pool.query("SELECT 1 FROM ordem_servico WHERE id_os = $1", [id]);
  if (!existe.rowCount) throw new HttpError(404, "Ordem de serviço não encontrada.");
  throw new HttpError(409, "Esta ordem de serviço já está concluída ou cancelada.");
});

ordensServicoRoutes.delete("/:id", async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM ordem_servico WHERE id_os = $1", [parseId(req.params.id)]);
  if (!rowCount) throw new HttpError(404, "Ordem de serviço não encontrada.");
  res.status(204).end();
});
