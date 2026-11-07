import { useState, type FormEvent } from "react";
import type { Cliente } from "../types/Cliente";
import { formatarCPF, formatarTelefone, somenteDigitos } from "../utils/mascaras";
import "./ModalCliente.css";

export type DadosCliente = Omit<Cliente, "id">;

type ModalClienteProps = {
  onClose: () => void;
  onSalvar: (dados: DadosCliente) => void;
  cliente?: Cliente | null;
};

export default function ModalCliente({ onClose, onSalvar, cliente }: ModalClienteProps) {
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [cpf, setCpf] = useState(formatarCPF(cliente?.cpf ?? ""));
  const [telefone, setTelefone] = useState(formatarTelefone(cliente?.telefone ?? ""));
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [endereco, setEndereco] = useState(cliente?.endereco ?? "");
  const [erro, setErro] = useState("");

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nome.trim() || somenteDigitos(cpf).length !== 11) {
      setErro("Informe o nome e um CPF com 11 dígitos.");
      return;
    }
    const digitosTelefone = somenteDigitos(telefone).length;
    if (digitosTelefone > 0 && digitosTelefone !== 11) {
      setErro("Informe o telefone com DDD e 9 dígitos: (00) 00000-0000.");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido, com @ (ex.: nome@exemplo.com).");
      return;
    }
    setErro("");
    onSalvar({ nome: nome.trim(), cpf, telefone, email: email.trim(), endereco: endereco.trim() });
  }

  return (
    <div className="modal-overlay cliente-modal-overlay">
      <div className="modal-box cliente-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-cliente">
        <div className="modal-heading">
          <h2 id="titulo-modal-cliente">{cliente ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {/* noValidate: as validações (e mensagens em português) são feitas em salvar(). */}
        <form onSubmit={salvar} noValidate>
          <div className="form-grid">
            <div className="form-field full"><label htmlFor="cliente-nome">Nome completo *</label><input id="cliente-nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} placeholder="Nome do cliente" required /></div>
            <div className="form-field"><label htmlFor="cliente-cpf">CPF *</label><input id="cliente-cpf" inputMode="numeric" value={cpf} onChange={(e) => setCpf(formatarCPF(e.target.value))} placeholder="000.000.000-00" required /></div>
            <div className="form-field"><label htmlFor="cliente-telefone">Telefone</label><input id="cliente-telefone" type="tel" inputMode="numeric" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} placeholder="(00) 90000-0000" /></div>
            <div className="form-field full"><label htmlFor="cliente-email">E-mail</label><input id="cliente-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} placeholder="cliente@exemplo.com" /></div>
            <div className="form-field full"><label htmlFor="cliente-endereco">Endereço</label><input id="cliente-endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} maxLength={150} placeholder="Rua, número, bairro" /></div>
          </div>
          {erro && <p className="form-error" role="alert">{erro}</p>}
          <div className="modal-footer"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn-primary">{cliente ? "Salvar Alterações" : "Salvar Cliente"}</button></div>
        </form>
      </div>
    </div>
  );
}
