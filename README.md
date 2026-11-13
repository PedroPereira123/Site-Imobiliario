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
