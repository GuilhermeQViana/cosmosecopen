
# Corrigir fluxo de acesso aos modulos apos criar organizacao

## Diagnostico

Identifiquei **dois problemas criticos** que impedem o acesso aos modulos:

### Problema 1: Perfil do usuario nao existe na tabela `profiles`

O trigger `handle_new_user` (que deveria criar automaticamente o perfil quando um usuario se cadastra) **nao esta registrado no banco de dados**. A funcao existe, mas o trigger que a conecta a tabela `auth.users` nao foi criado.

Resultado: ao fazer login, o sistema tenta buscar o perfil com `.single()`, recebe 0 linhas e retorna erro 406. Isso faz com que `organization` fique sempre `null` no contexto, e o usuario fica preso na tela de selecao de organizacao.

### Problema 2: Tabela `frameworks` esta vazia

A tabela `frameworks` nao tem nenhum registro. Mesmo que o problema do perfil seja resolvido, ao clicar em "GRC Frameworks" o sistema redireciona para `/selecionar-framework`, que nao mostra nenhuma opcao pois a tabela esta vazia.

## Solucao

### Passo 1: Migracao SQL (3 acoes)

1. **Criar o trigger `on_auth_user_created`** que conecta a funcao `handle_new_user` a tabela `auth.users`:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

2. **Inserir o perfil do usuario atual** que ficou sem perfil:

```sql
INSERT INTO public.profiles (id, full_name, email)
SELECT id, raw_user_meta_data->>'full_name', email
FROM auth.users
WHERE id = 'b889e8db-48a2-4d2f-b069-feb49015b657'
ON CONFLICT (id) DO NOTHING;
```

3. **Popular a tabela `frameworks`** com os 3 frameworks padrao do sistema:

```sql
INSERT INTO public.frameworks (id, code, name, version, description, is_custom)
VALUES
  (gen_random_uuid(), 'nist_csf', 'NIST Cybersecurity Framework', '2.0', 'Framework do NIST para gestao de riscos de ciberseguranca', false),
  (gen_random_uuid(), 'iso_27001', 'ISO/IEC 27001', '2022', 'Norma internacional para sistemas de gestao de seguranca da informacao', false),
  (gen_random_uuid(), 'bcb_cmn', 'BCB/CMN 4.893', '2021', 'Resolucao do Banco Central sobre politica de seguranca cibernetica', false)
ON CONFLICT DO NOTHING;
```

### Passo 2: Nenhuma alteracao de codigo necessaria

O codigo da aplicacao ja esta correto. Os problemas sao exclusivamente de dados/configuracao no banco.

## Resultado esperado

Apos a migracao:
1. O usuario tera um perfil valido na tabela `profiles`
2. O `set_active_organization` conseguira verificar o perfil corretamente
3. Os 3 frameworks aparecerão na tela de selecao
4. Novos usuarios criados no futuro terao perfil criado automaticamente pelo trigger
5. O fluxo completo funcionara: Login -> Selecionar Org -> Selecionar Modulo -> Selecionar Framework -> Dashboard
