

## Aprimorar o Gerador de Politicas com IA - Mais Opcoes de Instrucoes

### Problema Atual

O dialog de geracao por IA possui apenas 3 campos: Setor, Nivel de Rigor e Instrucoes Adicionais (texto livre). Isso limita o controle do usuario sobre o conteudo gerado e exige que ele escreva manualmente detalhes que poderiam ser selecionaveis.

### Novos Campos Propostos

**1. Idioma da Politica** (Select)
- Portugues (Brasil) (padrao)
- Ingles
- Espanhol

**2. Porte da Empresa** (Select)
- Startup / Pequena empresa
- Media empresa
- Grande empresa / Corporacao
- Multinacional

**3. Frameworks de Referencia** (Multi-select com checkboxes)
- ISO 27001
- NIST CSF
- SOC 2
- LGPD
- GDPR
- PCI DSS
- HIPAA
- CIS Controls
- Nenhum especifico

**4. Publico-alvo da Politica** (Select)
- Todos os colaboradores
- Equipe de TI / Seguranca
- Alta gestao / Diretoria
- Terceiros / Fornecedores

**5. Tom da Escrita** (Select)
- Formal / Juridico
- Tecnico
- Acessivel / Didatico

**6. Extensao do Documento** (Select)
- Resumido (1-2 paginas)
- Padrao (3-5 paginas)
- Detalhado (6+ paginas)

### Mudancas nos Arquivos

**`src/components/politicas/AIWriterDialog.tsx`**
- Adicionar os 6 novos campos com seus respectivos estados
- Expandir o dialog para `max-w-lg` para acomodar mais campos
- Organizar campos em grid 2 colunas para campos menores (Idioma + Porte, Publico + Tom, Extensao + Rigor)
- Manter Setor, Frameworks e Instrucoes Adicionais em largura total
- Frameworks como grupo de checkboxes (multi-select)
- Passar todos os novos valores no body da chamada ao edge function

**`supabase/functions/generate-policy/index.ts`**
- Extrair os novos campos do request body: `language`, `companySize`, `frameworks`, `audience`, `tone`, `length`
- Incorporar cada campo no prompt enviado a IA:
  - Idioma: "Escreva a politica em [idioma]"
  - Porte: "Considere uma empresa de porte [porte]"
  - Frameworks: "A politica deve estar alinhada com os frameworks: [lista]"
  - Publico-alvo: "O publico-alvo desta politica e: [publico]"
  - Tom: "Utilize um tom [tom] na redacao"
  - Extensao: "A politica deve ter extensao [extensao]"
- Aumentar `max_tokens` para 6000 quando extensao for "Detalhado"

### Layout do Dialog Atualizado

```text
+------------------------------------------+
| [*] Gerar com IA                    [x]  |
|                                          |
| [info: IA vai reescrever...]             |
|                                          |
| Setor da Empresa                         |
| [_____________________________ v]        |
|                                          |
| Idioma           Porte da Empresa        |
| [________ v]     [______________ v]      |
|                                          |
| Nivel de Rigor   Tom da Escrita          |
| [________ v]     [______________ v]      |
|                                          |
| Publico-alvo     Extensao                |
| [________ v]     [______________ v]      |
|                                          |
| Frameworks de Referencia                 |
| [x] ISO 27001  [ ] NIST CSF  [x] LGPD   |
| [ ] SOC 2      [ ] GDPR      [ ] PCI    |
| [ ] HIPAA      [ ] CIS       [ ] Nenhum |
|                                          |
| Instrucoes Adicionais (opcional)         |
| [________________________________]       |
| [________________________________]       |
|                                          |
|              [Cancelar]  [* Gerar]       |
+------------------------------------------+
```

### Resultado

O usuario tera controle granular sobre 8 parametros de geracao (vs. 3 atuais), produzindo politicas mais alinhadas com o contexto real da organizacao sem precisar descrever tudo manualmente nas instrucoes adicionais.

