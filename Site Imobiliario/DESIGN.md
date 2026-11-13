# Capital SP — sistema de design

Este documento descreve o estado observado, não uma aprovação de novos valores. A identidade combina brutalismo arquitetônico, composição editorial e geometria expressiva com referências ao modernismo brasileiro e a São Paulo. Fotografia arquitetônica deve liderar quando houver recurso licenciado; efeitos e transparências são pontuais. A homepage é mais expressiva, enquanto busca e administração priorizam clareza operacional.

## Tokens existentes

O código é a fonte de verdade: `src/styles.css` define `--concrete: #ede5d9`, `--ink: #252422`, `--yellow: #e8b51e`, `--red: #c73526`, `--green: #14543c`, `--ivory: #f7f3ec`, `--muted: #716d64`, `--line: #d6cfc3`, `--space: 8px`, `--radius: 12px` e `--shadow`. `src/home.css` redefine essas cores em `.capital-home`: concreto `#b1a38a`, marfim `#e3d8c2`, tinta `#292d29`, texto secundário `#44483f`, linha `#292d2938`, destaque `#a64b36` e superfície `#e3d8c2e6`. Os nomes iguais têm escopos diferentes: confira o ancestral antes de reutilizar.

O corpo usa Archivo com fallback Arial; a homepage usa Impact/Arial Narrow para o título e Courier New para apoio. As fontes de marca e a fotografia institucional continuam pendentes de licença. A escala existente usa `clamp()` em títulos; o espaçamento base declarado é 8px, mas há valores locais. O grid é CSS Grid/Flex conforme o contexto. Na homepage existem quebras em 1100, 800 e 400px; não são uma escala universal aprovada. Bordas variam entre 0, 7, 8 e 12px; sombras e vidro são seletivos. Não há escala unificada aprovada para camadas, movimento, tamanhos de toque ou estados semânticos; use os padrões existentes e registre novas decisões.

## Componentes e áreas

Reutilize `.btn`, campos nativos, cabeçalho, cards e padrões existentes em `src/`. Botões devem indicar ação e manter foco visível; inputs e selects precisam de rótulo e erro associado. Modais precisam de nome acessível, foco controlado e fechamento por teclado. Cards imobiliários destacam preço, localização e características sem revelar dados privados. Filtros mantêm os principais visíveis; o dock usa revelação progressiva para opções avançadas. Navegação deve funcionar por teclado e em telas pequenas.

Tabelas, formulários e indicadores administrativos priorizam leitura, rótulos, estados e densidade controlada. Mapas precisam de alternativa textual; galerias precisam de controles acessíveis e descrições adequadas. Notificações, estados vazios, carregamento e skeletons devem comunicar situação sem depender apenas de cor. Property Match deve oferecer alternativa explícita aos gestos. Signature prioriza fotografia licenciada e narrativa editorial.

## Implementação e validação

Use tokens existentes antes de introduzir valores novos. Exemplo correto: `color: var(--ink)` no escopo apropriado; incorreto: repetir uma cor arbitrária para um papel já coberto. Preserve o foco visível, rótulos, contraste e funcionamento com teclado; não use animação como único feedback. Verifique movimento reduzido, zoom e alvos de toque adequados. Imagens devem ser responsivas, otimizadas e ter alternativa apropriada.

Valide desktop, tablet e celular, incluindo 1440, 768, 390 e 320px quando aplicável. Renderize e compare capturas com referências aprovadas quando disponíveis. Antes de concluir, revise hierarquia, composição, espaçamento, tipografia, contraste, consistência, acessibilidade, desempenho e fidelidade visual. Consulte `docs/design/visual-identity.md`, `component-guidelines.md`, `interaction-rules.md`, `reference-gallery.md` e `design-audit.md` para orientações complementares.
