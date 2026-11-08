import { useState } from "react";
import { FiEye, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import ModalCliente from "../../components/ModalCliente";
import type { DadosCliente } from "../../components/ModalCliente";
import { useClientes } from "../../contexts/ClientesContext";
import { useVeiculos } from "../../contexts/VeiculosContext";
import { mensagemDeErro } from "../../services/api";
import type { Cliente } from "../../types/Cliente";
import "./Clientes.css";

export default function Clientes() {
  const { clientes, carregando, erro, criarCliente, atualizarCliente, excluirCliente: removerCliente } = useClientes();
  const { veiculos } = useVeiculos();
  const [pesquisa, setPesquisa] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);
  const [mensagem, setMensagem] = useState("");

  const termo = pesquisa.trim().toLowerCase();
  const cpfPesquisa = pesquisa.replace(/\D/g, "");
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(termo) ||
    (cpfPesquisa.length > 0 && cliente.cpf.replace(/\D/g, "").includes(cpfPesquisa))
  );

  function abrirCadastro() { setClienteEditando(null); setMensagem(""); setModalAberto(true); }
  function abrirEdicao(cliente: Cliente) { setClienteEditando(cliente); setMensagem(""); setModalAberto(true); }
  function fecharModal() { setModalAberto(false); setClienteEditando(null); }

  async function salvarCliente(dados: DadosCliente) {
    try {
      if (clienteEditando) {
        await atualizarCliente(clienteEditando.id, dados);
        setMensagem("Cliente atualizado com sucesso!");
      } else {
        await criarCliente(dados);
        setMensagem("Cliente cadastrado com sucesso!");
      }
      fecharModal();
    } catch (e) {
      window.alert(mensagemDeErro(e));
    }
  }

  async function excluirCliente(cliente: Cliente) {
    if (veiculos.some((veiculo) => veiculo.clienteId === cliente.id)) {
      window.alert("Este cliente possui veículos cadastrados. Não é possível excluí-lo sem comprometer os vínculos e o histórico.");
      return;
    }
    if (!window.confirm(`Deseja realmente excluir o cliente ${cliente.nome}?`)) return;
    try {
      await removerCliente(cliente.id);
      setMensagem("Cliente excluído com sucesso!");
    } catch (e) {
      window.alert(mensagemDeErro(e));
    }
  }

  return (
    <div className="sistema-layout">
      <Sidebar />
      <main className="clientes-content">
        <header className="page-header clientes-header"><h1>Clientes</h1><p>Gerencie os clientes cadastrados na oficina.</p></header>
        {mensagem && <div className="notice-success" role="status">{mensagem}</div>}
        {erro && <div className="notice-error" role="alert">{erro}</div>}
        <section className="page-panel clientes-card">
          <div className="page-toolbar clientes-toolbar">
            <input type="search" placeholder="Pesquisar por nome ou CPF..." aria-label="Pesquisar clientes" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
            <button type="button" className="btn-primary" onClick={abrirCadastro}><FiPlus aria-hidden="true" /> Novo Cliente</button>
          </div>
          <div className="table-scroll"><table className="data-table clientes-table">
            <thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Ações</th></tr></thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td><td>{cliente.cpf}</td><td>{cliente.telefone || "—"}</td><td>{cliente.email || "—"}</td>
                  <td><div className="action-group clientes-acoes">
                    <button type="button" className="icon-button view" title="Visualizar cliente" aria-label={`Visualizar ${cliente.nome}`} onClick={() => setClienteVisualizando(cliente)}><FiEye /></button>
                    <button type="button" className="icon-button edit" title="Editar cliente" aria-label={`Editar ${cliente.nome}`} onClick={() => abrirEdicao(cliente)}><FiEdit2 /></button>
                    <button type="button" className="icon-button delete" title="Excluir cliente" aria-label={`Excluir ${cliente.nome}`} onClick={() => excluirCliente(cliente)}><FiTrash2 /></button>
                  </div></td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && <tr><td colSpan={5} className="empty-row">{carregando ? "Carregando clientes..." : "Nenhum cliente encontrado."}</td></tr>}
            </tbody>
          </table></div>
        </section>
      </main>

      {modalAberto && <ModalCliente key={clienteEditando?.id ?? "novo"} cliente={clienteEditando} onClose={fecharModal} onSalvar={salvarCliente} />}
      {clienteVisualizando && (
        <div className="modal-overlay"><div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-cliente">
          <div className="modal-heading"><h2 id="titulo-detalhes-cliente">Dados do Cliente</h2><button className="modal-close" type="button" onClick={() => setClienteVisualizando(null)} aria-label="Fechar">×</button></div>
          <div className="detail-grid">
            <div className="detail-field full"><strong>Nome</strong><span>{clienteVisualizando.nome}</span></div>
            <div className="detail-field"><strong>CPF</strong><span>{clienteVisualizando.cpf}</span></div>
            <div className="detail-field"><strong>Telefone</strong><span>{clienteVisualizando.telefone || "Não informado"}</span></div>
            <div className="detail-field full"><strong>E-mail</strong><span>{clienteVisualizando.email || "Não informado"}</span></div>
            <div className="detail-field full"><strong>Endereço</strong><span>{clienteVisualizando.endereco || "Não informado"}</span></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn-secondary" onClick={() => setClienteVisualizando(null)}>Fechar</button></div>
        </div></div>
      )}
    </div>
  );
}
