# Contribuindo com o CosmoSec

Obrigado pelo interesse em contribuir! 🎉

## Como Contribuir

1. **Fork** o repositório
2. Crie uma **branch** para sua feature: `git checkout -b feature/minha-feature`
3. Faça **commit** das suas alterações: `git commit -m 'feat: adiciona nova feature'`
4. Faça **push** para a branch: `git push origin feature/minha-feature`
5. Abra um **Pull Request**

## Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de lógica)
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas de manutenção

## Setup de Desenvolvimento

```bash
git clone https://github.com/GuilhermeQViana/cosmosecopen.git
cd cosmosec
cp .env.example .env
# Preencha as variáveis no .env
npm install
npm run dev
```

## Diretrizes

- Escreva código em TypeScript
- Siga os padrões existentes do projeto
- Teste suas alterações antes de submeter
- Mantenha PRs focados e pequenos

## Reportando Bugs

Abra uma [Issue](../../issues) com:
- Descrição do bug
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
