import pg from "pg";
import { config } from "./config.js";

// DATE (1082) como texto "AAAA-MM-DD", evitando conversão de fuso horário.
pg.types.setTypeParser(1082, (valor) => valor);
// NUMERIC/DECIMAL (1700) como number, no formato usado pelo front-end.
pg.types.setTypeParser(1700, (valor) => Number(valor));

export const pool = new pg.Pool({ connectionString: config.databaseUrl });
