

# Plano: Posicionar CosmoSec para Empresas + Auditores/Consultores

## Visao Geral

Transformar a landing page da CosmoSec de uma proposta focada apenas em empresas para uma plataforma de dois lados: **empresas que precisam de GRC** e **consultores/auditores que gerenciam multiplos clientes**. Isso amplia o mercado enderecavel e cria um canal de aquisicao organico (consultores trazem seus clientes).

---

## 1. HeroSection - Subtitulo Abrangente

**Arquivo:** `src/components/landing/HeroSection.tsx`

**O que muda:**
- Subtitulo atual: *"A plataforma GRC + VRM que une governanca de seguranca e gestao de terceiros em um so lugar."*
- Novo subtitulo: *"A plataforma GRC + VRM para empresas, consultorias e auditores que precisam dominar conformidade de ponta a ponta."*
- Indicador de confianca (linha 75) atualizado para incluir uma referencia a multi-organizacao:
  - Atual: `Conformidade com NIST CSF 2.0 - ISO 27001:2022 - BCB/CMN 4.893`
  - Novo: `NIST CSF 2.0 - ISO 27001:2022 - BCB/CMN 4.893 - Multi-organizacoes`

**Impacto:** 2 linhas alteradas. Sem mudanca estrutural.

---

## 2. Navbar - Novo Link "Para Quem"

**Arquivo:** `src/components/landing/Navbar.tsx`

**O que muda:**
- Adicionar item ao array `navLinks` (linha 21-25):

```typescript
const navLinks = [
  { href: '#platform', label: 'Plataforma' },
  { href: '#audience', label: 'Para Quem' },  // NOVO
  { href: '/tour', label: 'Recursos', isRoute: true },
  { href: '#contact', label: 'Contato' },
];
```

**Impacto:** 1 linha adicionada. Funciona automaticamente no mobile e desktop porque o render ja itera sobre `navLinks`.

---

## 3. PlatformSection - Quarto Pilar "Consultoria & Auditoria"

**Arquivo:** `src/components/landing/PlatformSection.tsx`

**O que muda:**
- Adicionar um quarto item ao array `platforms` (apos linha 81):

```typescript
{
  id: 'consultoria',
  icon: ClipboardCheck,  // novo import do Lucide
  title: 'Consultoria & Auditoria',
  description: 'Gerencie multiplos clientes em um unico painel com padronizacao e escalabilidade.',
  features: [
    'Painel multi-organizacoes',
    'Relatorios com branding personalizado',
    'Templates de diagnostico reutilizaveis',
    'Trilha de auditoria por cliente',
  ],
  gradient: 'from-emerald-500 to-teal-500',
  screenshots: [],
}
```

- Alterar o grid de `md:grid-cols-3` para `md:grid-cols-2 lg:grid-cols-4` (linha 109) para acomodar 4 cards mantendo responsividade.
- Atualizar subtitulo da secao (linha 103-104) para:
  *"Consolide sua governanca de seguranca, gestao de fornecedores e operacoes de consultoria em uma unica solucao."*

**Impacto:** ~20 linhas adicionadas, 2 linhas modificadas. Novo import `ClipboardCheck`.

---

## 4. Nova Secao: AudienceSection - "Para Quem e a CosmoSec?"

**Novo arquivo:** `src/components/landing/AudienceSection.tsx`

**Posicao no fluxo:** Entre `TrustSection` e `ROICalculatorSection` (atualizar `src/pages/Landing.tsx`).

**Estrutura do componente:**

Secao com id `audience` contendo:
- Header com badge "Para Quem" e titulo *"Uma plataforma, dois perfis"*
- Grid de 2 colunas (desktop) com dois cards principais:

**Card 1 - Para Empresas:**
- Icone: `Building2`
- Titulo: "Para sua empresa"
- Subtitulo: "Controle interno de conformidade e fornecedores"
- Lista de beneficios (5 itens):
  - Diagnostico completo de frameworks (NIST, ISO, BCB)
  - Gestao centralizada de riscos e evidencias
  - Avaliacao e monitoramento de fornecedores
  - Planos de acao automatizados com IA
  - Preparacao continua para auditorias externas
