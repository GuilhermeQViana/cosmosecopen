import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, handleCors, isAuthError, errorResponse, jsonResponse } from "../_shared/auth.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { templateContent, templateTitle, sector, rigor, customInstructions } = await req.json();

    const prompt = `Você é um especialista em segurança da informação, compliance e governança corporativa.

${templateContent ? `Baseando-se neste template de política:
---
Título: ${templateTitle || 'Política'}
Conteúdo:
${templateContent.substring(0, 3000)}
---` : `Crie uma política corporativa sobre: ${templateTitle}`}

${sector ? `Setor da empresa: ${sector}` : ''}
${rigor ? `Nível de rigor desejado: ${rigor}` : ''}
${customInstructions ? `Instruções adicionais: ${customInstructions}` : ''}

Gere o texto completo da política em formato HTML bem estruturado, usando as seguintes tags:
- <h2> para seções principais
- <h3> para subseções
- <p> para parágrafos
- <ul>/<li> para listas
- <table> quando apropriado
- <strong> para termos importantes

A política deve incluir:
1. Objetivo
2. Escopo
3. Definições
4. Diretrizes/Requisitos
5. Responsabilidades
6. Penalidades/Consequências
7. Disposições Finais

Responda APENAS com o HTML da política, sem explicações adicionais.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (response.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns instantes.');
    }
    if (response.status === 402) {
      throw new Error('Créditos de IA insuficientes.');
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    let content = aiResponse.choices?.[0]?.message?.content || '';

    // Clean up markdown code blocks if present
    content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    return jsonResponse({ content });
  } catch (error) {
    console.error('Error generating policy:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
