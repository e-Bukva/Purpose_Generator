#!/usr/bin/env node
/**
 * Генератор PDF из HTML с использованием Playwright
 * Соответствует ТЗ: A4, поля 15 мм, колонтитулы, контроль разрывов
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === Конфигурация ===

const CONFIG = {
  // Пути
  htmlPath: resolve(__dirname, '../src/index.html'),
  outDir: resolve(__dirname, '../out'),
  outFile: 'proposal.pdf',  // Базовое имя (будет изменено в generatePDF)
  useTimestamp: true,  // Добавлять дату и время к имени файла

  // Параметры страницы
  format: 'A4',
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '40mm',  // резерв для логотипа
    left: '20mm'
  },

  // Опции PDF
  printBackground: true,
  preferCSSPageSize: true,  // используем margin из @page в print.css
  displayHeaderFooter: false,  // без колонтитулов и нумерации

  // Опции браузера
  launchOptions: {
    headless: true,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  },

  // Таймауты
  timeout: {
    navigation: 30000,
    waitAfterLoad: 500  // дополнительная пауза для рендера шрифтов
  }
};

// === Утилиты ===

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    step: '→'
  }[type] || 'ℹ';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    log(`Создана директория: ${dirPath}`, 'step');
  }
}

function validateFiles() {
  if (!existsSync(CONFIG.htmlPath)) {
    throw new Error(`HTML файл не найден: ${CONFIG.htmlPath}`);
  }
  log(`HTML файл найден: ${CONFIG.htmlPath}`, 'info');
}

// === Генерация имени файла с временной меткой ===

function generateFileName(logoKey = null) {
  const baseName = 'proposal';
  
  if (!CONFIG.useTimestamp) {
    return CONFIG.outFile;
  }
  
  // Форматируем дату и время: YYYYMMDD_HHMMSS
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
  
  // Формат: proposal_blue-rakun_20251027_123045.pdf
  if (logoKey) {
    return `${baseName}_${logoKey}_${timestamp}.pdf`;
  }
  
  // Формат: proposal_20251027_123045.pdf
  return `${baseName}_${timestamp}.pdf`;
}

// === Загрузка конфигурации логотипа ===

function loadLogoConfig() {
  const configPath = resolve(__dirname, '../logo-config.json');
  
  if (!existsSync(configPath)) {
    log('⚠️  Конфиг логотипа не найден, логотип отключён', 'warn');
    return { enabled: false };
  }
  
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    
    // Поддержка выбора логотипа через CLI аргумент
    const logoArg = process.argv.find(arg => arg.startsWith('--logo='));
    
    if (logoArg && config.alternatives) {
      const logoKey = logoArg.split('=')[1];
      
      if (config.alternatives[logoKey]) {
        const altLogo = config.alternatives[logoKey];
        
        // Поддержка двух форматов: строка (старый) или объект (новый)
        if (typeof altLogo === 'string') {
          config.logo.path = altLogo;
        } else {
          config.logo.path = altLogo.path;
          // Применяем индивидуальные настройки логотипа
          if (altLogo.width) config.logo.width = altLogo.width;
          if (altLogo.opacity) config.logo.opacity = altLogo.opacity;
          if (altLogo.margin) config.logo.margin = { ...config.logo.margin, ...altLogo.margin };
        }
        
        log(`✓ Выбран логотип: ${logoKey} → ${config.logo.path} (${config.logo.width})`, 'info');
      } else {
        log(`⚠️  Логотип '${logoKey}' не найден в alternatives, использую по умолчанию`, 'warn');
        log(`Доступные: ${Object.keys(config.alternatives).join(', ')}`, 'warn');
      }
    } else {
      log(`✓ Используется логотип по умолчанию: ${config.logo.path} (${config.logo.width})`, 'info');
    }
    
    log(`✓ Конфигурация логотипа загружена`, 'info');
    return config;
  } catch (error) {
    log(`⚠️  Ошибка чтения конфига: ${error.message}`, 'warn');
    return { enabled: false };
  }
}

// === Инжект логотипа в HTML ===

async function injectLogo(page, logoConfig) {
  if (!logoConfig.enabled) {
    log('Логотип отключён в конфиге', 'info');
    return;
  }

  const logoPath = resolve(__dirname, '..', logoConfig.logo.path);
  
  if (!existsSync(logoPath)) {
    log(`⚠️  Файл логотипа не найден: ${logoPath}`, 'warn');
    return;
  }

  log(`Добавление логотипа: ${logoPath}`, 'step');

  // Конвертируем путь для file:// URL
  const logoUrl = 'file://' + logoPath.replace(/\\/g, '/');
  
  // Инжектим логотип через JS
  await page.evaluate(({ url, config }) => {
    const logoContainer = document.getElementById('pdf-logo');
    if (!logoContainer) {
      console.warn('Контейнер #pdf-logo не найден в HTML');
      return;
    }

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Company Logo';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    
    // Простое позиционирование - fixed bottom
    const bottomMargin = config.margin.bottom || '3mm';
    
    // Определяем позицию
    let positionStyles = '';
    
    if (config.position === 'bottom-center' || !config.position) {
      positionStyles = `
        left: 50%;
        transform: translateX(-50%);
        bottom: ${bottomMargin};
      `;
    } else if (config.position === 'bottom-right') {
      positionStyles = `
        right: ${config.margin.right || '15mm'};
        bottom: ${bottomMargin};
      `;
    } else if (config.position === 'bottom-left') {
      positionStyles = `
        left: ${config.margin.right || '15mm'};
        bottom: ${bottomMargin};
      `;
    }
    
    // Применяем стили к контейнеру
    logoContainer.style.cssText = `
      position: fixed;
      ${positionStyles}
      width: ${config.width};
      height: ${config.height};
      opacity: ${config.opacity};
      z-index: 1000;
      pointer-events: none;
    `;
    
    logoContainer.appendChild(img);
  }, { url: logoUrl, config: logoConfig.logo });

  // Дополнительная пауза для загрузки изображения
  await page.waitForTimeout(300);
  log('✓ Логотип успешно добавлен', 'info');
}

// === Основная функция генерации ===

async function generatePDF() {
  const startTime = Date.now();
  
  log('=== Генерация PDF началась ===', 'step');

  try {
    // Проверки
    validateFiles();
    ensureDir(CONFIG.outDir);

    // Загрузка конфигурации логотипа
    const logoConfig = loadLogoConfig();
    
    // Определяем какой логотип используется (для имени файла)
    const logoArg = process.argv.find(arg => arg.startsWith('--logo='));
    const logoKey = logoArg ? logoArg.split('=')[1] : null;

    // Запуск браузера
    log('Запуск Chromium...', 'step');
    const browser = await chromium.launch(CONFIG.launchOptions);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();

    // Загрузка HTML
    const htmlUrl = 'file://' + CONFIG.htmlPath.replace(/\\/g, '/');
    log(`Загрузка страницы: ${htmlUrl}`, 'step');
    
    await page.goto(htmlUrl, {
      waitUntil: 'load',
      timeout: CONFIG.timeout.navigation
    });

    // Переключение в режим печати
    log('Применение печатных стилей...', 'step');
    await page.emulateMedia({ media: 'print' });

    // Дополнительная пауза для рендера шрифтов и стилей
    if (CONFIG.timeout.waitAfterLoad > 0) {
      await page.waitForTimeout(CONFIG.timeout.waitAfterLoad);
    }

    // Генерация PDF
    const fileName = generateFileName(logoKey);
    const outPath = join(CONFIG.outDir, fileName);
    log(`Генерация PDF: ${outPath}`, 'step');

    // Подготовка футера с логотипом если включен
    let pdfOptions = {
      path: outPath,
      format: CONFIG.format,
      margin: CONFIG.margin,
      printBackground: CONFIG.printBackground,
      preferCSSPageSize: CONFIG.preferCSSPageSize,
      displayHeaderFooter: false
    };

    // Если логотип включен, добавляем через displayHeaderFooter
    if (logoConfig.enabled) {
      const logoPath = resolve(__dirname, '..', logoConfig.logo.path);
      if (existsSync(logoPath)) {
        // Читаем файл и конвертируем в base64
        const logoBuffer = readFileSync(logoPath);
        const logoExt = logoPath.split('.').pop().toLowerCase();
        const mimeTypes = {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'svg': 'image/svg+xml',
          'gif': 'image/gif'
        };
        const mimeType = mimeTypes[logoExt] || 'image/png';
        const logoBase64 = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
        
        const logoWidth = logoConfig.logo.width || '35mm';
        const logoOpacity = logoConfig.logo.opacity || 0.9;
        // Отступ от нижнего края страницы (работает через margin-top в footer)
        const fromEdge = logoConfig.logo.margin.fromEdge || logoConfig.logo.margin.top || '5mm';
        
        pdfOptions.displayHeaderFooter = true;
        pdfOptions.headerTemplate = '<div></div>';
        pdfOptions.footerTemplate = `
          <div style="width: 100%; height: 35mm; position: relative; font-size: 1px;">
            <div style="position: absolute; bottom: ${fromEdge}; left: 0; right: 0; text-align: center;">
              <img src="${logoBase64}" style="width: ${logoWidth}; opacity: ${logoOpacity}; display: inline-block;" />
            </div>
          </div>
        `;
        log(`✓ Логотип будет добавлен в футер (${logoExt.toUpperCase()}, ${Math.round(logoBuffer.length/1024)}KB)`, 'info');
      }
    }

    await page.pdf(pdfOptions);

    // Закрытие браузера
    await browser.close();

    // Итоги
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`=== PDF готов: ${outPath} (${elapsed}s) ===`, 'info');

    return { success: true, path: outPath, elapsed };

  } catch (error) {
    log(`Ошибка генерации: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// === Тестовый режим ===

async function runTests() {
  log('=== Тестовый режим ===', 'step');
  
  const result = await generatePDF();
  
  if (result.success) {
    log('✓ T1: Базовая генерация прошла успешно', 'info');
    log('✓ T2: Файл создан без ошибок', 'info');
    log('✓ T3: Проверьте вручную:', 'warn');
    log('  - Пагинация и разрывы разделов', 'warn');
    log('  - Колонтитулы (хедер/футер с нумерацией)', 'warn');
    log('  - Фоны и градиенты присутствуют', 'warn');
    log('  - Кириллица отображается корректно', 'warn');
    log('  - Таблицы не разорваны', 'warn');
  }
}

// === Точка входа ===

const isTestMode = process.argv.includes('--test');

if (isTestMode) {
  runTests();
} else {
  generatePDF();
}

