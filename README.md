# LogiSmart — Plataforma de Inteligência Logística

Plataforma SaaS multi-tenant para gestão logística e análise de fretes.

## Tecnologias

**Backend:** NestJS · TypeScript · TypeORM · MySQL · Redis · BullMQ · Socket.io  
**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · Framer Motion  
**Infra:** Docker · Docker Compose  
**Auth:** JWT · Refresh Token · OAuth Google · OAuth GitHub · MFA/TOTP  

## Pré-requisitos

- Docker e Docker Compose
- Node.js 18+
- npm

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/desafio-logistica.git
cd desafio-logistica
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais.

### 3. Suba os serviços de infra

```bash
docker compose up -d
```

Isso sobe MySQL, Redis e Adminer.

### 4. Instale as dependências e suba o backend

```bash
cd api
npm install
npm run start:dev
```

### 5. Instale as dependências e suba o frontend

```bash
cd web
npm install
npm run dev
```

## URLs locais

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |
| Adminer (banco) | http://localhost:8080 |

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| DB_HOST | Host do MySQL |
| DB_PORT | Porta do MySQL (padrão: 3306) |
| DB_USERNAME | Usuário do banco |
| DB_PASSWORD | Senha do banco |
| DB_DATABASE | Nome do banco |
| REDIS_HOST | Host do Redis |
| REDIS_PORT | Porta do Redis (padrão: 6379) |
| JWT_SECRET | Chave secreta do JWT |
| JWT_EXPIRES_IN | Expiração do access token (padrão: 15m) |
| JWT_REFRESH_SECRET | Chave secreta do refresh token |
| JWT_REFRESH_EXPIRES_IN | Expiração do refresh token (padrão: 7d) |

## Arquitetura

### Multi-tenancy

Estratégia de **row-level isolation** — todas as tabelas possuem coluna `tenant_id`. Cada query filtra automaticamente pelo tenant do usuário autenticado, extraído do JWT.

Decisão: optei por row-level em vez de schema-per-tenant pela simplicidade de implementação no prazo disponível e pela facilidade de escalar horizontalmente sem múltiplas conexões de banco.

### Processamento Assíncrono

Simulações de frete são processadas via **BullMQ** (filas no Redis). O fluxo é:

1. Cliente faz POST /freight/simulate
2. Backend salva com status PENDING e enqueue o job
3. Worker processa: busca CEPs na ViaCEP, calcula frete
4. Ao finalizar, emite evento via **Socket.io** para o frontend

### Integrações Externas

- **ViaCEP** — busca endereço por CEP de origem e destino
- **AwesomeAPI** — cotação USD-BRL para conversão de valor de carga

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/register | Cadastro de usuário |
| POST | /auth/login | Login |
| POST | /auth/refresh | Renovar token |
| POST | /auth/logout | Logout |
| GET | /clients | Listar clientes |
| POST | /clients | Criar cliente |
| GET | /carriers | Listar transportadoras |
| POST | /carriers | Criar transportadora |
| POST | /freight/simulate | Iniciar simulação de frete |
| GET | /freight/simulations | Histórico de simulações |
| GET | /dashboard/summary | Resumo do dashboard |
| GET | /dashboard/insights | Insights automáticos |
| POST | /upload/clients | Importar clientes via CSV/XLSX |
| POST | /upload/carriers | Importar transportadoras via CSV |

Documentação completa disponível em `/api/docs` (Swagger).

## Como rodar os testes

```bash
cd api
npm run test
```

## Uso de IA no desenvolvimento

Este projeto foi desenvolvido com auxílio de IA (Claude e Cursor) para geração de boilerplate, módulos NestJS e componentes React. Todas as decisões arquiteturais — estratégia de multi-tenancy, escolha das integrações externas, estrutura de módulos, lógica de insights — foram tomadas e revisadas pelo desenvolvedor.

Os artefatos de desenvolvimento assistido estão na pasta `.cursor` e nos arquivos `CLAUDE.md` e `AGENTS.md`.
