# 🎨 Логотипы для PDF

## Доступные логотипы

### 1. Blue Rakun (по умолчанию)
- **Файл:** `blue-rakun.svg`
- **Описание:** Логотип с енотом и фирменными цветами Blue Rakun
- **Использование:** Для проектов от компании Blue Rakun

### 2. Spa Bureau
- **Файл:** `spa-bureau.svg`
- **Описание:** Логотип с элементами SPA (листья, капли воды)
- **Использование:** Для проектов от компании Spa Bureau

## Поддерживаемые форматы

- ✅ **SVG** (рекомендуется) — векторная графика, масштабируется без потери качества
- ✅ **PNG** — с прозрачным фоном для лучшего результата
- ✅ **JPG** — если прозрачность не требуется

## Рекомендации по размерам

- **Ширина PNG:** 300-800px
- **Разрешение:** 150-300 DPI
- **Соотношение сторон:** любое (задаётся в конфиге)

## Как заменить логотип

### Быстрая замена

Отредактируйте файл `logo-config.json` в корне проекта:

```json
{
  "logo": {
    "path": "src/assets/logos/spa-bureau.svg"
  }
}
```

### Через командную строку

```bash
# Использовать Blue Rakun
npm run pdf

# Использовать Spa Bureau
npm run pdf -- --logo=spa-bureau
```

## Как добавить новый логотип

1. Поместите файл в эту папку: `src/assets/logos/my-logo.png`

2. Добавьте в `logo-config.json`:
   ```json
   {
     "alternatives": {
       "blue-rakun": "src/assets/logos/blue-rakun.svg",
       "spa-bureau": "src/assets/logos/spa-bureau.svg",
       "my-company": "src/assets/logos/my-logo.png"
     }
   }
   ```

3. Используйте:
   ```bash
   npm run pdf -- --logo=my-company
   ```

## Настройка позиции и размера

В файле `logo-config.json` доступны параметры:

```json
{
  "logo": {
    "position": "bottom-right",  // bottom-right, bottom-left, top-right, top-left
    "width": "45mm",              // ширина логотипа
    "height": "auto",             // авто-высота (сохраняет пропорции)
    "opacity": 0.85,              // прозрачность (0-1)
    "margin": {
      "bottom": "10mm",           // отступ снизу
      "right": "15mm"             // отступ справа
    }
  }
}
```

## Отключение логотипа

Чтобы сгенерировать PDF без логотипа:

```json
{
  "enabled": false
}
```

---

**Подсказка:** SVG файлы можно редактировать в любом текстовом редакторе или векторном редакторе (Figma, Inkscape, Adobe Illustrator).



