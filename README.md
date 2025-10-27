# Генератор PDF коммерческих предложений

Профессиональная система генерации постраничных PDF документов формата A4 из HTML с использованием **Node.js + Playwright (Chromium)**.

## 🎯 Особенности

- ✅ **Формат A4** с гибкими полями (верх 15mm, бока 18mm, низ 35mm для логотипа)
- ✅ **Постраничный контроль разрывов** — разделы, таблицы, карточки не разрываются
- ✅ **Логотипы компаний** — автоматическая подстановка Blue Rakun или Spa Bureau
- ✅ **Чистый формат** — без колонтитулов, максимум полезного пространства
- ✅ **Кириллица** — локальные шрифты с полной поддержкой кириллицы
- ✅ **Фоны и градиенты** — встраиваются в PDF (`printBackground`)
- ✅ **Векторный текст** — весь текст выделяемый и доступный для копирования
- ✅ **Репродьюсабилити** — одинаковый результат при повторной генерации
- ✅ **Универсальность** — работает с любым HTML, не только с примером

## 📁 Структура проекта

```
project-root/
├── src/
│   ├── index.html           # Исходный HTML документ
│   ├── print.css            # Печатные стили для PDF
│   ├── assets/
│   │   └── logos/           # Логотипы компаний (PNG/SVG)
│   └── fonts/               # Локальные шрифты (опционально)
├── tools/
│   └── make-pdf.js          # Скрипт генерации PDF
├── out/
│   └── proposal.pdf         # Результат (создаётся автоматически)
├── logo-config.json         # Конфигурация логотипа
├── package.json
└── README.md
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

Это установит Playwright и автоматически скачает браузер Chromium:

```bash
npm run prepare
```

### 2. Генерация PDF

```bash
npm run pdf
```

PDF будет создан в директории `out/proposal.pdf`.

### 3. Тестовый режим (с проверками)

```bash
npm run pdf:test
```

## 🖼️ Логотипы компаний

### Доступные логотипы

Система поддерживает два логотипа компаний:
- **Blue Rakun** (по умолчанию)
- **Spa Bureau**

### Базовая генерация

```bash
# Генерация с Blue Rakun (по умолчанию)
npm run pdf

# Генерация с Blue Rakun (явно)
npm run pdf:blue-rakun

# Генерация с Spa Bureau
npm run pdf:spa-bureau
```

**Альтернативный способ (прямой вызов):**
```bash
node tools/make-pdf.js --logo=blue-rakun
node tools/make-pdf.js --logo=spa-bureau
```

### Настройка логотипа

Отредактируйте файл `logo-config.json`:

```json
{
  "enabled": true,
  "logo": {
    "path": "src/assets/logos/Blue_Rakun синий.png",
    "position": "bottom-center",
    "width": "35mm",
    "opacity": 0.9,
    "margin": {
      "fromEdge": "10mm"
    }
  },
  "alternatives": {
    "blue-rakun": {
      "path": "src/assets/logos/Blue_Rakun синий.png",
      "width": "35mm"
    },
    "spa-bureau": {
      "path": "src/assets/logos/Spabureau360.png",
      "width": "28mm"
    }
  }
}
```

**Параметры:**
- `fromEdge` — расстояние от нижнего края страницы (3-15mm)
- `width` — ширина логотипа (25-50mm)
- `opacity` — прозрачность (0.0-1.0)

**Индивидуальные настройки для каждого логотипа:**
Каждый логотип в `alternatives` может иметь свои параметры размера, прозрачности и отступов.

**Отключить логотип:**
```json
{
  "enabled": false
}
```

### Добавление нового логотипа

1. Поместите PNG/SVG файл в `src/assets/logos/`
2. Добавьте скрипт в `package.json`:
```json
{
  "scripts": {
    "pdf:my-company": "node tools/make-pdf.js --logo=my-company"
  }
}
```
3. Добавьте в `logo-config.json`:
```json
{
  "alternatives": {
    "blue-rakun": {
      "path": "src/assets/logos/Blue_Rakun синий.png",
      "width": "35mm"
    },
    "spa-bureau": {
      "path": "src/assets/logos/Spabureau360.png",
      "width": "28mm"
    },
    "my-company": {
      "path": "src/assets/logos/my-logo.png",
      "width": "30mm"
    }
  }
}
```
4. Используйте: `npm run pdf:my-company`

Подробности в `src/assets/README.md`

### Автоматические имена файлов

PDF сохраняются с уникальными именами:
- `proposal_blue-rakun_20251027_123045.pdf`
- `proposal_spa-bureau_20251027_123046.pdf`

**Формат:** `proposal_[логотип]_YYYYMMDD_HHMMSS.pdf`

**Отключить временные метки:**
В `tools/make-pdf.js` измените `useTimestamp: false`

## 🎨 Настройка стилей для печати

### Файл `src/print.css`

Основные правила для постраничной печати:

```css
/* Размер страницы и поля */
@page {
  size: A4 portrait;
  margin: 15mm 18mm 35mm 18mm;  /* верх право низ лево */
}

/* Начать раздел с новой страницы */
.page-start {
  break-before: page;
}

/* Запретить разрыв внутри блока */
.no-break {
  break-inside: avoid;
}

/* Вдовы и сироты */
p {
  orphans: 3;
  widows: 3;
}
```

### Применение классов в HTML

```html
<!-- Каждый раздел начинается с новой страницы -->
<section class="section page-start" id="terms">
  <h2>02. Условия оплаты</h2>
  
  <!-- Таблица не разрывается -->
  <table class="table no-break">
    ...
  </table>
  
  <!-- Блок итогов не разрывается -->
  <div class="totals no-break">
    ...
  </div>
