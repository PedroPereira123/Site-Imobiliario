# Homepage institucional — Capital SP

Implementada em 13/11/2026 a partir de `writing-block (1).md`.

## Estrutura e arquivos

- `src/public.js`: hero institucional, `propertySearchDock`, área arquitetônica e páginas institucionais básicas (Sobre, Contato, Blog sem artigos e Termos).
- `src/home.css`: tokens restritos à homepage, composição em três faixas, dock fosca, responsividade, máscara de revelação e foco acessível. Fontes de sistema: Impact/Arial Narrow no título e Courier New nos pequenos textos editoriais. Nenhuma fonte comercial foi incorporada.
- `src/index.html`: carregamento do CSS da homepage.
- `src/app.js`: rotas institucionais. O formulário usa o envio e a rota de resultados existentes.
- `src/ui.js`: link para Termos no rodapé.
- `../Gestor de Imóveis/domain.mjs` e `scripts/demo-api.js`: filtro exato `type`, combinado com operação, localização, teto de preço e dormitórios. Valores vêm dos tipos presentes no catálogo. Preço permanece teto máximo, conforme contrato existente.
- `tests/frontend.test.mjs`: combinação de tipo, operação e preço.
- `scripts/browser-check.mjs`: seletores atualizados e verificações de largura e pesquisa visível a 1440, 768, 390 e 320 px.

## Recursos pendentes e limites

Não foi localizado um recurso fotográfico institucional com licença comprovada. A área arquitetônica usa uma superfície neutra e máscara progressiva; não contém fotografia. Para concluir a direção fotográfica, adicionar imagem urbana licenciada e otimizada aos assets e definir `--architecture-image: url('/assets/arquitetura.jpg')` em `.capital-home`. A fotografia deve ser editorial e não representar anúncio. Ajustar contraste do texto após inserir a imagem. Registrar origem, licença e texto alternativo se a imagem tiver significado além da atmosfera visual.

Bahuss, Cosmono e Monoskrn não foram incorporadas por ausência de arquivos e licença web. As alternativas de sistema são temporárias e variam entre plataformas.

Blog é uma página vazia explícita, sem artigos inventados. Textos institucionais e de termos são básicos e podem receber conteúdo editorial da imobiliária. As seções posteriores e anúncios já existentes foram preservados, inclusive a identificação de dados demonstrativos.

Não há nova dependência nem biblioteca de animação. Não há rolagem automática ao preencher campos. Filtros avançados usam `details`, mantendo os campos básicos visíveis. A altura pode crescer com filtros abertos, zoom ou telas baixas para preservar a utilização.

## Verificações

- `node --test tests/*.test.mjs`: 30 testes aprovados.
- `node scripts/browser-check.mjs`: fluxo integrado com banco temporário e capturas locais, sem alterar a carteira real.
- `node scripts/build-demo.mjs`: versão estática gerada em `../presentation-dist`.
- Sem script de lint configurado; npm não está no PATH desta sessão, por isso os comandos Node foram executados diretamente.
- Alterações locais; nenhuma publicação na Vercel foi feita.
