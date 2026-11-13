# Auditoria inicial — 13/11/2026

O projeto principal usa Node 24, módulos JavaScript, HTML e CSS próprios. `package.json` não declara framework ou dependências locais; o backend é compartilhado com `../Gestor de Imóveis`. Há alterações pré-existentes não confirmadas, inclusive homepage e testes. A aplicação ativa está em `src/`; `dist/` é protótipo anterior. O CSS global é compacto e contém valores locais, enquanto a homepage redefine nomes de tokens no seu próprio escopo. Uma extração indiscriminada pode mudar outras áreas.

Não há scripts de lint, typecheck ou build no manifest. `node --test tests/*.test.mjs` passou 30 testes nesta auditoria. O ensaio `scripts/browser-check.mjs` usa Playwright e Chrome, banco temporário e capturas locais; ele verifica fluxo e responsividade, mas não compara imagens com baselines e não constitui regressão visual automatizada. Uma futura comparação deve fixar navegador, fontes, dados e viewport, revisar baselines e evitar dados reais.

React, shadcn/ui, Radix, Mantine, Motion e bibliotecas equivalentes não são base adequada imediata para este frontend sem React. Não foram adicionadas dependências. Storybook e bibliotecas de efeitos ou gráficos exigem uma necessidade concreta antes de adoção.

## Skills locais

Instaladas em `.agents/skills/`: `frontend-design` ([Anthropic](https://github.com/anthropics/skills), commit `2c5958ecac7cee2b583967a2c4981d0f4a75c579`, Apache-2.0), `web-design-guidelines` ([Vercel](https://github.com/vercel-labs/agent-skills), commit `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`, README declara MIT), e `ui-ux-pro-max` ([Next Level Builder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), commit `6ae86f61f520d6ca229d2f40e070410638c908c5`, MIT). As duas primeiras foram instaladas com o instalador do Codex; a terceira foi montada a partir do template Codex e dos dados e scripts da versão inspecionada, sem executar instalador remoto. A licença acompanha as skills Anthropic e UI/UX; para Vercel, a declaração MIT está no README de origem. A skill `property-design-system` é local e direciona para as decisões do projeto.

Os arquivos de entrada e frontmatter foram verificados, e uma busca local de UX retornou resultado. O validador oficial de skills não executou porque o Python disponível não possui PyYAML; a descoberta efetiva em nova sessão ainda não foi observada. A skill de criação do Codex já está disponível no ambiente; não foi instalada uma cópia adicional da skill de criação Anthropic. `vercel-react-best-practices` e `vercel-composition-patterns` foram estudadas, mas não instaladas pois o projeto não usa React. O guia web obtém instruções atualizadas da Vercel pela rede ao ser usado; essas instruções devem ser avaliadas no contexto do projeto.

O ensaio `node scripts/browser-check.mjs` passou, sem erros JavaScript, e gerou capturas da homepage em 1440, 768, 390 e 320px. Essas capturas não foram comparadas visualmente nesta auditoria. `node scripts/build-demo.mjs` também terminou com sucesso e gerou uma apresentação estática com dados fictícios.

Pendências: inventariar e revisar referências visuais, validar descoberta de skills em nova sessão, estabelecer baseline visual aprovado, resolver fotografia e fontes licenciadas, consolidar tokens por área e aplicar um piloto comparado com capturas antes/depois. Não há alegação de inspeção visual nem de conclusão dessas etapas.
