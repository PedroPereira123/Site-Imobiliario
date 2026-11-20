# Design único — 19/11/2026

Decisão do proprietário: o design do Claude Design é a base do site público. A versão anterior do Codex (home, busca e páginas públicas em `src/`) deixa de ser a referência visual.

## Estado do repositório

- `Site Imobiliario/design/`: fonte única do front-end público (home v3 com busca animada e busca na header, e página de imóvel). Inclui o runtime exigido pelos `.dc.html`.
- `scripts/build-demo.mjs`: gera `presentation-dist` (`index.html`, `imovel.html`, runtime e `mapa.html`). Só ajusta destinos internos e injeta React antes de `support.js`.
- Removidos: `design-export/` (três HTMLs de ~30 MB, desatualizados) e `scripts/embed-export-images.mjs`. Estão no histórico Git.
- Mantidos: `Gestor de Imóveis/` (cadastro, autenticação, banco) e os módulos administrativos de `src/` e `server.mjs`.

## Pendências para concluir a unificação

1. `src/public.js`, `src/home.css` e as rotas públicas de `src/app.js` ainda existem e são servidos por `server.mjs`. Devem ser removidos ou redirecionados quando o design for ligado à API de imóveis (hoje o design usa dados de exemplo embutidos).
2. Testes `tests/frontend.test.mjs` e `scripts/browser-check.mjs` cobrem a home antiga; atualizar junto com o item 1.
3. Fotografias ilustrativas vêm da Wikimedia Commons por URL; para uso offline, reincorporar ou hospedar localmente com créditos.
4. A prancha de estudos (`Capital SP Estudos`) e a folha de sistema do imóvel não foram importadas; a prancha só mostra estados da home.

## Como sincronizar com o Claude Design

Copie `Capital SP Home v3.dc.html` para `design/home.dc.html` e `Capital SP Imovel.dc.html` para `design/imovel.dc.html`; `npm run build`.
