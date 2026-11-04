import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, definirAoNaoAutorizado, obterToken, salvarToken } from "../services/api";
import type { Usuario } from "../types/Usuario";

type AuthContextType = {
  token: string | null;
  usuario: Usuario | null;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(obterToken);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const sair = useCallback(() => {
    salvarToken(null);
    setToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    definirAoNaoAutorizado(sair);
    return () => definirAoNaoAutorizado(null);
  }, [sair]);

  // Restaura os dados do usuário (e valida o token) ao recarregar a página.
  useEffect(() => {
    if (!token || usuario) return;
    api<{ usuario: Usuario }>("/auth/me").then((dados) => setUsuario(dados.usuario)).catch(() => {});
  }, [token, usuario]);

  async function entrar(login: string, senha: string) {
    const dados = await api<{ token: string; usuario: Usuario }>("/auth/login", { method: "POST", body: { login, senha } });
    salvarToken(dados.token);
    setToken(dados.token);
    setUsuario(dados.usuario);
  }

  return <AuthContext.Provider value={{ token, usuario, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
