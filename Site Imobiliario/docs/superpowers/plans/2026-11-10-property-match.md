# Property Match — plano de implementação

**Objetivo:** MVP visual navegável dos oito módulos do briefing aprovado.
**Arquitetura:** aplicação estática, rotas por hash, módulos ES nativos e catálogo único. Estado demonstrativo de favoritos e agendamentos no navegador. Sem backend ou dados pessoais.
**Stack:** HTML, CSS, JavaScript e servidor Node sem dependências.
**Especificação:** briefing v2 fornecido no chat e seis referências anexadas. Direção de arte já aprovada; execução autorizada.

## Etapas e arquivos
- [ ] Fundamentos: `dist/styles.css`, `dist/ui.js`, `dist/data.js`; tokens, grid de 12 colunas, marca geométrica, fotografias exibidas a partir dos recortes visuais das referências fornecidas.
- [ ] Público: `dist/public.js`; homepage editorial, pesquisa filtrável, mapa vetorial ilustrativo com seleção de imóveis.
- [ ] Match: `dist/match.js`; preferências, cards, curtidas, rejeições, salvos e agendamento simulado.
- [ ] Apresentações: `dist/property.js`; Essencial e Signature com galeria e informações territoriais qualificadas.
- [ ] Administração: `dist/admin.js`; dashboard, tabela, cadastro em oito etapas, documentos e módulos internos demonstrativos.
- [ ] Integração: `dist/app.js`; navegação, estado compartilhado, modais acessíveis, movimento reduzido.
- [ ] Verificação: `tests/domain.test.mjs`, sintaxe JS, HTTP e inspeção visual desktop/mobile quando navegador disponível; registrar resultados reais em `docs/AUDITORIA.md`.

## Pontos de revisão
Filtros sem resultados; favoritos entre rotas; último card do Match; formulário com campos obrigatórios; layout de 390 px; teclado e Escape nos modais. Não declarar dados fictícios como reais. Mapa não oferece distâncias ou rotas reais.
