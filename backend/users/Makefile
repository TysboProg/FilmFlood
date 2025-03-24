# Переменные для удобства
ALEMBIC = alembic
PYTHON = uv run python
MAIN = main.py

# Цель по умолчанию (если просто вызвать `make`)
.DEFAULT_GOAL := help

# Цель для вывода справки
help:
	@echo "Используйте следующие команды:"
	@echo "  make db_migration       - Создать автоматическую миграцию"
	@echo "  make db_push            - Применить миграции к базе данных"
	@echo "  make db_downgrade       - Откатить базу данных до конкретной версии (используйте revision=<revision>)"
	@echo "  make start              - Запустить приложение"
	@echo "  make help               - Показать эту справку"

# Цель для создания автоматической миграции
db_migration:
	$(ALEMBIC) revision --autogenerate

# Цель для применения миграций к базе данных
db_push:
	$(ALEMBIC) upgrade head

# Цель для отката базы данных до конкретной версии
db_downgrade:
ifndef revision
	@echo "Ошибка: Не указана версия для отката. Используйте revision=<revision>"
	@exit 1
else
	$(ALEMBIC) downgrade $(revision)
endif

# Цель для запуска приложения
start:
	$(PYTHON) $(MAIN)

.PHONY: help db_migration db_push db_downgrade start