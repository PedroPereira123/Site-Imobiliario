# Validação do MVP — 13/11/2026

**Atualização — cadastro expandido:** formulário ampliado a partir do inventário funcional Kenlo fornecido pelo usuário. Verificação atual: **28 testes automatizados e 11 grupos de checagem no navegador aprovados**, com fases colapsáveis, contatos/participações repetíveis, tipos dependentes, persistência e controles de publicação. [Registro da expansão](CADASTRO-EXPANDIDO.md). Os resultados de 20 testes/nove grupos abaixo registram a entrega inicial.

## Resultado técnico

Aplicação local implementada e verificada. CRM próprio não foi ativado. Nenhum sistema externo recebeu escrita, nenhuma mensagem foi enviada e não houve publicação na internet.

### Testes automatizados

Comando: `node --test tests/*.test.mjs`, na pasta `Site Imobiliario`.

Resultado final: **20 testes passaram, zero falhas**. Incluem sete testes preservados do protótipo e testes novos de API/domínio/interface renderizada.

Cobertura relevante: autenticação e papéis, origem indevida, logout, criação e validação, referências únicas, duas ofertas, revisão/publicação/retirada, ausência de dados privados no catálogo, concorrência de revisão/upload, persistência após reabrir o banco, imagem inválida, mídia privada/publicada, backup/restauração e integridade de snapshot.

### Navegador

Comando: `node scripts/browser-check.mjs`. Chrome headless via Playwright, banco temporário isolado e usuários de teste. Resultado: **nove grupos de checagem aprovados**, sem erros JavaScript.

1. Homepage desktop sem sobreposição entre apresentação e busca.
2. Login e cadastro persistente.
3. Navegação concorrente: resposta antiga não altera a identidade de um cadastro novo.
4. Upload, ordem das fotos e capa preservados após recarregar.
5. Publicação, filtros combinados, dados privados ausentes e destino WhatsApp correto.
6. Favoritos locais.
7. Navegação mobile; página de imóvel sem overflow em 390, 768 e 1440 pixels.
8. Edição preserva versão pública anterior, republicação atualiza valor e retirada impede consulta pública.
9. Estado de imóvel não encontrado e ausência de erros JS.

Capturas e resultado detalhado em `.local/browser-check/`, fora do versionamento. Houve inspeção visual das capturas de homepage desktop, cadastro desktop e imóvel mobile.

### Revisão independente

Uma revisão de código independente identificou três problemas: concorrência de upload, resposta atrasada na navegação e validação superficial de imagens. Os três foram reproduzidos em testes, corrigidos e verificados novamente. A validação de imagens agora usa decodificação real e normalização com Sharp, removendo metadados EXIF/GPS. O snapshot consistente de backup também possui regressão RED→GREEN.

Verificação de sintaxe concluída para os arquivos JS ativos e módulos do backend. Arquivos de credenciais e banco foram confirmados como ignorados pelo Git.

## Correspondência com o plano

| Tarefas | Estado técnico |
|---|---|
| SITE-01 a SITE-07 | Implementadas e demonstradas tecnicamente; aceite de uso final cabe à imobiliária |
| SITE-08 | Preparação documentada; carteira real, autorização de mídia, domínio/hosting e publicação permanecem operacionais |
| CAD-01 | Cadastro próprio é autoridade dos novos registros; não há sobrescrita automática por XML/CRM |
| CAD-02 a CAD-07 | Implementadas e verificadas |
| CAD-08 | Backup e restauração com mídia demonstrados em banco de teste; rotina operacional de cópias deve ser adotada pela imobiliária |

## Entrega e limites

- Servidor local: `http://127.0.0.1:4173/`; cadastro: `/#/admin`.
- Atalho Windows: `Site Imobiliario/Iniciar.cmd`.
- Acesso inicial em arquivo privado `.local/acesso-inicial.txt`; senha aleatória por instalação.
- Um cadastro criado no primeiro ensaio manual está identificado como fictício e foi retirado do site. Os ensaios automatizados posteriores usaram bancos temporários e não alteram a carteira.
- Nenhum anúncio real foi carregado ou declarado disponível. O catálogo pode começar vazio e é alimentado pelo cadastro.
- Não houve merge, push ou alteração dos sistemas legados; trabalho preservado em `codex/mvp-site-cadastro`.
- Interface web local e SQLite atendem o MVP testável na estação. Domínio, HTTPS, acesso por outros computadores e operação pública exigem implantação própria, conforme README.
