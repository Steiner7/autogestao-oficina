export type StatusOS = "Aberta" | "Em andamento" | "Concluída" | "Cancelada";

export type OrdemServico = {
  id: number;
  veiculoId: number;
  usuarioId: number;
  dataAbertura: string;
  dataFechamento: string | null;
  descricao: string;
  status: StatusOS;
  valor: number | null;
};
