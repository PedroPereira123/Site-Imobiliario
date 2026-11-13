# Capital SP — site e cadastro de imóveis

MVP local com catálogo público, busca, páginas de imóvel, favoritos locais, contato pelo WhatsApp e cadastro interno com persistência SQLite. O CRM não é necessário.

## Iniciar no Windows

Execute `Iniciar.cmd` nesta pasta. Ele usa Node.js do PATH ou o runtime disponível no Codex. Requer Node.js 24 ou superior. Na estação atual, usa o processador de imagens Sharp já disponível no runtime do Codex; não requer credenciais de banco externo.

Em outra máquina, instale as dependências na pasta `Gestor de Imóveis` com `pnpm install --frozen-lockfile` (ou `npm install`) antes de iniciar. A versão do Sharp está fixada no manifest/lockfile. A aplicação decodifica e normaliza imagens, limita dimensões e remove metadados EXIF/GPS antes de publicá-las.

- Site: http://127.0.0.1:4173/
- Cadastro: http://127.0.0.1:4173/#/admin
- Primeiro acesso: usuário e senha aleatória estão no arquivo **privado** `.local/acesso-inicial.txt`, criado na primeira inicialização. Não há senha padrão compartilhada.
- Para encerrar: Ctrl+C no terminal do servidor.

O catálogo começa vazio. Para testar, cadastre um imóvel fictício e marque a opção de exemplo. Para carregar os exemplos anteriores, inicie com `CAPITAL_DEMO=1` no ambiente; eles são explicitamente identificados e nunca representam carteira real. A carga de exemplos só ocorre em banco sem imóveis.

## Uso

1. Acesse o cadastro com login.
2. Cadastre referência, título, bairro, cidade, tipo, características e ao menos um preço.
3. Adicione fotos próprias/autorizadas. A primeira é a capa; use as setas para ordenar. Salve após remover ou reordenar.
4. Revise os dados e publique. Somente gerência pode publicar ou retirar.
5. Abra o site: filtre, consulte o imóvel e confira o WhatsApp.
6. Uma edição de imóvel publicado fica em revisão; a versão anterior permanece pública até nova publicação. Retirar remove o imóvel do catálogo, favoritos públicos e mídia pública.

O cadastro possui cinco grupos colapsáveis — **Identidade**, **Características**, **Ofertas e Condições**, **O espaço em primeiro plano** e **Somente para a equipe** — contendo dez etapas internas. Clique no cabeçalho para abrir/fechar ou use **Expandir fases** e **Recolher fases** para todos os níveis. Inclui os campos do inventário e das seis capturas fornecidas: estrutura, detalhes/características, controles comerciais, transporte, localização, proprietário, chaves, captação/comissões, fotos e publicação. É possível salvar dados adicionais incompletos em rascunho; os obrigatórios da publicação são indicados com asterisco e os grupos/fases com erros abrem automaticamente.

Finalidade determina os tipos disponíveis. Proprietário aceita múltiplos telefones/e-mails; chaves mostram campos condicionais; captadores podem ser adicionados; estações têm filtro de busca. Seleção de portais e preferências de comunicação são apenas registros internos, sem integrações de envio. Visibilidade de preços e exibição no site são aplicadas na publicação local. Os dados novos ficam em `registration`, e os cadastros anteriores são preservados.

Venda e locação podem coexistir. Encargos vazios aparecem como não informados; IPTU mensal e anual são diferenciados. Endereço completo, proprietário e notas internas não são enviados ao site público.

O número confirmado de WhatsApp é **+55 11 97665-3830**, editável em Configurações. O botão abre a conversa com referência e link; não envia mensagem sozinho nem confirma visita. Links localhost só funcionam na estação local; o endereço definitivo depende de implantação.

## Dados, backup e recuperação

Dados em `../Gestor de Imóveis/data/`: banco, fotos e backups. Nunca publique essa pasta. `.local/` contém o acesso inicial e também deve permanecer privada.

No painel da gerência, Configurações → Baixar backup gera um arquivo com registros, fotos, configurações e hashes de senha. Guarde-o em local restrito, separado do computador. Sessões não são exportadas.

Também é possível usar, com Node no PATH:

```powershell
node server.mjs backup
```

Para restaurar, **pare o servidor**, use somente um backup confiável e execute:

```powershell
node server.mjs restore "C:\Backups\capital-sp-backup.json"
```

A restauração cria backup prévio, valida checksum e imagens e invalida sessões. Preserve o acesso ao arquivo original até conferir a recuperação. Alterar `CAPITAL_DATA_DIR` permite usar outro diretório, inclusive para ensaios isolados.

Para criar editor ou gestor adicional: `node server.mjs user` ou `Iniciar.ps1 user`. Perfis: `editor` (rascunho/revisão) e `manager` (publicação/configurações/backup). A senha digitada pelo comando é visível no terminal; para evitar isso, use `CAPITAL_NEW_PASSWORD` no ambiente privado da sessão e limpe a variável em seguida.

## Verificação

```powershell
node --test tests/*.test.mjs
```

Os testes usam bancos temporários e não conectam a dados reais. `dist/` preserva o protótipo anterior; a aplicação ativa está em `src/`, com uma cópia local do CSS base sem importação de fontes externas e os recursos visuais do protótipo. Backend em `../Gestor de Imóveis/`.

Verificação ponta a ponta: `node scripts/browser-check.mjs`. Requer Playwright disponível (na estação atual, encontrado no runtime Codex) e Chrome; `CHROME_PATH` permite informar outro executável Chromium compatível. O ensaio cria banco temporário, testa cadastro/fotos/publicação/filtros/edição/retirada e salva capturas e resultado em `.local/browser-check/`, sem alterar a carteira local.

## Limite de implantação

O servidor vincula apenas `127.0.0.1`, com sessão HttpOnly/SameSite, validação de origem e permissão na API. Este pacote foi preparado para uso/teste na estação local. Publicação na internet exige adaptar origem confiável, HTTPS/cookie Secure, domínio, supervisão do processo, armazenamento persistente, política de backup e conferência dos anúncios/fotos. Não expor a porta local por túnel sem essa preparação.
