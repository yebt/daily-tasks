# Etapa 1: Compilación con Bun
FROM oven/bun:latest AS build-stage
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json ./
RUN bun install

# Copiamos el resto del código y compilamos
COPY . .
RUN bun run build

# Etapa 2: Producción con Caddy
FROM caddy:2-alpine AS production-stage

# Copiamos los archivos compilados desde la etapa anterior
COPY --from=build-stage /app/dist /usr/share/caddy

# Copiamos tu Caddyfile personalizado
COPY Caddyfile /etc/caddy/Caddyfile

# Exponemos el puerto estándar
EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