</section>
```

## ⚙️ Конфигурация

### 🎯 Главное — контроль полей через CSS

**Все поля страницы контролируются ТОЛЬКО через `src/print.css`:**

```css
@page {
  size: A4;
  margin: 15mm 18mm 35mm 18mm;  /* верх право низ лево */
}
```

**Почему именно так:**
- ✅ Одно место для изменений
- ✅ Предсказуемый результат
- ✅ Работает с любыми HTML файлами

### Параметры генерации (`tools/make-pdf.js`)

```javascript
const CONFIG = {
  // Формат
  format: 'A4',
  
  // ⚠️ Эти значения ПЕРЕЗАПИСАНЫ значениями из src/print.css
  // благодаря preferCSSPageSize: true
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '40mm',
    left: '20mm'
  },

  // Опции
  printBackground: true,        // фоны и градиенты
  preferCSSPageSize: true,      // ✅ ВАЖНО: приоритет @page из CSS!
  displayHeaderFooter: false,   // колонтитулы отключены
};
```

### ⚠️ Важно про поля

1. **Меняйте поля ТОЛЬКО в `src/print.css`** (строка 15):
   ```css
   @page {
     margin: 15mm 18mm 35mm 18mm;
   }
   ```

2. **НЕ меняйте поля в `tools/make-pdf.js`** — они игнорируются из-за `preferCSSPageSize: true`

3. **Если inline стили в `src/index.html` содержат `@page { margin:0; }`** — удалите их, они перезапишут CSS файл!

## 🔤 Шрифты с кириллицей

### Вариант 1: Локальные шрифты (рекомендуется)

1. Скачайте шрифты с поддержкой кириллицы (например, Inter, Montserrat)
2. Разместите в `src/fonts/`:
   ```
   src/fonts/
   ├── Inter-Variable.woff2
   ├── Inter-Variable.ttf
   ├── Montserrat-Variable.woff2
   └── Montserrat-Variable.ttf
   ```

3. Подключите в `src/print.css`:

```css
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Variable.woff2") format("woff2-variations"),
       url("./fonts/Inter-Variable.ttf") format("truetype-variations");
  font-weight: 100 900;
  font-display: swap;
}

body {
  font-family: "Inter", "Montserrat", "Segoe UI", Arial, sans-serif;
}
```

### Вариант 2: Системные шрифты (fallback)

```css
body {
  font-family: "Segoe UI", "Roboto", system-ui, -apple-system, Arial, sans-serif;
}
```

Системные шрифты Windows (`Segoe UI`) и macOS (`SF Pro`) уже содержат кириллицу.

## ✅ Чек-лист качества

После генерации PDF проверьте:

- [ ] **Формат:** все страницы строго A4
- [ ] **Поля:** верх 15mm, бока 18mm, низ 35mm (место под логотип)
- [ ] **Разрывы:** разделы начинаются с новой страницы где нужно
- [ ] **Таблицы:** не разрываются между страницами
- [ ] **Первая страница:** отступ сверху такой же как на остальных
- [ ] **Кириллица:** текст читается, нет «квадратиков»
- [ ] **Копирование:** текст выделяется и копируется корректно
- [ ] **Фоны:** градиенты и цветные блоки присутствуют
- [ ] **Размер:** файл компактный (< 500 КБ для 5 страниц)

## 🧪 Тестирование

### Автоматический тест

```bash
npm run pdf:test
```

### Ручная проверка

1. Откройте `out/proposal.pdf`
2. Проверьте чек-лист выше
3. Убедитесь, что повторная генерация даёт идентичный результат

### Предпросмотр в браузере

Откройте `src/index.html` в браузере и нажмите **Ctrl/Cmd + P** для предпросмотра печати.

## 🐛 Устранение проблем

### Проблема: Таблицы/блоки всё равно разрываются

**Решение:**
- Добавьте класс `.no-break` к проблемным элементам
- Упростите вложенность (flex/grid внутри `.no-break` может игнорироваться)
- Оберните в дополнительный `<div class="no-break">...</div>`

### Проблема: Кириллица отображается как «квадратики»

**Решение:**
- Убедитесь, что шрифты содержат кириллические глифы
- Проверьте путь к шрифтам в `@font-face`
- Используйте системные шрифты как fallback (`Segoe UI`, `Arial`)

### Проблема: Поля не меняются при изменении в `tools/make-pdf.js`

**Решение:**
- Поля контролируются через `src/print.css` (строка 15)
- Убедитесь что в `src/index.html` нет inline стилей с `@page { margin:0; }`
- Значение `preferCSSPageSize: true` даёт приоритет CSS файлу

### Проблема: Фоны не попадают в PDF

**Решение:**
- Убедитесь, что `printBackground: true` в конфиге
- Добавьте `print-color-adjust: exact` в CSS:

```css
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

### Проблема: PDF слишком большой

**Решение:**
- Оптимизируйте изображения (используйте WebP, сжатие)
- Уменьшите физический размер изображений до реального размера в макете
- Целевая плотность: 150–200 DPI

## 📚 Дополнительные ресурсы

- [Playwright PDF API](https://playwright.dev/docs/api/class-page#page-pdf)
- [CSS @page (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
- [CSS break-inside (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside)
- [Paged.js (опционально)](https://pagedjs.org/) — расширенный контроль пагинации

## 📝 Лицензия

Внутренний проект. Все права защищены.

---

**Разработано согласно ТЗ:** постраничный контроль, A4, колонтитулы, кириллица, репродьюсабельность ✅

