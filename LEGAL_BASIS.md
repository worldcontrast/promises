# World Contrast — Base Legal de Tratamento de Dados
**Versão: 1.0 | Data: April 2026**

Este documento define as bases legais aplicáveis ao tratamento de dados
pelo World Contrast sob a LGPD (Lei 13.709/2018), o GDPR (Regulamento
Geral de Proteção de Dados da UE) e demais normativas eleitorais.

---

## 1. Natureza dos Dados Tratados

| Categoria | Exemplo | Natureza |
|---|---|---|
| Dados de candidatos | Nome, partido, número eleitoral | Dados pessoais de pessoa pública |
| Promessas eleitorais | Texto verbatim de declarações oficiais | Dado público, manifestado pelo próprio titular |
| Metadados de coleta | URL, timestamp, hash SHA-256 | Dado técnico de auditoria |
| Logs de rejeição | Texto rejeitado + motivo | Dado de auditoria pública |
| Dados de acesso à API | IP fingerprint (hash, não IP raw) | Dado técnico anonimizado |

---

## 2. Bases Legais — LGPD

### 2.1 Dados de Candidatos (nome, partido, fontes, promessas)

**Base legal primária:** Art. 7º, IX — Legítimo Interesse

O tratamento de dados de candidatos eleitorais serve ao legítimo interesse
do público de acessar informação comparativa sobre propostas de governo,
exercendo o direito à informação garantido pelo Art. 5º, XIV da Constituição
Federal. O interesse do titular (candidato) não prevalece sobre o interesse
público eleitoral, conforme Art. 7º, §2º da LGPD.

**Base legal secundária:** Art. 7º, II — Cumprimento de obrigação legal

Dados extraídos de filings eleitorais do TSE (tse.jus.br) são documentos
públicos de acesso garantido pela Lei de Acesso à Informação (Lei 12.527/2011),
Art. 8º. O tratamento desses dados reproduz informação que o próprio titular
(candidato) foi legalmente obrigado a tornar pública.

**Fundamento constitucional:** Art. 5º, XIV (acesso à informação) e
Art. 5º, XXXIII (direito de petição e informação) da Constituição Federal.

### 2.2 Exceção a Dados Sensíveis

As promessas eleitorais não constituem dados sensíveis conforme Art. 11
da LGPD (saúde, genética, biometria, orientação sexual, religião, filiação
sindical, convicção política para fins de perseguição).

Nota: convicção política é dado sensível quando coletado para perseguição.
O World Contrast coleta declarações políticas **da própria pessoa pública**
para fins de controle democrático — uso expressamente distinto.

### 2.3 IP Fingerprints (rate limiting)

**Base legal:** Art. 7º, IX — Legítimo Interesse (segurança e integridade
do sistema). O IP nunca é armazenado diretamente — apenas seu hash SHA-256 —
constituindo anonimização imediata conforme Art. 5º, XI da LGPD.

---

## 3. Bases Legais — GDPR

### 3.1 Exceção de Interesse Público / Jornalismo — Art. 85

O World Contrast opera sob a derrogação prevista no GDPR Art. 85 e
Recital 153, que permite aos Estados-membros e à legislação nacional
estabelecer exceções ao regime geral de proteção de dados para:
- Fins jornalísticos
- Fins de pesquisa acadêmica
- Fins de expressão artística

O monitoramento e a comparação de promessas eleitorais constituem atividade
de interesse público equivalente ao jornalismo investigativo.

### 3.2 Dados Manifestamente Tornados Públicos — Art. 9(2)(e)

Todos os dados de candidatos tratados pelo World Contrast foram
**manifestamente tornados públicos** pelos próprios titulares ao:
- Publicar plataformas eleitorais em sites oficiais de campanha
- Depositar programas de governo em tribunais eleitorais
- Publicar em redes sociais verificadas de uso público

O Art. 9(2)(e) do GDPR permite o tratamento de dados especiais quando
o titular os tornou manifestamente públicos.

### 3.3 Direito ao Esquecimento — Art. 17 GDPR / Art. 18 LGPD

O exercício do direito ao esquecimento por candidatos eleitorais é
limitado pelo princípio da proporcionalidade (GDPR Recital 65) quando:
- O dado é de interesse público demonstrável
- O titular é uma figura pública agindo em sua capacidade pública
- A remoção prejudicaria o interesse legítimo do público

Solicitações de remoção são avaliadas individualmente e registradas
na tabela `legal_orders` (sistema de gestão de ordens judiciais).

---

## 4. Normativas Eleitorais

### 4.1 Lei 9.504/1997 (Lei Eleitoral Brasileira)

**Art. 243** — O World Contrast não produz propaganda eleitoral, não emite
juízos de valor sobre candidatos e não favorece nem prejudica qualquer
candidato. A exibição lado a lado de promessas é uma ferramenta de
transparência, não propaganda. A tabela `symmetry_audit` provê prova
matemática de que todos os candidatos recebem tratamento idêntico de coleta.

**Art. 26, §3º** — O World Contrast não é provedor de conteúdo eleitoral
pago, não aceita publicidade e não tem relação com campanhas.

### 4.2 Resolução TSE nº 23.610/2019 (Propaganda Eleitoral Digital)

O World Contrast não se enquadra como "aplicativo para inserção em
comunicação digital com conteúdo de propaganda eleitoral" conforme definição
do Art. 28 da Resolução. A plataforma exibe exclusivamente dados extraídos
de fontes oficiais sem acréscimo editorial.

---

## 5. Princípios POCVA-01 como Escudo Jurídico

O protocolo POCVA-01 implementa os seguintes princípios jurídicos:

| Princípio Jurídico | Implementação Técnica |
|---|---|
| Proporcionalidade | Apenas dados necessários para o objetivo (promessa + fonte) |
| Finalidade | Única finalidade: transparência comparativa de promessas eleitorais |
| Não discriminação | Algoritmo idêntico para todos os candidatos (ver `symmetry_audit`) |
| Transparência | Log público de rejeições (`extraction_rejections`), hash do prompt |
| Segurança | SHA-256 por registro, audit_log append-only, RLS no banco |

---

## 6. Controlador e Operador (LGPD Art. 5º, VI e VII)

**Controlador:** WorldContrast (iniciativa independente não formalizada como
pessoa jurídica — ver nota abaixo)

**Operador:** Anthropic PBC (processamento de IA), Supabase Inc. (banco de
dados), Vercel Inc. (hospedagem) — todos com termos de serviço que proíbem
uso indevido de dados pessoais.

> **Nota sobre entidade jurídica:** O World Contrast é uma iniciativa
> independente não registrada formalmente como pessoa jurídica em nenhuma
> jurisdição. "Não-lucrativo" descreve o modelo operacional, não um status
> legal formal registrado. O processo de formalização está em curso.

---

## 7. Contato para Direitos de Titulares

Solicitações de acesso, correção, eliminação ou portabilidade:

- **Email jurídico:** legal@worldcontrast.org
- **Formulário:** https://worldcontrast.org/privacy
- **GitHub Issue (público):** label `privacy-request`

**Prazo de resposta:** 15 dias úteis, conforme Art. 18, §3º da LGPD.

---

*Este documento faz parte integral da documentação jurídica do World Contrast.*
*Em caso de conflito com outros documentos, este documento prevalece em matéria de proteção de dados.*
