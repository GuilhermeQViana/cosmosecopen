

# Plano: Melhorar Formulario de Contato da Landing Page

## Objetivo
Melhorar o formulario de contato na CTASection da landing page para incluir todos os campos disponiveis (cargo, tamanho da empresa, como conheceu, mensagem) e garantir que todos funcionem corretamente com o envio de emails.

---

## Situacao Atual

### Formulario Atual (CTASection)
O formulario atual tem apenas 3 campos:
- Nome completo
- Email corporativo
- Empresa

### Campos Disponiveis (Tabela + Edge Function)
A tabela `contact_requests` e a Edge Function `send-contact-notification` ja suportam:
- `name` (obrigatorio)
- `email` (obrigatorio)
- `company` (obrigatorio)
- `role` (opcional)
- `company_size` (opcional)
- `how_found` (opcional)
- `message` (opcional)

---

## Mudancas Planejadas

### 1. Expandir Campos do Formulario

Adicionar os campos opcionais que ja estao configurados no backend:

| Campo | Tipo | Placeholder |
|-------|------|-------------|
| Nome | Input | Seu nome |
| Email | Input (email) | seu@empresa.com |
| Empresa | Input com icone | Nome da empresa |
| Cargo | Input | Ex: CISO, Gerente de TI |
| Tamanho | Select | 1-50, 51-200, 201-500, 501-1000, 1000+ |
| Como conheceu | Select | Google, LinkedIn, Indicacao, Evento, Outro |
| Mensagem | Textarea | Conte-nos sobre sua necessidade... |

### 2. Layout Responsivo

Organizar campos em grid de 2 colunas no desktop:
- Linha 1: Nome + Email
- Linha 2: Empresa + Cargo  
- Linha 3: Tamanho + Como conheceu
- Linha 4: Mensagem (full width)
- Linha 5: Botao + Aviso

### 3. Melhorias Visuais

- Adicionar estilo de fundo consistente nos inputs (`bg-muted/50` ou similar para melhor contraste)
- Manter icone no campo Empresa (Building2)
- Aplicar validacao visual para campos obrigatorios (asterisco)
- Manter efeito de glow no hover/focus

---

## Arquivo a Modificar

`src/components/landing/CTASection.tsx`

### Mudancas no State
Expandir formData para incluir todos os campos:

```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  company: '',
  role: '',
  company_size: '',
  how_found: '',
  message: '',
});
```

### Mudancas no handleSubmit
Enviar todos os campos para o banco e para a Edge Function:

```typescript
// Save to database
const { error } = await supabase
  .from('contact_requests')
  .insert({
    name: formData.name,
    email: formData.email,
    company: formData.company,
    role: formData.role || null,
    company_size: formData.company_size || null,
    how_found: formData.how_found || null,
    message: formData.message || null,
  });

// Send email notification with all fields
const { error: emailError } = await supabase.functions.invoke('send-contact-notification', {
  body: {
    name: formData.name,
    email: formData.email,
    company: formData.company,
    role: formData.role || undefined,
    company_size: formData.company_size || undefined,
    how_found: formData.how_found || undefined,
    message: formData.message || undefined,
  },
});
```

### Novos Imports Necessarios
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
```

---

## Layout Final do Card de Formulario

```text
┌─────────────────────────────────────────────────┐
│ [Icon] Fale com Especialista                    │
│         Resposta em ate 24h uteis               │
├─────────────────────────────────────────────────┤
│ Nome completo *      │  Email corporativo *     │
│ [_______________]    │  [___________________]   │
├─────────────────────────────────────────────────┤
│ Empresa *            │  Cargo                   │
│ [🏢 ____________]    │  [___________________]   │
├─────────────────────────────────────────────────┤
│ Tamanho da empresa   │  Como nos conheceu?      │
│ [Selecione      ▼]   │  [Selecione         ▼]   │
├─────────────────────────────────────────────────┤
│ Mensagem (opcional)                             │
│ [                                            ]  │
│ [                                            ]  │
│ [____________________________________________]  │
├─────────────────────────────────────────────────┤
│        [✈ Agendar Demonstracao]                 │
│   Ao enviar, voce concorda com nossa            │
│        Politica de Privacidade                  │
└─────────────────────────────────────────────────┘
```

---

## Estilos Adicionais

### Inputs com Melhor Contraste
```typescript
className="bg-muted/50 border-input/50 focus:border-primary"
```

### Campos Obrigatorios
Adicionar asterisco vermelho nos Labels:
```typescript
<Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
```

---

## Edge Function - Ja Compativel

A Edge Function `send-contact-notification` ja suporta todos os campos:

```typescript
interface ContactRequest {
  name: string;
  email: string;
  company: string;
  role?: string;
  company_size?: string;
  how_found?: string;
  message?: string;
}
```

O email enviado ja exibe todos esses campos corretamente.

---

## Resumo das Alteracoes

| Arquivo | Acao |
|---------|------|
| `src/components/landing/CTASection.tsx` | Expandir formulario com todos os campos |

---

## Resultado Esperado

- Formulario completo com todos os campos disponiveis
- Layout responsivo em 2 colunas (desktop) / 1 coluna (mobile)
- Campos obrigatorios claramente identificados
- Todos os dados salvos no banco e enviados por email
- Visual consistente com a identidade CosmoSec
- Melhor qualificacao dos leads com informacoes adicionais

