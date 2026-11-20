# Site Imobiliário e Cadastro de Imóveis

MVP da Capital SP: site público e painel de cadastro de imóveis com publicação controlada.

## Executar

Requer Node.js 24 ou superior e pnpm para instalar as dependências do backend.

```powershell
cd "Gestor de Imóveis"
pnpm install --frozen-lockfile
cd "../Site Imobiliario"
node server.mjs
```

Acesse http://127.0.0.1:4173/ e o painel em http://127.0.0.1:4173/#/admin.
Na primeira execução, consulte as instruções e as credenciais geradas localmente conforme o README do site.

## Validar

```powershell
cd "Site Imobiliario"
node --test tests/*.test.mjs
```

Os dois diretórios devem permanecer lado a lado. Consulte `Site Imobiliario/README.md` para operação, backup e limitações de implantação.

Banco de dados, imóveis reais, fotos cadastradas, credenciais, backups e outros módulos privados não são enviados ao GitHub. O ambiente local existente permanece preservado. Este repositório inicia com o código do MVP, sem incorporar o histórico anterior do CRM.

## Apresentação na Vercel

Para compartilhar uma demonstração sem backend, importe este repositório na Vercel com Root Directory na raiz e Framework Preset Other. O vercel.json configura o build e a saída. Não são necessárias variáveis de ambiente. Consulte `Site Imobiliario/docs/DEMO-VERCEL.md`.

## Design Capital SP — fonte única (19/11/2026)

O front-end público tem uma única fonte: `Site Imobiliario/design/` (`home.dc.html` e `imovel.dc.html`, sincronizados com o Claude Design, mais o runtime `support.js`, `image-slot.js` e React). Execute `npm run build` na raiz: o script gera `presentation-dist` com `/` (home e busca) e `/imovel.html?id=CSP-0321`. Para alterar o design, edite os `.dc.html` (ou reexporte do Claude Design para esta pasta) e refaça o build. Fotos são ilustrativas (Wikimedia Commons, com crédito) e carregadas da internet; mapa e fluxos comerciais são demonstrativos. Os exports antigos de 30 MB foram removidos; continuam no histórico Git. Veja `Site Imobiliario/docs/design/design-unico.md`.
