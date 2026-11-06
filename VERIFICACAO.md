# Verificação da entrega

## Sincronização do portal atual — 06/11/2026

- Interface e conteúdo sincronizados com a versão publicada 66 do portal, fonte `1ca2c2ec4834a387d6e0cc708d01b60734867ae5`: descrições completas das sete organizações, Motriz sem negrito, textos de apresentação, link da Fundação Lemann, acesso a um programa específico e filtros que preservam foco e rolagem.
- Preservados o login Google, o banco SQLite persistente, as gravações atômicas, as configurações de produção e os modelos de e-mail já ajustados para a hospedagem independente. Nenhum módulo de autenticação ou armazenamento da plataforma de criação foi copiado.
- A cópia inicial do mapa foi sincronizada com a fonte atual, sem reescrever os programas: contém a capitalização atual de uma classificação e as quebras de linha das descrições importadas. O deploy não substitui os dados já publicados no banco de produção; novas publicações de dados continuam pelo fluxo administrativo do Google Sheets.
- 61 testes automatizados aprovados. TypeScript e build Next.js standalone aprovados. Os 13 fluxos HTTP passaram tanto em acesso direto quanto atrás de proxy HTTPS simulado. O importador standalone também passou, incluindo migrações e rejeição de carga duplicada.
- As verificações usaram banco temporário e serviços externos simulados. A execução do deploy e a disponibilidade real de Google, Sheets e e-mail na Codebit dependem dos serviços configurados na hospedagem.

## Sincronização do portal atual — 05/11/2026

- Interface e comportamento sincronizados com a versão publicada 52 do portal: início com três acessos, navegação, páginas separadas de Mapa Programático e Mapas de Atuação, filtros revisados, exploração por estratégia, datas, contato oculto nas imersões, documentos e aceite no primeiro acesso.
- 53 testes automatizados aprovados. TypeScript e build Next.js standalone aprovados.
- 13 fluxos HTTP completos aprovados em acesso direto e os mesmos 13 atrás de proxy HTTPS simulado. Incluem aceite versionado, gravação atômica do aceite com as inscrições, proteção de dados de contato, concorrência, permissões, reinício e login inicial.
- Navegação verificada no navegador em computador e celular de 390 px. Alfabetização exibiu 12 programas; sem nível especificado, 7. Um vínculo de Lideranças exibiu 1 de 15 programas e preservou o filtro após recarregar.
- Os 38 programas e todas as suas descrições foram comparados com o snapshot publicado do portal e são iguais. O snapshot inicial permanece com SHA-256 `24083071bf687ab9fab366155da73b8418490ab3fdf2b31ea31b1be5cf03ccd4`.
- O importador local está incluído no artefato standalone e na imagem Docker. A importação real do pacote de migração foi validada em banco temporário a partir do diretório standalone: 15 agendas, 1 inscrição e 4 migrações, sem importar sessões.
- Nenhuma dependência executável da plataforma de criação foi incorporada. A versão conserva OAuth Google, SQLite persistente e validação da origem pública atrás do proxy.
- A publicação dos arquivos não configura serviços externos: a implantação na AWS, a carga oficial, as credenciais Google/Sheets e o serviço de envio de e-mails devem estar configurados na hospedagem. A disponibilidade desses serviços não é comprovada pelos testes locais.

## Correção para proxy HTTPS — 04/11/2026

- A validação das gravações usa `SITE_ORIGIN`, pois o endereço interno do Next.js standalone pode diferir do domínio público. Origens externas, ausentes ou inválidas continuam bloqueadas; os cabeçalhos de encaminhamento não substituem a origem configurada.
- O início e o retorno do OAuth usam o domínio configurado. O redirecionamento do mapa para o login também usa esse domínio.
- 31 testes automatizados aprovados, TypeScript e build de produção concluídos.
- 12 fluxos HTTP integrados aprovados em acesso local e os mesmos 12 atrás de proxy HTTPS simulado, com `HOSTNAME=0.0.0.0` e domínio público diferente do endereço de escuta. Foram verificados login inicial, retorno inválido, cadastro e edição de agendas, inscrições, permissões de usuários, exclusão, concorrência e persistência.
- A integração contínua passa a executar também o cenário de proxy. O login real com a conta Google ainda exige o callback cadastrado no cliente e validação no domínio de hospedagem.
- A carga de dados de produção é entregue separadamente. Dados pessoais, sessões e segredos não fazem parte do repositório.

## Verificação inicial

Verificação em 30/10/2026 da versão para hospedagem independente.

- Instalação com lockfile, TypeScript e build de produção concluídos.
- 30 testes automatizados aprovados.
- 11 fluxos HTTP integrados aprovados em servidor Node standalone com SQLite real: acesso, páginas, edição, inscrições, notificações, permissões, concorrência, início de autenticação, arquivos locais, reinício e saída.
- Consulta de dependências de produção: nenhuma vulnerabilidade conhecida reportada, após atualização para Next.js 16.4.1 e Zod 4.6.6.
- 38 programas e todas as descrições preservados a partir dos dados publicados. SHA-256 do snapshot publicado: `24083071bf687ab9fab366155da73b8418490ab3fdf2b31ea31b1be5cf03ccd4`.
- Interface conferida em computador, tablet de 900 px e celular de 390 px. No mapa: Educação 27, Lideranças 15, Geral 7; Alfabetização 12 na fonte atual, com somente South-South do Centro Lemann.
- Código executável sem SDK, API, domínio, credencial ou identificação da plataforma de criação. Fontes e imagens são locais. O armazenamento do mapa e da agenda usa o mesmo banco SQLite persistente.

## Validações que dependem da hospedagem

O login real exige credencial Google e callback do domínio final. A consulta real da fonte exige a conta de serviço e o compartilhamento da planilha. A entrega de e-mails depende do webhook configurado. Os testes cobriram a validação criptográfica do login, o protocolo do Sheets e o envio ao webhook de teste; não substituem a validação dessas credenciais e serviços no domínio de produção.

Configurar volume persistente, HTTPS, variáveis protegidas e backup na hospedagem. A configuração atual é para uma instância de aplicação com SQLite em disco persistente. Não há credenciais, banco real nem inscrições neste repositório.

O conteúdo atual das agendas foi preservado na cópia local de migração. Algumas agendas ainda têm informações em confirmação; o sistema bloqueia inscrições enquanto faltarem os campos necessários. Uma inscrição antiga vinculada apenas a um evento demonstrativo ausente foi preservada em arquivo separado, sem inclusão na agenda ativa.
