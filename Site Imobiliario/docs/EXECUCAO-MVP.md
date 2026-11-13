# Execução — site e cadastro

Plano: `docs/planejamento/2026-11-13/04-mvp-imediato-site-e-cadastro.md`.

## Decisões de implementação

- Preservar `dist` como protótipo de referência; aplicação funcional em `src`, mantendo CSS e imagens existentes como recursos visuais.
- Node disponível no runtime local, versão 24.22.1; SQLite nativo e APIs HTTP/criptografia nativas. Sharp 0.35.5 fixado para decodificação completa das fotos; runtime local já o fornece, com instalação normal prevista no manifest/lockfile para outras máquinas.
- Backend do cadastro em `Gestor de Imóveis`; site e cadastro servidos pela mesma origem para simplificar autenticação e operação local.
- Trabalhar no branch `codex/mvp-site-cadastro`, no diretório atual. O checkout contém extensa reorganização anterior e todo o site não rastreado; worktree de HEAD não conteria o projeto atual. Nenhum arquivo anterior será movido ou removido.
- WhatsApp confirmado pelo usuário: +55 11 97665-3830. Configuração editável no painel.
- Banco novo e isolado, sem conectar ao CRM ou banco produtivo. Amostras demonstrativas explicitamente rotuladas; catálogo real será alimentado pelo cadastro.
- A publicação na internet e a confirmação operacional de anúncios reais exigem implantação e conferência da imobiliária; o trabalho atual entrega execução local e homologação técnica.

## Progresso

- Baseline: sete testes do protótipo passaram, executados na pasta correta do site.
- Contrato: catálogo público compartilhado entre busca/página; backend expõe somente projeção pública de imóveis publicados.
- Site e cadastro implementados: login, dois perfis, cadastro persistente, duas ofertas, fotos/capa/ordem, revisão/publicação/retirada, busca, favoritos, páginas essencial/Signature e WhatsApp.
- Revisão independente: três achados corrigidos com reprodução RED→GREEN — upload concorrente, resposta atrasada na navegação e validação completa das imagens. Backup consistente também corrigido com regressão automatizada.
- Suite: 20 testes automatizados verdes; verificação de navegador com nove grupos de checagem verdes, incluindo largura 390/768/1440, ausência de erros JS e ciclo ponta a ponta.
- Decisões operacionais futuras: publicar na internet, conferir anúncios reais, substituir fotografias de atmosfera ilustrativas se necessário. Não houve envio de mensagens ao WhatsApp.
