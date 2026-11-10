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

As migrações são aplicadas antes da primeira consulta. `pnpm run db:backup` cria uma cópia consistente na pasta `backups` ao lado do banco configurado, dentro do volume persistente. `BACKUP_DIRECTORY` permite indicar outro diretório restrito. As cópias geradas por esse comando são substituídas em até trinta dias; arquivos de outros nomes não são removidos. Dados reais e segredos não pertencem ao repositório. A importação inicial é executada somente por comando local: `pnpm run db:import -- caminho/agenda.json [caminho/mapa.json]`. Não há importador administrativo aberto na internet. Sessões antigas não são importadas.

O artefato standalone e a imagem Docker também incluem os comandos locais de manutenção. Na imagem, executar `node --experimental-strip-types scripts/import-data.mjs /caminho/agenda.json`, com o JSON montado por um volume restrito e `DATABASE_PATH` apontando para o volume persistente. O importador recusa uma agenda já preenchida; fazer backup antes da carga e não publicar o JSON no GitHub.

O primeiro acesso exige aceite dos Termos de Uso e ciência da Política de Privacidade. Os documentos são servidos pelo próprio portal. Os novos registros guardam a identidade autenticada, nome, e-mail, data/hora, operação, recurso e SHA-256 da cópia integral dos documentos. O arquivo de versões é imutável pela aplicação e fica no mesmo SQLite persistente. Alterações no conteúdo exigem novo aceite; cadastro e inscrição também registram os documentos apresentados. Os administradores acessam `/administracao/aceites`, ou o link “Consultar registros de aceite” no diálogo de administradores, para pesquisar e baixar comprovantes em HTML para impressão ou JSON. A API e os arquivos exigem sessão, aceite vigente e permissão de administrador.

O histórico de textos já versionados no Git é incluído sem dados de usuários, para recuperar cópias antigas somente quando o hash coincide. Se não houver correspondência, o comprovante antigo informa que a cópia não está disponível, preservando o registro original sem atribuir um texto diferente a ele.

O processo de produção inicia também os serviços de e-mail e conservação. A conservação roda antes de abrir o servidor e, depois, uma vez ao dia, mesmo sem visitantes. Agendas e inscrições vencem dois anos após o encerramento; agendas sem data e rascunhos usam a última edição. Usuários inativos e aceites de acesso seguem dois anos desde a última utilização, preservados os vínculos com agendas ainda conservadas. Aceites de agendas canceladas usam a data mais recente entre o término registrado e a operação. Sessões e estados OAuth expirados também são removidos. O relatório da última execução contém apenas contagens, visíveis na área de aceites.

Uma conservação excepcional exige justificativa e vencimento explícitos: `node scripts/privacy-hold.mjs user|event IDENTIFICADOR DATA-ISO JUSTIFICATIVA`. Esse comando deve ser usado somente por responsável autorizado diante de fundamento legal específico. Ele não abre uma API de escrita na internet. A rotina é transacional, preserva reservas vigentes e reaplica as regras após restauração de backup. Cópias e logs mantidos fora do aplicativo, inclusive snapshots da hospedagem e caixas de e-mail, precisam seguir a conservação definida para esses serviços; o aplicativo não administra esses ambientes externos.

O mapa continua funcionando com seus dados publicados mesmo sem acesso ao Sheets; o Sheets é necessário apenas para obter uma nova prévia. Confira a prévia antes de publicar. O banco conserva a revisão anterior até uma atualização válida.

## Verificação

`pnpm test`, `pnpm run typecheck` e `pnpm run build`. O fluxo em .github/workflows/ci.yml verifica alterações e gera o artefato da aplicação; a publicação na hospedagem depende da esteira configurada para este repositório.
