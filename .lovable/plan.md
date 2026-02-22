

# Corrigir seção "Como começar" invisível na Landing Page

## Problema

A seção "Como começar" (`AudienceSection`) está no código e renderiza no DOM, mas pode ficar **invisível** para o usuário porque está envolvida em um componente `ScrollReveal` que usa `IntersectionObserver` para animar a entrada.

O `ScrollReveal` inicia todos os elementos com `opacity-0` e só muda para `opacity-100` quando o `IntersectionObserver` detecta que o elemento entrou no viewport. Em alguns contextos (iframes, scroll rápido, ou se o observer não dispara), a seção permanece completamente transparente.

## Causa Raiz

No arquivo `src/components/ui/scroll-reveal.tsx`, o estado inicial é `opacity-0 translate-y-8`. Se o `IntersectionObserver` falhar ou se o usuário não scrollar de forma que o threshold de 15% seja atingido, o conteúdo fica permanentemente invisível.

## Correção

Adicionar um **fallback com timeout** no componente `ScrollReveal`: se após 2 segundos o `IntersectionObserver` não disparou, forçar `isVisible = true`. Isso garante que o conteúdo sempre aparece, mesmo em cenários onde o observer falha.

## Detalhes Técnicos

### Arquivo: `src/components/ui/scroll-reveal.tsx`

Adicionar um `useEffect` com um timer de segurança:

```
useEffect(() => {
  const timer = setTimeout(() => {
    setIsVisible(true);
  }, 2000);
  return () => clearTimeout(timer);
}, []);
```

Isso funciona como fallback: se a animação já disparou via IntersectionObserver, o timeout não muda nada (já é `true`). Se não disparou, força a visibilidade após 2 segundos.

### Arquivos Impactados

| Arquivo | Ação |
|---------|------|
| `src/components/ui/scroll-reveal.tsx` | Adicionar fallback timeout para garantir visibilidade |

