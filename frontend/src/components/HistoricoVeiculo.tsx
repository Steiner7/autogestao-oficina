import { useClientes } from "../contexts/ClientesContext";
import { useOrdensServico } from "../contexts/OrdensServicoContext";
import type { Veiculo } from "../types/Veiculo";
import "./HistoricoVeiculo.css";

type HistoricoVeiculoProps = { veiculo: Veiculo; onClose: () => void };

export default function HistoricoVeiculo({ veiculo, onClose }: HistoricoVeiculoProps) {
  const { clientes } = useClientes();
  const { ordens } = useOrdensServico();
  const proprietario = clientes.find((cliente) => cliente.id === veiculo.clienteId);
  const historico = ordens
    .filter((ordem) => ordem.veiculoId === veiculo.id)
    .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura) || b.id - a.id);

  function formatarData(data: string | null) {
    if (!data) return "Ainda não fechada";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function formatarValor(valor: number | null) {
    return valor === null ? "Não informado" : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const classes: Record<string, string> = {
    "Aberta": "historico-aberta", "Em andamento": "historico-andamento", "Concluída": "historico-concluida", "Cancelada": "historico-cancelada"
  };

  return (
    <div className="historico-overlay"><div className="historico-modal" role="dialog" aria-modal="true" aria-labelledby="historico-titulo">
      <div className="historico-header"><div><h2 id="historico-titulo">Histórico do Veículo</h2><p>Consulte todos os serviços registrados na oficina.</p></div><button className="historico-fechar" type="button" onClick={onClose} aria-label="Fechar histórico">×</button></div>
      <div className="historico-veiculo-info"><h3>{veiculo.marca} {veiculo.modelo}</h3><p><strong>Placa:</strong> {veiculo.placa}</p><p><strong>Ano:</strong> {veiculo.ano}</p><p><strong>Proprietário:</strong> {proprietario?.nome ?? "Cliente não encontrado"}</p></div>
      <div className="historico-resumo">{historico.length} {historico.length === 1 ? "ordem de serviço" : "ordens de serviço"}</div>
      <div className="historico-lista">
        {historico.length === 0 ? <div className="historico-vazio"><h3>Nenhum serviço registrado</h3><p>Este veículo ainda não possui ordens de serviço cadastradas.</p></div> : historico.map((ordem) => (
          <article className="historico-item" key={ordem.id}>
            <div className="historico-item-topo"><h3>OS #{String(ordem.id).padStart(3, "0")}</h3><span className={`historico-status ${classes[ordem.status] ?? "historico-aberta"}`}>{ordem.status}</span></div>
            <div className="historico-dados"><p><strong>Abertura:</strong> {formatarData(ordem.dataAbertura)}</p><p><strong>Fechamento:</strong> {formatarData(ordem.dataFechamento)}</p><p><strong>Valor:</strong> {formatarValor(ordem.valor)}</p></div>
            <div className="historico-descricao"><strong>Descrição do serviço</strong><p>{ordem.descricao || "Nenhuma descrição informada."}</p></div>
          </article>
        ))}
      </div>
      <div className="historico-rodape"><button type="button" onClick={onClose}>Fechar</button></div>
    </div></div>
  );
}
