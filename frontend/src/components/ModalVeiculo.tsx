import { useState, type FormEvent } from "react";
import { useClientes } from "../contexts/ClientesContext";
import type { Veiculo } from "../types/Veiculo";
import "./ModalVeiculo.css";

export type DadosVeiculo = Omit<Veiculo, "id">;

type ModalVeiculoProps = {
  onClose: () => void;
  onSalvar: (dados: DadosVeiculo) => void;
  veiculo?: Veiculo | null;
};

export default function ModalVeiculo({ onClose, onSalvar, veiculo }: ModalVeiculoProps) {
  const { clientes } = useClientes();
  const [clienteId, setClienteId] = useState(veiculo ? String(veiculo.clienteId) : "");
  const [placa, setPlaca] = useState(veiculo?.placa ?? "");
  const [marca, setMarca] = useState(veiculo?.marca ?? "");
  const [modelo, setModelo] = useState(veiculo?.modelo ?? "");
  const [ano, setAno] = useState(veiculo ? String(veiculo.ano) : "");
  const [erro, setErro] = useState("");

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const placaNormalizada = placa.trim().toUpperCase().replace(/[-\s]/g, "");
    const anoNumero = Number(ano);
    if (!clientes.some((c) => c.id === Number(clienteId))) {
      setErro("Selecione um proprietário válido."); return;
    }
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaNormalizada)) {
      setErro("Informe uma placa válida: ABC1234 ou ABC1D23."); return;
    }
    if (!marca.trim() || !modelo.trim()) {
      setErro("Informe a marca e o modelo do veículo."); return;
    }
    if (!Number.isInteger(anoNumero) || anoNumero < 1900 || anoNumero > new Date().getFullYear() + 1) {
      setErro("Informe um ano válido."); return;
    }
    setErro("");
    onSalvar({ clienteId: Number(clienteId), placa: placaNormalizada, marca: marca.trim(), modelo: modelo.trim(), ano: anoNumero });
  }

  return (
    <div className="modal-overlay veiculo-modal-overlay"><div className="modal-box veiculo-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-veiculo">
      <div className="modal-heading"><h2 id="titulo-modal-veiculo">{veiculo ? "Editar Veículo" : "Novo Veículo"}</h2><button className="modal-close" type="button" onClick={onClose} aria-label="Fechar">×</button></div>
      <form onSubmit={salvar}>
        <div className="form-grid">
          <div className="form-field full"><label htmlFor="veiculo-cliente">Proprietário *</label><select id="veiculo-cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)} required><option value="">Selecione um cliente</option>{clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome} — {cliente.cpf}</option>)}</select></div>
          <div className="form-field"><label htmlFor="veiculo-placa">Placa *</label><input id="veiculo-placa" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} maxLength={8} placeholder="ABC1D23" required /></div>
          <div className="form-field"><label htmlFor="veiculo-ano">Ano *</label><input id="veiculo-ano" type="number" min="1900" max={new Date().getFullYear() + 1} value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2022" required /></div>
          <div className="form-field"><label htmlFor="veiculo-marca">Marca *</label><input id="veiculo-marca" value={marca} onChange={(e) => setMarca(e.target.value)} maxLength={50} placeholder="Chevrolet" required /></div>
          <div className="form-field"><label htmlFor="veiculo-modelo">Modelo *</label><input id="veiculo-modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} maxLength={50} placeholder="Onix" required /></div>
        </div>
        {clientes.length === 0 && <p className="info-box">Cadastre um cliente antes de cadastrar veículos.</p>}
        {erro && <p className="form-error" role="alert">{erro}</p>}
        <div className="modal-footer"><button className="btn-secondary" type="button" onClick={onClose}>Cancelar</button><button type="submit" className="btn-primary">{veiculo ? "Salvar Alterações" : "Salvar Veículo"}</button></div>
      </form>
    </div></div>
  );
}
