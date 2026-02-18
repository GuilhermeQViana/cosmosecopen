

# Plano de Negocios e Atualizacao da Landing Page

## Parte 1: Plano de Negocios -- CosmoSec como Consultoria + Ferramenta

### Novo Posicionamento

A CosmoSec deixa de ser uma "plataforma SaaS vendida para empresas e consultorias externas" e passa a ser uma **empresa de consultoria em seguranca da informacao e conformidade** que possui uma **ferramenta proprietaria** como diferencial competitivo.

### Modelo de Receita (Duas Ofertas)

```text
+--------------------------------------------------+
|              CosmoSec Consultoria                 |
+--------------------------------------------------+
|                                                    |
|  OFERTA 1: Consultoria + Plataforma               |
|  - Diagnostico conduzido por especialistas         |
|  - Implementacao de frameworks (NIST, ISO, BCB)    |
|  - Gestao de riscos de terceiros (VRM)             |
|  - Criacao e revisao de politicas                  |
|  - Acesso completo a plataforma CosmoSec           |
|  - Acompanhamento continuo                         |
|  - Relatorios executivos periodicos                |
|                                                    |
|  OFERTA 2: Plataforma (SaaS Standalone)            |
|  - Acesso a plataforma CosmoSec                    |
|  - Onboarding assistido                            |
|  - Suporte tecnico                                 |
|  - Sem servico de consultoria                      |
|  - Para empresas com equipe interna de GRC         |
|                                                    |
+--------------------------------------------------+
```

### Publico-Alvo Revisado

- **Empresas que precisam de consultoria completa** (nao tem equipe GRC interna): Oferta 1
- **Empresas com equipe GRC propria** (querem apenas a ferramenta): Oferta 2
- **Removido**: Consultorias externas e programa de parceiros

### Proposta de Valor Diferenciada

1. **"Nao vendemos apenas software. Entregamos conformidade."** -- a consultoria usa a propria ferramenta para entregar resultados, criando um diferencial unico vs concorrentes que vendem so software ou so consultoria.
2. A plataforma nao e um produto isolado -- ela e a **prova de competencia** da consultoria.
3. Clientes de consultoria recebem acesso a plataforma como parte do servico.

### Faixas de Preco Sugeridas

| Oferta | Modelo | Faixa Estimada |
|---|---|---|
| Consultoria + Plataforma | Contrato anual + fee mensal | R$ 5.000 - R$ 25.000/mes (conforme escopo) |
| Plataforma Standalone | Assinatura mensal/anual | R$ 1.500 - R$ 4.500/mes (conforme porte) |

### Estrutura de Servicos da Consultoria

1. **Assessment Inicial**: Diagnostico de maturidade usando a plataforma
2. **Roadmap de Conformidade**: Plano estrategico com prioridades e prazos
3. **Implementacao**: Configuracao de frameworks, politicas e controles
4. **Gestao Contínua**: Monitoramento, relatorios periodicos, reavaliacao de riscos
5. **Auditoria Interna**: Preparacao para auditorias externas
6. **VRM como Servico**: Due diligence e gestao de fornecedores

---

## Parte 2: Atualizacao da Landing Page

### Mudancas Necessarias

#### 1. HeroSection -- Novo headline e subtitulo

**De:** "Nao Gerencie Compliance. Domine." + foco em plataforma
**Para:** Posicionar como consultoria com tecnologia proprietaria

- Novo headline: "Consultoria em GRC com Tecnologia Propria."
- Novo subtitulo: "Somos especialistas em conformidade e seguranca da informacao. Usamos nossa propria plataforma para entregar resultados -- ou disponibilizamos ela para sua equipe."
- CTAs: "Falar com Especialista" (primario) + "Conhecer a Plataforma" (secundario)

#### 2. AudienceSection -- Substituir "Empresas vs Consultorias" por "Consultoria vs Plataforma"

**De:** Cards "Para sua empresa" e "Para sua consultoria"
**Para:** Cards "Consultoria Completa" e "Plataforma SaaS"

- Card 1 (Consultoria): Beneficios do servico completo com especialistas
- Card 2 (Plataforma): Para quem ja tem equipe e quer apenas a ferramenta

#### 3. PlatformSection -- Remover modulo "Consultoria & Auditoria"

- Remover o 5o card ("Consultoria & Auditoria") que vendia funcionalidades para consultores externos
- Manter os 4 modulos da plataforma: GRC, VRM, Politicas, IA
- Layout passa de 3+2 para 2+2 (grade uniforme)

#### 4. CTASection (formulario de contato) -- Atualizar tipo de interesse

**De:** Opcoes "empresa / consultoria / parceiro"
**Para:** Opcoes "Quero consultoria completa" / "Quero apenas a plataforma" / "Quero saber mais"

#### 5. FAQSection -- Atualizar perguntas

- Remover FAQ sobre "programa de parceiros"
- Remover FAQ sobre "consultorias e auditores externos"
- Adicionar FAQ: "Qual a diferenca entre contratar a consultoria e apenas a plataforma?"
- Adicionar FAQ: "Posso comecar com a plataforma e depois contratar a consultoria?"

#### 6. ROICalculatorSection -- Sem mudanca significativa

A calculadora de ROI continua relevante para ambas as ofertas. Manter como esta.

#### 7. Footer -- Remover mencoes a parceiros

- Atualizar descricao de "Plataforma completa de GRC" para "Consultoria e plataforma de GRC"

#### 8. Navbar -- Atualizar link "Para Quem" label

- Renomear "Para Quem" para "Servicos"

#### 9. PricingSection -- Nao e usada na landing atual

A PricingSection existe no codigo mas nao e importada na Landing. Manter removida do fluxo.

#### 10. BenefitsSection -- Nao e usada na landing atual

Existe no codigo mas nao e importada. Manter removida.

### Resumo de Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/components/landing/HeroSection.tsx` | Novo headline, subtitulo e CTAs |
| `src/components/landing/AudienceSection.tsx` | Trocar "empresa/consultoria" por "consultoria/plataforma" |
| `src/components/landing/PlatformSection.tsx` | Remover modulo "Consultoria & Auditoria", ajustar grid para 2x2 |
| `src/components/landing/CTASection.tsx` | Atualizar opcoes de "interest_type" |
| `src/components/landing/ContactSection.tsx` | Sem campo interest_type, sem mudanca necessaria |
| `src/components/landing/FAQSection.tsx` | Substituir 2 FAQs por novas |
| `src/components/landing/Footer.tsx` | Atualizar descricao |
| `src/components/landing/Navbar.tsx` | Renomear "Para Quem" para "Servicos" |

### Ordem de Implementacao

1. HeroSection (maior impacto visual)
2. AudienceSection (reposicionamento estrategico)
3. PlatformSection (remover modulo consultoria externa)
4. CTASection + FAQSection (alinhamento de formulario e duvidas)
5. Navbar + Footer (ajustes finais)

