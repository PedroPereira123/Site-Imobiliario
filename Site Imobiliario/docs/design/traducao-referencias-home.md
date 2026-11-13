# Tradução visual — homepage Capital SP

Documento de passagem para implementação futura. As duas imagens fornecidas são referências da primeira dobra da homepage, não telas completas nem especificações de comportamento. Não houve implementação ou validação visual nesta etapa.

## Referências e leitura

- **Imagem 1 — Portal Imobiliário Brutalista Capital SP:** fundo de concreto bege com textura e juntas discretas; cabeçalho, grande título central e dock próximo à base. É a referência mais clara para materialidade, escala tipográfica, espaçamento e composição do cabeçalho.
- **Imagem 2 — Hero “Capital SP” com Busca de Imóveis:** mesmo sistema de marca, com fotografia arquitetônica iluminada no terço inferior e dock sobreposto à imagem. É a referência para integrar arquitetura e busca numa única composição. A imagem mostra filtros adicionais abertos; isso não define, por si só, comportamento ou funcionalidades existentes.

As referências diferem: a primeira apresenta concreto em toda a dobra e não mostra fotografia; a segunda mostra fotografia e uma segunda linha de filtros. **Proposta para implementação:** manter a composição e textura da primeira, incorporando a fotografia da segunda na parte inferior, com transição suave. Usar a busca existente e manter filtros avançados recolhidos inicialmente. Essa combinação é uma interpretação proposta, não uma escolha confirmada pelo usuário.

## Composição desktop

1. **Cabeçalho:** marca à esquerda, navegação Home / Sobre / Contato / Blog à direita, alinhados em uma faixa horizontal com margens laterais generosas e linha inferior fina. A marca combina símbolo 2×2 de quadrados escuros, um quadrado terracota e nome forte; o subtítulo “IMÓVEIS” aparece pequeno e espaçado. Home é assinalada por um traço terracota curto.
2. **Título:** “CAPITAL SP” em caixa alta, centrado, preto quase sólido, extremamente grande e condensado. É o foco principal da página; a largura e a altura devem responder à viewport sem cortar letras nem forçar rolagem horizontal. Abaixo, “ENCONTRE SEU PRÓXIMO ESPAÇO.” em tamanho muito menor, com espaçamento entre letras e centralização.
3. **Fundo e fotografia:** superfície quente de concreto, com textura sutil e baixo contraste. Na proposta combinada, fotografia horizontal de arquitetura brutalista paulistana surge gradualmente abaixo do título, com luz quente e geometria de concreto. A transição não deve reduzir a legibilidade nem transformar a imagem em ruído visual. A fotografia é atmosférica e não representa anúncio específico.
4. **Busca:** uma barra larga e horizontal, centrada, em superfície bege clara levemente translúcida, borda clara fina, cantos arredondados e sombra suave. Sobre a foto, mantenha opacidade suficiente para leitura. Colunas separadas por linhas finas: pretensão, tipo, localização, preço máximo e botão escuro “Buscar imóveis” com seta. Acesso a filtros avançados fica junto à barra ou na segunda linha, conforme espaço.

```text
[ marca ]                                  Home   Sobre   Contato   Blog
────────────────────────────────────────────────────────────────────────
                          CAPITAL SP
                   ENCONTRE SEU PRÓXIMO ESPAÇO.

                  fotografia arquitetônica em revelação
     [ pretensão | tipo | localização | preço | BUSCAR | + filtros ]
```

## Direção visual

