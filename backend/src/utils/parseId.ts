import { HttpError } from "./HttpError.js";

export function parseId(valor: string | string[] | undefined): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Identificador inválido.");
  return id;
}
