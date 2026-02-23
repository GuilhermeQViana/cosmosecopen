

# Adicionar botao de download da imagem Docker no guia de instalacao

## Resumo

Adicionar um botao visivel de download/acesso na secao "Opcao 2: Imagem Docker Pronta" do guia de instalacao, linkando para a pagina da imagem no Docker Hub (`https://hub.docker.com/r/guilhermeqviana/cosmosecopen`).

## Alteracao

### Arquivo: `src/components/landing/AudienceSection.tsx`

Na secao da Opcao 2 (Imagem Docker Pronta), adicionar um botao estilizado com icone de download que abre o Docker Hub em nova aba. O botao ficara entre a descricao e o bloco de codigo, com destaque visual para facilitar a acao do usuario.

- Importar o icone `Download` do lucide-react
- Adicionar um botao/link com o texto "Baixar no Docker Hub" apontando para `https://hub.docker.com/r/guilhermeqviana/cosmosecopen`
- Estilizar com gradiente violet/purple para manter consistencia visual com o card da Opcao 2

### Detalhes tecnicos

O botao sera um elemento `<a>` estilizado como botao, posicionado logo apos o paragrafo de descricao e antes do `CodeBlock`. Tera `target="_blank"` e `rel="noopener noreferrer"` para abrir em nova aba com seguranca.

| Arquivo | Acao |
|---------|------|
| `src/components/landing/AudienceSection.tsx` | Adicionar botao de download linkando ao Docker Hub |

