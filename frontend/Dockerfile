# Базовый образ с Node.js
FROM node:20-alpine AS base
# Устанавливаем Bun глобально
RUN npm install -g bun

# Этап установки зависимостей
FROM base AS deps
# Устанавливаем необходимые системные зависимости
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json bun.lock ./

# Устанавливаем зависимости с помощью Bun
RUN bun install --frozen-lockfile

# Этап сборки приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем приложение
RUN bun run build

# Этап запуска приложения
FROM base AS runner
WORKDIR /app

# Настройки окружения
ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем статику
COPY --from=builder /app/public ./public

# Создаем и настраиваем права для .next
RUN mkdir -p .next && \
    chown nextjs:nodejs .next

# Копируем собранное приложение
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаем пользователя
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]