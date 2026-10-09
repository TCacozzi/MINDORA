# MINDORA

Plataforma de autoconhecimento e desenvolvimento profissional — avaliação de
personalidade (Big Five), feedback 360° e Plano de Desenvolvimento Individual
(PDI), construída a partir do documento de concepção
*"Plataforma Integrada de Autoconhecimento e Desenvolvimento Profissional"*.

> Nome provisório. Este é um MVP de validação técnica e de produto — não é
> um instrumento psicométrico validado, não deve ser usado para decisões de
> contratação, promoção ou desligamento, e não substitui parecer jurídico ou
> psicológico profissional. Ver [Limitações e próximos passos](#limitações-e-próximos-passos).

## O que este MVP cobre

- **MINDORA Self**: autenticação, avaliação de personalidade (itens
  públicos do IPIP-50 Big Five, adaptados para pt-BR), motor de pontuação
  determinístico e relatório individual com explicações e limitações.
- **Feedback 360°**: ciclos criados por gestor/admin, convites a
  avaliadores (autoavaliação, gestor, pares, liderados), questionário de
  comportamentos observáveis com opção "não observei", e agregação que só
  libera a média de terceiros quando um número mínimo de avaliadores
  responde (privacidade/anonimato).
- **PDI**: objetivos e ações com responsável e prazo, visível e editável
  tanto pelo profissional quanto pelo seu gestor direto.
- **MINDORA Leader** (gestor): painel da equipe, feedback 360° agregado do
  liderado e acompanhamento do PDI — **sem acesso aos resultados brutos do
  Big Five**, por princípio de proteção de dados sensíveis.
- **MINDORA Insights** (admin): gestão de usuários/organização e
  indicadores agregados de personalidade, também protegidos por um mínimo
  de N para preservar anonimato individual.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, Prisma 6 +
PostgreSQL, NextAuth v5 (Credentials, sessão JWT).

## Rodando localmente

Pré-requisitos: Node.js 20+, um banco PostgreSQL.

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e AUTH_SECRET
npm run db:migrate      # aplica o schema (prisma/schema.prisma)
npm run db:seed         # cria questionários (IPIP-50 + 360°) e organização demo
npm run dev
```

Gere um `AUTH_SECRET` forte com `npx auth secret` ou `openssl rand -base64 32`.

### Usuários demo (criados pelo seed)

| Papel | E-mail | Senha |
|---|---|---|
| Admin | admin@demo.mindora | mindora123 |
| Gestor | gestor@demo.mindora | mindora123 |
| Profissional | joao@demo.mindora / maria@demo.mindora / pedro@demo.mindora | mindora123 |

## Estrutura de dados

Modelado em `prisma/schema.prisma`: `Organization`, `User` (com papel e
gestor direto), `Questionnaire` → `Dimension` → `Question` (versionados,
reaproveitáveis entre Big Five e 360°), `ResponseSession`/`Answer`,
`ScoringResult`/`DimensionScore` (motor de pontuação auditável e
determinístico — reversão de itens, exclusão de "não observei"),
`FeedbackCycle`/`FeedbackInvitation` (360°) e `PDI`/`Objective`/`Action`.

Os itens do Big Five (`prisma/data/bigFiveIpip50.ts`) são os 50 itens do
IPIP Big-Five Factor Markers (Goldberg, 1992) — domínio público
(https://ipip.ori.org/) — traduzidos e adaptados para português do Brasil.
Os itens de 360° (`prisma/data/feedback360.ts`) são ilustrativos, escritos
para este projeto.

## Limitações e próximos passos

Conforme os princípios metodológicos do documento de concepção:

- A tradução/adaptação dos itens de personalidade **não foi validada
  psicometricamente** (estrutura fatorial, confiabilidade, normas para a
  população brasileira). Isso é pré-requisito antes de qualquer uso além
  de testes internos — ver seção 12 (Programa de validação) do documento.
- O nome "MINDORA" e a identidade de marca são provisórios e não foram
  verificados juridicamente (INPI, domínios, marcas).
- Antes de uso comercial com dados reais de colaboradores: revisão de
  LGPD/bases legais, política de retenção e exclusão, e análise de
  incidência das regras do CFP/SATEPSI para instrumentos psicológicos no
  Brasil (seção 11 do documento).
- Fora do escopo deste MVP: módulos de valores/motivadores e competências
  como questionários separados, normas populacionais/percentis, logs de
  auditoria e exportação, e papéis/permissões mais granulares.
