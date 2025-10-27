/**
 * Клиент для работы с OpenAI ChatGPT API
 */

import OpenAI from 'openai';
import { createReadStream, readFileSync } from 'fs';
import { basename, extname } from 'path';
import { SYSTEM_PROMPT, getInitialPrompt, getCorrectionPrompt } from '../config/gpt-prompts.js';

let openaiClient = null;

/**
 * Инициализировать OpenAI клиент
 * Используется стандартный API /v1/chat/completions
 */
export function initializeOpenAI(apiKey, model = 'gpt-5') {
  if (!apiKey) {
    throw new Error('OpenAI API ключ не предоставлен');
  }
  
  openaiClient = new OpenAI({
    apiKey: apiKey
  });
  
  return { client: openaiClient, model };
}

/**
 * Проверить валидность API ключа
 */
export async function validateAPIKey(apiKey) {
  try {
    const testClient = new OpenAI({ apiKey });
    // Простой запрос для проверки
    await testClient.models.list();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Загрузить файл в OpenAI и получить file_id
 */
async function uploadFile(filePath) {
  if (!openaiClient) {
    throw new Error('OpenAI клиент не инициализирован');
  }
  
  try {
    console.log(`  📤 Загрузка файла: ${basename(filePath)}...`);
    
    // Используем OpenAI SDK для загрузки
    const file = await openaiClient.files.create({
      file: createReadStream(filePath),
      purpose: 'user_data'  // для работы с документами через attachments
    });
    
    console.log(`  ✓ Файл загружен: ${file.id}`);
    return file.id;
  } catch (error) {
    throw new Error(`Ошибка загрузки файла: ${error.message}`);
  }
}

/**
 * Генерация HTML напрямую из файла (без парсинга)
 * Использует Responses API /v1/responses с input_file
 */
export async function generateHTMLFromFile(filePath, model = 'gpt-5') {
  if (!openaiClient) {
    throw new Error('OpenAI клиент не инициализирован. Вызовите initializeOpenAI() сначала.');
  }
  
  try {
    const ext = extname(filePath).toLowerCase();
    
    // Для PDF - загружаем файл и используем Responses API
    if (ext === '.pdf') {
      return await generateFromPDFViaFile(filePath, model);
    } else {
      // Для Word и Markdown - читаем текст и отправляем через Responses API как input_text
      const fileContent = readFileSync(filePath, 'utf-8');
      console.log(`  📄 Чтение файла: ${basename(filePath)}...`);
      return await generateFromTextViaResponses(fileContent, model);
    }
  } catch (error) {
    throw new Error(`Ошибка генерации HTML из файла: ${error.message}`);
  }
}

/**
 * Генерация HTML из PDF через загрузку файла
 */
async function generateFromPDFViaFile(filePath, model) {
  const fileId = await uploadFile(filePath);
      
      // Отправляем запрос через Responses API с файлом
      const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiClient.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        input: [
          {
            role: 'system',
            content: [
              { type: 'input_text', text: SYSTEM_PROMPT }
            ]
          },
          {
            role: 'user',
            content: [
              { 
                type: 'input_text', 
                text: 'Преобразуй содержимое этого документа в HTML по шаблону из system prompt. КРИТИЧЕСКИ ВАЖНО: игнорируй колонтитулы, номера страниц и повторяющиеся элементы оформления.' 
              },
              {
                type: 'input_file',
                file_id: fileId
              }
            ]
          }
        ],
        max_output_tokens: 16000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    // Извлекаем текст из Responses API
    const data = await response.json();
    
    // Проверяем статус
    if (data.status === 'incomplete') {
      throw new Error(`Ответ неполный: ${data.incomplete_details?.reason}. Увеличьте max_output_tokens`);
    }
    
    // Ищем message в output (может быть несколько элементов: reasoning + message)
    const messageOutput = data.output.find(item => item.type === 'message');
    if (!messageOutput || !messageOutput.content) {
      throw new Error(`Не найден message в output: ${JSON.stringify(data.output)}`);
    }
    
    // Находим текстовый контент
    const textContent = messageOutput.content.find(item => item.type === 'output_text');
    if (!textContent) {
      throw new Error(`Не найден output_text в content: ${JSON.stringify(messageOutput.content)}`);
    }
    
    const htmlContent = textContent.text.trim();
    
    // Очистка от markdown обёрток
    let cleanHTML = htmlContent;
    if (cleanHTML.startsWith('```html')) {
      cleanHTML = cleanHTML.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (cleanHTML.startsWith('```')) {
      cleanHTML = cleanHTML.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    // Извлекаем usage из нового формата
    const usage = {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens: data.usage?.total_tokens || 0
    };
    
    return {
      html: cleanHTML,
      usage: usage,
      model: data.model,
      fileId: fileId
    };
}

/**
 * Генерация HTML из текста через Responses API
 */
async function generateFromTextViaResponses(textContent, model) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiClient.apiKey}`
    },
    body: JSON.stringify({
      model: model,
      input: [
        {
          role: 'user',
          content: [
            { 
              type: 'input_text', 
              text: SYSTEM_PROMPT + '\n\nПреобразуй следующий текст в HTML по шаблону. КРИТИЧЕСКИ ВАЖНО: игнорируй колонтитулы, номера страниц и повторяющиеся элементы оформления.\n\n' + textContent
            }
          ]
        }
      ],
      max_output_tokens: 16000
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.status === 'incomplete') {
    throw new Error(`Ответ неполный: ${data.incomplete_details?.reason}`);
  }
  
  const messageOutput = data.output.find(item => item.type === 'message');
  if (!messageOutput || !messageOutput.content) {
    throw new Error(`Не найден message в output`);
  }
  
  const outputText = messageOutput.content.find(item => item.type === 'output_text');
  if (!outputText) {
    throw new Error(`Не найден output_text`);
  }
  
  const htmlContent = outputText.text.trim();
  
  // Очистка от markdown обёрток
  let cleanHTML = htmlContent;
  if (cleanHTML.startsWith('```html')) {
    cleanHTML = cleanHTML.replace(/^```html\n/, '').replace(/\n```$/, '');
  } else if (cleanHTML.startsWith('```')) {
    cleanHTML = cleanHTML.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  const usage = {
    prompt_tokens: data.usage?.input_tokens || 0,
    completion_tokens: data.usage?.output_tokens || 0,
    total_tokens: data.usage?.total_tokens || 0
  };
  
  return {
    html: cleanHTML,
    usage: usage,
    model: data.model
  };
}

/**
 * Генерация HTML из исходного текста
 * Использует стандартный API /v1/chat/completions
 */
export async function generateHTMLFromText(extractedText, model = 'gpt-5') {
  if (!openaiClient) {
    throw new Error('OpenAI клиент не инициализирован. Вызовите initializeOpenAI() сначала.');
  }
  
  try {
    // Стандартный формат API: /v1/chat/completions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiClient.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: getInitialPrompt(extractedText) }
        ],
        max_completion_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    // Извлекаем текст из стандартного формата ответа
    const data = await response.json();
    const htmlContent = data.choices[0].message.content.trim();
    
    // Очистка от markdown обёрток если GPT их добавил
    let cleanHTML = htmlContent;
    if (cleanHTML.startsWith('```html')) {
      cleanHTML = cleanHTML.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (cleanHTML.startsWith('```')) {
      cleanHTML = cleanHTML.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    return {
      html: cleanHTML,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    throw new Error(`Ошибка генерации HTML: ${error.message}`);
  }
}

/**
 * Применить корректировки к существующему HTML
 * Использует стандартный API /v1/chat/completions
 */
export async function applyCorrections(currentHTML, userCorrection, model = 'gpt-5') {
  if (!openaiClient) {
    throw new Error('OpenAI клиент не инициализирован. Вызовите initializeOpenAI() сначала.');
  }
  
  try {
    // Стандартный формат API: /v1/chat/completions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiClient.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: getCorrectionPrompt(currentHTML, userCorrection) }
        ],
        max_completion_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    // Извлекаем текст из стандартного формата ответа
    const data = await response.json();
    const htmlContent = data.choices[0].message.content.trim();
    
    // Очистка от markdown обёрток
    let cleanHTML = htmlContent;
    if (cleanHTML.startsWith('```html')) {
      cleanHTML = cleanHTML.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (cleanHTML.startsWith('```')) {
      cleanHTML = cleanHTML.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    return {
      html: cleanHTML,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    throw new Error(`Ошибка применения корректировок: ${error.message}`);
  }
}

/**
 * Анализ структуры HTML для показа превью
 */
export function analyzeHTMLStructure(html) {
  const sections = [];
  
  // Извлекаем разделы через регулярные выражения
  const sectionRegex = /<section[^>]*id="([^"]*)"[^>]*>[\s\S]*?<h2[^>]*>(.*?)<\/h2>/g;
  let match;
  
  while ((match = sectionRegex.exec(html)) !== null) {
    const id = match[1];
    const title = match[2].replace(/<[^>]*>/g, '').trim();
    sections.push({ id, title });
  }
  
  // Если не нашли через section, пробуем просто h2
  if (sections.length === 0) {
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/g;
    while ((match = h2Regex.exec(html)) !== null) {
      const title = match[1].replace(/<[^>]*>/g, '').trim();
      sections.push({ title });
    }
  }
  
  // Подсчитываем таблицы
  const tableCount = (html.match(/<table/g) || []).length;
  
  // Подсчитываем списки
  const listCount = (html.match(/<ul/g) || []).length;
  
  return {
    sections,
    tableCount,
    listCount,
    characterCount: html.length,
    hasContent: sections.length > 0 || html.includes('<p')
  };
}

/**
 * Валидация HTML (базовая проверка)
 */
export function validateHTML(html) {
  const errors = [];
  const warnings = [];
  
  // Проверка на пустой контент
  if (!html || html.trim().length === 0) {
    errors.push('HTML пустой');
    return { valid: false, errors, warnings };
  }
  
  // Проверка на незакрытые теги (базовая)
  const openTags = (html.match(/<section/g) || []).length;
  const closeTags = (html.match(/<\/section>/g) || []).length;
  if (openTags !== closeTags) {
    warnings.push(`Несоответствие тегов <section>: открыто ${openTags}, закрыто ${closeTags}`);
  }
  
  // Проверка на наличие контента
  const hasHeadings = html.includes('<h2') || html.includes('<h3');
  if (!hasHeadings) {
    warnings.push('HTML не содержит заголовков');
  }
  
  // Проверка на markdown обёртки (не должно быть)
  if (html.includes('```html') || html.includes('```')) {
    errors.push('HTML содержит markdown обёртки - требуется очистка');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Форматирование использования токенов
 */
export function formatTokenUsage(usage) {
  if (!usage) return 'N/A';
  
  return `Промпт: ${usage.prompt_tokens}, Ответ: ${usage.completion_tokens}, Всего: ${usage.total_tokens}`;
}

