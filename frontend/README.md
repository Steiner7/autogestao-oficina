# AutoGestão — Front-end

Front-end do **AutoGestão**, sistema de gerenciamento de oficina mecânica, desenvolvido com **React + TypeScript + Vite**.

Os dados vêm da API em `../backend` (Node + Express + PostgreSQL). Os Contexts buscam e gravam pela API, e o acesso às páginas exige login (JWT).

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Executar localmente

Primeiro suba o back-end (veja `../backend/README.md`) e crie um usuário. Depois:

```bash
cd frontend
npm install
npm run dev
```

Acesse o endereço mostrado pelo Vite (normalmente http://localhost:5173). Em desenvolvimento, o Vite encaminha `/api` para `http://localhost:3333`. Para apontar para outra API (ex.: em produção), defina `VITE_API_URL` (ex.: `VITE_API_URL=https://minha-api.com/api`).

### Verificar compilação

```bash
npm run build
```

## Páginas e funcionalidades

| Rota | Funcionalidades |
| --- | --- |
| `/` | Login com usuário e senha; o token JWT fica salvo no navegador |
| `/dashboard` | Página inicial após o login: totais de clientes, veículos, OS em aberto e faturamento do mês, gráfico de faturamento dos últimos 6 meses, OS por status e lista das OS em aberto |
| `/clientes` | Listar, pesquisar por nome/CPF, cadastrar, visualizar, editar e excluir (caso não possua veículos) |
| `/veiculos` | Listar, pesquisar, cadastrar (tipo, marca, modelo e ano pela tabela FIPE), visualizar, editar, excluir sem OS vinculada e ver histórico |
| `/ordens-servico` | Listar, pesquisar, filtrar status, criar, visualizar, editar e concluir ordens |

As páginas internas redirecionam para o login quando não há sessão. Se o token expirar, a sessão é encerrada na próxima requisição.

## Estrutura

```text
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── HistoricoVeiculo.tsx
│   │   ├── HistoricoVeiculo.css
│   │   ├── ModalCliente.tsx
│   │   ├── ModalCliente.css
│   │   ├── ModalVeiculo.tsx
│   │   ├── ModalVeiculo.css
│   │   ├── ModalOrdemServico.tsx
│   │   ├── ModalOrdemServico.css
│   │   ├── RotaProtegida.tsx
│   │   ├── Sidebar.tsx
│   │   └── Sidebar.css
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ClientesContext.tsx
│   │   ├── VeiculosContext.tsx
│   │   └── OrdensServicoContext.tsx
│   ├── pages/
│   │   ├── login/Login.tsx, Login.css
│   │   ├── dashboard/Dashboard.tsx, Dashboard.css
│   │   ├── clientes/Clientes.tsx, Clientes.css
│   │   ├── veiculos/Veiculos.tsx, Veiculos.css
│   │   └── ordensServico/OrdensServico.tsx, OrdensServico.css
│   ├── services/
│   │   ├── api.ts
│   │   └── fipe.ts
│   ├── types/
│   │   ├── Cliente.ts
│   │   ├── Veiculo.ts
│   │   ├── OrdemServico.ts
│   │   └── Usuario.ts
│   ├── utils/
│   │   └── mascaras.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Correspondência com o banco PostgreSQL

- `Cliente`: `id` → `id_cliente`.
- `Veiculo`: `id` → `id_veiculo`; `clienteId` → `id_cliente`.
- `OrdemServico`: `id` → `id_os`; `veiculoId` → `id_veiculo`; `usuarioId` → `id_usuario`; `dataAbertura` → `data_abertura`; `dataFechamento` → `data_fechamento`.
- O back-end converte os nomes para camelCase. O `usuarioId` de uma nova OS vem do usuário autenticado.

Não envie a pasta `node_modules`, a pasta `dist`, credenciais nem arquivos `.env` com segredos. O `.gitignore` já ignora esses itens.
