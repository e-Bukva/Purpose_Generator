# Шпаргалка команд — Генератор PDF

## 🚀 Основные команды

### Генерация PDF
```bash
npm run pdf
```
📄 Результат: `out/proposal.pdf`

### Тестовый режим
```bash
npm run pdf:test
```
🧪 С подробным логированием и проверками

### Установка зависимостей (первый раз)
```bash
npm install
```

### Переустановка Chromium
```bash
npm run prepare
```
или
```bash
npx playwright install chromium
```

---

## 📝 Быстрое редактирование

### Изменить содержимое
1. Откройте `src/index.html`
2. Найдите нужный раздел (по id: `#price-list`, `#terms`, `#scope`, `#schedule`)
3. Измените текст/цены/даты
4. Сохраните файл
5. Запустите: `npm run pdf`

### Изменить цены
```html
<!-- В src/index.html найдите таблицу прайс-листа -->
<tr>
  <td><strong>1. Концептуальное проектирование</strong></td>
  <td class="num"><strong>104 000,00</strong></td>  ← ЗДЕСЬ
</tr>
```

### Добавить новый раздел
```html
<section class="section page-start" id="new-section">
  <h2>05. Новый раздел</h2>
  <p>Ваш текст...</p>
</section>
```

---

## 🎨 Настройка стилей

### Изменить поля страницы
**Файл:** `tools/make-pdf.js`
```javascript
margin: {
  top: '15mm',     ← Верхнее поле
  right: '15mm',   ← Правое поле
  bottom: '20mm',  ← Нижнее поле (больше под футер)
  left: '15mm'     ← Левое поле
}
```

### Изменить брендовые цвета
**Файл:** `src/index.html` (в секции `<style>`)
```css
:root {
  --primary: #255C9E;   ← Основной цвет (заголовки)
  --primary-2: #638ED5; ← Вспомогательный
  --primary-0: #E2F0FF; ← Светлый (фоны)
}
```

### Изменить шрифты
**Файл:** `src/print.css`
```css
body {
  font-family: "Segoe UI", Arial, sans-serif;  ← Системные шрифты
}
```

---

## 🔧 Классы для контроля разрывов

### Начать раздел с новой страницы
```html
<section class="section page-start">
  ...
</section>
```

### Запретить разрыв блока
```html
<table class="table no-break">
  ...
</table>

<div class="totals no-break">
  ...
</div>
```

---

## 🐛 Устранение проблем

### Кириллица — «квадратики»
```bash
# Убедитесь, что в src/print.css используются системные шрифты:
# body { font-family: "Segoe UI", Arial, sans-serif; }
```

### Таблицы разрываются
```html
<!-- Добавьте класс .no-break -->
<table class="table no-break">
  ...
</table>
```

### Фоны не видны
**Файл:** `tools/make-pdf.js`
```javascript
printBackground: true,  ← Должно быть включено
```

### PDF не создаётся
```bash
# Переустановите зависимости:
rm -rf node_modules package-lock.json  # Linux/Mac
# или
Remove-Item -Recurse -Force node_modules, package-lock.json  # Windows

npm install
npm run prepare
```

---

## 📂 Где что находится

```
Проект/
├── src/index.html          → Ваш HTML документ (редактируйте здесь)
├── src/print.css           → Печатные стили (поля, разрывы)
├── tools/make-pdf.js       → Скрипт генерации (поля, колонтитулы)
├── out/proposal.pdf        → Готовый PDF (результат)
├── QUICKSTART.md           → Подробное руководство
├── CHECKLIST.md            → Чек-лист проверки PDF
└── README.md               → Полная документация
```

---

## 🎯 Типичные сценарии

### Сценарий 1: Обновить цены
```bash
1. Открыть src/index.html
2. Найти: <td class="num"><strong>104 000,00</strong></td>
3. Изменить число
4. Сохранить
5. npm run pdf
6. Открыть out/proposal.pdf
```

### Сценарий 2: Изменить название компании
```bash
1. Открыть tools/make-pdf.js
2. Найти: headerTemplate
3. Изменить: "Коммерческое предложение — Blue Rakun"
4. Сохранить
5. npm run pdf
```

### Сценарий 3: Добавить логотип
```bash
1. Поместить logo.png в src/
2. В src/index.html добавить:
   <img src="./logo.png" alt="Logo" style="max-width: 150px;">
3. npm run pdf
```

---

## 📊 Проверка качества

### Быстрая проверка
```bash
npm run pdf
# Откройте out/proposal.pdf и проверьте:
# ✅ Формат A4
# ✅ Кириллица читается
# ✅ Колонтитулы присутствуют
# ✅ Таблицы не разорваны
```

### Полная проверка
См. файл **CHECKLIST.md** — 30+ пунктов проверки

---

## 🚀 Автоматизация

### Генерация при изменении файлов (опционально)
```bash
# Установите nodemon:
npm install --save-dev nodemon

# Добавьте в package.json:
"scripts": {
  "watch": "nodemon --watch src -e html,css --exec npm run pdf"
}

# Запустите:
npm run watch
```

Теперь PDF будет обновляться автоматически при изменении файлов!

---

## 📦 Версионирование PDF

```bash
# Windows PowerShell:
$date = Get-Date -Format "yyyy-MM-dd"
Copy-Item "out\proposal.pdf" "out\proposal-$date.pdf"

# Linux/Mac:
cp out/proposal.pdf "out/proposal-$(date +%Y-%m-%d).pdf"
```

---

## 🔍 Отладка

### Включить подробные логи
**Файл:** `tools/make-pdf.js`
```javascript
// Добавьте вывод в консоль:
console.log('Загружен HTML:', htmlPath);
console.log('Размер страницы:', page.viewportSize());
```

### Проверить какие стили применились
```bash
# Откройте src/index.html в браузере
# Нажмите Ctrl+P (Печать)
# Проверьте предпросмотр
```

---

## ⚡ Оптимизация

### Ускорить генерацию
**Файл:** `tools/make-pdf.js`
```javascript
timeout: {
  waitAfterLoad: 100  // Уменьшите с 500 до 100
}
```

### Уменьшить размер PDF
1. Оптимизируйте изображения (WebP, сжатие)
2. Используйте SVG вместо PNG для иконок
3. Удалите неиспользуемые стили

---

## 📖 Справка

- **Node.js документация:** https://nodejs.org/docs
- **Playwright PDF API:** https://playwright.dev/docs/api/class-page#page-pdf
- **CSS @page:** https://developer.mozilla.org/en-US/docs/Web/CSS/@page
- **CSS break-inside:** https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside

---

## 💡 Полезные хоткеи

| Действие | Команда |
|----------|---------|
| Генерация PDF | `npm run pdf` |
| Открыть PDF | `start out\proposal.pdf` (Win) |
| Открыть HTML в браузере | `start src\index.html` (Win) |
| Предпросмотр печати | Ctrl+P в браузере |
| Перезагрузка PDF | F5 в программе просмотра |

---

**Сохраните этот файл в закладки для быстрого доступа!** 📌

