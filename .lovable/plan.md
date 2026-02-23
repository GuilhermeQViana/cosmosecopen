

# Plano: Mostrar variaveis de ambiente completas no passo 4

## Alteracao

### `src/components/landing/AudienceSection.tsx` (linha 58)

Substituir os valores placeholder pelas credenciais reais do projeto:

```
cp .env.example .env

# Edite o .env com:
VITE_SUPABASE_URL=https://hxxmuygywtazwcvavvtn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eG11eWd5d3RhendjdmF2dnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzE2MzIsImV4cCI6MjA4NzM0NzYzMn0.MxRExOCQP79oRwpiP-TehPE9uh1SQpma3aAjm93cKg0
VITE_SUPABASE_PROJECT_ID=hxxmuygywtazwcvavvtn
```

Isso permite que qualquer usuario copie e cole diretamente sem precisar procurar as credenciais.

**Nota:** A chave exibida e a anon key (publica), portanto e seguro exibi-la no frontend.

