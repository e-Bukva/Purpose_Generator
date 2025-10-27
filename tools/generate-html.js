#!/usr/bin/env node
/**
 * Простая генерация HTML из документа через GPT-5
 * 
 * Алгоритм:
 * 1. Берёт файл из input/
 * 2. Загружает в GPT-5
 * 3. Сохраняет HTML в generated/
 */

import dotenv from 'dotenv';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

dotenv.config();

import { initializeOpenAI, generateHTMLFromFile } from './gpt-client.js';
import { createFullHTMLDocument, PATHS, createSessionTimestamp, createSessionDirectory } from './file-utils.js';
import { HTML_TEMPLATE } from '../config/gpt-prompts.js';

/**
 * Главная функция
 */
async function main() {
  console.log('\n🤖 Генерация HTML из документа\n');
  
  // 1. Проверка API ключа
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    console.log('✗ Ошибка: OPENAI_API_KEY не найден');
    console.log('\n📝 Создайте файл .env:');
    console.log('OPENAI_API_KEY=sk-ваш-ключ');
    console.log('OPENAI_MODEL=gpt-5\n');
    return;
  }
  
  const model = process.env.OPENAI_MODEL || 'gpt-5';
  initializeOpenAI(apiKey, model);
  console.log(`✓ API готов (${model})\n`);
  
  // 2. Поиск файла
  console.log('📁 Поиск файла в input/...');
  
  const files = readdirSync(PATHS.input)
    .filter(f => !f.startsWith('.'))
    .filter(f => ['.pdf', '.docx', '.doc', '.md'].includes(extname(f).toLowerCase()))
    .map(f => ({
      name: f,
      path: join(PATHS.input, f),
      stats: statSync(join(PATHS.input, f))
    }));
  
  if (files.length === 0) {
    console.log('✗ Файлы не найдены');
    console.log('  Положите PDF, Word или Markdown файл в папку input/\n');
    return;
  }
  
  const file = files[0];
  const sizeKB = Math.round(file.stats.size / 1024);
  console.log(`✓ Найден: ${file.name} (${sizeKB} KB)\n`);
  
  // 3. Генерация HTML
  console.log(`🧠 Отправка в ${model}...`);
  
  try {
    const result = await generateHTMLFromFile(file.path, model);
    
    const sizeKB = (result.html.length / 1024).toFixed(1);
    console.log(`✓ HTML получен (${sizeKB} KB)`);
    console.log(`  Токены: ${result.usage.prompt_tokens} промпт + ${result.usage.completion_tokens} ответ = ${result.usage.total_tokens}\n`);
    
    // 4. Создание сессии
    const sessionTimestamp = createSessionTimestamp();
    const sessionPath = createSessionDirectory(sessionTimestamp);
    console.log(`📁 Сессия: ${sessionTimestamp}\n`);
    
    // 5. Сохранение HTML в сессию
    const fullHTML = createFullHTMLDocument(result.html, HTML_TEMPLATE);
    const htmlPath = join(sessionPath, 'proposal.html');
    
    writeFileSync(htmlPath, fullHTML, 'utf-8');
    console.log(`💾 HTML: ${htmlPath}\n`);
    
    console.log('✅ Готово! Теперь запустите:');
    console.log('   npm run pdf\n');
    
  } catch (error) {
    console.log(`✗ Ошибка: ${error.message}\n`);
    process.exit(1);
  }
}

main();

