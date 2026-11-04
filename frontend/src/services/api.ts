const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const CHAVE_TOKEN = "autogestao.token";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function obterToken(): string | null {
  try { return localStorage.getItem(CHAVE_TOKEN); } catch { return null; }
}

export function salvarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // Armazenamento indisponível (ex.: navegação privada): a sessão dura até recarregar a página.
  }
}

let aoNaoAutorizado: (() => void) | null = null;

// Chamado quando a API recusa o token (expirado ou inválido), para encerrar a sessão no front.
export function definirAoNaoAutorizado(callback: (() => void) | null) {
  aoNaoAutorizado = callback;
}

type Opcoes = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

export async function api<T>(caminho: string, { method = "GET", body }: Opcoes = {}): Promise<T> {
  const token = obterToken();
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique se a API está em execução.");
  }

  if (resposta.status === 401 && token) aoNaoAutorizado?.();
  if (!resposta.ok) {
    const dados = await resposta.json().catch(() => null);
    throw new ApiError(resposta.status, dados?.mensagem ?? `Erro ${resposta.status} ao comunicar com o servidor.`);
  }
  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

export function mensagemDeErro(erro: unknown) {
  return erro instanceof Error ? erro.message : "Ocorreu um erro inesperado.";
}
