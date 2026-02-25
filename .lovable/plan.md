
Objetivo: resolver de forma definitiva o erro de login local (“Erro ao entrar / Failed to fetch”) e evitar que o usuário fique sem diagnóstico claro quando o backend de autenticação estiver inacessível.

Contexto observado
- O login no ambiente de preview está funcionando (há autenticação por senha + MFA concluída nos logs).
- O erro “Failed to fetch” aparece na tela de login local, o que normalmente indica falha de conectividade/configuração de ambiente (não erro de credenciais).
- Em Vite, `.env.local` tem prioridade sobre `.env`; isso costuma causar divergência silenciosa de URL/chave em ambiente local.
- O fluxo de login atual mostra a mensagem bruta do erro, mas não orienta o que corrigir.

Escopo da correção
- Sem mudanças de banco de dados.
- Sem mudanças em políticas de acesso.
- Apenas frontend (diagnóstico e tratamento de erro).

Plano de implementação

1) Criar diagnóstico central de conexão (novo utilitário)
- Arquivo novo: `src/lib/auth-connection-diagnostics.ts`
- Implementar funções:
  - `validateAuthEnv()`:
    - valida presença de `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
    - valida formato da URL (`http/https`)
    - retorna status estruturado (ok/missing/invalid)
  - `pingAuthBackend()`:
    - tenta requisição leve para endpoint de autenticação (`/auth/v1/user` com token vazio ou endpoint público equivalente)
    - timeout curto (ex.: 5s) para não travar UX
    - retorna causa provável: backend indisponível, DNS, CORS/rede, etc.
  - `normalizeAuthError(error)`:
    - converte “Failed to fetch” em mensagem amigável e acionável para usuário local
    - mantém mensagens de credencial inválida como estão

2) Melhorar robustez do `signIn` no contexto de autenticação
- Arquivo: `src/contexts/AuthContext.tsx`
- Ajustes:
  - envolver `signInWithPassword` com `try/catch` defensivo
  - quando houver falha de rede, devolver erro normalizado (ao invés de mensagem genérica crua)
  - manter logging assíncrono de acesso como está (sem bloquear login)
- Resultado esperado:
  - nenhuma exceção não tratada no fluxo local
  - erro consistente para a UI decidir qual orientação mostrar

3) Melhorar UX da tela de login para erro de conectividade local
- Arquivo: `src/pages/Gateway.tsx`
- Ajustes:
  - ao detectar erro de conexão, exibir toast com texto claro (ex.: “Não foi possível conectar ao backend de autenticação”)
  - renderizar um bloco de ajuda abaixo do formulário somente nesse caso, com checklist:
    - confirmar URL do backend
    - confirmar chave publishable
    - verificar se `.env.local` não sobrescreve `.env`
    - reiniciar servidor após trocar env
  - incluir botão “Testar conexão” que chama `pingAuthBackend()` e retorna diagnóstico em tempo real
- Resultado esperado:
  - usuário deixa de ver só “Failed to fetch” e passa a ter instruções objetivas para resolver

4) Adicionar diagnóstico seguro em modo desenvolvimento
- Arquivo: `src/pages/Gateway.tsx` (ou utilitário de debug)
- Em `import.meta.env.DEV`:
  - mostrar URL atual do backend usada pelo app (sem expor segredo)
  - mostrar estado da checagem (“conectado / não conectado”)
- Segurança:
  - nunca exibir chave completa; no máximo prefixo/sufixo mascarado para depuração local

5) Atualizar documentação de troubleshooting local
- Arquivo: `README.md`
- Incluir seção curta “Erro de login local: Failed to fetch”
  - checklist para modo cloud local (`npm run dev`) e modo self-hosted (`docker compose`)
  - reforçar precedência do `.env.local`
  - comando/fluxo para validar endpoint de autenticação antes do login
- Resultado esperado:
  - menos recorrência do problema para novos setups

Validação (fim-a-fim)
1. Rodar local com configuração correta:
- login deve funcionar normalmente
- sem toast de erro de rede
2. Simular configuração quebrada (URL inválida):
- app deve exibir erro amigável + painel de ajuda + “Testar conexão”
3. Simular backend offline:
- mesmo comportamento de diagnóstico, sem travamento
4. Validar regressões:
- login com credencial inválida continua mostrando mensagem de credenciais
- fluxo com 2FA continua funcionando (usuário com 2FA ativo é direcionado para verificação)

Riscos e mitigação
- Risco: falso positivo no teste de conectividade por endpoint inadequado.
  - Mitigação: usar endpoint estável e tratar timeout/rede separadamente.
- Risco: exposição indevida de credenciais em debug.
  - Mitigação: apenas URL + chave mascarada, nunca valor completo.
- Risco: ruído visual em produção.
  - Mitigação: bloco detalhado de diagnóstico só para erro de rede, com detalhes extras apenas em DEV.

Resultado esperado após implementação
- O login local deixa de falhar sem contexto.
- Quando houver falha real de ambiente/rede, a aplicação explica exatamente o que ajustar.
- Redução significativa de tentativas cegas (“não sei mais o que fazer”) ao configurar localmente.
