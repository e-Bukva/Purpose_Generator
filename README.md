# 🤖 Автоматическая генерация коммерческих предложений

Система создаёт профессиональные коммерческие предложения из ваших документов (PDF, Word, Markdown) с помощью GPT-5.

## 🚀 Быстрый старт

### 1. Установка

```bash
npm install
npm run prepare  # Установка Chromium для PDF
```

### 2. Настройка

Создайте файл `.env`:

```env
OPENAI_API_KEY=sk-ваш-ключ
OPENAI_MODEL=gpt-5
```

### 3. Использование

```bash
# Шаг 1: Положите файл
copy ваш-файл.pdf input\

# Шаг 2: Генерация HTML
npm run generate

# Шаг 3: Создание PDF
npm run pdf
```

Готово! PDF находится в `generated/sessions/[дата-время]/proposal.pdf`

## 📁 Структура проекта

```
input/                    # Входные файлы (PDF/Word/MD)
generated/sessions/       # Сессии работы
  └── YYYYMMDD_HHMMSS/
      ├── proposal.html   # Сгенерированный HTML
      └── proposal.pdf    # Итоговый PDF
src/                     # Шаблоны и стили
tools/                   # Инструменты
config/                  # Конфигурация и промпты
```

## 🎨 Возможности

- ✅ Чтение PDF напрямую через GPT-5 (без парсинга!)
- ✅ Умная структуризация и объединение заголовков
- ✅ Автоматическая вставка логотипов компаний
- ✅ Профессиональное форматирование таблиц и списков
- ✅ Поддержка нескольких компаний (Blue Rakun, Spa Bureau)
- ✅ История всех сессий

## 📝 Дополнительные команды

```bash
npm run pdf:blue-rakun   # PDF с логотипом Blue Rakun
npm run pdf:spa-bureau   # PDF с логотипом Spa Bureau
npm run pdf:test         # Тестовая генерация
```

## 🔧 Основные файлы

- `tools/generate-html.js` — генерация HTML через GPT-5
- `tools/make-pdf.js` — создание PDF из HTML
- `config/gpt-prompts.js` — промпты для AI
- `src/index.html` — HTML шаблон
- `logo-config.json` — настройки логотипов

## 📄 Лицензия

MIT

## 🤝 Поддержка

Получите API ключ на https://platform.openai.com/api-keys
