import { Router } from "express";
import { HttpError } from "../utils/HttpError.js";
import { parseId } from "../utils/parseId.js";

// API FIPE gratuita da Parallelum: https://deividfortuna.github.io/fipe/
// O plano gratuito permite 500 requisições por dia, por isso as respostas ficam em cache no servidor.
const FIPE_URL = "https://parallelum.com.br/fipe/api/v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// Categorias da FIPE; "caminhoes" inclui micro-ônibus.
const TIPOS = ["carros", "motos", "caminhoes"];

type ItemFipe = { codigo: string; nome: string };

const cache = new Map<string, { expiraEm: number; dados: ItemFipe[] }>();

function parseTipo(tipo: string | string[] | undefined): string {
  if (typeof tipo !== "string" || !TIPOS.includes(tipo)) throw new HttpError(400, "Tipo de veículo inválido.");
  return tipo;
}

async function buscarNaFipe(caminho: string, extrair: (json: unknown) => { codigo: string | number; nome: string }[]) {
  const emCache = cache.get(caminho);
  if (emCache && emCache.expiraEm > Date.now()) return emCache.dados;

  let resposta: Response;
  try {
    resposta = await fetch(`${FIPE_URL}${caminho}`, { signal: AbortSignal.timeout(10000) });
  } catch {
    throw new HttpError(502, "Não foi possível consultar a tabela FIPE no momento.");
  }
  if (resposta.status === 429) throw new HttpError(503, "Limite diário de consultas à tabela FIPE atingido. Tente novamente mais tarde.");
  if (!resposta.ok) throw new HttpError(502, "A tabela FIPE retornou um erro. Tente novamente mais tarde.");

  const dados = extrair(await resposta.json()).map(({ codigo, nome }) => ({ codigo: String(codigo), nome }));
  cache.set(caminho, { expiraEm: Date.now() + CACHE_TTL_MS, dados });
  return dados;
}

export const fipeRoutes = Router();

fipeRoutes.get("/:tipo/marcas", async (req, res) => {
  const tipo = parseTipo(req.params.tipo);
  res.json(await buscarNaFipe(`/${tipo}/marcas`, (json) => json as ItemFipe[]));
});

fipeRoutes.get("/:tipo/marcas/:codigo/modelos", async (req, res) => {
  const tipo = parseTipo(req.params.tipo);
  const codigo = parseId(req.params.codigo);
  res.json(await buscarNaFipe(`/${tipo}/marcas/${codigo}/modelos`, (json) => (json as { modelos: ItemFipe[] }).modelos));
});

// Anos-modelo com combustível, ex.: { codigo: "2022-1", nome: "2022 Gasolina" }; o ano 32000 indica zero km.
fipeRoutes.get("/:tipo/marcas/:codigo/modelos/:modelo/anos", async (req, res) => {
  const tipo = parseTipo(req.params.tipo);
  const codigo = parseId(req.params.codigo);
  const modelo = parseId(req.params.modelo);
  res.json(await buscarNaFipe(`/${tipo}/marcas/${codigo}/modelos/${modelo}/anos`, (json) => json as ItemFipe[]));
});
