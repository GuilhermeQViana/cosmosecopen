

# Plano: Criar Controles Padrão para Avaliação de Fornecedores

## Problema
As tabelas `vendor_assessment_domains` e `vendor_requirements` estão vazias, por isso o formulário de avaliação abre sem nenhum requisito.

## Solução
Executar uma migração SQL para inserir:

1. **4 domínios** de avaliação:
   - Segurança da Informação (`seg_info`)
   - Cybersegurança (`cyber`)
   - Privacidade e Proteção de Dados (`privacy`)
   - Gestão de Continuidade de Negócios (`bcn`)

2. **~40 requisitos** distribuídos entre os domínios, cobrindo temas como:

   **Segurança da Informação (~12):** Política de SI, Gestão de Acessos, Classificação de Dados, Criptografia, Gestão de Vulnerabilidades, Segurança Física, Backup, Logs e Monitoramento, Gestão de Incidentes, Conscientização, Segregação de Funções, Gestão de Ativos

   **Cybersegurança (~10):** Firewall/IDS/IPS, Antimalware, Segurança de Endpoints, Segurança de Rede, Testes de Intrusão, SOC/SIEM, Patch Management, Autenticação Multifator, Segurança em Nuvem, Resposta a Incidentes Cyber

   **Privacidade (~10):** Programa de Privacidade, Mapeamento de Dados Pessoais, Base Legal, Consentimento, DSAR, DPIA, DPO, Compartilhamento com Terceiros, Retenção de Dados, Transferência Internacional

   **GCN (~8):** Plano de Continuidade, Análise de Impacto (BIA), Plano de Recuperação (DRP), Testes de Continuidade, Gestão de Crises, Comunicação de Crise, Resiliência de TI, Cadeia de Suprimentos

Cada requisito terá peso (1-3), exemplos de evidência e descrição.

## Arquivos impactados

| Recurso | Ação |
|---------|------|
| Migração SQL | Criar — inserir domínios e requisitos padrão |

Nenhuma alteração de código necessária — o `VendorAssessmentForm` já consome esses dados via `useVendorRequirementsByDomain`.

