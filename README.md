# AutoGestão

Sistema de gerenciamento para oficina mecânica, desenvolvido como Projeto Integrador.

## Objetivo

Organizar o dia a dia da oficina em um só lugar:

- cadastro de **clientes**;
- cadastro de **veículos** vinculados aos clientes;
- controle de **ordens de serviço**, do status "Aberta" até "Concluída";
- acesso ao sistema por **login**.

## Tecnologias

- **Banco de dados:** PostgreSQL
- **Back-end:** Node.js + Express + TypeScript
- **Front-end:** React + TypeScript + Vite

## Banco de dados

O modelo do banco está em [`backend/database/db_mecanica.sql`](backend/database/db_mecanica.sql), com as tabelas:

| Tabela | Descrição |
| --- | --- |
| `cliente` | Clientes da oficina (CPF único) |
| `veiculo` | Veículos, cada um ligado a um cliente (placa única) |
| `usuario` | Usuários que acessam o sistema |
| `ordem_servico` | Serviços realizados em um veículo, registrados por um usuário |

## Status

Projeto em desenvolvimento.
