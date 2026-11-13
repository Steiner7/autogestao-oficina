# AutoGestão

Sistema de gerenciamento para oficina mecânica, desenvolvido como Projeto Integrador.

## Funcionalidades

- **Login** com usuário e senha (senha com hash bcrypt e sessão por token JWT).
- **Dashboard** com totais de clientes, veículos, OS em aberto, faturamento do mês e gráficos.
- **Clientes:** cadastro, pesquisa por nome ou CPF, edição e exclusão, com máscara de CPF e telefone.
- **Veículos:** cadastro com tipo, marca, modelo e ano vindos da **tabela FIPE**, e histórico de serviços de cada veículo.
- **Ordens de serviço:** abertura, edição, conclusão e filtro por status, com valor em reais.

## Tecnologias

| Parte | Tecnologias |
| --- | --- |
| Banco de dados | PostgreSQL |
| Back-end | Node.js, Express, TypeScript, pg, JWT, bcrypt, Zod |
| Front-end | React, TypeScript, Vite, React Router |
| Integração | API FIPE gratuita (Parallelum) |

## Como executar

Requisitos: Node.js 20+ e Docker (ou um PostgreSQL instalado).

**1. Banco e API**

```bash
cd backend
npm install
cp .env.example .env          # depois troque o JWT_SECRET
docker compose up -d          # cria o banco e as tabelas
npm run criar-usuario -- "Administrador" admin admin123
npm run dev                   # API em http://localhost:3333/api
```

**2. Front-end** (em outro terminal)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Entre com o usuário criado no passo 1.

Mais detalhes em [`backend/README.md`](backend/README.md) e [`frontend/README.md`](frontend/README.md).

## Estrutura

```text
autogestao-oficina/
├── backend/    API REST (Express + PostgreSQL)
│   └── database/db_mecanica.sql
└── frontend/   Interface web (React + Vite)
```

## Integrantes

- [Steiner7](https://github.com/Steiner7)
- [CauaSavi](https://github.com/CauaSavi)
- [ElianDalmolin](https://github.com/ElianDalmolin)
- [jhonataninacio6](https://github.com/jhonataninacio6)
