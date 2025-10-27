/**
 * Утилиты для работы с файловой системой и версионированием
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Корневая директория проекта
export const PROJECT_ROOT = resolve(__dirname, '..');

// Основные пути
export const PATHS = {
  input: join(PROJECT_ROOT, 'input'),
  generated: join(PROJECT_ROOT, 'generated'),
  sessions: join(PROJECT_ROOT, 'generated', 'sessions'),
  out: join(PROJECT_ROOT, 'out'),
  src: join(PROJECT_ROOT, 'src')
};

/**
 * Создать директорию если не существует
 */
export function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

/**
 * Инициализировать все необходимые директории
 */
export function initializeDirectories() {
  const created = [];
  
  Object.entries(PATHS).forEach(([name, path]) => {
    if (ensureDir(path)) {
      created.push(name);
    }
  });
  
  return created;
}

/**
 * Сканировать папку input на наличие документов
 */
export function scanInputFolder() {
  if (!existsSync(PATHS.input)) {
    return [];
  }
  
  const files = readdirSync(PATHS.input)
    .filter(file => !file.startsWith('.'))
    .filter(file => {
      const ext = file.toLowerCase();
      return ext.endsWith('.docx') || 
             ext.endsWith('.pdf') || 
             ext.endsWith('.md') ||
             ext.endsWith('.markdown');
    })
    .map(file => {
      const fullPath = join(PATHS.input, file);
      const stats = statSync(fullPath);
      return {
        name: file,
        path: fullPath,
        stats
      };
    });
  
  return files;
}

/**
 * Создать timestamp для сессии
 */
export function createSessionTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Создать директорию для новой сессии
 */
export function createSessionDirectory(timestamp) {
  const sessionPath = join(PATHS.sessions, timestamp);
  ensureDir(sessionPath);
  return sessionPath;
}

/**
 * Скопировать исходный документ в папку сессии
 */
export function copySourceToSession(sourcePath, sessionPath) {
  const fileName = basename(sourcePath);
  const destPath = join(sessionPath, `source_${fileName}`);
  copyFileSync(sourcePath, destPath);
  return destPath;
}

/**
 * Сохранить HTML версию
 */
export function saveHTMLVersion(sessionPath, version, content) {
  const fileName = version === 'final' 
    ? 'proposal_final.html' 
    : `proposal_v${version}.html`;
  
  const filePath = join(sessionPath, fileName);
  writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Прочитать HTML версию
 */
export function readHTMLVersion(sessionPath, version) {
  const fileName = version === 'final' 
    ? 'proposal_final.html' 
    : `proposal_v${version}.html`;
  
  const filePath = join(sessionPath, fileName);
  
  if (!existsSync(filePath)) {
    return null;
  }
  
  return readFileSync(filePath, 'utf-8');
}

/**
 * Получить список всех версий в сессии
 */
export function getSessionVersions(sessionPath) {
  if (!existsSync(sessionPath)) {
    return [];
  }
  
  const files = readdirSync(sessionPath)
    .filter(file => file.startsWith('proposal_v') || file === 'proposal_final.html')
    .sort();
  
  return files;
}

/**
 * Извлечь номер версии из имени файла
 */
export function extractVersionNumber(fileName) {
  const match = fileName.match(/proposal_v(\d+)\.html/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Получить следующий номер версии
 */
export function getNextVersionNumber(sessionPath) {
  const versions = getSessionVersions(sessionPath);
  const numbers = versions
    .map(extractVersionNumber)
    .filter(n => n !== null);
  
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

/**
 * Создать полный HTML документ из body контента
 */
export function createFullHTMLDocument(bodyContent, template) {
  return `${template.doctype}
<html lang="en">
${template.head}
${template.bodyStart}

${bodyContent}

${template.bodyEnd}`;
}

/**
 * Форматировать размер файла
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Получить информацию о сессии
 */
export function getSessionInfo(sessionPath) {
  if (!existsSync(sessionPath)) {
    return null;
  }
  
  const timestamp = basename(sessionPath);
  const versions = getSessionVersions(sessionPath);
  const sourceFiles = readdirSync(sessionPath)
    .filter(file => file.startsWith('source_'));
  
  return {
    timestamp,
    path: sessionPath,
    versions: versions.length,
    sourceFile: sourceFiles[0] || null
  };
}

