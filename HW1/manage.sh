#!/bin/bash

# 🎯 GigaChat Frontend Shell Script
# Этот скрипт помогает управлять проектом

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="GigaChat Frontend"

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ${PROJECT_NAME}  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
    echo ""
    echo "Выберите действие:"
    echo "1) 📦 Установить зависимости"
    echo "2) 🚀 Запустить dev сервер"
    echo "3) 🔨 Сделать production сборку"
    echo "4) 👀 Preview production сборки"
    echo "5) 🧹 Проверить на ошибки"
    echo "6) 📚 Показать документацию"
    echo "7) 🗑️  Очистить (node_modules & dist)"
    echo "8) ❌ Выход"
    echo ""
}

install_deps() {
    echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
    npm install
    echo -e "${GREEN}✅ Готово!${NC}"
}

run_dev() {
    echo -e "${YELLOW}🚀 Запуск dev сервера...${NC}"
    echo -e "${GREEN}✨ Dev сервер запущен на http://localhost:5173/${NC}"
    npm run dev
}

build_prod() {
    echo -e "${YELLOW}🔨 Сборка для production...${NC}"
    npm run build
    echo -e "${GREEN}✅ Сборка завершена! Результат в папке dist/${NC}"
}

preview_prod() {
    echo -e "${YELLOW}👀 Preview production сборки...${NC}"
    echo -e "${GREEN}✨ Preview доступен на http://localhost:4173/${NC}"
    npm run preview
}

check_errors() {
    echo -e "${YELLOW}🧹 Проверка на ошибки TypeScript...${NC}"
    npm run build >/dev/null 2>&1 && echo -e "${GREEN}✅ Ошибок не найдено!${NC}" || echo -e "${RED}❌ Найдены ошибки${NC}"
}

show_docs() {
    echo -e "${BLUE}📚 Доступная документация:${NC}"
    echo ""
    echo "1) README_PROJECT.md - Полная документация"
    echo "2) QUICKSTART.md - Инструкции по запуску"
    echo "3) CHECKLIST.md - Проверка требований"
    echo "4) COMPONENTS_REFERENCE.md - Справочник компонентов"
    echo "5) PROJECT_REPORT.md - Отчет о выполнении"
    echo ""
    read -p "Выберите (1-5) или Enter для отмены: " doc_choice
    case $doc_choice in
        1) cat README_PROJECT.md | less ;;
        2) cat QUICKSTART.md | less ;;
        3) cat CHECKLIST.md | less ;;
        4) cat COMPONENTS_REFERENCE.md | less ;;
        5) cat PROJECT_REPORT.md | less ;;
        *) echo "Отмена" ;;
    esac
}

clean() {
    echo -e "${YELLOW}🗑️  Очистка проекта...${NC}"
    read -p "Вы уверены? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        rm -rf node_modules dist
        echo -e "${GREEN}✅ Очистка завершена!${NC}"
    else
        echo "Отмена"
    fi
}

# Главный цикл
while true; do
    show_menu
    read -p "Введите номер: " choice

    case $choice in
        1) install_deps ;;
        2) run_dev ;;
        3) build_prod ;;
        4) preview_prod ;;
        5) check_errors ;;
        6) show_docs ;;
        7) clean ;;
        8) echo -e "${GREEN}Спасибо за использование!${NC}"; exit 0 ;;
        *) echo "Неверный выбор" ;;
    esac
done
