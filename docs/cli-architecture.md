# WorldContrast — CLI-First Architecture
# File: docs/ARCHITECTURE_CLI.md
# Version: 1.0 · April 2026

## Princípio Fundacional

> O dashboard Enterprise é apenas um reflexo visual do CLI.
> Toda operação disponível na interface deve ser executável
> via linha de comando com resultado idêntico.

Se existe no dashboard mas não existe no CLI → o dashboard está errado.

---

## Estrutura do CLI (@worldcontrast/cli)

```
packages/
└── cli/                         # npm: @worldcontrast/cli
    ├── bin/
    │   └── wc.ts                # Entry point: `wc` command
    ├── commands/
    │   ├── status.ts            # wc status
    │   ├── data/
    │   │   ├── dump.ts          # wc data dump
    │   │   └── verify.ts        # wc data verify
    │   ├── promises/
    │   │   └── list.ts          # wc promises list
    │   ├── api/
    │   │   └── keys.ts          # wc api keys create|list|revoke
    │   ├── webhooks/
    │   │   ├── create.ts        # wc webhooks create
    │   │   └── logs.ts          # wc webhooks logs
    │   ├── audit/
    │   │   └── export.ts        # wc audit export
    │   └── agent/
    │       └── run.ts           # wc agent run
    ├── lib/
    │   ├── config.ts            # ~/.wc/config.json
    │   ├── client.ts            # HTTP client → worldcontrast REST API
    │   └── output.ts            # JSON | table | JSONL formatters
    └── package.json
```

---

## Mapeamento CLI → API → Dashboard

Cada comando CLI corresponde a um endpoint REST.
O dashboard chama o mesmo endpoint.

| CLI Command | REST Endpoint | Dashboard Screen |
|---|---|---|
| `wc status` | `GET /v1/system/status` | Dashboard > Overview |
| `wc data dump --country BR` | `GET /v1/data/dump?country=BR` | Dashboard > Export |
| `wc verify --hash <sha>` | `GET /v1/audit/verify/:hash` | Badge Autêntico |
| `wc promises list` | `GET /v1/promises` | Compare Page |
| `wc promises list --live` | `GET /v1/promises/live (SSE)` | Dashboard > Live Feed |
| `wc api keys create` | `POST /v1/api/keys` | Dashboard > API Keys |
| `wc api keys list` | `GET /v1/api/keys` | Dashboard > API Keys |
| `wc api keys revoke <id>` | `DELETE /v1/api/keys/:id` | Dashboard > API Keys |
| `wc webhooks create` | `POST /v1/webhooks` | Dashboard > Webhooks |
| `wc webhooks logs <id>` | `GET /v1/webhooks/:id/logs` | Dashboard > Webhooks |
| `wc audit export` | `GET /v1/audit/export` | Dashboard > Audit |
| `wc agent run` | (executa localmente) | — |

---

## Instalação e Configuração

```bash
# Install
npm install -g @worldcontrast/cli

# Auth
wc login --api-key $WC_API_KEY
# Salva em ~/.wc/config.json

# Status
wc status
# OUTPUT:
# System:  ONLINE
# Agent:   v1.1.0 · Last run: 2026-04-10T14:32:00Z
# Records: 21 promises · 2 candidates · 1 election
# API:     https://api.worldcontrast.org · 99.8% uptime (30d)
```

---

## Exemplos de Uso — Enterprise

