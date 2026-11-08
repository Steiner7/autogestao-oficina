import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, mensagemDeErro } from "../services/api";
import { useAuth } from "./AuthContext";
import type { Veiculo } from "../types/Veiculo";

type DadosVeiculo = Omit<Veiculo, "id">;

type VeiculosContextType = {
  veiculos: Veiculo[];
  carregando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
  criarVeiculo: (dados: DadosVeiculo) => Promise<Veiculo>;
  atualizarVeiculo: (id: number, dados: DadosVeiculo) => Promise<Veiculo>;
  excluirVeiculo: (id: number) => Promise<void>;
};

const VeiculosContext = createContext<VeiculosContextType | undefined>(undefined);

export function VeiculosProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setVeiculos(await api<Veiculo[]>("/veiculos"));
      setErro("");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (token) recarregar();
    else setVeiculos([]);
  }, [token, recarregar]);

  async function criarVeiculo(dados: DadosVeiculo) {
    const veiculo = await api<Veiculo>("/veiculos", { method: "POST", body: dados });
    setVeiculos((anteriores) => [...anteriores, veiculo]);
    return veiculo;
  }

  async function atualizarVeiculo(id: number, dados: DadosVeiculo) {
    const veiculo = await api<Veiculo>(`/veiculos/${id}`, { method: "PUT", body: dados });
    setVeiculos((anteriores) => anteriores.map((v) => v.id === id ? veiculo : v));
    return veiculo;
  }

  async function excluirVeiculo(id: number) {
    await api<void>(`/veiculos/${id}`, { method: "DELETE" });
    setVeiculos((anteriores) => anteriores.filter((v) => v.id !== id));
  }

  return (
    <VeiculosContext.Provider value={{ veiculos, carregando, erro, recarregar, criarVeiculo, atualizarVeiculo, excluirVeiculo }}>
      {children}
    </VeiculosContext.Provider>
  );
}

export function useVeiculos() {
  const context = useContext(VeiculosContext);
  if (!context) throw new Error("useVeiculos deve ser usado dentro de VeiculosProvider");
  return context;
}
