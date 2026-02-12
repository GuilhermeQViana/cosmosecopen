

## Simplificar a Agenda de Reavaliacao

### Problema Atual
A pagina de reavaliacao possui muitos elementos visuais: 4 cards de estatisticas, um calendario completo, uma lista de proximas reavaliacoes, uma secao de fornecedores sem agenda e um dialog com calendario para agendar. Isso torna a experiencia pesada e complexa.

### Solucao
Simplificar o componente `VendorReassessmentSchedule.tsx` mantendo apenas o essencial:

1. **Remover os 4 cards de estatisticas** no topo (atrasadas, proximos 30 dias, agendadas, sem agenda) - informacao redundante com a lista
2. **Manter o calendario** mas em tamanho compacto
3. **Unificar a lista**: juntar "proximas reavaliacoes" e "sem agenda" em uma unica lista com tabs ou separacao visual simples
4. **Simplificar o dialog de agendamento**: remover o card de "frequencia sugerida" e deixar apenas o seletor de data com um botao de salvar

### Layout Simplificado

```text
+------------------------------------------+
| Calendario (compacto)  |  Lista unica    |
|                        |  - Atrasadas    |
|                        |  - Agendadas    |
|                        |  - Sem agenda   |
+------------------------------------------+
```

### Detalhes Tecnicos

**Arquivo:** `src/components/fornecedores/VendorReassessmentSchedule.tsx`

1. Remover o bloco `grid grid-cols-2 md:grid-cols-4` com os 4 stat cards (linhas 135-191)
2. Unificar todas as listas em um unico card com secoes visuais (atrasadas em vermelho, agendadas normal, sem agenda em amarelo)
3. Simplificar o dialog removendo o card de frequencia sugerida e deixando apenas calendario + botao
4. Manter toda a logica de agendamento funcional (handleSchedule, openScheduleDialog)

