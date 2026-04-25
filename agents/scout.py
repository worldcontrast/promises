# World Contrast — Scout Discovery Agent
# File: .github/workflows/scout-discovery.yml

name: Scout — Discovery Agent

on:
  workflow_dispatch:
    inputs:
      country:
        description: 'Sigla do país (ex: BR, FR, US, AR)'
        required: true
        default: 'BR'
      election:
        description: 'Nome da eleição (ex: Presidential 2026)'
        required: true
        default: 'Presidential 2026'
      search_backend:
        description: 'Backend de busca'
        required: false
        default: 'tavily'
        type: choice
        options:
          - tavily
          - duckduckgo
      dry_run:
        description: 'Dry run — imprime JSON sem salvar nem commitar'
        required: false
        default: false
        type: boolean

permissions:
  contents: write

jobs:
  run-scout:
    name: OSINT Scout Runner
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: agents/requirements.txt

      - name: Install Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install httpx==0.27.2 anthropic tavily-python duckduckgo-search

      - name: Create output directories
        run: mkdir -p data/countries logs

      - name: Run Scout Agent
        env:
          PYTHONPATH: .
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          TAVILY_API_KEY:    ${{ secrets.TAVILY_API_KEY }}
          http_proxy: ""
          https_proxy: ""
          HTTP_PROXY: ""
          HTTPS_PROXY: ""
        run: |
          EXTRA_FLAGS=""

          EXTRA_FLAGS="$EXTRA_FLAGS --scheduled"

          if [ "${{ github.event.inputs.dry_run }}" = "true" ]; then
            EXTRA_FLAGS="$EXTRA_FLAGS --dry-run"
          fi

          python agents/scout.py \
            --country  "${{ github.event.inputs.country }}" \
            --election "${{ github.event.inputs.election }}" \
            --search   "${{ github.event.inputs.search_backend }}" \
            $EXTRA_FLAGS

      - name: Validate generated JSON
        if: ${{ github.event.inputs.dry_run != 'true' }}
        run: |
          JSON_FILE=$(find data/countries -name "*.json" \
            -newer agents/scout.py 2>/dev/null | head -1)

          if [ -z "$JSON_FILE" ]; then
            echo "::warning::Nenhum JSON novo encontrado em data/countries/"
            exit 0
          fi

          echo "Validating: $JSON_FILE"

          python3 - "$JSON_FILE" << 'PYEOF'
          import json, sys
          path = sys.argv[1]
          with open(path) as f:
              data = json.load(f)

          required = {"country", "election", "status", "candidates"}
          missing  = required - set(data.keys())
          if missing:
              print(f"::error::JSON inválido — campos ausentes: {missing}")
              sys.exit(1)

          if data["status"] not in ("live", "scheduled"):
              print(f"::error::status inválido: {data['status']}")
              sys.exit(1)

          cands = data["candidates"]
          print(f"✓ JSON válido — {len(cands)} candidato(s) | status={data['status']}")
          for c in cands:
              sources = c.get("sources", {})
              filled  = [k for k, v in sources.items() if v]
              print(f"  · {c['fullName']} ({c.get('party','?')}) — {len(filled)} fonte(s)")
          PYEOF

      - name: Commit and Push JSON
        if: ${{ github.event.inputs.dry_run != 'true' }}
        run: |
          git config --global user.name  "World Contrast Scout"
          git config --global user.email "scout@worldcontrast.org"
          
          # 1. Adiciona apenas a pasta de dados
          git add data/countries/

          # 2. Verifica se há ficheiros JSON modificados ou novos
          if git diff --staged --quiet; then
            echo "Sem alterações para commitar."
          else
            # 3. Faz o Commit PRIMEIRO
            git commit -m "scout: ${{ github.event.inputs.country }} — ${{ github.event.inputs.election }}"
            
            # 4. FIX: Esconde qualquer ficheiro de log ou lixo solto que atrapalhe o GitHub
            git stash --include-untracked
            
            # 5. Puxa do servidor e empurra com a via totalmente livre
            git pull --rebase origin main
            git push origin main
            echo "✓ JSON publicado com sucesso em data/countries/"
          fi

      - name: Upload Scout Logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: scout-logs-${{ github.run_id }}
          path: logs/*.log
          if-no-files-found: ignore
          retention-days: 30