- Badge: "GRC + VRM"
- CTA: Botao "Agendar Demonstracao" -> scroll para #contact

**Card 2 - Para Consultorias & Auditores:**
- Icone: `UserCheck`
- Titulo: "Para sua consultoria"
- Subtitulo: "Gerencie multiplos clientes com escalabilidade"
- Lista de beneficios (5 itens):
  - Painel consolidado multi-cliente
  - Relatorios PDF com branding da sua consultoria
  - Templates de diagnostico padronizados e reutilizaveis
  - Visao comparativa de maturidade entre clientes
  - Programa de parceiros com condicoes especiais
- Badge: "Programa de Parceiros"
- CTA: Botao "Conhecer Programa" -> scroll para #contact

**Estilos visuais:**
- Efeito nebula de fundo consistente com outras secoes
- Cards com glassmorphism (`bg-card/60 backdrop-blur-sm border-primary/20`)
- Hover com glow effect (`hover:shadow-[0_0_40px_hsl(var(--secondary)/0.15)]`)
- Icones dos beneficios com `CheckCircle2` em cor `text-secondary`
- Badges com estilo cosmic (primary/secondary)

**Estimativa:** ~180 linhas de codigo.

---

## 5. Landing.tsx - Integrar AudienceSection

**Arquivo:** `src/pages/Landing.tsx`

**O que muda:**
- Adicionar import: `import { AudienceSection } from '@/components/landing/AudienceSection';`
- Inserir `<AudienceSection />` entre `<TrustSection />` e `<ROICalculatorSection />`

Fluxo final da pagina:
1. Hero
2. Platform (com 4o pilar)
3. Trust
4. **Audience (NOVO)**
5. ROI Calculator
6. CTA (com campo de tipo de interesse)
7. FAQ (com novas perguntas)

---

## 6. FAQSection - 2 Novas Perguntas

**Arquivo:** `src/components/landing/FAQSection.tsx`

**O que muda:** Adicionar 2 objetos ao array `faqs` (apos linha 33):

```typescript
{
  question: 'A CosmoSec funciona para consultorias e auditores externos?',
  answer: 'Sim. A plataforma permite gerenciar multiplas organizacoes em um unico 
  painel, ideal para consultores que atendem varios clientes. Voce pode padronizar 
  diagnosticos, gerar relatorios com a identidade da sua consultoria e manter trilha 
  de auditoria separada por cliente.',
},
{
  question: 'Existe um programa de parceiros?',
  answer: 'Sim. Consultores, auditores e empresas de tecnologia podem se cadastrar 
  no nosso programa de parceiros para obter condicoes comerciais especiais, suporte 
  prioritario, materiais de co-marketing e acesso antecipado a novos recursos. 
  Entre em contato pelo formulario para saber mais.',
},
```

**Impacto:** ~14 linhas adicionadas. Total de FAQs passa de 6 para 8.

---

## 7. CTASection - Campo "Tipo de Interesse"

**Arquivo:** `src/components/landing/CTASection.tsx`

**O que muda:**

### 7a. Novo array de opcoes (apos HOW_FOUND_OPTIONS, linha 27):
```typescript
const INTEREST_TYPES = [
  { value: 'empresa', label: 'Quero para minha empresa' },
  { value: 'consultoria', label: 'Quero para minha consultoria/auditoria' },
  { value: 'parceiro', label: 'Quero ser parceiro' },
];
```

### 7b. Expandir formData (linha 79-87):
Adicionar `interest_type: ''` ao estado inicial.

### 7c. Novo campo Select no formulario:
Inserir entre a Row 2 (Empresa + Cargo) e a Row 3 (Tamanho + Como conheceu) um novo campo de largura total:

