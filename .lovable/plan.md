

# Plano: Criar Framework ISO 22301:2019 com Controles do PDF

## Resumo

Inserir o framework ISO 22301:2019 (SGCN) como framework padrão do sistema, com **~55 controles** extraídos diretamente do PDF fornecido, organizados pelas 7 seções da norma. Atualizar o frontend para reconhecer o novo código.

---

## 1. Migração SQL — Framework + Controles

Inserir na tabela `frameworks` (`is_custom = false`, `organization_id = NULL`):
- **code:** `iso_22301`
- **name:** ISO 22301:2019
- **version:** 2019
- **icon:** `shield-check`

Inserir **~55 controles** na tabela `controls`, distribuídos por categoria:

| Categoria (seção) | Qtd | Exemplos de controles |
|---|---|---|
| **4. Contexto da Organização** | 4 | 4.1 Contexto interno/externo, 4.2 Partes interessadas, 4.3 Escopo do SGCN, 4.4 Estabelecimento do SGCN |
| **5. Liderança** | 3 | 5.1 Liderança e comprometimento, 5.2 Política de CN, 5.3 Papéis e responsabilidades |
| **6. Planejamento** | 3 | 6.1 Riscos e oportunidades, 6.2 Objetivos de CN, 6.3 Planejamento de mudanças |
| **7. Apoio** | 5 | 7.1 Recursos, 7.2 Competência, 7.3 Conscientização, 7.4 Comunicação, 7.5 Informação documentada |
| **8. Operação** | ~25 | 8.1 Controles operacionais, 8.2 BIA (8 sub-requisitos) + Avaliação de riscos (3), 8.3 Estratégias e soluções (6 sub-requisitos + recursos), 8.4 Planos e procedimentos (equipes, comunicação, conteúdo dos planos, restauração), 8.5 Programa de exercícios (7 critérios), 8.6 Avaliação de capacidade (5) |
| **9. Avaliação de Desempenho** | ~10 | 9.1 Monitoramento e medição, 9.2 Auditoria interna (7 sub-requisitos), 9.3 Análise crítica pela direção (entradas a-k, saídas a-d) |
| **10. Melhoria** | 5 | 10.1 Não conformidade e ações corretivas (a-e + evidências), 10.2 Melhoria contínua |

Cada controle terá: `code`, `name`, `description` (texto extraído do PDF), `category`, `weight` (1-3), `order_index`.

**Critérios de peso:**
- **Peso 3** (crítico): BIA, Avaliação de riscos, Planos de CN, Programa de exercícios
- **Peso 2** (importante): Estratégias, Comunicação, Auditoria, Análise crítica
- **Peso 1** (suporte): Contexto, Recursos, Documentação, Competência

---

## 2. Atualizar FrameworkCode Type

**Arquivo:** `src/contexts/FrameworkContext.tsx` (linha 5)

Adicionar `'iso_22301'` ao union type:
```
export type FrameworkCode = 'nist_csf' | 'iso_27001' | 'bcb_cmn' | 'bcb_85' | 'bcb_265' | 'iso_22301';
```

---

## 3. Atualizar SelecionarFramework

**Arquivo:** `src/pages/SelecionarFramework.tsx`

- Adicionar cor (linha ~25): `iso_22301: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 text-indigo-500'`
- Adicionar descrição (linha ~35): `iso_22301: 'Sistema de Gestão de Continuidade de Negócios (SGCN) — requisitos para resiliência organizacional e recuperação de disrupções.'`

---

## Arquivos Impactados

| Recurso | Ação |
|---------|------|
| Migração SQL | Criar — framework + ~55 controles baseados no PDF |
| `src/contexts/FrameworkContext.tsx` | Editar — adicionar `iso_22301` ao type |
| `src/pages/SelecionarFramework.tsx` | Editar — cor e descrição |

