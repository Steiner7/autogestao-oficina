import { useState, type FormEvent } from "react";
import { useVeiculos } from "../contexts/VeiculosContext";
import { useClientes } from "../contexts/ClientesContext";
import type { OrdemServico, StatusOS } from "../types/OrdemServico";
import "./ModalOrdemServico.css";

export type DadosFormularioOS = Pick<OrdemServico, "veiculoId" | "descricao" | "valor" | "status">;

type ModalOrdemServicoProps = {
  onClose: () => void;
  onSalvar: (dados: DadosFormularioOS) => void;
  ordem?: OrdemServico | null;
};

export default function ModalOrdemServico({ onClose, onSalvar, ordem }: ModalOrdemServicoProps) {
  const { veiculos } = useVeiculos();
  const { clientes } = useClientes();
  const [veiculoId, setVeiculoId] = useState(ordem ? String(ordem.veiculoId) : "");
  const [descricao, setDescricao] = useState(ordem?.descricao ?? "");
  const [valor, setValor] = useState(ordem?.valor != null ? String(ordem.valor) : "");
  const [status, setStatus] = useState<StatusOS>(ordem?.status ?? "Aberta");
  const [erro, setErro] = useState("");
  const editando = Boolean(ordem);

  const veiculoSelecionado = veiculos.find((veiculo) => veiculo.id === Number(veiculoId));
  const proprietario = clientes.find((cliente) => cliente.id === veiculoSelecionado?.clienteId);

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!veiculoSelecionado || !proprietario) { setErro("Selecione um veículo com proprietário válido."); return; }
    if (!descricao.trim()) { setErro("Informe a descrição do serviço."); return; }
    const valorNumero = valor.trim() === "" ? null : Number(valor);
    if (valorNumero !== null && (!Number.isFinite(valorNumero) || valorNumero < 0 || Math.round(valorNumero * 100) / 100 !== valorNumero)) {
      setErro("Informe um valor válido, com no máximo duas casas decimais."); return;
    }
    setErro("");
    onSalvar({ veiculoId: veiculoSelecionado.id, descricao: descricao.trim(), valor: valorNumero, status: editando ? status : "Aberta" });
  }

  return (
    <div className="modal-overlay os-modal-overlay"><div className="modal-box os-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-os">
      <div className="modal-heading os-modal-header"><h2 id="titulo-modal-os">{editando ? `Editar OS #${String(ordem?.id).padStart(3, "0")}` : "Nova Ordem de Serviço"}</h2><button type="button" className="modal-close os-modal-fechar" onClick={onClose} aria-label="Fechar formulário">×</button></div>
      <form onSubmit={salvar}>
        <div className="form-grid">
          <div className="form-field full os-form-group"><label htmlFor="os-veiculo">Veículo *</label><select id="os-veiculo" value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} required><option value="">Selecione um veículo</option>{veiculos.map((veiculo) => <option key={veiculo.id} value={veiculo.id}>{veiculo.marca} {veiculo.modelo} - {veiculo.placa}</option>)}</select></div>
          <div className="form-field full os-form-group"><label htmlFor="os-proprietario">Proprietário</label><input id="os-proprietario" type="text" value={proprietario?.nome ?? ""} placeholder="Selecione um veículo" readOnly /></div>
          <div className="form-field full os-form-group"><label htmlFor="os-descricao">Descrição do Serviço *</label><textarea id="os-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o serviço realizado..." rows={4} required /></div>
          <div className="form-field full os-form-group"><label htmlFor="os-valor">Valor do Serviço (R$)</label><input id="os-valor" type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" /></div>
          {editando && <div className="form-field full os-form-group"><label htmlFor="os-status">Status *</label><select id="os-status" value={status} onChange={(e) => setStatus(e.target.value as StatusOS)}><option value="Aberta">Aberta</option><option value="Em andamento">Em andamento</option><option value="Concluída">Concluída</option><option value="Cancelada">Cancelada</option></select></div>}
        </div>
        {!editando && <div className="info-box os-info"><p><strong>Status inicial:</strong> Aberta</p><p>A data de abertura será registrada automaticamente.</p></div>}
        {veiculos.length === 0 && <p className="info-box">Cadastre um veículo antes de criar uma ordem de serviço.</p>}
        {erro && <p className="form-error os-modal-erro" role="alert">{erro}</p>}
        <div className="modal-footer os-modal-actions"><button type="button" className="btn-secondary os-btn-cancelar" onClick={onClose}>Cancelar</button><button type="submit" className="btn-primary os-btn-salvar">{editando ? "Salvar Alterações" : "Salvar OS"}</button></div>
      </form>
    </div></div>
  );
}
