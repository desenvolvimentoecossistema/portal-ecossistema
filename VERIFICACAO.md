# Verificação da entrega

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
