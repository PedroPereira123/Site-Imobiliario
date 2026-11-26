# Componentes

Antes de criar um componente, procure equivalente em `src/ui.js`, `src/public.js`, `src/registration-form.js` e nos estilos existentes. Prefira HTML nativo e composição compatível com JavaScript sem framework. Extraia componentes apenas quando houver reutilização real; teste isoladamente quando isso esclarecer comportamento e estados. Preserve dados privados, rótulos, mensagens de erro e controles de teclado. Padrões por tipo e tokens estão em `DESIGN.md`.

## Cartão do corretor (`design/Corretor.dc.html`)

Componente único, importado com `<dc-import name="Corretor">` ao lado de toda ação de falar com o corretor: painel do imóvel na Home, card de valores e painel "Agendar visita" na página do imóvel, e detalhe do imóvel na busca. Mostra foto (image-slot `corretor-foto`, circular), "SEU CORRETOR", nome, CRECI e uma apresentação curta. Props: `tom` (`claro` | `escuro`, para fundos escuros) e `compacto` (esconde a apresentação, foto de 52px). Nome, CRECI e apresentação são texto literal do componente: editar nele atualiza todas as páginas. Os valores atuais são marcadores de exemplo e devem ser substituídos pelos dados reais antes de publicar.

Foto de exemplo do cartão: `design/fotos/corretor-exemplo.jpg`, de Christina @ wocintechchat.com no Unsplash (licença Unsplash, uso gratuito; https://unsplash.com/photos/SJvDxw0azqw). Nome "Mariana Costa", CRECI e apresentação são fictícios e marcados como exemplo.

## Página de anúncio (`design/anuncio.dc.html`)

Página dos imóveis comuns (não destaque), aberta pelos cards da busca (`?id=CSP-1xxx`). Estrutura inspirada no anúncio do QuintoAndar: mosaico de fotos com galeria em tela cheia, trilha (Zona Leste › bairro › rua › código), título descritivo, dados principais, descrição, itens disponíveis e indisponíveis, mapa com área aproximada (dados OpenStreetMap em `zl-ruas.js`), similares na região, blocos de Bairro e Condições, e card de valores fixo com o cartão do corretor, "Agendar visita" e WhatsApp. No celular, o card vira uma barra fixa com preço e "Agendar visita". A página do imóvel em destaque (`imovel.dc.html`) continua separada.
