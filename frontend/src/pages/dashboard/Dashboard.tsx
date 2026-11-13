import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiTruck, FiClipboard, FiDollarSign } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import { useClientes } from "../../contexts/ClientesContext";
import { useVeiculos } from "../../contexts/VeiculosContext";
import { useOrdensServico } from "../../contexts/OrdensServicoContext";
import type { StatusOS } from "../../types/OrdemServico";
import { formatarMoeda } from "../../utils/mascaras";
import "./Dashboard.css";

const STATUS: { status: StatusOS; classe: string }[] = [
  { status: "Aberta", classe: "os-aberta" },
  { status: "Em andamento", classe: "os-andamento" },
  { status: "Concluída", classe: "os-concluida" },
  { status: "Cancelada", classe: "os-cancelada" }
];

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function chaveMes(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function diasDesde(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const hoje = new Date();
  const inicio = new Date(ano, mes - 1, dia);
  return Math.max(0, Math.floor((new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime() - inicio.getTime()) / 86400000));
}

export default function Dashboard() {
  const { clientes, carregando: carregandoClientes } = useClientes();
  const { veiculos, carregando: carregandoVeiculos } = useVeiculos();
  const { ordens, carregando: carregandoOrdens, erro } = useOrdensServico();
  const [mesDestacado, setMesDestacado] = useState<string | null>(null);
  const carregando = carregandoClientes || carregandoVeiculos || carregandoOrdens;

  // Faturamento = soma das OS concluídas, pelo mês da data de fechamento.
  const hoje = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1);
    const chave = chaveMes(data);
    const concluidas = ordens.filter((o) => o.status === "Concluída" && o.dataFechamento?.startsWith(chave));
    return {
      chave,
      rotulo: MESES[data.getMonth()],
      rotuloCompleto: `${MESES[data.getMonth()]}/${data.getFullYear()}`,
      total: concluidas.reduce((soma, o) => soma + (o.valor ?? 0), 0),
      quantidade: concluidas.length
    };
  });
  const mesAtual = meses[meses.length - 1];
  const maiorFaturamento = Math.max(...meses.map((m) => m.total), 0);

  const porStatus = STATUS.map((s) => ({ ...s, quantidade: ordens.filter((o) => o.status === s.status).length }));
  const maiorStatus = Math.max(...porStatus.map((s) => s.quantidade), 0);

  const emAberto = ordens
    .filter((o) => o.status === "Aberta" || o.status === "Em andamento")
    .sort((a, b) => a.dataAbertura.localeCompare(b.dataAbertura) || a.id - b.id);

  function descricaoVeiculo(veiculoId: number) {
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    return veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : "Veículo não encontrado";
  }

  function nomeCliente(veiculoId: number) {
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    return clientes.find((c) => c.id === veiculo?.clienteId)?.nome ?? "—";
  }

  const indicadores = [
    { titulo: "Clientes", valor: String(clientes.length), detalhe: "cadastrados", icone: <FiUsers />, link: "/clientes" },
    { titulo: "Veículos", valor: String(veiculos.length), detalhe: "cadastrados", icone: <FiTruck />, link: "/veiculos" },
    { titulo: "OS em aberto", valor: String(emAberto.length), detalhe: "abertas ou em andamento", icone: <FiClipboard />, link: "/ordens-servico" },
    { titulo: "Faturamento do mês", valor: formatarMoeda(mesAtual.total), detalhe: `${mesAtual.quantidade} ${mesAtual.quantidade === 1 ? "OS concluída" : "OS concluídas"} em ${mesAtual.rotuloCompleto}`, icone: <FiDollarSign />, link: "/ordens-servico" }
  ];

  const destaque = meses.find((m) => m.chave === mesDestacado);

  return (
    <div className="sistema-layout"><Sidebar />
      <main className="dash-content">
        <header className="page-header"><h1>Dashboard</h1><p>Visão geral da oficina{carregando ? " — atualizando dados..." : "."}</p></header>
        {erro && <div className="notice-error" role="alert">{erro}</div>}

        <section className="dash-indicadores" aria-label="Indicadores">
          {indicadores.map((ind) => (
            <Link key={ind.titulo} to={ind.link} className="page-panel dash-indicador">
              <span className="dash-indicador-icone" aria-hidden="true">{ind.icone}</span>
              <div>
                <p className="dash-indicador-titulo">{ind.titulo}</p>
                <p className="dash-indicador-valor">{ind.valor}</p>
                <p className="dash-indicador-detalhe">{ind.detalhe}</p>
              </div>
            </Link>
          ))}
        </section>

        <div className="dash-graficos">
          <section className="page-panel dash-grafico" aria-labelledby="titulo-faturamento">
            <div className="dash-grafico-topo">
              <h2 id="titulo-faturamento">Faturamento — últimos 6 meses</h2>
              <p>OS concluídas, pelo mês de fechamento</p>
            </div>
            <div className="dash-colunas" onMouseLeave={() => setMesDestacado(null)}>
              {meses.map((m) => (
                <div
                  key={m.chave}
                  className={`dash-coluna${m.chave === mesDestacado ? " ativa" : ""}`}
                  tabIndex={0}
                  aria-label={`${m.rotuloCompleto}: ${formatarMoeda(m.total)}, ${m.quantidade} OS`}
                  onMouseEnter={() => setMesDestacado(m.chave)}
                  onFocus={() => setMesDestacado(m.chave)}
                  onBlur={() => setMesDestacado(null)}
                >
                  <div className="dash-coluna-area">
                    {m.chave === mesDestacado && (
                      <div className="dash-tooltip" role="status">
                        <strong>{m.rotuloCompleto}</strong>
                        <span>{formatarMoeda(m.total)}</span>
                        <span>{m.quantidade} {m.quantidade === 1 ? "OS concluída" : "OS concluídas"}</span>
                      </div>
                    )}
                    <div className="dash-barra" style={{ height: maiorFaturamento > 0 ? `${(m.total / maiorFaturamento) * 100}%` : "0%" }} />
                  </div>
                  <span className="dash-coluna-rotulo">{m.rotulo}</span>
                </div>
              ))}
            </div>
            <p className="dash-grafico-rodape">
              {destaque
                ? <>{destaque.rotuloCompleto}: <strong>{formatarMoeda(destaque.total)}</strong></>
                : <>Total no período: <strong>{formatarMoeda(meses.reduce((s, m) => s + m.total, 0))}</strong></>}
            </p>
          </section>

          <section className="page-panel dash-grafico" aria-labelledby="titulo-status">
            <div className="dash-grafico-topo">
              <h2 id="titulo-status">Ordens de serviço por status</h2>
              <p>{ordens.length} {ordens.length === 1 ? "ordem cadastrada" : "ordens cadastradas"}</p>
            </div>
            <ul className="dash-linhas">
              {porStatus.map((s) => (
                <li key={s.status} className="dash-linha" title={`${s.status}: ${s.quantidade}`}>
                  <span className={`os-status ${s.classe}`}>{s.status}</span>
                  <div className="dash-linha-trilho">
                    <div className="dash-linha-barra" style={{ width: maiorStatus > 0 ? `${(s.quantidade / maiorStatus) * 100}%` : "0%" }} />
                  </div>
                  <strong className="dash-linha-valor">{s.quantidade}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="page-panel" aria-labelledby="titulo-em-aberto">
          <div className="dash-grafico-topo dash-tabela-topo">
            <div>
              <h2 id="titulo-em-aberto">Ordens em aberto</h2>
              <p>As mais antigas primeiro</p>
            </div>
            <Link to="/ordens-servico" className="dash-ver-todas">Ver todas</Link>
          </div>
          <div className="table-scroll"><table className="data-table">
            <thead><tr><th>Nº OS</th><th>Cliente</th><th>Veículo</th><th>Status</th><th>Aberta há</th><th>Valor</th></tr></thead>
            <tbody>
              {emAberto.slice(0, 5).map((o) => {
                const dias = diasDesde(o.dataAbertura);
                return (
                  <tr key={o.id}>
                    <td>#{String(o.id).padStart(3, "0")}</td>
                    <td>{nomeCliente(o.veiculoId)}</td>
                    <td>{descricaoVeiculo(o.veiculoId)}</td>
                    <td><span className={`os-status ${STATUS.find((s) => s.status === o.status)?.classe}`}>{o.status}</span></td>
                    <td>{dias === 0 ? "Hoje" : `${dias} ${dias === 1 ? "dia" : "dias"}`}</td>
                    <td>{o.valor === null ? "Não informado" : formatarMoeda(o.valor)}</td>
                  </tr>
                );
              })}
              {emAberto.length === 0 && <tr><td colSpan={6} className="empty-row">{carregando ? "Carregando..." : "Nenhuma ordem de serviço em aberto."}</td></tr>}
            </tbody>
          </table></div>
        </section>
      </main>
    </div>
  );
}