- **Paleta:** concreto bege quente como campo principal; preto esverdeado para texto e botão; terracota restrito ao símbolo e à indicação de navegação; superfície areia mais clara para a busca. Começar pelos tokens existentes em `.capital-home` (`--concrete`, `--ivory`, `--ink`, `--accent`, `--surface`, `--line` em `src/home.css`). Valores exatos das imagens não estão estabelecidos como tokens definitivos.
- **Tipografia:** título de exibição condensado, muito pesado e de proporções altas; navegação e formulário em sans-serif legível, com rótulo menor e valor mais forte. O projeto usa Impact/Arial Narrow como fallback; conferir disponibilidade e licença de qualquer fonte nova antes de incorporá-la. Preservar a frase e seu espaçamento característico sem sacrificar leitura em telas pequenas.
- **Materialidade:** textura de concreto discreta, linhas finas, transparência e sombra apenas na busca. Evitar sobreposição de efeitos que enfraqueça a arquitetura ou a leitura.
- **Geometria:** composição central e simétrica, margens amplas e alinhamentos rigorosos. A busca é uma peça horizontal de cantos arredondados, em contraste com o desenho arquitetônico e a marca quadrada.

## Tradução funcional para o projeto

O projeto atual usa HTML gerado por JavaScript e CSS, sem React. A homepage e `propertySearchDock` estão em `src/public.js`; os estilos específicos estão em `src/home.css`; os eventos e rotas devem ser verificados em `src/app.js`. Leia `DESIGN.md` e `docs/HOMEPAGE-INSTITUCIONAL.md` antes de alterar. Preserve as mudanças locais existentes e reutilize a busca funcional.

- Pretensão usa `operation`; tipo usa `type`; localização usa `query`; preço máximo usa `max`; dormitórios usa `beds`. Preserve seus significados, nomes e envio para a busca existente.
- A imagem 2 sugere área, vagas e condomínio, mas isso não demonstra que esses filtros funcionem no fluxo atual. Não criar controles que aparentem filtrar sem suporte real. Manter dormitórios em filtros avançados e avaliar os demais em trabalho próprio.
- O campo de localização deve continuar sendo entrada de texto; setas ou ícones da imagem não justificam convertê-lo em select. Rótulos visíveis e associação semântica são obrigatórios.
- Preserve as demais seções e rotas. O escopo visual desta referência é cabeçalho, hero e busca, não uma reformulação das páginas internas ou do painel.

## Adaptação responsiva proposta

- **Desktop:** cabeçalho horizontal; título em uma linha quando couber; dock em uma linha, com filtros adicionais acessíveis sem sobreposição.
- **Tablet:** reduzir título e espaçamentos; permitir que a busca se reorganize em duas linhas, mantendo os campos e a ação claramente agrupados.
- **Mobile:** manter marca e menu acessível; dimensionar o título para caber, admitindo quebra controlada se necessário; busca em duas colunas ou uma coluna conforme espaço e legibilidade, com botão de largura adequada. A fotografia pode ser recortada para preservar a arquitetura. A altura da dobra pode crescer para evitar cortes e sobreposições.
- Manter controles operáveis por teclado e toque, foco visível, contraste suficiente, texto ampliável e alternativa ao movimento. Abrir filtros com controle semântico e estado comunicado. Respeitar `prefers-reduced-motion`.

## Recursos e decisões pendentes

- As imagens fornecidas são referências visuais; não presumir que os arquivos possam ser usados como fotografia de produção ou que seus elementos recortados tenham licença para tal. Buscar ou receber fotografia arquitetônica com direitos confirmados; enquanto isso, manter fallback neutro e registrar a pendência.
- Fonte exata, imagem final, textura e valores finos de cores não foram identificados. Medidas e proporções devem ser calibradas visualmente, não tratadas como especificação aprovada em pixels.
- As duas imagens divergem na posição da foto e nos filtros. A combinação proposta acima pode ser ajustada pelo usuário antes ou durante a implementação.

## Critérios para o Astra validar depois de implementar

Renderizar a homepage, capturar 1440, 768, 390 e 320px e comparar com ambas as referências, observando proporção do título, margens, textura, posição da fotografia e aparência do dock. Verificar ausência de corte e rolagem horizontal, teclado, foco, contraste, filtros, rota de resultados e estados em telas pequenas. Executar `node --test tests/*.test.mjs` e `node scripts/browser-check.mjs`; relatar o que foi realmente inspecionado e qualquer diferença ou recurso pendente.

