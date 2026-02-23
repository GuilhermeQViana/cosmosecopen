FROM node:20-alpine AS build
WORKDIR /app

# Placeholders fixos — serão substituídos no runtime pelo entrypoint
ENV VITE_SUPABASE_URL=__VITE_SUPABASE_URL__
ENV VITE_SUPABASE_PUBLISHABLE_KEY=__VITE_SUPABASE_PUBLISHABLE_KEY__
ENV VITE_SUPABASE_PROJECT_ID=__VITE_SUPABASE_PROJECT_ID__

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
