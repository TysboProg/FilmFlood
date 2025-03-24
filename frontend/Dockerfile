# Используем базовый образ с Bun
FROM node:alpine
RUN npm install -g bun AS base

# Этап установки зависимостей
FROM base AS deps
# Устанавливаем необходимые зависимости (если нужны)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json bun.lockb ./

# Устанавливаем зависимости с помощью Bun
RUN bun install --frozen-lockfile

# Этап сборки приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем приложение с помощью Bun
RUN bun run build

# Этап запуска приложения
FROM base AS runner
WORKDIR /app

# Устанавливаем переменные окружения
ENV NODE_ENV production
# Отключение телеметрии (по желанию)
# ENV NEXT_TELEMETRY_DISABLED 1

# Создаем пользователя и группу для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем статические файлы
COPY --from=builder /app/public ./public

# Создаем директорию .next и устанавливаем права
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Копируем собранное приложение
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаемся на пользователя nextjs
USER nextjs

# Открываем порт 3000
EXPOSE 3000

# Устанавливаем переменные окружения для сервера
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Запускаем сервер
CMD ["bun", "run", "start"]