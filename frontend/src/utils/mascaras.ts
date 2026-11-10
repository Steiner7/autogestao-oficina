export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

// 000.000.000-00, aplicada conforme o usuário digita.
export function formatarCPF(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11);
  const inicio = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(".");
  return d.length > 9 ? `${inicio}-${d.slice(9)}` : inicio;
}

// (00) 00000-0000, aplicada conforme o usuário digita.
export function formatarTelefone(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte o texto digitado em reais, preenchendo a partir dos centavos (ex.: "12345" → 123,45).
// Zeros à esquerda são descartados para que apagar tudo volte a "não informado".
// Limitado a 10 dígitos, o máximo de decimal(10,2) no banco.
export function lerMoeda(valor: string): number | null {
  const d = somenteDigitos(valor).replace(/^0+/, "").slice(0, 10);
  return d ? Number(d) / 100 : null;
}
