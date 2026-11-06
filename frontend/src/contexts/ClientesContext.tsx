import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, mensagemDeErro } from "../services/api";
import { useAuth } from "./AuthContext";
import type { Cliente } from "../types/Cliente";

type DadosCliente = Omit<Cliente, "id">;

type ClientesContextType = {
  clientes: Cliente[];
  carregando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
  criarCliente: (dados: DadosCliente) => Promise<Cliente>;
  atualizarCliente: (id: number, dados: DadosCliente) => Promise<Cliente>;
  excluirCliente: (id: number) => Promise<void>;
};

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

export function ClientesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setClientes(await api<Cliente[]>("/clientes"));
      setErro("");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (token) recarregar();
    else setClientes([]);
  }, [token, recarregar]);

  async function criarCliente(dados: DadosCliente) {
    const cliente = await api<Cliente>("/clientes", { method: "POST", body: dados });
    setClientes((anteriores) => [...anteriores, cliente]);
    return cliente;
  }

  async function atualizarCliente(id: number, dados: DadosCliente) {
    const cliente = await api<Cliente>(`/clientes/${id}`, { method: "PUT", body: dados });
    setClientes((anteriores) => anteriores.map((c) => c.id === id ? cliente : c));
    return cliente;
  }

  async function excluirCliente(id: number) {
    await api<void>(`/clientes/${id}`, { method: "DELETE" });
    setClientes((anteriores) => anteriores.filter((c) => c.id !== id));
  }

  return (
    <ClientesContext.Provider value={{ clientes, carregando, erro, recarregar, criarCliente, atualizarCliente, excluirCliente }}>
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientesContext);
  if (!context) throw new Error("useClientes deve ser usado dentro de ClientesProvider");
  return context;
}
