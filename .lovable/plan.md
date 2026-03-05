

# Resultado da Análise: Lacunas no Plano Atual

Analisei integralmente o texto oficial das 3 resoluções (85/2021, 368/2024 e 538/2025) e comparei com os 31 controles do plano. O plano tem lacunas significativas introduzidas pela **Resolução BCB 538/2025** (vigente desde dez/2025, prazo de adequação até mar/2026).

## Controles que ESTAO contemplados corretamente (21 de 31)

Art.1, Art.2, Art.3-I, Art.3-II, Art.3-IV, Art.3-V, Art.3-VI, Art.3-VII, Art.4, Art.5, Art.6, Art.7, Art.8, Art.9, Art.11, Art.12, Art.13, Art.14, Art.15, Art.16, Art.17

## Controles que PRECISAM de ajuste

| # | No plano | Problema |
|---|----------|----------|
| 5 | Art.3-III | OK mas descrição genérica — deve citar "rastreabilidade de transações" e "trilhas de auditoria" conforme §7º adicionado pela 538 |
| 10 | Art.3§2 | **Insuficiente** — o plano trata como 1 controle, mas a Res. 538 detalhou 14 incisos obrigatórios (I-XIV) que merecem controles individuais |
| 17 | Art.10 | **Não existe** na Res. 85 — o Art.10 foi revogado. A revisão anual está no Art.9 e Art.6 |
| 26 | Art.18 | OK (exceções para câmaras) |

## Controles TOTALMENTE AUSENTES (adicionados pela Res. 538/2025)

| # | Artigo | Conteúdo | Criticidade |
|---|--------|----------|-------------|
| 1 | Art.3§2-I | Autenticação | critico |
| 2 | Art.3§2-II | Mecanismos de criptografia | critico |
| 3 | Art.3§2-III | Prevenção e detecção de intrusão | critico |
| 4 | Art.3§2-IV | Prevenção de vazamento de informações | critico |
| 5 | Art.3§2-V | Proteção contra softwares maliciosos | critico |
| 6 | Art.3§2-VI | Mecanismos de rastreabilidade | alto |
| 7 | Art.3§2-VII | Gestão de cópias de segurança (backup) | alto |
| 8 | Art.3§2-VIII | Avaliação e correção de vulnerabilidades | critico |
| 9 | Art.3§2-IX | Controles de acesso | critico |
| 10 | Art.3§2-X | Perfis de configuração segura de ativos | alto |
| 11 | Art.3§2-XI | Proteção da rede | critico |
| 12 | Art.3§2-XII | Gestão de certificados digitais | alto |
| 13 | Art.3§2-XIII | Segurança na integração de sistemas (APIs) | alto |
| 14 | Art.3§2-XIV | Inteligência cibernética (Deep/Dark Web) | alto |
| 15 | Art.3§6 | Verificação de sistemas adquiridos de terceiros | medio |
| 16 | Art.3§7 | Rastreabilidade de transações (trilhas de auditoria, logs, retenção) | alto |
| 17 | Art.3§8 | Testes de vulnerabilidades (varreduras, intrusão, correção) | critico |
| 18 | Art.3§9 | Controles de acesso detalhados (MFA, revisão, dispositivos) | critico |
| 19 | Art.3§10 | Configuração segura (ciclo de vida, patches, senhas padrão) | alto |
| 20 | Art.3§11 | Proteção de rede detalhada (segmentação, firewall, VPN, horário) | critico |
| 21 | Art.3§12 | Gestão de certificados digitais detalhada | alto |
| 22 | **Art.3-A** | **Requisitos adicionais RSFN/Pix/STR** (MFA, isolamento, certificados, integridade, vedações) | critico |
| 23 | **Art.22-A** | **Testes de intrusão** (periodicidade anual, independência, documentação) | critico |
| 24 | **Art.22-B** | **RSFN como serviço relevante** para contratação de nuvem | alto |
| 25 | Art.23-X | Retenção de documentação de testes de intrusão | medio |

## Controle a REMOVER

| Artigo | Motivo |
|--------|--------|
| Art.10 | Não existe na Res. 85. Revisão anual já coberta pelo Art.9 + Art.6 |
| Art.24 | Foi revogado pela Res. 368/2024 |

## Plano Revisado Proposto

O framework passaria de **31 para ~56 controles**, organizados em 6 categorias:

```text
Categoria                                    | Qtd
---------------------------------------------|----
Objeto e Escopo                              |  1
Política de Segurança Cibernética (Art.2-5)  | 10
Controles Técnicos Obrigatórios (Art.3§2-§12)| 21
Requisitos Adicionais RSFN/Pix (Art.3-A)     |  3
Plano de Ação e Resposta (Art.6-9)           |  4
Contratação de Serviços (Art.11-18)          |  8
Disposições Gerais (Art.19-23)               |  9
---------------------------------------------|----
Total                                        | 56
```

### Decisao necessaria: granularidade dos controles Art.3§2

Os 14 incisos do Art.3§2 podem ser tratados como:
- **14 controles individuais** (um por inciso) — mais granular, permite avaliação independente de cada domínio
- **1 controle agrupado** com sub-itens — mais simples, mas perde visibilidade

Recomendo a abordagem granular (14 individuais) porque cada inciso representa um domínio técnico distinto (autenticação vs. criptografia vs. proteção de rede) que será avaliado de forma independente na prática.

### Alteracoes na migracao SQL

1. Remover Art.10 e Art.24 (inexistentes)
2. Expandir Art.3§2 de 1 para 14 controles
3. Adicionar Art.3§§6-12 (7 controles de detalhamento)
4. Adicionar Art.3-A (requisitos RSFN/Pix/STR)
5. Adicionar Art.22-A (testes de intrusão)
6. Adicionar Art.22-B (RSFN como serviço relevante)
7. Adicionar Art.23-X (retenção de testes)
8. Ajustar descrições dos controles existentes para refletir redação atualizada pela 368/2024

### Sem alteracao nos arquivos de codigo

A lista de arquivos TypeScript a alterar permanece a mesma (FrameworkContext, SelecionarFramework, AppSidebar, Mapeamento, MappingCard, MappingMatrix, PolicyTemplates). Apenas a migração SQL muda.

