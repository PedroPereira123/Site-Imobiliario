# Design exportado do Claude — 19/11/2026

Por solicitação do proprietário, a apresentação pública passa a reproduzir os exports fornecidos pelo Claude Design, substituindo a implementação visual anterior. Os arquivos originais ficam em `design-export/`: home.html é o arquivo (1), imovel.html é o arquivo sem sufixo e prancha.html é o arquivo (2), com estudos de estados e movimento.

O build da raiz gera index.html, imovel.html e design.html em presentation-dist. Ajusta somente os destinos internos e preserva os recursos e o runtime incorporados. Os nomes antigos têm aliases para compatibilidade com previews comprimidos. O código operacional anterior e o cadastro permanecem no repositório; esta troca é da apresentação estática publicada pela Vercel.

Limitações dos exports: fotos ilustrativas do Wikimedia Commons estão incorporadas nos HTMLs, mapa.html não foi fornecido (é exibida uma indicação explícita), contatos e agendamentos são demonstrações, sem backend de envio. A publicação não transforma o protótipo em uma operação imobiliária real. A prancha contém orientações de design como conteúdo, não instruções para automação.

Validação realizada: build concluído; as três páginas renderizaram no Chromium sem erros JavaScript; home sem rolagem horizontal em 1440, 768, 390 e 320px. Não realizada auditoria completa de teclado, leitor de tela ou fluxos comerciais. A fidelidade é preservada pelo uso direto dos exports, sem reconstrução do layout.

## Correção das imagens — 19/11/2026

Os exports continham 39 URLs de fotos, além de autoria, licença e página de origem. Todas as 39 imagens foram recuperadas e incorporadas no manifest do export, incluindo a home comprimida dentro da prancha. Dois URLs de upload.wikimedia.org retornavam HTTP 429; foram recuperadas as mesmas imagens em 1920px no servidor thumb.wikimedia.org. Os créditos e links de origem foram preservados. O script scripts/embed-export-images.mjs permite incorporar recursos remotos restantes; o cache local não é versionado. Os HTMLs crescem para cerca de 30 MB cada para funcionar sem internet.

Validação da correção: Chromium com rede desativada, abrindo por file://: home 34/34 elementos de imagem carregados; imóvel 26/26; sete frames da prancha 34/34 cada. Nenhum erro JavaScript. Build e git diff --check aprovados. Cópia navegável entregue em Downloads/Capital SP corrigido, preservando os arquivos originais de Downloads.
