# 🚀 Инструкции по запуску GigaChat Frontend

## Предварительные требования

- **Node.js** версии 16 или выше
- **npm** версии 8 или выше

## 📦 Установка

1. **Перейдите в директорию проекта**:
   ```bash
   cd "c:\Users\Psixowan\Desktop\Education\front-end"
   ```

2. **Установите зависимости** (если еще не установлены):
   ```bash
   npm install
   ```

## 🎯 Запуск разработческого сервера

```bash
npm run dev
```

После этой команды:
- Откроется автоматически браузер или перейдите на **http://localhost:5173/**
- Dev-сервер будет запущен с горячей перезагрузкой (HMR)
- Любые изменения в коде будут автоматически обновлены в браузере

## 🔨 Сборка для production

```bash
npm run build
```

Результат сборки будет в папке `dist/`:
- Минифицированный HTML, CSS, JS
- Готово для развертывания на сервер
- Оптимизировано по размеру и производительности

## 👀 Preview production сборки (локально)

```bash
npm run preview
```

Откроет локальный preview production-версии на **http://localhost:4173/**

## 🧹 Проверка кода

Проверка на ошибки TypeScript:
```bash
npm run build
```

ESLint проверка:
```bash
npm run lint
```

## 🌐 Тестирование приложения

### 1. Экран авторизации
- Введите любую Base64-строку в поле Credentials
- Пример валидной Base64: `dGVzdA==` или `aGVsbG8gd29ybGQ=`
- Выберите Scope (по умолчанию GIGACHAT_API_PERS)
- Нажмите "Sign In"

### 2. Основной интерфейс
- **Боковая панель**: список 5 моковых чатов
- **Поиск**: фильтрует чаты по названию
- **Новый чат**: кнопка ➕ создает новый чат (заглушка)
- **Сообщения**: показаны с Markdown поддержкой
- **Ввод**: напишите сообщение и отправьте (Enter или кнопка ✈️)

### 3. Настройки
- Нажмите кнопку ⚙️ в углу чата
- Измените модель, параметры
- Переключите на темную тему
- Нажмите "Save Settings"

### 4. Адаптивность
- Откройте DevTools (F12)
- Используйте Toggle device toolbar Ctrl+Shift+M
- Тестируйте на разных размерах:
  - Mobile: 375px
  - Tablet: 768px
  - Desktop: 1440px+

## 🎨 Работа с темами

Темы переключаются через SettingsPanel или автоматически сохраняются в localStorage:
- **Светлая тема** (по умолчанию)
- **Тёмная тема** (переключение в Settings → Dark Theme)

Переменные CSS для кастомизации находятся в `src/app/globals.css`.

## 📁 Основные директории

```
src/
├── app/              # Основное приложение и стили
├── components/       # Переиспользуемые компоненты
├── hooks/           # Custom React hooks
├── types/           # TypeScript типы
└── main.tsx         # Точка входа
```

## 🐛 Решение проблем

### Порт 5173 уже занят
```bash
npm run dev -- --port 3000
```

### Очистить кэш и переустановить зависимости
```bash
rm -r node_modules package-lock.json
npm install
```

### Полная перестройка проекта
```bash
npm run build -- --force
```

## 📝 Заметки

- Все данные - моки (localStorage для сохранения auth и settings)
- На следующем этапе будет добавлена реальная API интеграция
- TypeScript strict mode включен
- ESLint настроен для React + TypeScript

## 📚 Документация

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [react-markdown](https://github.com/remarkjs/react-markdown)

## ✅ Проверка готовности

Проект успешно установлен, если:
- ✅ `npm install` завершился без ошибок
- ✅ `npm run build` скомпилировался без ошибок
- ✅ `npm run dev` запустился на localhost:5173
- ✅ Приложение загружается и показывает AuthForm

Удачи в разработке! 🎉