## Aplicação — 13/11/2026

Aplicada por solicitação direta de implementação deste documento. Cabeçalho, título e busca receberam a composição da primeira referência; a integração fotográfica está preparada no hero por `--architecture-image`, mantendo fallback neutro até haver recurso licenciado. As demais seções e contratos de busca foram preservados.

Decisões: tokens de cor existentes preservados; textura procedural SVG local, sem recurso externo, e juntas de baixo contraste; título Impact do sistema, sem fonte nova; dock areia com raio de 22px (18px no mobile), sombra e opacidade suficiente para leitura. Removido o cabeçalho redundante de dentro do formulário. Filtros avançados continuam em `details`, fechados inicialmente, com dormitórios como único campo adicional. Até 1100px a busca usa duas colunas; até 400px usa uma para evitar truncamento dos valores. Campos com texto de 16px e alvos mínimos de 44px.

Validação: 30 testes Node aprovados; fluxo integrado de navegador aprovado sem erros JavaScript. Capturas reais em `.local/browser-check/homepage-{1440,768,390,320}.png` inspecionadas visualmente e comparadas às referências: título dominante, margens simétricas e dock arredondado presentes; fotografia ausente intencionalmente por licença pendente. Sem rolagem horizontal nas quatro larguras, ação de busca visível na primeira tela. Verificação adicional de abertura/fechamento dos filtros via Enter, acesso ao campo via Tab, foco visível e movimento reduzido incluída no ensaio de navegador.

Limites: não houve ensaio com leitor de tela, zoom de navegador ou fonte alternativa em outro sistema operacional. Contraste foi revisado visualmente, sem auditoria automatizada completa. A textura procedural é mais discreta que o concreto fotográfico da referência. Nenhuma publicação realizada.

### Ajuste após revisão no navegador

Removida a faixa de quatro benefícios (`value-strip`) por solicitação do usuário. A máscara da superfície arquitetônica agora também desaparece suavemente na base, retornando ao token `--concrete` antes da seleção de imóveis. O degradê é estático, não intercepta interação e preserva texto e links. Nenhuma regra de negócio alterada.

### Concreto mais escuro

Por solicitação do usuário, o concreto principal da homepage passa de `#c9bea8` para `#b1a38a`, um bege mineral mais escuro. Mantida a textura procedural existente e a busca clara. Texto secundário ajustado para `#44483f` para preservar contraste no fundo escurecido. Alteração restrita aos tokens da homepage; nenhuma imagem nova incorporada.

### Dock compacta com expansão sob demanda

Por solicitação do usuário, a busca inicia como botão central “Buscar imóvel”. A ativação expande o formulário existente, comunica o estado com `aria-expanded`/`aria-controls`, transfere foco ao primeiro campo e rola a página até a dock. Com movimento reduzido a rolagem é imediata. “Recolher busca” mantém os valores preenchidos. Os filtros avançados e o envio para resultados preservam o contrato existente. Esta decisão substitui a orientação anterior de manter os campos básicos visíveis inicialmente; a rolagem só acontece por ativação explícita do botão.

Verificação: 30 testes Node aprovados; ensaio de navegador ampliado com abertura por teclado, foco, rolagem, recolhimento e preservação de valores, além de capturas dos estados compacto e expandido em 1440, 768, 390 e 320px. Capturas de desktop compacto e mobile expandido inspecionadas. Sem ensaio com leitor de tela.

### Marca principal alinhada à esquerda

Título do hero alinhado à margem esquerda por solicitação do usuário, com “IMÓVEIS” em segunda linha do mesmo h1. A segunda linha usa sans-serif menor e espaçamento de `.5em` entre letras. A frase de apoio acompanha o alinhamento; busca e navegação mantidas. Esta decisão substitui a centralização prevista na referência original.

### Escala e posição da marca no hero

