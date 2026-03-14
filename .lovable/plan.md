
Objetivo
Resolver de vez o erro de login local quando aparece **“Invalid authentication credentials”** (além de “Invalid login credentials”), com diagnóstico claro na tela e instruções acionáveis para não travar mais no fluxo.

Diagnóstico que fiz
- O fluxo de login no preview está funcional: encontrei requisição `POST /auth/v1/token?grant_type=password` com status **200** para o mesmo backend.
- A mensagem do seu print atual é **“Invalid authentication credentials”** (diferente de “Invalid login credentials”).
- Hoje o código só trata bem:
  - erro de conexão (rede/backend offline), e
  - string exata `"Invalid login credentials"`.
- Resultado: quando vem `"Invalid authentication credentials"`, o app mostra mensagem crua e não orienta como corrigir.
- Causa mais comum desse erro em ambiente local: **URL e chave publishable não pertencem ao mesmo projeto** (normalmente por `.env.local` sobrescrevendo `.env`).

O que vamos implementar
1) Melhorar o classificador de erros de autenticação
- Arquivo: `src/lib/auth-connection-diagnostics.ts`
- Adicionar classificação de erro por tipo:
  - `connection_error`
  - `invalid_project_credentials` (URL/chave incompatíveis)
  - `invalid_user_credentials` (email/senha)
  - `email_not_confirmed`
  - `rate_limited`
  - `unknown_auth_error`
- Atualizar `normalizeAuthError()` para retornar mensagem amigável por categoria (não só conexão).

2) Tornar o teste de conexão realmente útil para credenciais do projeto
- Arquivo: `src/lib/auth-connection-diagnostics.ts`
- Refinar `pingAuthBackend()` para:
  - diferenciar “backend alcançável” de “chave inválida/incompatível”;
  - não marcar 401/403 genericamente como “ok” sem interpretar o corpo da resposta;
  - retornar causa explícita quando o par URL+key estiver inconsistente.

3) Ajustar o fluxo de login para mensagens consistentes e úteis
- Arquivo: `src/contexts/AuthContext.tsx`
- Manter `try/catch`, mas garantir normalização também para erros retornados pela lib (não só exceções lançadas).
- Sanitizar entrada de email (`trim`, `lowercase`) antes do login para evitar falso erro por espaço/capitalização.

4) Melhorar UX da tela `/entrar` para este caso específico
- Arquivo: `src/pages/Gateway.tsx`
- Tratar também `"Invalid authentication credentials"` com mensagem amigável em português.
- Exibir bloco de ajuda específico quando for erro de configuração local:
  - “URL e chave devem ser do mesmo projeto”;
  - “`.env.local` tem prioridade sobre `.env`”;
  - “reinicie o `npm run dev` após alterar env”.
- Incluir CTA direto para recuperação de senha **somente** quando for erro real de credenciais do usuário (não configuração).
- Manter lockout e MFA sem regressão.

5) Documentação de troubleshooting mais precisa
- Arquivo: `README.md`
- Expandir seção atual com um subtópico explícito:
  - diferença entre “Invalid login credentials” (usuário/senha) e
  - “Invalid authentication credentials” (configuração local URL/key).

Validação (fim a fim)
1. Caso A — credenciais corretas e env correto
- Login deve funcionar normalmente.
- Se usuário tiver 2FA, segue para verificação MFA.

2. Caso B — URL/key incompatíveis (simulado)
- Login deve mostrar mensagem de configuração local, não mensagem genérica.
- Painel de diagnóstico deve explicar exatamente o que revisar.

3. Caso C — senha errada
- Mensagem deve orientar “email ou senha incorretos”.
- CTA para “Esqueci minha senha” deve estar claro.

4. Caso D — backend indisponível
- Continua mostrando diagnóstico de conexão (já existente), sem regressão.

Riscos e mitigação
- Risco: classificar errado mensagens variáveis do provedor.
  - Mitigação: usar matching por múltiplos padrões (`includes`, lowercase, códigos quando disponíveis).
- Risco: poluir UI com muito detalhe.
  - Mitigação: mostrar detalhes técnicos apenas em `DEV`; produção com mensagem objetiva.

Resultado esperado
- Você deixa de receber erro “solto” sem orientação.
- O app passa a te dizer claramente **se o problema é senha** ou **configuração local do projeto**.
- Redução drástica de tentativas cegas e retrabalho no login local.
