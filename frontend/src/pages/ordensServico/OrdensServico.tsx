import { useState } from "react";
import { FiEye, FiEdit2, FiCheck, FiPlus } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import ModalOrdemServico from "../../components/ModalOrdemServico";
import type { DadosFormularioOS } from "../../components/ModalOrdemServico";
import { useClientes } from "../../contexts/ClientesContext";
import { useVeiculos } from "../../contexts/VeiculosContext";
import { useOrdensServico } from "../../contexts/OrdensServicoContext";
import { mensagemDeErro } from "../../services/api";
import type { OrdemServico } from "../../types/OrdemServico";
import "./OrdensServico.css";

export default function OrdensServico() {
  const { clientes } = useClientes();
  const { veiculos } = useVeiculos();
  const { ordens, carregando, erro, criarOrdem, atualizarOrdem, concluirOrdem: finalizarOrdem } = useOrdensServico();
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [ordemEditando, setOrdemEditando] = useState<OrdemServico | null>(null);
  const [ordemVisualizando, setOrdemVisualizando] = useState<OrdemServico | null>(null);
  const [mensagem, setMensagem] = useState("");

  function buscarVeiculo(veiculoId: number) {
    return veiculos.find((veiculo) => veiculo.id === veiculoId);
  }

  function buscarCliente(veiculoId: number) {
    const veiculo = buscarVeiculo(veiculoId);
    if (!veiculo) return "Veículo não encontrado";
    return clientes.find((cliente) => cliente.id === veiculo.clienteId)?.nome ?? "Cliente não encontrado";
  }

  function descricaoVeiculo(veiculoId: number) {
    const veiculo = buscarVeiculo(veiculoId);
    return veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : "Veículo não encontrado";
  }

  function formatarValor(valor: number | null) {
    return valor === null ? "Não informado" : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatarData(data: string | null) {
    if (!data) return "Não informada";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const ordensFiltradas = ordens.filter((ordem) => {
    const termo = pesquisa.trim().toLowerCase();
    const veiculo = buscarVeiculo(ordem.veiculoId);
    const cliente = buscarCliente(ordem.veiculoId);
    const encontrouPesquisa = String(ordem.id).includes(termo) ||
      (veiculo?.placa ?? "").toLowerCase().includes(termo) ||
      (veiculo?.modelo ?? "").toLowerCase().includes(termo) ||
      cliente.toLowerCase().includes(termo);
    return encontrouPesquisa && (filtroStatus === "Todos" || ordem.status === filtroStatus);
  });

  function abrirCadastro() { setOrdemEditando(null); setMensagem(""); setModalAberto(true); }
  function abrirEdicao(ordem: OrdemServico) { setOrdemEditando(ordem); setMensagem(""); setModalAberto(true); }
  function fecharModal() { setModalAberto(false); setOrdemEditando(null); }

  // Data de abertura, status inicial e usuário responsável são definidos pelo back-end.
  async function salvarOrdem(dados: DadosFormularioOS) {
    try {
      if (ordemEditando) {
        await atualizarOrdem(ordemEditando.id, dados);
        setMensagem("Ordem de serviço atualizada com sucesso!");
      } else {
        await criarOrdem({ veiculoId: dados.veiculoId, descricao: dados.descricao, valor: dados.valor });
        setMensagem("Ordem de serviço cadastrada com sucesso!");
      }
      fecharModal();
    } catch (e) {
      window.alert(mensagemDeErro(e));
    }
  }

  async function concluirOrdem(ordem: OrdemServico) {
    if (ordem.status === "Concluída" || ordem.status === "Cancelada") return;
    if (!window.confirm(`Deseja concluir a OS #${String(ordem.id).padStart(3, "0")}?`)) return;
    try {
      await finalizarOrdem(ordem.id);
      setMensagem("Ordem de serviço concluída com sucesso!");
    } catch (e) {
      window.alert(mensagemDeErro(e));
    }
  }

  function classeStatus(status: OrdemServico["status"]) {
    switch (status) {
      case "Concluída": return "os-concluida";
      case "Em andamento": return "os-andamento";
      case "Cancelada": return "os-cancelada";
      default: return "os-aberta";
    }
  }

  return (
    <div className="sistema-layout"><Sidebar />
      <main className="os-content">
        <header className="page-header os-header"><h1>Ordens de Serviço</h1><p>Gerencie os serviços realizados na oficina.</p></header>
        {mensagem && <div className="notice-success os-mensagem" role="status">{mensagem}</div>}
        {erro && <div className="notice-error" role="alert">{erro}</div>}
        <section className="page-panel os-card">
          <div className="page-toolbar os-toolbar">
            <input type="search" placeholder="Pesquisar por OS, placa ou cliente..." aria-label="Pesquisar ordens de serviço" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtrar por status"><option value="Todos">Todos os status</option><option value="Aberta">Aberta</option><option value="Em andamento">Em andamento</option><option value="Concluída">Concluída</option><option value="Cancelada">Cancelada</option></select>
            <button type="button" className="btn-primary os-btn-nova" onClick={abrirCadastro}><FiPlus aria-hidden="true" /> Nova OS</button>
          </div>
          <div className="table-scroll os-table-wrapper"><table className="data-table os-table">
            <thead><tr><th>Nº OS</th><th>Cliente</th><th>Veículo</th><th>Abertura</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead>
            <tbody>
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.id}>
                  <td>#{String(ordem.id).padStart(3, "0")}</td>
                  <td>{buscarCliente(ordem.veiculoId)}</td>
                  <td>{descricaoVeiculo(ordem.veiculoId)}</td>
                  <td>{formatarData(ordem.dataAbertura)}</td>
                  <td><span className={`os-status ${classeStatus(ordem.status)}`}>{ordem.status}</span></td>
                  <td>{formatarValor(ordem.valor)}</td>
                  <td><div className="action-group os-acoes">
                    <button type="button" className="icon-button view os-acao-visualizar" title="Visualizar OS" aria-label={`Visualizar OS ${ordem.id}`} onClick={() => setOrdemVisualizando(ordem)}><FiEye /></button>
                    <button type="button" className="icon-button edit os-acao-editar" title="Editar OS" aria-label={`Editar OS ${ordem.id}`} onClick={() => abrirEdicao(ordem)}><FiEdit2 /></button>
                    {ordem.status !== "Concluída" && ordem.status !== "Cancelada" && <button type="button" className="icon-button complete os-acao-concluir" title="Concluir OS" aria-label={`Concluir OS ${ordem.id}`} onClick={() => concluirOrdem(ordem)}><FiCheck /></button>}
                  </div></td>
                </tr>
              ))}
              {ordensFiltradas.length === 0 && <tr><td colSpan={7} className="empty-row">{carregando ? "Carregando ordens de serviço..." : "Nenhuma ordem de serviço encontrada."}</td></tr>}
            </tbody>
          </table></div>
        </section>
      </main>
      {modalAberto && <ModalOrdemServico key={ordemEditando?.id ?? "nova"} ordem={ordemEditando} onClose={fecharModal} onSalvar={salvarOrdem} />}
      {ordemVisualizando && (
        <div className="modal-overlay os-modal-overlay"><div className="modal-box os-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-os">
          <div className="modal-heading os-modal-header"><h2 id="titulo-detalhes-os">OS #{String(ordemVisualizando.id).padStart(3, "0")}</h2><button type="button" className="modal-close os-modal-fechar" onClick={() => setOrdemVisualizando(null)} aria-label="Fechar detalhes">×</button></div>
          <div className="detail-grid os-detalhes">
            <div className="detail-field full"><strong>Cliente</strong><span>{buscarCliente(ordemVisualizando.veiculoId)}</span></div>
            <div className="detail-field full"><strong>Veículo</strong><span>{descricaoVeiculo(ordemVisualizando.veiculoId)}</span></div>
            <div className="detail-field"><strong>Data de abertura</strong><span>{formatarData(ordemVisualizando.dataAbertura)}</span></div>
            <div className="detail-field"><strong>Data de fechamento</strong><span>{ordemVisualizando.dataFechamento ? formatarData(ordemVisualizando.dataFechamento) : "Ainda não fechada"}</span></div>
            <div className="detail-field"><strong>Status</strong><span>{ordemVisualizando.status}</span></div>
            <div className="detail-field"><strong>Valor</strong><span>{formatarValor(ordemVisualizando.valor)}</span></div>
            <div className="detail-field full"><strong>Descrição</strong><div className="detail-description os-descricao-detalhes">{ordemVisualizando.descricao || "Nenhuma descrição informada."}</div></div>
          </div>
          <div className="modal-footer os-modal-actions"><button type="button" className="btn-secondary os-btn-cancelar" onClick={() => setOrdemVisualizando(null)}>Fechar</button></div>
        </div></div>
      )}
    </div>
  );
}
