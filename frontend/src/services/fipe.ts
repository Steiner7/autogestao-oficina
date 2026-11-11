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
