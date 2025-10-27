# Руководство по установке и запуску

Пошаговое руководство для быстрого старта проекта генерации PDF.

## Системные требования

- **Node.js:** ≥ 18.0.0 (рекомендуется 20.x LTS)
- **npm:** ≥ 9.0.0 (поставляется с Node.js)
- **ОС:** Windows 10/11, macOS 12+, Linux (Ubuntu 20.04+)
- **Свободное место:** ~500 МБ (для браузера Chromium)

## Шаг 1: Установка Node.js (если ещё не установлен)

### Windows

Скачайте установщик с официального сайта:
```
https://nodejs.org/en/download/
→ Windows Installer (.msi)
→ Рекомендуется: LTS версия
```

### macOS

```bash
# Homebrew
brew install node

# Или скачать с nodejs.org
```

### Linux (Ubuntu/Debian)

```bash
# NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Проверка установки:
```bash
node --version   # должно быть v18+ или v20+
npm --version    # должно быть v9+ или v10+
```

## Шаг 2: Установка зависимостей проекта

Откройте терминал в корне проекта и выполните:

```bash
npm install
```

Это установит:
- `playwright` — библиотека для управления браузером

После установки автоматически скачается браузер Chromium (~350 МБ):

```bash
npm run prepare
```

Если автоматическая установка не сработала, выполните вручную:

```bash
npx playwright install chromium
```

## Шаг 3: Установка шрифтов (опционально, но рекомендуется)

Для корректного отображения кириллицы рекомендуется установить локальные шрифты.

### Быстрый способ

1. Скачайте **Inter**:
   ```
   https://github.com/rsms/inter/releases/latest
   → Inter-X.X.zip
   ```

2. Распакуйте и скопируйте в `src/fonts/`:
   - `Inter-Variable.woff2`
   - `Inter-Variable.ttf`

3. Скачайте **Montserrat** (опционально):
   ```
   https://github.com/JulietaUla/Montserrat/releases
   → Montserrat.zip
   ```

4. Распакуйте и скопируйте в `src/fonts/`:
   - `Montserrat-VariableFont_wght.woff2` → переименуйте в `Montserrat-Variable.woff2`
   - `Montserrat-VariableFont_wght.ttf` → переименуйте в `Montserrat-Variable.ttf`

### Альтернатива: системные шрифты

Если не хотите устанавливать шрифты, проект будет использовать системные (`Segoe UI` на Windows, `SF Pro` на macOS). Они уже содержат кириллицу.

## Шаг 4: Первый запуск

Создайте первый PDF:

```bash
npm run pdf
```

Результат будет сохранён в `out/proposal.pdf`.

### Тестовый режим (с проверками)

```bash
npm run pdf:test
```

Это запустит генерацию с логированием всех шагов и базовыми проверками.

## Шаг 5: Проверка результата

Откройте файл `out/proposal.pdf` и проверьте:

- ✅ Формат A4, поля равномерные
- ✅ Разделы начинаются с новой страницы
- ✅ Таблицы не разорваны
- ✅ Колонтитулы: «стр. X/Y» внизу справа
- ✅ Кириллица читается (нет «квадратиков»)
- ✅ Текст выделяется и копируется
- ✅ Фоны и градиенты присутствуют

## Возможные проблемы и решения

### ❌ `npm: command not found`

**Причина:** Node.js не установлен или не добавлен в PATH.

**Решение:**
- Установите Node.js (см. Шаг 1)
- Перезапустите терминал/командную строку
- Проверьте: `node --version`

### ❌ `Cannot find module 'playwright'`

**Причина:** Зависимости не установлены.

**Решение:**
```bash
npm install
npm run prepare
```

### ❌ `Executable doesn't exist at ...playwright/chromium...`

**Причина:** Браузер Chromium не скачан.

**Решение:**
```bash
npx playwright install chromium
```

### ❌ В PDF кириллица отображается как «квадратики»

**Причина:** Шрифты не содержат кириллицу или не найдены.

**Решение:**
1. Установите локальные шрифты (см. Шаг 3)
2. Или отредактируйте `src/print.css`:
   ```css
   body {
     font-family: "Segoe UI", Arial, sans-serif; /* системные шрифты */
   }
   ```

### ❌ `Error: net::ERR_FILE_NOT_FOUND` при загрузке шрифтов

**Причина:** Неверный путь к файлам шрифтов.

**Решение:**
1. Убедитесь, что файлы в `src/fonts/` названы точно:
   - `Inter-Variable.woff2`
   - `Inter-Variable.ttf`
2. Проверьте путь в `src/print.css`:
   ```css
   src: url("./fonts/Inter-Variable.woff2") format("woff2");
   ```

### ❌ Колонтитулы не отображаются

**Причина:** Шаблоны колонтитулов требуют inline-стили.

**Решение:** это уже настроено в `tools/make-pdf.js`. Если не работает, проверьте:
```javascript
displayHeaderFooter: true,  // должно быть включено
```

### ❌ PDF генерируется долго (> 30 сек)

**Причина:** Медленное соединение или большие изображения.

**Решение:**
- Оптимизируйте изображения (WebP, сжатие)
- Увеличьте таймаут в `tools/make-pdf.js`:
  ```javascript
  timeout: {
    navigation: 60000  // 60 секунд
  }
  ```

## Следующие шаги

После успешной установки:

1. **Редактирование содержимого:**
   - Откройте `src/index.html` и отредактируйте текст/таблицы
   - Сохраните и запустите `npm run pdf`

2. **Настройка стилей:**
   - Откройте `src/print.css` для изменения полей, шрифтов, отступов
   - Измените встроенные стили в `src/index.html` для экранной версии

3. **Настройка колонтитулов:**
   - Откройте `tools/make-pdf.js` и отредактируйте `headerTemplate`/`footerTemplate`

4. **Добавление новых разделов:**
   - Добавьте `<section class="section page-start">` для начала с новой страницы
   - Добавьте класс `.no-break` к таблицам/блокам, которые нельзя разрывать

## Документация

- **README.md** — основная документация проекта
- **src/fonts/README.md** — инструкции по установке шрифтов
- **Официальная документация Playwright:** https://playwright.dev/docs/api/class-page#page-pdf

## Поддержка

При возникновении проблем:
1. Проверьте версию Node.js: `node --version` (должно быть ≥ 18.0.0)
2. Переустановите зависимости: `rm -rf node_modules && npm install`
3. Переустановите браузер: `npx playwright install chromium --force`

---

**Готово!** Теперь вы можете генерировать профессиональные PDF документы из HTML. 🎉

