// Uso: npm run criar-usuario -- "<nome>" <login> <senha>
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const [nome, login, senha] = process.argv.slice(2);

if (!nome || !login || !senha) {
  console.error('Uso: npm run criar-usuario -- "<nome>" <login> <senha>');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(senha, 10);
  const { rows } = await pool.query(
    "INSERT INTO usuario (nome, login, senha) VALUES ($1, $2, $3) RETURNING id_usuario",
    [nome, login, hash]
  );
  console.log(`Usuário "${login}" criado com id ${rows[0].id_usuario}.`);
} catch (erro) {
  const codigo = (erro as { code?: string }).code;
  console.error(codigo === "23505" ? `Já existe um usuário com o login "${login}".` : erro);
  process.exitCode = 1;
} finally {
  await pool.end();
}
