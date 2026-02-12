

## Melhorias de Funcionalidade e Design para a Agenda de Reavaliações

### Problemas Atuais (baseado no screenshot)
- Calendario ocupa muito espaco vazio a esquerda sem informacoes contextuais
- Lista de reavaliacoes a direita e basica demais (so nome + dias)
- Falta de resumo rapido (quantas atrasadas, proximas, etc.)
- Nao ha como agendar rapidamente sem clicar em um fornecedor existente
- Falta criticidade do fornecedor na lista
- Ao clicar em um dia no calendario nao filtra a lista

---

### Melhorias Propostas

#### 1. Mini-cards de resumo no topo (3 indicadores compactos inline)
Adicionar uma faixa com 3 indicadores compactos horizontais logo abaixo do header:
- **Atrasadas** (vermelho) com contagem
- **Proximos 30 dias** (amarelo) com contagem  
- **Total agendadas** (verde) com contagem

Serao badges/chips inline, nao cards grandes -- mantendo a simplicidade.

#### 2. Calendario interativo com filtro por dia
- Ao clicar em um dia que tem reavaliacao marcada, a lista lateral filtra para mostrar apenas os fornecedores daquele dia
- Adicionar um botao "Limpar filtro" quando um dia esta selecionado
- Mostrar um ponto colorido nos dias com reavaliacoes (ja existe parcialmente com modifiers)

#### 3. Lista de reavaliacoes aprimorada
- Adicionar badge de **criticidade** do fornecedor (Critica/Alta/Media/Baixa) ao lado do nome
- Adicionar a **categoria** do fornecedor como texto secundario
- Mostrar icone de status diferente para overdue (alerta) vs agendado (calendario)
- Botao "Agendar novo" no topo da lista para fornecedores sem agenda

#### 4. Botao "Agendar Reavaliacao" no header
- Adicionar um botao primario "Nova Reavaliacao" no header da pagina (ao lado de "Ver Fornecedores")
- Abre um dialog com dropdown para selecionar o fornecedor + calendario para selecionar data
- Permite agendar rapidamente sem precisar navegar ate o detalhe

#### 5. Melhorias visuais
- Aplicar glassmorphism sutil nos cards (consistente com identidade CosmoSec)
- Melhorar o contraste das badges de dias restantes com cores mais definidas
- Adicionar transicoes suaves na lista ao filtrar
- Calendario ocupar menos espaco vertical (remover borda interna duplicada)

---

### Detalhes Tecnicos

**Arquivos alterados:**

1. **`src/pages/VendorAgenda.tsx`**
   - Adicionar botao "Nova Reavaliacao" no header
   - Passar callback para o componente filho abrir o dialog de agendamento

2. **`src/components/fornecedores/VendorReassessmentSchedule.tsx`**
   - Adicionar faixa de mini-indicadores (3 chips) acima do grid
   - Implementar filtro por dia: estado `filterDate`, ao clicar no calendario filtrar a lista
   - Enriquecer `renderVendorRow` com badge de criticidade e categoria
   - Adicionar botao "Agendar novo" no card da lista que abre dialog com Select de fornecedor
   - Melhorar estilos: glassmorphism nos cards, remover borda duplicada do calendario
   - Adicionar icones diferenciados para overdue (AlertTriangle) vs agendado (CalendarCheck)

### Sequencia de implementacao
1. Indicadores compactos no topo
2. Botao "Nova Reavaliacao" com dialog completo (select + calendario)
3. Filtro por dia no calendario
4. Enriquecer rows da lista (criticidade, categoria, icones)
5. Ajustes visuais e transicoes

