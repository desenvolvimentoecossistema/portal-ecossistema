# Portal do Ecossistema

Organizações Core, Mapa Programático, Mapas de Atuação e Imersões em Eventos em um portal. As Áreas Funcionais permanecem ocultas, com conteúdo preservado para retomada.

Aplicação Next.js para Node.js 24, com banco SQLite persistente. As fontes, imagens, páginas e os dados iniciais do mapa fazem parte do projeto. O funcionamento não utiliza serviços de criação de sites nem modelos de IA.

## Executar

1. Instalar Node.js 24 e pnpm 11.25.0.
2. Executar `pnpm install --frozen-lockfile`.
3. Copiar `.env.example` para `.env` e configurar os valores no servidor.
4. Executar `pnpm run build` e `pnpm start`.

Também há Dockerfile com saída standalone. O volume /data deve ser persistente. Esta configuração usa uma única instância com disco persistente; não distribuir cópias independentes do SQLite entre servidores.

## Configuração

O acesso usa Google OAuth. Cadastrar no cliente a URL `<SITE_ORIGIN>/auth/callback/google`. O segredo e a conta de serviço do Google Sheets ficam somente nas variáveis protegidas da hospedagem. A conta de serviço precisa de leitura da planilha configurada. Administradores da agenda e do mapa são definidos separadamente em BOOTSTRAP_ADMIN_EMAILS e MAP_ADMIN_EMAILS.

Em hospedagem com proxy HTTPS, `SITE_ORIGIN` deve conter o domínio público exato, sem caminho, como `https://portalecossistema.fundacaolemann.codebit.biz`. O endereço interno de escuta, definido por `HOSTNAME` e `PORT`, pode ser diferente. A aplicação usa a origem pública configurada para login, redirecionamentos e validação das gravações, sem confiar em cabeçalhos de origem encaminhados pelo visitante.

Sem EMAIL_WEBHOOK_URL e EMAIL_WEBHOOK_SECRET as inscrições são gravadas, mas não há confirmação por e-mail. O webhook recebe POST JSON com secret e os dados da mensagem e deve devolver {"ok":true}. A interface informa quando a confirmação não é enviada.

## Dados e manutenção

As migrações são aplicadas antes da primeira consulta. `pnpm run db:backup` cria uma cópia consistente do banco em backups/. Dados reais e segredos não pertencem ao repositório. A importação inicial é executada somente por comando local: `pnpm run db:import -- caminho/agenda.json [caminho/mapa.json]`. Não há importador administrativo aberto na internet. Sessões antigas não são importadas.

O artefato standalone e a imagem Docker também incluem os comandos locais de manutenção. Na imagem, executar `node --experimental-strip-types scripts/import-data.mjs /caminho/agenda.json`, com o JSON montado por um volume restrito e `DATABASE_PATH` apontando para o volume persistente. O importador recusa uma agenda já preenchida; fazer backup antes da carga e não publicar o JSON no GitHub.

O primeiro acesso exige aceite dos Termos de Uso e ciência do Aviso de Privacidade. Os documentos são servidos pelo próprio portal. A migração `0003_legal_acceptances.sql` cria o registro das versões e impressões dos documentos sem apagar os dados existentes. Alterações no conteúdo dos documentos exigem novo aceite; cadastro e inscrição também registram a versão apresentada no formulário.

O mapa continua funcionando com seus dados publicados mesmo sem acesso ao Sheets; o Sheets é necessário apenas para obter uma nova prévia. Confira a prévia antes de publicar. O banco conserva a revisão anterior até uma atualização válida.

## Verificação

`pnpm test`, `pnpm run typecheck` e `pnpm run build`. O fluxo em .github/workflows/ci.yml verifica alterações e gera o artefato da aplicação; a publicação na hospedagem depende da esteira configurada para este repositório.
