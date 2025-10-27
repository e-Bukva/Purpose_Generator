# 🖼️ Краткое руководство по логотипам

## Быстрый старт

### Генерация PDF с логотипами

```bash
# Blue Rakun (по умолчанию)
npm run pdf

# Spa Bureau
npm run pdf -- --logo=spa-bureau
```

## Настройка в 3 шага

### 1. Выбор логотипа

Откройте `logo-config.json` и измените `path`:

```json
{
  "logo": {
    "path": "src/assets/logos/Spabureau360.png"
  }
}
```

### 2. Настройка позиции

Измените `position` (по центру внизу — лучший вариант):

```json
{
  "logo": {
    "position": "bottom-center",
    "width": "35mm",
    "margin": {
      "bottom": "8mm"
    }
  }
}
```

**Варианты позиций:**
- `bottom-center` ⭐ — рекомендуется
- `bottom-right`
- `bottom-left`
- `top-center`
- `top-right`
- `top-left`

### 3. Настройка размера

Отрегулируйте ширину логотипа:

```json
{
  "logo": {
    "width": "30mm"    // маленький
    "width": "35mm"    // средний (рекомендуется)
    "width": "45mm"    // большой
  }
}
```

## Отключение логотипа

```json
{
  "enabled": false
}
```

## Добавление своего логотипа

1. **Поместите файл** в `src/assets/logos/my-logo.png`

2. **Добавьте в конфиг:**
```json
{
  "alternatives": {
    "blue-rakun": "src/assets/logos/Blue_Rakun синий.png",
    "spa-bureau": "src/assets/logos/Spabureau360.png",
    "my-logo": "src/assets/logos/my-logo.png"
  }
}
```

3. **Используйте:**
```bash
npm run pdf -- --logo=my-logo
```

## Рекомендации

### Формат файлов
- ✅ **PNG** с прозрачным фоном (рекомендуется)
- ✅ **SVG** векторный формат
- ⚠️ **JPG** (без прозрачности)

### Размеры для PNG
- Ширина: **300-600px**
- Разрешение: **150-300 DPI**
- Пропорции: любые

### Лучшие настройки
```json
{
  "position": "bottom-center",
  "width": "35mm",
  "opacity": 0.9,
  "margin": {
    "bottom": "8mm"
  }
}
```

## Решение проблем

### Логотип слишком большой
Уменьшите `width`:
```json
{ "width": "25mm" }
```

### Логотип слишком яркий
Уменьшите `opacity`:
```json
{ "opacity": 0.7 }
```

### Логотип перекрывает текст
Увеличьте `margin.bottom`:
```json
{
  "margin": {
    "bottom": "12mm"
  }
}
```

### Логотип не появляется
1. Проверьте путь в `logo-config.json`
2. Убедитесь что `enabled: true`
3. Проверьте что файл существует в `src/assets/logos/`

---

**Подробная документация:** `README.md` и `src/assets/README.md`


