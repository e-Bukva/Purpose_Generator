# ✅ Система полностью готова!

## 🎯 Две простые функции

### 1. `npm run generate`
- 📥 Берёт файл из `input/` (PDF/Word/MD)
- 🚀 Загружает в GPT-5 через Responses API
- 💾 Сохраняет HTML в `generated/sessions/YYYYMMDD_HHMMSS/proposal.html`

### 2. `npm run pdf`
- 🔍 Находит последнюю сессию
- 📄 Создаёт PDF из HTML
- 💾 Сохраняет в ту же сессию: `proposal.pdf`

## ⚡ Как работает

```
input/file.pdf
    ↓
npm run generate
    ↓
generated/sessions/20251027_185826/
    ├── proposal.html  ← создано GPT-5
    ↓
npm run pdf
    ↓
generated/sessions/20251027_185826/
    ├── proposal.html  ← уже есть
    └── proposal.pdf   ← создано сейчас
```

## 🎨 Умная генерация

GPT-5 умеет:
- ✅ Читать PDF напрямую (без парсинга!)
- ✅ Объединять похожие заголовки
- ✅ Убирать лишние двойные "— —" 
- ✅ Создавать логичную структуру
- ✅ Сохранять фирменный стиль
- ❌ НЕ менять текст/числа/даты

## 📁 Что в сессии?

```
generated/sessions/20251027_185826/
    ├── proposal.html  ← сгенерированный HTML
    └── proposal.pdf   ← итоговый PDF
```

**БЕЗ исходников** — только результат работы!

## 🚀 Использование

```bash
# Шаг 1: Положите файл
copy ваш-файл.pdf input\

# Шаг 2: Генерация HTML
npm run generate

# Шаг 3: Создание PDF
npm run pdf
```

Готово! PDF в папке сессии.

## 🔧 Настройка

`.env`:
```env
OPENAI_API_KEY=sk-ваш-ключ
OPENAI_MODEL=gpt-5
```

## ✨ Чисто и просто

- Одна сессия — один результат
- Никаких промежуточных файлов
- Автоматический выбор последней сессии
- Вся история в `generated/sessions/`

