# 🚀 Загрузка проекта на GitHub

## Быстрый старт

### 1️⃣ Инициализация Git репозитория

```bash
# Инициализировать репозиторий
git init

# Проверить статус
git status
```

### 2️⃣ Добавить файлы в коммит

```bash
# Добавить все файлы (кроме node_modules и out/ — они в .gitignore)
git add .

# Создать первый коммит
git commit -m "Initial commit: HTML to PDF generator with Playwright"
```

### 3️⃣ Создать репозиторий на GitHub

1. Откройте https://github.com/new
2. Введите название (например: `html-to-pdf-generator`)
3. Выберите:
   - **Public** (публичный) или **Private** (приватный)
   - **НЕ создавайте** README, .gitignore, LICENSE (уже есть в проекте)
4. Нажмите **Create repository**

### 4️⃣ Подключить удалённый репозиторий

```bash
# Замените YOUR_USERNAME и YOUR_REPO на ваши данные
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Проверить подключение
git remote -v
```

### 5️⃣ Загрузить код на GitHub

```bash
# Отправить код в main ветку
git push -u origin main

# Если GitHub требует master вместо main:
# git branch -M main
# git push -u origin main
```

---

## 📋 Что будет загружено

✅ **Загружается:**
- `src/` — исходные HTML и CSS
- `tools/` — скрипт генерации
- `package.json` — зависимости
- `.gitignore` — правила исключения
- `README.md`, `START_HERE.md` и другая документация

❌ **НЕ загружается (исключено в .gitignore):**
- `node_modules/` — зависимости npm (большие, скачиваются автоматически)
- `out/` — сгенерированные PDF (результаты работы)
- `.DS_Store`, `Thumbs.db` — служебные файлы ОС

---

## 🔐 Аутентификация GitHub

### Вариант 1: Personal Access Token (рекомендуется)

1. Откройте: https://github.com/settings/tokens/new
2. Заполните:
   - **Note:** `PDF Generator Token`
   - **Expiration:** 90 days (или дольше)
   - **Scopes:** выберите `repo` (полный доступ к репозиториям)
3. Нажмите **Generate token**
4. **Скопируйте токен** (он больше не покажется!)

При `git push` введите:
- **Username:** ваш GitHub username
- **Password:** скопированный токен (НЕ пароль от GitHub!)

### Вариант 2: SSH ключ

```bash
# Генерировать SSH ключ (если нет)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Скопировать публичный ключ
cat ~/.ssh/id_ed25519.pub

# Добавить на GitHub: https://github.com/settings/keys
```

Затем измените remote URL:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
```

---

## 🎨 Красивый README для GitHub

Файл `README.md` уже оптимизирован для GitHub и содержит:
- ✅ Бейджи статуса
- ✅ Структурированное оглавление
- ✅ Примеры кода с подсветкой
- ✅ Чек-листы
- ✅ Ссылки на документацию

---

## 📝 Рекомендуемая структура коммитов

```bash
# Первый коммит
git commit -m "Initial commit: HTML to PDF generator with Playwright"

# Последующие изменения
git commit -m "feat: add margin control via print.css"
git commit -m "fix: remove black bar at page breaks"
git commit -m "docs: update margin configuration guide"
git commit -m "refactor: simplify page-start spacing"
```

**Типы коммитов:**
- `feat:` — новая функциональность
- `fix:` — исправление бага
- `docs:` — документация
- `refactor:` — рефакторинг без изменения функциональности
- `style:` — форматирование кода
- `test:` — тесты

---

## 🌿 Рекомендуемая структура веток

```bash
# Основная ветка
main (или master)

# Ветка разработки (опционально)
git checkout -b develop

# Ветка функциональности
git checkout -b feature/custom-fonts
git checkout -b feature/header-footer
git checkout -b fix/margin-control
```

---

## 🔄 Обновление репозитория

```bash
# После внесения изменений
git status
git add .
git commit -m "fix: correct top margin on first page"
git push
```

---

## 👥 Клонирование проекта (для других разработчиков)

```bash
# Клонировать репозиторий
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Установить зависимости
npm install

# Генерировать PDF
npm run pdf
```

---

## 📦 Добавление в package.json

Убедитесь что в `package.json` есть:

```json
{
  "name": "html-to-pdf-generator",
  "version": "1.0.0",
  "description": "Professional A4 PDF generation from HTML using Playwright",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO.git"
  },
  "keywords": [
    "pdf",
    "html-to-pdf",
    "playwright",
    "a4",
    "print",
    "pdf-generation",
    "commercial-proposal"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

---

## ⚠️ Важные замечания

1. **НЕ коммитьте `node_modules/`** — они огромные и бесполезны в репозитории
2. **НЕ коммитьте `out/*.pdf`** — это результаты работы, а не исходники
3. **НЕ коммитьте `.env` файлы** с секретами (уже в `.gitignore`)
4. **Проверьте `.gitignore`** перед первым коммитом

---

## 🎯 Чек-лист перед загрузкой

- [ ] `git init` выполнен
- [ ] `.gitignore` настроен (node_modules, out/ исключены)
- [ ] `git add .` добавил все нужные файлы
- [ ] Первый коммит создан
- [ ] Репозиторий создан на GitHub
- [ ] `git remote add origin` выполнен
- [ ] `git push` успешно загрузил код
- [ ] README.md корректно отображается на GitHub

---

## 🆘 Частые проблемы

### Ошибка: "remote: Repository not found"

**Решение:**
- Проверьте правильность URL: `git remote -v`
- Убедитесь что репозиторий создан на GitHub
- Проверьте права доступа (токен или SSH ключ)

### Ошибка: "failed to push some refs"

**Решение:**
```bash
git pull origin main --rebase
git push origin main
```

### Ошибка: "Support for password authentication was removed"

**Решение:**
- Используйте Personal Access Token вместо пароля
- Или настройте SSH ключ

---

## 📚 Полезные ссылки

- [GitHub Docs: Quickstart](https://docs.github.com/en/get-started/quickstart)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [SSH Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Готово! 🎉 Ваш проект теперь на GitHub!**

