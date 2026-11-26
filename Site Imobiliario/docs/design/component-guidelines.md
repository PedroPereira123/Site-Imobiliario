# Componentes

Antes de criar um componente, procure equivalente em `src/ui.js`, `src/public.js`, `src/registration-form.js` e nos estilos existentes. Prefira HTML nativo e composição compatível com JavaScript sem framework. Extraia componentes apenas quando houver reutilização real; teste isoladamente quando isso esclarecer comportamento e estados. Preserve dados privados, rótulos, mensagens de erro e controles de teclado. Padrões por tipo e tokens estão em `DESIGN.md`.

## Cartão do corretor (`design/Corretor.dc.html`)

Componente único, importado com `<dc-import name="Corretor">` ao lado de toda ação de falar com o corretor: painel do imóvel na Home, card de valores e painel "Agendar visita" na página do imóvel, e detalhe do imóvel na busca. Mostra foto (image-slot `corretor-foto`, circular), "SEU CORRETOR", nome, CRECI e uma apresentação curta. Props: `tom` (`claro` | `escuro`, para fundos escuros) e `compacto` (esconde a apresentação, foto de 52px). Nome, CRECI e apresentação são texto literal do componente: editar nele atualiza todas as páginas. Os valores atuais são marcadores de exemplo e devem ser substituídos pelos dados reais antes de publicar.

Foto de exemplo do cartão: `design/fotos/corretor-exemplo.jpg`, de Christina @ wocintechchat.com no Unsplash (licença Unsplash, uso gratuito; https://unsplash.com/photos/SJvDxw0azqw). Nome "Mariana Costa", CRECI e apresentação são fictícios e marcados como exemplo.

## Página de anúncio (`design/anuncio.dc.html`)

Página dos imóveis comuns (não destaque), aberta pelos cards da busca (`?id=CSP-1xxx`). Estrutura inspirada no anúncio do QuintoAndar: mosaico de fotos com galeria em tela cheia, trilha (Zona Leste › bairro › rua › código), título descritivo, dados principais, descrição, itens disponíveis e indisponíveis, mapa com área aproximada (dados OpenStreetMap em `zl-ruas.js`), similares na região, blocos de Bairro e Condições, e card de valores fixo com o cartão do corretor, "Agendar visita" e WhatsApp. No celular, o card vira uma barra fixa com preço e "Agendar visita". A página do imóvel em destaque (`imovel.dc.html`) continua separada.


## Property Match (`match.dc.html`)

Descoberta de imóveis um por vez, com recomendação ajustada pela sessão. Não é anúncio, landing page Signature nem carrossel de destaques: usa o catálogo convencional da busca.

- **Catálogo único:** `catalogo.js` (`window.CSP_CATALOGO`) é a fonte de dados da busca, do anúncio e do Property Match. As páginas esperam o script carregar antes de montar (`componentDidMount` aguarda `CAT`).
- **Acesso:** seção "03a Property Match" na Home (mostra "Continuar de onde parei" se houver progresso); botão "Descobrir no Property Match" na busca, que leva os filtros atuais pela URL; link "Descobrir semelhantes" no anúncio (`?ref=CÓDIGO`) e no imóvel em destaque (`?origem=destaque`).
- **Fluxo:** introdução visual → preferências → descoberta → Seus matches. Estado em `localStorage` (`csp-match`): preferências, decisões com motivos, histórico para desfazer e contato opcional. Favoritos em `csp-favs`, compartilhados com a busca, o anúncio e a Home.
- **Indispensáveis × flexíveis:** finalidade, preço, tipo, dormitórios, vagas, metragem e características marcadas definem a elegibilidade. Bairros e linhas podem ser exigência ou preferência (chave na tela). Prioridades pessoais só ordenam.
- **Pontuação (determinística):** critérios declarados pesam pela regra (bairro 3–4, linha 2,5, espaço 2, transporte 2, custo-benefício 2, segurança 1,5). Curtidas (+1), favoritos (+1,5) e descartes sem motivo (−0,4) geram afinidade por bairro, tipo, características e linha. Motivos ajustam limites: "preço elevado" passa a penalizar preços a partir do descartado, "imóvel pequeno" penaliza áreas até a dele, "localização" penaliza o bairro, "transporte" aumenta o peso do transporte.
- **Rodadas de 20:** a descoberta mostra no máximo 20 imóveis por rodada, os mais bem pontuados. Ao fim, "Mais 20" abre outra rodada já reordenada. Imóveis que contrariam um motivo de descarte (preço a partir do que foi achado alto, área até a que foi achada pequena, bairro descartado por localização) saem da rodada enquanto houver outras opções; esgotadas, a tela explica e oferece "Ver mesmo assim", com o aviso no card. Mudar as preferências inicia uma rodada nova.
- **Integridade dos dados:** motivos são percepções do cliente e nunca viram característica do imóvel. Prioridades sem dado no catálogo (silêncio, iluminação, privacidade, comércio) não pontuam e vão para a ficha. A porcentagem de compatibilidade usa só critérios com dado; "sem dado" não conta contra.
- **Gestos:** arrastar com ponteiro (rotação ≤ 12°, limiar de 30% da largura ou velocidade de 0,5 px/ms), botões equivalentes e teclado (← → ↑ F Z, Esc). Tocar na foto abre detalhes, que não contam como decisão. Com movimento reduzido, o card só esmaece e não gira.
- **Ficha de atendimento:** texto consolidado para WhatsApp, cópia ou .txt. Nada é enviado automaticamente. A integração futura deve registrar o lead no C2S, o sistema central da imobiliária.

### Property Match: objetivo e decisões da revisão

- **Objetivo principal: visita em lote.** Na busca, o cliente agenda um imóvel por vez. No Property Match, ele monta um roteiro de até 5 imóveis (`VISIT_MAX`) e pede todas as visitas num só agendamento pelo WhatsApp, com ordem sugerida por proximidade (vizinho mais próximo, coordenadas aproximadas), dias possíveis, período e a ficha. O roteiro fica em `csp-match.rot` e aparece no painel lateral, na barra do celular, nos fins de rodada, em Seus matches e nos detalhes.
- **Uma ação positiva, "Quero visitar":** o arrasto para a direita (o *match*) grava nos favoritos compartilhados (`csp-favs`), entra na lista de visitas, que não tem limite. Ao tocar em "Agendar visitas", com até 5 na lista o envio abre direto com todos; com mais de 5, abre antes a tela "Escolha até 5 para visitar", que guarda a última seleção, e os não enviados continuam na lista. Na primeira vez aparece a pergunta "Quer agendar agora?"; nas seguintes, uma faixa compacta no topo do card com "Agendar (n)". A cada envio vão de 1 a 5 imóveis. A mensagem pergunta a disponibilidade, e a conversa segue no WhatsApp.
- **Regras explícitas:** "preço elevado", "imóvel pequeno" e "localização" perguntam se o cliente quer esconder imóveis parecidos. Só as regras confirmadas tiram imóveis das rodadas, e elas aparecem nas preferências, no painel lateral e em Seus matches, com opção de remover. Sem confirmação, o motivo só reduz a prioridade.
- **Compatibilidade sem porcentagem:** "Atende X de Y preferências", contando só critérios com dado cadastrado.
- **Catálogo pequeno:** com menos de 8 imóveis elegíveis (`MIN_DECK`), a página sugere ver em lista na busca, com os mesmos indispensáveis.
- **Posicionamento:** na Home, o módulo aparece como "Não sabe por onde começar?": um caminho complementar à busca, não um substituto.
