import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, mensagemDeErro } from "../services/api";
import { useAuth } from "./AuthContext";
import type { OrdemServico } from "../types/OrdemServico";

type DadosNovaOS = Pick<OrdemServico, "veiculoId" | "descricao" | "valor">;
type DadosAtualizacaoOS = DadosNovaOS & Pick<OrdemServico, "status">;

type OrdensServicoContextType = {
  ordens: OrdemServico[];
  carregando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
  criarOrdem: (dados: DadosNovaOS) => Promise<OrdemServico>;
  atualizarOrdem: (id: number, dados: DadosAtualizacaoOS) => Promise<OrdemServico>;
  concluirOrdem: (id: number) => Promise<OrdemServico>;
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

  function substituir(ordem: OrdemServico) {
    setOrdens((anteriores) => anteriores.map((os) => os.id === ordem.id ? ordem : os));
    return ordem;
  }

  async function criarOrdem(dados: DadosNovaOS) {
    const ordem = await api<OrdemServico>("/ordens-servico", { method: "POST", body: dados });
    setOrdens((anteriores) => [...anteriores, ordem]);
    return ordem;
  }

  async function atualizarOrdem(id: number, dados: DadosAtualizacaoOS) {
    return substituir(await api<OrdemServico>(`/ordens-servico/${id}`, { method: "PUT", body: dados }));
  }

  async function concluirOrdem(id: number) {
    return substituir(await api<OrdemServico>(`/ordens-servico/${id}/concluir`, { method: "PATCH" }));
  }

  return (
    <OrdensServicoContext.Provider value={{ ordens, carregando, erro, recarregar, criarOrdem, atualizarOrdem, concluirOrdem }}>
      {children}
    </OrdensServicoContext.Provider>
  );
}

export function useOrdensServico() {
  const context = useContext(OrdensServicoContext);
  if (!context) throw new Error("useOrdensServico deve ser usado dentro de OrdensServicoProvider");
  return context;
}
