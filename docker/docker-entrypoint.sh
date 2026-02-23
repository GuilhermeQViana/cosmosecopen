#!/bin/sh
set -e

# Substitui placeholders nos arquivos JS compilados pelos valores reais
# das variáveis de ambiente fornecidas no runtime do container.
find /usr/share/nginx/html -type f -name '*.js' -exec sed -i \
  -e "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL:-http://localhost:8000}|g" \
  -e "s|__VITE_SUPABASE_PUBLISHABLE_KEY__|${VITE_SUPABASE_PUBLISHABLE_KEY}|g" \
  -e "s|__VITE_SUPABASE_PROJECT_ID__|${VITE_SUPABASE_PROJECT_ID:-local}|g" \
  {} +

echo "✅ Variáveis de ambiente injetadas com sucesso."

exec nginx -g 'daemon off;'
