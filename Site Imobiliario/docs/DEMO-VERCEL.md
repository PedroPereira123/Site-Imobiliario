# Apresentação na Vercel

Objetivo: compartilhar site e telas do cadastro por link, sem backend nem banco na nuvem. A demonstração usa somente os imóveis fictícios do protótipo; nenhum dado do banco local é exportado.

Plano: gerar uma pasta estática a partir de src, acrescentar uma API simulada somente para leitura, identificar o modo apresentação e configurar o build da Vercel. Navegação, busca, favoritos e formulário permanecem disponíveis. Salvar/publicar/upload e contatos externos exibem aviso; nada é enviado. Validar build, testes e rotas antes do commit.

## Publicação

Na Vercel, importe PedroPereira123/Site-Imobiliario, branch main. Mantenha Root Directory na raiz do repositório e Framework Preset em Other. O vercel.json define build e saída. Não configure banco ou variáveis de ambiente. Clique em Deploy e compartilhe a URL gerada. Cada push em main atualiza a apresentação.

Build local: `node "Site Imobiliario/scripts/build-demo.mjs"`. Saída: presentation-dist (gerada e ignorada pelo Git). A aplicação local continua sendo iniciada pelo servidor existente.
