# AutoGestão — Back-end

API REST do **AutoGestão**, em **Node.js + Express + TypeScript**, com PostgreSQL e autenticação via **JWT**.

## Requisitos

- Node.js 20+
- PostgreSQL 14+ (ou Docker, usando o `docker-compose.yml` incluído)

## Configuração

```bash
cd backend
npm install
cp .env.example .env   # depois edite o JWT_SECRET
```

### Banco de dados

**Opção 1 — Docker** (cria o banco `db_mecanica` e executa `database/db_mecanica.sql` automaticamente na primeira vez):

```bash
docker compose up -d
```

**Opção 2 — PostgreSQL instalado:** crie o banco `db_mecanica`, execute `database/db_mecanica.sql` e ajuste a `DATABASE_URL` no `.env`.

### Criar o primeiro usuário

A senha é gravada com hash bcrypt:

```bash
npm run criar-usuario -- "Administrador" admin admin123
```

## Executar

```bash
npm run dev      # desenvolvimento, com recarga automática
npm run build    # compila para dist/
npm start        # executa a versão compilada
```

A API fica em `http://localhost:3333/api`.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da API (padrão `3333`) |
| `DATABASE_URL` | Conexão do PostgreSQL |
| `JWT_SECRET` | Segredo para assinar os tokens — use um valor longo e aleatório |
| `JWT_EXPIRES_IN` | Validade do token (padrão `8h`) |
| `CORS_ORIGIN` | Origem do front-end liberada no CORS (padrão `http://localhost:5173`) |

## Rotas

Todas as rotas, exceto `/api/health` e `/api/auth/login`, exigem o cabeçalho `Authorization: Bearer <token>`.
Erros retornam `{ "mensagem": "..." }`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/login` | `{ login, senha }` → `{ token, usuario }` |
| `GET` | `/api/auth/me` | Usuário do token |
| `GET` | `/api/clientes` · `/api/clientes/:id` | Listar / buscar |
| `POST` | `/api/clientes` | Cadastrar (CPF único) |
| `PUT` | `/api/clientes/:id` | Atualizar |
| `DELETE` | `/api/clientes/:id` | Excluir (bloqueado se houver veículos — `409`) |
| `GET` | `/api/veiculos` · `/api/veiculos/:id` | Listar / buscar |
| `POST` | `/api/veiculos` | Cadastrar (placa única, cliente existente) |
| `PUT` | `/api/veiculos/:id` | Atualizar |
| `DELETE` | `/api/veiculos/:id` | Excluir (bloqueado se houver OS — `409`) |
| `GET` | `/api/ordens-servico` · `/api/ordens-servico/:id` | Listar / buscar |
| `POST` | `/api/ordens-servico` | `{ veiculoId, descricao, valor }` — nasce `Aberta`, com a data de hoje e o usuário do token |
| `PUT` | `/api/ordens-servico/:id` | `{ veiculoId, descricao, valor, status }` |
| `PATCH` | `/api/ordens-servico/:id/concluir` | Conclui e registra a data de fechamento |
| `DELETE` | `/api/ordens-servico/:id` | Excluir |
| `GET` | `/api/fipe/:tipo/marcas` | Marcas da tabela FIPE (`tipo`: `carros`, `motos` ou `caminhoes`, que inclui micro-ônibus) |
| `GET` | `/api/fipe/:tipo/marcas/:codigo/modelos` | Modelos de uma marca |

As rotas `/api/fipe` consultam a [API FIPE gratuita da Parallelum](https://deividfortuna.github.io/fipe/), que permite 500 requisições por dia. Por isso as respostas ficam em cache na memória do servidor por 24h.

Status válidos de OS: `Aberta`, `Em andamento`, `Concluída`, `Cancelada`. Ao mudar para `Concluída`, a data de fechamento é preenchida; ao sair dela, é limpa.

Os campos são retornados em camelCase (`clienteId`, `dataAbertura`...), no mesmo formato dos tipos do front-end.

## Estrutura

```text
backend/
├── database/db_mecanica.sql
├── src/
│   ├── middlewares/   autenticar.ts (JWT), errorHandler.ts
│   ├── routes/        auth, clientes, veiculos, ordensServico
│   ├── scripts/       criarUsuario.ts
│   ├── utils/         HttpError.ts, parseId.ts
│   ├── app.ts
│   ├── config.ts
│   ├── db.ts
│   └── server.ts
├── docker-compose.yml
└── .env.example
```
