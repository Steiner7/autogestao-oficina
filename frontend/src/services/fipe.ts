import { api } from "./api";

export type ItemFipe = { codigo: string; nome: string };
export type TipoVeiculo = "carros" | "motos" | "caminhoes";

export const TIPOS_VEICULO: { valor: TipoVeiculo; rotulo: string }[] = [
  { valor: "carros", rotulo: "Carro / utilitário" },
  { valor: "motos", rotulo: "Moto" },
  { valor: "caminhoes", rotulo: "Caminhão / micro-ônibus" }
];

export function mesmoNome(a: string, b: string) {
  return a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;
}

export function listarMarcas(tipo: TipoVeiculo) {
  return api<ItemFipe[]>(`/fipe/${tipo}/marcas`);
}

export function listarModelos(tipo: TipoVeiculo, codigoMarca: string) {
  return api<ItemFipe[]>(`/fipe/${tipo}/marcas/${codigoMarca}/modelos`);
}

// A FIPE lista um item por ano e combustível ("2022 Gasolina", "2022 Flex"); aqui ficam só os anos, do mais novo ao mais antigo.
// O código 32000 significa "zero km" e vira o ano atual.
export async function listarAnos(tipo: TipoVeiculo, codigoMarca: string, codigoModelo: string) {
  const itens = await api<ItemFipe[]>(`/fipe/${tipo}/marcas/${codigoMarca}/modelos/${codigoModelo}/anos`);
  const anoAtual = new Date().getFullYear();
  const anos = itens
    .map((item) => Number.parseInt(item.codigo, 10))
    .filter(Number.isFinite)
    .map((ano) => ano === 32000 ? anoAtual : ano);
  return [...new Set(anos)].sort((a, b) => b - a);
}

// Lista usada quando não há modelo da FIPE selecionado: do próximo ano até 1950.
export function anosPadrao() {
  const proximo = new Date().getFullYear() + 1;
  return Array.from({ length: proximo - 1950 + 1 }, (_, i) => proximo - i);
}

// O tipo não é gravado no banco: ao editar, ele é deduzido procurando marca e modelo em cada categoria.
// Prefere a categoria em que marca e modelo existem; senão, a primeira em que só a marca existe.
export async function descobrirTipo(marca: string, modelo: string): Promise<TipoVeiculo> {
  let apenasMarca: TipoVeiculo | null = null;
  for (const { valor: tipo } of TIPOS_VEICULO) {
    const encontrada = (await listarMarcas(tipo)).find((m) => mesmoNome(m.nome, marca));
    if (!encontrada) continue;
    const modelos = await listarModelos(tipo, encontrada.codigo);
    if (modelos.some((m) => mesmoNome(m.nome, modelo))) return tipo;
    apenasMarca ??= tipo;
  }
  return apenasMarca ?? "carros";
}
