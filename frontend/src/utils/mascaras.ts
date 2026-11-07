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
