
# Plano: Atualizar Termos de Uso e Politica de Privacidade

## Contexto

A pagina de autenticacao (`/auth`) exibe o texto "Ao continuar, voce concorda com os Termos de Uso e Politica de Privacidade", porem os links estao apontando para `#` ao inves das rotas corretas (`/termos` e `/privacidade`).

Alem disso, e necessario garantir que as paginas legais estejam com os dados corporativos atualizados.

---

## Alteracoes Planejadas

### 1. Corrigir Links na Pagina de Autenticacao

**Arquivo:** `src/pages/Auth.tsx`

- Linha 438: Alterar `href="#"` para usar `Link` do React Router apontando para `/termos`
- Linha 440: Alterar `href="#"` para usar `Link` do React Router apontando para `/privacidade`

**Antes:**
```text
<a href="#">Termos de Uso</a>
<a href="#">Política de Privacidade</a>
```

**Depois:**
```text
<Link to="/termos">Termos de Uso</Link>
<Link to="/privacidade">Política de Privacidade</Link>
```

---

### 2. Atualizar Termos de Uso

**Arquivo:** `src/pages/TermosDeUso.tsx`

- Adicionar telefone de contato: **(21) 99925-3788**
- Incluir CNPJ generico: **00.000.000/0001-00**
- Adicionar secao com dados da empresa no inicio do documento

---

### 3. Atualizar Politica de Privacidade

**Arquivo:** `src/pages/PoliticaPrivacidade.tsx`

Ja foi atualizado anteriormente com:
- CNPJ: 00.000.000/0001-00
- Telefone DPO: (21) 99925-3788

Verificar se esta consistente com os Termos de Uso.

---

### 4. Atualizar Politica LGPD

**Arquivo:** `src/pages/PoliticaLGPD.tsx`

- Adicionar telefone do DPO: **(21) 99925-3788** na secao de contato

---

## Resumo das Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `Auth.tsx` | Corrigir links `#` para `/termos` e `/privacidade` |
| `TermosDeUso.tsx` | Adicionar CNPJ e telefone de contato |
| `PoliticaLGPD.tsx` | Adicionar telefone do DPO |

---

## Detalhes Tecnicos

- Sera necessario adicionar o import de `Link` do `react-router-dom` na pagina Auth.tsx (ja existe)
- Os links usarao o componente `Link` para navegacao SPA sem recarregar a pagina
- O estilo dos links sera mantido com as classes CSS existentes

---

## Resultado Esperado

Apos as alteracoes:
1. Clicar em "Termos de Uso" na pagina de login abrira `/termos`
2. Clicar em "Politica de Privacidade" abrira `/privacidade`
3. Todas as paginas legais terao dados de contato consistentes