```bash
# 1. Exportar base completa BR 2026 em JSONL
wc data dump \
  --country BR \
  --year 2026 \
  --format jsonl \
  --output ./brazil-2026-promises.jsonl

# 2. Verificar integridade de um registro específico
wc verify --hash 3a8c9e0185333598389680806121...
# OUTPUT:
# ✓ Record verified
# SHA-256:    3a8c9e0185333598389680806121...
# Collected:  2026-04-02T18:30:00Z
# Source URL: https://pt.org.br/propostas
# Archive:    https://web.archive.org/web/20260402/...
# POCVA-01:   v1.1.0 · hash: a4e7f9...1b39ed2
# Status:     AUTHENTIC

# 3. Criar webhook em tempo real
wc webhooks create \
  --url https://api.reuters.com/wc-hook/new \
  --events promise.created,election.updated \
  --secret $WEBHOOK_SECRET
# OUTPUT:
# Webhook created: wh_01HX...
# URL:    https://api.reuters.com/wc-hook/new
# Events: promise.created, election.updated
# Status: ACTIVE

# 4. Stream de novas promessas em tempo real (SSE)
wc promises list --live --country BR
# OUTPUT (streams):
# [2026-04-10T14:35:22Z] NEW PROMISE
# Candidate: Luiz Inácio Lula da Silva
# Category:  economy
# SHA-256:   8f7d1a3c...
# Text:      "Isenção do IR para quem ganha até R$5.000..."

# 5. Exportar audit trail completo
wc audit export \
  --from 2026-01-01 \
  --format jsonl \
  --include-rejections \
  --output ./audit-2026.jsonl

# 6. Rodar agente em dry-run (sem escrever no banco)
wc agent run \
  --country BR \
  --dry-run \
  --verbose
```

---

## Webhook Payload Schema

```json
{
  "event": "promise.created",
  "timestamp": "2026-04-10T14:35:22.847Z",
  "delivery_id": "del_01HX...",
  "data": {
    "id": "prom_01HX...",
    "election_id": "brazil-2026",
    "candidate_id": "lula-2026",
    "category": "economy",
    "text_pt": "Isenção do IR para quem ganha até R$5.000 mensais.",
    "text_en": "Income tax exemption for those earning up to R$5,000/month.",
    "source_url": "https://pt.org.br/propostas",
    "archive_url": "https://web.archive.org/web/20260402/...",
    "collected_at": "2026-04-02T18:30:00Z",
    "content_hash": "3a8c9e0185333598389680806121...",
    "pocva_protocol_hash": "a4e7f9...1b39ed2",
    "confidence": 0.97,
    "verbatim": true
  },
  "signature": "sha256=abc123..." // HMAC-SHA256 do payload com webhook secret
}
```

---

## Dashboard Enterprise — Rotas Next.js

```
frontend/src/app/[locale]/
├── enterprise/
│   ├── page.tsx              # Landing page (público)
│   └── dashboard/
│       ├── layout.tsx        # Verificação de auth Enterprise
│       ├── page.tsx          # Overview: métricas, status, live feed
│       ├── api-keys/
│       │   └── page.tsx      # Gerenciar API keys
│       ├── webhooks/
│       │   ├── page.tsx      # Listar webhooks
│       │   └── [id]/
│       │       └── page.tsx  # Logs de entrega de um webhook
│       ├── promises/
│       │   └── page.tsx      # Stream em tempo real
│       └── audit/
│           └── page.tsx      # Export audit trail
```

---

## Auth Enterprise — Supabase RLS

```sql
-- Tabela de API keys Enterprise
CREATE TABLE enterprise_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name    TEXT NOT NULL,
  org_email   TEXT NOT NULL,
  tier        TEXT CHECK (tier IN ('public','institutional','enterprise')),
  key_hash    TEXT NOT NULL UNIQUE, -- SHA-256 da key, não a key em si
  rate_limit  INTEGER DEFAULT 100,
  webhooks    INTEGER DEFAULT 0,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ
);

-- RLS: cada org só vê suas próprias keys
ALTER TABLE enterprise_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org sees own keys"
  ON enterprise_keys FOR ALL
  USING (auth.jwt() ->> 'org_email' = org_email);
```

---

## Commit Message para esta entrega

```
feat(enterprise): CLI-first architecture + Enterprise landing + homepage v15

- page.tsx v15: dark mode cryptographic notary design, data-first hero,
  counters live, POCVA-01 band, Onyx/Platinum/Gold/Emerald system
- enterprise/page.tsx: landing page B2B, tier cards, API endpoints table,
  CLI reference, application form, CLI-first architecture diagram
- docs/ARCHITECTURE_CLI.md: CLI → API → Dashboard mapping,
  webhook payload schema, Supabase RLS, all CLI commands documented
```
