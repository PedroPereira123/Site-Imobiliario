# Cadastro expandido — inventário Kenlo

Referência: inventário funcional v1.0 de 13/11/2026 fornecido pelo usuário em Downloads. A referência descreve campos; não determina publicação externa nem envio de mensagens.

## Execução

1. Registrar catálogo compartilhado com as seis finalidades, tipos dependentes, características, estações, chaves, comissões e portais.
2. Testar validação/persistência de informações adicionais, atualização de registros existentes, privacidade e controles de publicação.
3. Implementar formulário em dez fases colapsáveis: estrutura, detalhes, comercial/administrativo, transporte, localização, proprietário, chaves, comissões/captação, mídia e publicação.
4. Implementar contatos/captadores repetíveis, seleção conjunta de portais, sugestão de título e dependências de finalidade/chaves.
5. Verificar API e navegador, incluindo salvar/reabrir, erros em fases fechadas, edição dos cadastros legados e publicação sem dados privados.

## Decisões

- Preservar os cinco cadastros e suas fotos. Criar backup antes da alteração.
- Campos adicionais persistem em `registration`, sem migração destrutiva de tabelas JSON existentes.
- Finalidade comercial e estado de publicação são conceitos diferentes. Status administrativo inicial “Provisório” é separado de rascunho/revisão/publicado/retirado.
- Seletores sem opções comprovadas aceitam texto; não reproduzir opções inventadas do Kenlo.
- A lista de estações reproduz o inventário e permite seleção manual; não afirma que todas estão operacionais nem calcula proximidade.
- Campos obrigatórios indicados no inventário são verificados para publicação; rascunhos podem guardar dados adicionais incompletos. Não inventar área total ou dados de proprietário para registros legados.
- Preferências de envio ao proprietário e portais são registradas sem efeitos externos. A publicação no site e a visibilidade dos preços funcionam localmente.
- Valores avaliados, contatos, chaves, participações e comentários ficam exclusivamente na API autenticada.

## Resultado de verificação

- Catálogos: seis finalidades, 96 associações finalidade/tipo, 79 características e 137 entradas de estações transcritas do inventário.
- Dez fases colapsáveis, incluindo a fase de fotos já existente, com ações para expandir/recolher todas e preservação da preferência no navegador.
- Contatos e participações repetíveis, filtros de estações, dependências de chaves/tipos, seleção conjunta de portais e sugestão determinística de título implementados.
- Dados adicionais normalizados e persistidos; nova publicação exige área total, dormitórios, proprietário, mídia de origem e título para portais. Dados legados não foram preenchidos por suposição.
- Tipos legados inalterados podem ser preservados na edição e restaurados por backup; novas combinações inválidas são rejeitadas. A publicação pede classificação compatível.
- 28 testes automatizados passaram. Onze grupos de verificação no navegador passaram, incluindo formulário expandido, fases colapsáveis, contatos, chaves, dados privados, upload/publicação, navegação concorrente e validação em fases fechadas.
- Capturas desktop/mobile das fases foram inspecionadas. Nenhum erro JavaScript foi observado no ensaio.
- Revisão independente concluída. Ressalva sobre tipos legados foi tratada com reprodução RED→GREEN e teste de edição/restauração.
- Os cinco imóveis importados e suas 25 fotos foram conferidos e preservados. Backup prévio criado em `Gestor de Imóveis/data/backups/`.

As preferências de portais e comunicação não provocam publicação externa ou envio de e-mails. A pesquisa de logradouro é local, sem geocodificação; a associação de estações é manual.

## Conferência das seis capturas e correção da aba aberta

A inspeção da própria aba do usuário confirmou que ela ainda executava o formulário inicial de cinco seções fixas, apesar de o servidor já conter a expansão. Navegar por rotas de hash não recarregava o módulo JavaScript que estava em memória. A aba foi recarregada e validada diretamente.

Os campos das capturas estão organizados em cinco grupos nativamente recolhíveis, preservando as dez etapas internas:

| Grupo | Informações |
|---|---|
| Identidade | Identificação, finalidade/tipo, localização e logradouro |
| Características | Metragens, infraestrutura, ambientes, armários, pisos e estações |
| Ofertas e Condições | Status administrativo, pretensões, condições, avaliações, seguros e publicação na web |
| O espaço em primeiro plano | Fotografias, capa e ordem da galeria |
| Somente para a equipe | Proprietário, contatos, chaves e participações/captação |

Conferência visual das capturas: características administrativas/comerciais, detalhes/amenidades, proprietário/contatos, localização, estações e publicação. Opções de listas que não aparecem abertas nas capturas continuam sem ser inventadas.

Teste novo do formulário renderizado: cinco grupos com os títulos solicitados, RED→GREEN. Suite atual: **29 testes aprovados**. Na aba real, cada um dos cinco cabeçalhos foi aberto e fechado; salvar o formulário vazio revelou os grupos com campos obrigatórios pendentes, sem gravar um imóvel. Captura em `.local/cadastro-cinco-grupos.png`. Dados/fotos existentes não foram alterados por essa correção.
