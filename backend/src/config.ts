import "dotenv/config";

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ${nome} não definida. Veja o arquivo .env.example.`);
  return valor;
}

export const config = {
  porta: Number(process.env.PORT ?? 3333),
  databaseUrl: obrigatoria("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173"
};
