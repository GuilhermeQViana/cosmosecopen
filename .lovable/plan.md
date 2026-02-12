

## Fix: AI Policy Generation - Wrong API Endpoint

### Problem
The `generate-policy` edge function is calling the wrong URL:
- **Current (broken):** `https://api.lovable.dev/v1/chat`
- **Correct:** `https://ai.gateway.lovable.dev/v1/chat/completions`

This causes a 404 error, which surfaces as "Erro ao gerar politica" in the UI.

### Solution

**File:** `supabase/functions/generate-policy/index.ts`

1. Change the API endpoint from `https://api.lovable.dev/v1/chat` to `https://ai.gateway.lovable.dev/v1/chat/completions`
2. Add proper error handling for 429 (rate limit) and 402 (payment required) responses
3. Update the model to `google/gemini-3-flash-preview` (the recommended default)

### Technical Details

```text
Before:
  fetch('https://api.lovable.dev/v1/chat', { ... model: 'google/gemini-2.5-flash' })

After:
  fetch('https://ai.gateway.lovable.dev/v1/chat/completions', { ... model: 'google/gemini-3-flash-preview' })
```

This is a one-line URL fix plus minor improvements. No database or frontend changes needed.