```typescript
{/* Tipo de Interesse */}
<div className="space-y-2">
  <Label htmlFor="interest_type">
    Tipo de interesse <span className="text-destructive">*</span>
  </Label>
  <Select 
    value={formData.interest_type} 
    onValueChange={(value) => setFormData({ ...formData, interest_type: value })}
  >
    <SelectTrigger id="interest_type" className="bg-muted/50">
      <SelectValue placeholder="Selecione o tipo de interesse" />
    </SelectTrigger>
    <SelectContent>
      {INTEREST_TYPES.map((type) => (
        <SelectItem key={type.value} value={type.value}>
          {type.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### 7d. Atualizar handleSubmit:
- Incluir `interest_type` no insert do banco e no body da Edge Function.
- Adicionar validacao: `interest_type` passa a ser obrigatorio junto com nome, email e empresa.

### 7e. Atualizar reset do form:
Adicionar `interest_type: ''` ao reset apos envio bem-sucedido.

---

## 8. Migracao de Banco - Nova Coluna

**Tabela:** `contact_requests`

**SQL:**
```sql
ALTER TABLE contact_requests ADD COLUMN interest_type TEXT;
```

Nenhuma RLS precisa ser alterada pois a politica de INSERT ja permite `true` para todos.

---

## 9. Edge Function - Incluir interest_type no Email

**Arquivo:** `supabase/functions/send-contact-notification/index.ts`

**O que muda:**

### 9a. Atualizar interface (linha 11-19):
Adicionar `interest_type?: string;` a `ContactRequest`.

### 9b. Novo mapeamento de labels (apos linha 27):
```typescript
const INTEREST_TYPE_LABELS: Record<string, string> = {
  empresa: 'Para minha empresa',
  consultoria: 'Para minha consultoria/auditoria',
  parceiro: 'Quero ser parceiro',
};
```

### 9c. Adicionar variavel (apos linha 44):
```typescript
const interestTypeLabel = contactData.interest_type 
  ? INTEREST_TYPE_LABELS[contactData.interest_type] || contactData.interest_type 
  : 'Nao informado';
```

### 9d. Adicionar linha na tabela HTML do email (apos o bloco de "Como Conheceu", linha ~115):
```html
<tr>
  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
    <strong style="...">Tipo de Interesse</strong><br>
    <span style="...">${interestTypeLabel}</span>
  </td>
</tr>
```

### 9e. Atualizar subject do email para diferenciar parceiros:
```typescript
subject: `${contactData.interest_type === 'parceiro' ? '🤝' : '🚀'} Nova Solicitacao ${contactData.interest_type === 'parceiro' ? 'de Parceria' : 'de Demo'}: ${contactData.company}`,
```

---

## Resumo de Arquivos

| Arquivo | Acao | Linhas estimadas |
|---------|------|-----------------|
| `src/components/landing/HeroSection.tsx` | Atualizar subtitulo e indicador | ~3 linhas |
| `src/components/landing/Navbar.tsx` | Adicionar link "Para Quem" | ~1 linha |
| `src/components/landing/PlatformSection.tsx` | Adicionar 4o pilar + ajustar grid | ~22 linhas |
| `src/components/landing/AudienceSection.tsx` | **CRIAR** secao "Para Quem" | ~180 linhas |
| `src/pages/Landing.tsx` | Importar e inserir AudienceSection | ~2 linhas |
| `src/components/landing/FAQSection.tsx` | Adicionar 2 perguntas | ~14 linhas |
| `src/components/landing/CTASection.tsx` | Adicionar campo interest_type | ~30 linhas |
| `supabase/functions/send-contact-notification/index.ts` | Incluir interest_type no email | ~20 linhas |
| **Migracao SQL** | Adicionar coluna `interest_type` | 1 statement |

---

## Ordem de Implementacao

1. Migracao de banco (prerequisito para o formulario funcionar)
2. Edge Function (atualizar para receber o novo campo)
3. HeroSection (mudanca rapida de texto)
4. Navbar (adicionar link)
5. PlatformSection (novo pilar)
6. AudienceSection (criar componente novo)
7. Landing.tsx (integrar AudienceSection)
8. FAQSection (novas perguntas)
9. CTASection (novo campo no formulario)

---

## Resultado Esperado

- Landing page que fala diretamente para dois publicos distintos
- Secao dedicada "Para Quem" com beneficios especificos para cada perfil
- Quarto pilar na plataforma destacando capacidades de consultoria
- Formulario que qualifica leads por tipo de interesse (empresa vs consultoria vs parceiro)
- Email de notificacao diferenciado por tipo de interesse
- FAQ atualizado com respostas para consultores
- Identidade visual CosmoSec mantida (cosmic theme, glassmorphism, gradients, Space Grotesk)

