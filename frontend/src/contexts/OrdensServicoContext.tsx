import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, mensagemDeErro } from "../services/api";
import { useAuth } from "./AuthContext";
import type { OrdemServico } from "../types/OrdemServico";

type OrdensServicoContextType = {
  ordens: OrdemServico[];
  carregando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
};

const OrdensServicoContext = createContext<OrdensServicoContextType | undefined>(undefined);

export function OrdensServicoProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setOrdens(await api<OrdemServico[]>("/ordens-servico"));
      setErro("");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (token) recarregar();
    else setOrdens([]);
  }, [token, recarregar]);

  return (
    <OrdensServicoContext.Provider value={{ ordens, carregando, erro, recarregar }}>
      {children}
    </OrdensServicoContext.Provider>
  );
}

export function useOrdensServico() {
  const context = useContext(OrdensServicoContext);
  if (!context) throw new Error("useOrdensServico deve ser usado dentro de OrdensServicoProvider");
  return context;
}
