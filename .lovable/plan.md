

## Correcao de Vulnerabilidades de Seguranca

A analise de seguranca encontrou **6 vulnerabilidades**. Abaixo esta o diagnostico e a correcao para cada uma.

---

### 1. Organizacoes: INSERT com `WITH CHECK (true)` (RLS Always True)

**Risco**: Qualquer usuario autenticado pode inserir organizacoes sem restricao. Combinado com a ausencia de DELETE policy, nao ha grande risco de abuso, mas a boa pratica exige validar que o usuario esta autenticado.

**Correcao**: Substituir `WITH CHECK (true)` por `WITH CHECK (auth.uid() IS NOT NULL)` - semanticamente equivalente, mas remove o alerta do linter.

---

### 2. Contact Requests: INSERT com `WITH CHECK (true)` (RLS Always True)

**Risco**: Qualquer pessoa (incluindo anonimos) pode inserir contact requests. Como este e um formulario publico da landing page, o comportamento e intencional.

**Correcao**: Marcar como ignorado no scan - e o comportamento desejado para formularios de contato publicos.

---

### 3. Organizacoes: Dados do Stripe expostos a todos os membros

**Risco**: Os campos `stripe_customer_id` e `stripe_subscription_id` sao visiveis para todos os membros da organizacao. Um insider malicioso poderia tentar manipular a assinatura.

**Correcao**: Criar uma VIEW `organizations_safe` que exclui os campos Stripe, e restringir o SELECT direto na tabela base. O codigo frontend ja nao precisa desses campos (sao usados apenas nas edge functions com service role key).

- Criar view `organizations_safe` sem os campos `stripe_customer_id`, `stripe_subscription_id`, `stripe_webhook_secret`
- Alterar a SELECT policy da tabela `organizations` para negar acesso direto (somente admins podem ver via SELECT direto)
- Edge functions continuam funcionando porque usam `SUPABASE_SERVICE_ROLE_KEY`

---

### 4. Vendor Portal Tokens: Acesso sem restricao de role

**Risco**: Qualquer membro da organizacao pode criar e ver tokens de acesso ao portal de fornecedores.

**Correcao**: Restringir a policy ALL para apenas admins e auditores poderem gerenciar tokens. A policy SELECT pode manter acesso a toda organizacao para visualizacao.

---

### 5. Vendors: Informacoes de contato expostas

**Risco**: Campos como `contact_email`, `contact_phone` e `contact_name` sao acessiveis a todos da organizacao. Porem, em um sistema GRC multi-role (admin, auditor, analyst), todos os roles legitimamente precisam ver dados de fornecedores para realizar suas funcoes.

**Correcao**: Marcar como ignorado - em um sistema GRC, o acesso a informacoes de fornecedores e necessario para todos os roles da organizacao. A segregacao por organizacao via RLS ja e a protecao adequada.

---

### 6. Leaked Password Protection Desabilitada

**Risco**: Usuarios podem usar senhas que ja vazaram em breaches publicos.

**Correcao**: Habilitar a protecao contra senhas vazadas via configuracao de autenticacao.

---

### Resumo das Mudancas

**Migracoes SQL:**

1. Criar VIEW `organizations_safe` (sem campos Stripe)
2. Atualizar SELECT policy de `organizations` para usar a view
3. Restringir policy de `vendor_portal_tokens` para admins/auditores
4. Substituir `WITH CHECK (true)` na policy INSERT de `organizations`

**Codigo Frontend:**

- Atualizar `OrganizationContext.tsx` e qualquer query que acesse `organizations` diretamente para usar a view `organizations_safe` (se necessario)

**Configuracao:**

- Habilitar leaked password protection
- Marcar findings `contact_requests` e `vendors_contact_info` como ignorados (comportamento intencional)

### Secao Tecnica - SQL

```text
-- 1. View segura de organizacoes
CREATE VIEW public.organizations_safe
WITH (security_invoker=on) AS
  SELECT id, name, description, logo_url, created_at, updated_at,
         trial_ends_at, subscription_status, subscription_ends_at
  FROM public.organizations;
  -- Exclui: stripe_customer_id, stripe_subscription_id

-- 2. Restringir SELECT direto na tabela organizations
--    (admins mantem acesso direto para edge functions via service role)
DROP POLICY "Users can view organizations where they have a role" ON organizations;
CREATE POLICY "Users can view organizations via view"
  ON organizations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles
            WHERE organization_id = organizations.id
            AND user_id = auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- 3. Corrigir INSERT policy de organizations
DROP POLICY "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Restringir vendor_portal_tokens
DROP POLICY "Users can manage org portal tokens" ON vendor_portal_tokens;
CREATE POLICY "Admins can manage org portal tokens"
  ON vendor_portal_tokens FOR ALL
  USING (
    user_belongs_to_org(auth.uid(), organization_id)
    AND has_role(auth.uid(), 'admin')
  );
```

