# World Contrast — Guia Completo de Integração GitHub
# Gerado em: 06 de Abril de 2026
# Repositório: github.com/worldcontrast/promises

## ══════════════════════════════════════════════════════════
## ESTRUTURA FINAL DO REPOSITÓRIO
## ══════════════════════════════════════════════════════════

worldcontrast/promises/
│
├── README.md                          ← ✅ já está no repo
├── CONTRIBUTING.md                    ← ✅ já está no repo
├── DATA_STANDARDS.md                  ← ✅ já está no repo
├── SECURITY.md                        ← ✅ já está no repo
├── ANTI_MANIPULATION.md               ← 📥 fazer upload
├── .gitignore                         ← ✅ já está no repo
├── .github/
│   ├── CODEOWNERS                     ← ✅ já está no repo
│   └── workflows/
│       └── agent-run.yml              ← 📥 fazer upload
│
├── agents/                            ← 📁 pasta nova
│   ├── scheduler.py                   ← 📥 fazer upload
│   ├── requirements.txt               ← 📥 fazer upload
│   ├── crawler/
│   │   └── crawler.py                 ← 📥 fazer upload
│   ├── extraction/
│   │   ├── extractor.py               ← 📥 fazer upload
│   │   └── prompts/
│   │       └── extraction_prompt.txt  ← ✅ já está no repo (mover)
│   ├── validation/
│   │   └── validator.py               ← 📥 fazer upload
│   ├── archive/
│   │   └── archiver.py                ← 📥 fazer upload
│   └── tests/
│       └── test_extractor.py          ← 📥 fazer upload
│
├── backend/
│   └── db/
│       └── schema.sql                 ← ✅ já está no repo
│
├── config/
│   └── settings.py                    ← 📥 fazer upload
│
├── data/
│   └── countries/
│       └── brazil-2026.json           ← 📥 fazer upload (mover)
│
├── docs/
│   └── ANTI_MANIPULATION.md          ← 📥 fazer upload
│
└── frontend/                          ← 📁 pasta nova (Next.js)
    ├── index.html                     ← ✅ já está no repo
    ├── package.json                   ← 📥 fazer upload
    ├── next.config.ts                 ← 📥 fazer upload
    ├── middleware.ts                  ← 📥 fazer upload
    ├── messages/
    │   ├── en.json                    ← 📥 fazer upload
    │   ├── pt.json                    ← 📥 fazer upload
    │   ├── es.json                    ← 📥 fazer upload (gerar)
    │   ├── fr.json                    ← 📥 fazer upload (gerar)
    │   ├── de.json                    ← 📥 fazer upload (gerar)
    │   └── ar.json                    ← 📥 fazer upload (gerar)
    ├── data/
    │   └── brazil-2026.json           ← 📥 fazer upload
    └── src/
        ├── i18n.ts                    ← 📥 fazer upload
        ├── types/
        │   └── index.ts               ← 📥 fazer upload
        ├── lib/
        │   └── data.ts                ← 📥 fazer upload
        └── app/
            └── [locale]/
                ├── layout.tsx         ← 📥 fazer upload
                ├── page.tsx           ← 📥 fazer upload
                └── compare/
                    └── [electionId]/
                        └── page.tsx   ← 📥 fazer upload

## ══════════════════════════════════════════════════════════
## PASSO A PASSO: COMO SUBIR NO GITHUB
## ══════════════════════════════════════════════════════════

### MÉTODO RECOMENDADO: GitHub Desktop (mais fácil)

1. Baixe o GitHub Desktop: desktop.github.com
2. File → Clone Repository → worldcontrast/promises
3. Arraste os arquivos para as pastas corretas no seu computador
4. GitHub Desktop detecta as mudanças automaticamente
5. Escreva o commit message: "feat: add complete agent system and Next.js frontend"
6. Clique em "Commit to main" → "Push origin"

### MÉTODO ALTERNATIVO: Upload direto no browser

Para cada arquivo novo, no GitHub:
1. Navegue até a pasta correta
2. Add file → Create new file
3. Digite o caminho completo no nome (ex: agents/crawler/crawler.py)
4. Cole o conteúdo
5. Commit changes

### ORDEM DE UPLOAD RECOMENDADA

Fase 1 — Documentação (5 min):
  ANTI_MANIPULATION.md → raiz

Fase 2 — Agent system (15 min):
  .github/workflows/agent-run.yml
  agents/scheduler.py
  agents/requirements.txt
  agents/crawler/crawler.py
  agents/extraction/extractor.py
  agents/validation/validator.py
  agents/archive/archiver.py
  agents/tests/test_extractor.py
  config/settings.py

Fase 3 — Frontend Next.js (20 min):
  frontend/package.json
  frontend/next.config.ts
  frontend/middleware.ts
  frontend/src/i18n.ts
  frontend/src/types/index.ts
  frontend/src/lib/data.ts
  frontend/src/app/[locale]/layout.tsx
  frontend/src/app/[locale]/page.tsx
  frontend/src/app/[locale]/compare/[electionId]/page.tsx
  frontend/messages/en.json
  frontend/messages/pt.json
  frontend/data/brazil-2026.json

Fase 4 — GitHub Secrets (10 min):
  Settings → Secrets → Actions → New repository secret:
  - ANTHROPIC_API_KEY = sua chave da platform.anthropic.com
  - SUPABASE_URL = url do seu projeto Supabase
  - SUPABASE_KEY = service role key do Supabase

## ══════════════════════════════════════════════════════════
## PRÓXIMOS PASSOS APÓS UPLOAD
## ══════════════════════════════════════════════════════════

1. VERCEL (deploy frontend):
   - vercel.com → Import Git Repository → worldcontrast/promises
   - Root directory: frontend/
   - Framework: Next.js
   - Add environment variable: NEXT_PUBLIC_API_URL=https://api.worldcontrast.org
   - Connect domain: worldcontrast.org

2. SUPABASE (banco de dados):
   - supabase.com → New project → worldcontrast
   - SQL Editor → paste schema.sql → Run
   - Copy SUPABASE_URL e SUPABASE_KEY para GitHub Secrets

3. ANTHROPIC API:
   - platform.anthropic.com → API Keys → Create key
   - Copy para GitHub Secret ANTHROPIC_API_KEY

4. PRIMEIRO TESTE DO AGENTE:
   - GitHub → Actions → Agent Collection Pipeline → Run workflow
   - Country: BR
   - Dry run: true ← NÃO salva, só mostra o que encontraria
   - Verifique os logs — você verá o agente visitando tse.jus.br

5. PRIMEIRO DEPLOY REAL:
   - Run workflow novamente com dry run: false
   - As primeiras promessas reais entram no banco
   - O frontend exibe os dados reais automaticamente