“IMÓVEIS” passa a herdar a mesma fonte, peso e tamanho de “CAPITAL SP”, com tracking de `.12em`. O bloco fica alinhado ao início vertical do hero, com margem superior responsiva de 28–64px, em vez de centralização vertical. Substitui a decisão anterior de subtítulo menor.

### Textura fotográfica fornecida pelo usuário

Aplicada `dist/assets/concreto-envelhecido.png`, cópia da imagem “Parede de Concreto Brutalista Texturizada.png” enviada pelo usuário com pedido explícito de uso na página. Fundo decorativo no cabeçalho e hero, com camada bege translúcida para legibilidade do texto escuro e degradê até `--concrete` na base. Removidas as juntas artificiais sobrepostas no hero. A fotografia arquitetônica institucional continua sendo uma pendência distinta. Origem registrada como arquivo fornecido pelo usuário; não houve verificação independente de licença. Imagem original preservada (aproximadamente 3,5 MB); otimização adicional de entrega permanece possível.

### Vidro escurecido na dock compacta

Removido o preenchimento preto sólido do botão de expansão. A dock recolhida usa tinta a 62% de opacidade, blur de 16px e borda clara translúcida; botão transparente com texto marfim. Hover clareia discretamente o vidro e foco usa contorno marfim. Estilo restrito ao estado recolhido, preservando contraste e controles do formulário aberto.

### Vidro escurecido também na busca expandida

Aplicado o mesmo fundo translúcido (tinta a 62%, blur 16px) ao formulário aberto. Rótulos, valores, placeholders e foco em marfim; divisórias e contornos claros translúcidos. Botões de recolher e enviar transparentes, com contorno e hover discretos. Selects nativos usam esquema escuro e opções com fundo sólido para preservar leitura. Alteração apenas visual, sem modificar busca ou expansão.

### Ações empilhadas na dock aberta

Removido o controle “Recolher busca” do estado expandido a pedido do usuário. O botão inicial desaparece após abrir e o foco segue para o primeiro campo. No desktop, campos centralizados verticalmente ao lado de uma coluna com “Buscar imóveis” e “Filtros avançados” imediatamente abaixo, ambos com o mesmo tratamento visual. Em telas menores, ações ocupam a largura disponível abaixo dos campos. Filtros avançados preservam `details`/`summary`, operação por teclado e indicador +/−. Substitui a opção anterior de recolher o formulário. Ensaio de navegador atualizado para verificar ausência do botão após abrir.

### Fotografia stock e vinheta irregular

Imagem decorativa local `dist/assets/arquitetura-stock.png`: Aimbere Elorza, “Modern Architectural Corridor in São Paulo”, https://www.pexels.com/photo/modern-architectural-corridor-in-sao-paulo-32505400/ . Licença Pexels conferida em https://www.pexels.com/license/ (uso em site e modificações permitidos). Imagem redimensionada a 1600px e convertida para PNG otimizado. Máscara elíptica assimétrica e três gradientes radiais produzem bordas irregulares suaves, com proteção bege na região do texto. No mobile, superfície de apoio translúcida preserva leitura. Não representa imóvel anunciado. Substitui o fallback neutro desta seção; sem alteração de funcionalidades.

### Tipografia da seção arquitetônica

Título secundário passa a usar Impact/Arial Narrow, caixa alta, peso 400 e alinhamento à esquerda, seguindo o hero em escala menor (40–88px; 36px em telas estreitas). Texto de apoio mantém sans-serif legível com espaçamento discreto. Fotografia e vinheta preservadas.

### Vitrine por categoria

Substituído o cabeçalho editorial e “Explorar todos” por três seções: APARTAMENTOS, SOBRADOS E CASAS e IMÓVEIS COMERCIAIS. Reutilizados cards e grid existentes, até quatro anúncios por seção. Apartamentos e casas são agrupados pelo tipo cadastrado, excluindo finalidade comercial; comerciais usam `use= commercial`. Categorias vazias comunicam ausência sem inventar anúncios. Sem alteração no catálogo ou regras da busca.
