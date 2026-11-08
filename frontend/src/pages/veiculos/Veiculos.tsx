import { useState } from "react";
import { FiEye, FiEdit2, FiTrash2, FiPlus, FiClock } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import ModalVeiculo from "../../components/ModalVeiculo";
import type { DadosVeiculo } from "../../components/ModalVeiculo";
import HistoricoVeiculo from "../../components/HistoricoVeiculo";
import { useClientes } from "../../contexts/ClientesContext";
import { useVeiculos } from "../../contexts/VeiculosContext";
import { useOrdensServico } from "../../contexts/OrdensServicoContext";
import { mensagemDeErro } from "../../services/api";
import type { Veiculo } from "../../types/Veiculo";
import "./Veiculos.css";

export default function Veiculos() {
  const { clientes } = useClientes();
  const { veiculos, carregando, erro, criarVeiculo, atualizarVeiculo, excluirVeiculo: removerVeiculo } = useVeiculos();
  const { ordens } = useOrdensServico();
  const [pesquisa, setPesquisa] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState<Veiculo | null>(null);
  const [veiculoVisualizando, setVeiculoVisualizando] = useState<Veiculo | null>(null);
  const [veiculoHistorico, setVeiculoHistorico] = useState<Veiculo | null>(null);
  const [mensagem, setMensagem] = useState("");

  function buscarProprietario(clienteId: number) {
    return clientes.find((cliente) => cliente.id === clienteId)?.nome ?? "Cliente não encontrado";
  }

  const termo = pesquisa.trim().toLowerCase();
  const veiculosFiltrados = veiculos.filter((veiculo) =>
    veiculo.placa.toLowerCase().includes(termo) ||
    veiculo.marca.toLowerCase().includes(termo) ||
    veiculo.modelo.toLowerCase().includes(termo)
  );

  function abrirCadastro() { setVeiculoEditando(null); setMensagem(""); setModalAberto(true); }
  function abrirEdicao(veiculo: Veiculo) { setVeiculoEditando(veiculo); setMensagem(""); setModalAberto(true); }
  function fecharModal() { setModalAberto(false); setVeiculoEditando(null); }

  async function salvarVeiculo(dados: DadosVeiculo) {
    try {
      if (veiculoEditando) {
        await atualizarVeiculo(veiculoEditando.id, dados);
        setMensagem("Veículo atualizado com sucesso!");
      } else {
        await criarVeiculo(dados);
        setMensagem("Veículo cadastrado com sucesso!");
      }
      fecharModal();
    } catch (e) {
      window.alert(mensagemDeErro(e));
    }
  }

  async function excluirVeiculo(veiculo: Veiculo) {
    if (ordens.some((ordem) => ordem.veiculoId === veiculo.id)) {
      window.alert("Este veículo possui ordens de serviço e não pode ser excluído sem comprometer o histórico.");
      return;
    }
    if (!window.confirm(`Deseja realmente excluir o veículo de placa ${veiculo.placa}?`)) return;
    try {
      await removerVeiculo(veiculo.id);
      setMensagem("Veículo excluído com sucesso!");
    } catch (e) {
      window.alert(mensagemDeErro(e));
    }
  }

  return (
    <div className="sistema-layout"><Sidebar />
      <main className="veiculos-content">
        <header className="page-header veiculos-header"><h1>Veículos</h1><p>Gerencie os veículos cadastrados na oficina.</p></header>
        {mensagem && <div className="notice-success" role="status">{mensagem}</div>}
        {erro && <div className="notice-error" role="alert">{erro}</div>}
        <section className="page-panel veiculos-card">
          <div className="page-toolbar veiculos-toolbar">
            <input type="search" aria-label="Pesquisar veículos" placeholder="Pesquisar por placa, marca ou modelo..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
            <button type="button" className="btn-primary btn-novo-veiculo" onClick={abrirCadastro}><FiPlus aria-hidden="true" /> Novo Veículo</button>
          </div>
          <div className="table-scroll veiculos-table-wrapper"><table className="data-table veiculos-table">
            <thead><tr><th>Placa</th><th>Marca</th><th>Modelo</th><th>Ano</th><th>Proprietário</th><th>Ações</th></tr></thead>
            <tbody>
              {veiculosFiltrados.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.placa}</td><td>{veiculo.marca}</td><td>{veiculo.modelo}</td><td>{veiculo.ano}</td><td>{buscarProprietario(veiculo.clienteId)}</td>
                  <td><div className="action-group veiculos-acoes">
                    <button type="button" className="icon-button view acao-visualizar" title="Visualizar veículo" aria-label={`Visualizar ${veiculo.placa}`} onClick={() => setVeiculoVisualizando(veiculo)}><FiEye /></button>
                    <button type="button" className="icon-button edit acao-editar" title="Editar veículo" aria-label={`Editar ${veiculo.placa}`} onClick={() => abrirEdicao(veiculo)}><FiEdit2 /></button>
                    <button type="button" className="icon-button delete acao-excluir" title="Excluir veículo" aria-label={`Excluir ${veiculo.placa}`} onClick={() => excluirVeiculo(veiculo)}><FiTrash2 /></button>
                    <button type="button" className="icon-button history acao-historico" title="Histórico de serviços" aria-label={`Histórico de ${veiculo.placa}`} onClick={() => setVeiculoHistorico(veiculo)}><FiClock /></button>
                  </div></td>
                </tr>
              ))}
              {veiculosFiltrados.length === 0 && <tr><td colSpan={6} className="empty-row">{carregando ? "Carregando veículos..." : "Nenhum veículo encontrado."}</td></tr>}
            </tbody>
          </table></div>
        </section>
      </main>
      {modalAberto && <ModalVeiculo key={veiculoEditando?.id ?? "novo"} veiculo={veiculoEditando} onClose={fecharModal} onSalvar={salvarVeiculo} />}
      {veiculoVisualizando && (
        <div className="modal-overlay veiculo-modal-overlay"><div className="modal-box veiculo-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-veiculo">
          <div className="modal-heading"><h2 id="titulo-detalhes-veiculo">Dados do Veículo</h2><button className="modal-close" type="button" onClick={() => setVeiculoVisualizando(null)} aria-label="Fechar detalhes">×</button></div>
          <div className="detail-grid veiculo-detalhes">
            <div className="detail-field"><strong>Placa</strong><span>{veiculoVisualizando.placa}</span></div>
            <div className="detail-field"><strong>Ano</strong><span>{veiculoVisualizando.ano}</span></div>
            <div className="detail-field"><strong>Marca</strong><span>{veiculoVisualizando.marca}</span></div>
            <div className="detail-field"><strong>Modelo</strong><span>{veiculoVisualizando.modelo}</span></div>
            <div className="detail-field full"><strong>Proprietário</strong><span>{buscarProprietario(veiculoVisualizando.clienteId)}</span></div>
          </div>
          <div className="modal-footer veiculo-modal-actions"><button className="btn-secondary veiculo-btn-cancelar" type="button" onClick={() => setVeiculoVisualizando(null)}>Fechar</button></div>
        </div></div>
      )}
      {veiculoHistorico && <HistoricoVeiculo veiculo={veiculoHistorico} onClose={() => setVeiculoHistorico(null)} />}
    </div>
  );
}
