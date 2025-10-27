/**
 * Промпты для ChatGPT API
 * Используются для генерации и корректировки HTML коммерческих предложений
 */

// Рекомендуемые модели (январь 2025):
// - "gpt-5" — новейшая модель (если доступна в вашем аккаунте)
// - "gpt-4o" — стабильная и быстрая (рекомендуется!)
// - "gpt-4.1" — альтернатива с большим контекстом
// Примечание: используется стандартный endpoint /v1/chat/completions

export const SYSTEM_PROMPT = `Ты — эксперт по оформлению коммерческих предложений. Твоя задача:

=== БАЗОВЫЕ ТРЕБОВАНИЯ ===

1. Структурировать текст пользователя в HTML формат по образцу шаблона
2. КРИТИЧЕСКИ ВАЖНО: НЕ изменяй текст пользователя, сохраняй его дословно
3. Определи разделы автоматически (прайс-лист, условия оплаты, объем работ, график и т.д.)
4. Используй те же CSS классы что в шаблоне
5. Если в тексте есть таблицы — оформи их как <table class="table no-break">
6. Если есть списки — оформи как <ul>
7. Сохраняй числовые значения, даты, названия точно как в оригинале
8. Определяй нумерацию разделов автоматически (01., 02., 03. и т.д.)
9. Для таблиц с ценами используй структуру: thead с заголовками, tbody с данными
10. Для итоговых сумм используй <div class="totals no-break"> с lead-row структурой
11. Для примечаний используй <div class="notes no-break">
12. ИГНОРИРУЙ колонтитулы, номера страниц, повторяющиеся элементы оформления — используй только основной содержательный текст документа


СТРУКТУРА ШАБЛОНА:

Каждый раздел оформляется так:
<section class="section page-start" id="раздел-id">
  <h2>01. Название раздела</h2>
  <!-- Содержимое раздела -->
</section>

ТАБЛИЦЫ (пример прайс-листа):
<table class="table no-break">
  <colgroup>
    <col />
    <col style="width:28%" />
  </colgroup>
  <thead>
    <tr><th>Stage</th><th class="num">Price (EUR)</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Название этапа</strong></td>
      <td class="num"><strong>16 500,00</strong></td>
    </tr>
    <tr><td class="indent">Подэтап</td><td class="num muted">—</td></tr>
  </tbody>
</table>

ИТОГОВЫЕ СУММЫ:
<div class="totals no-break" aria-label="Total">
  <div class="lead-row"><span class="label">Total</span><span class="lead" aria-hidden="true"></span><span class="value">33 400,00</span></div>
</div>

ПРИМЕЧАНИЯ:
<div class="notes no-break">
  <p>(1) Текст примечания.</p>
  <p>(2) Еще одно примечание.</p>
</div>

СПИСКИ:
<ul>
  <li>Элемент списка</li>
  <li>Другой элемент</li>
</ul>

ПОДЗАГОЛОВКИ:
<h3>Подзаголовок раздела</h3>
<h3 class="muted">Подзаголовок второго уровня</h3>

КЛАССЫ:
- .page-start — начать раздел с новой страницы
- .no-break — запретить разрыв элемента между страницами
- .num — выравнивание чисел по правому краю (для таблиц)
- .indent — отступ для вложенных строк таблицы
- .muted — приглушенный текст
- .tight — компактная таблица (для графиков)

Верни ТОЛЬКО содержимое <body> (без тега body), готовое для вставки в HTML документ.
НЕ используй markdown обёртки вроде \`\`\`html.
Начинай сразу с первого <section>.`;

export function getInitialPrompt(extractedText) {
  return `Исходный текст коммерческого предложения:

${extractedText}

Пожалуйста, структурируй этот текст в HTML согласно шаблону. Сохраняй весь текст без изменений, только добавь правильную разметку.`;
}

export function getCorrectionPrompt(currentHTML, userCorrection) {
  return `У меня есть HTML коммерческого предложения. Нужно внести следующие корректировки:

${userCorrection}

Текущий HTML:
${currentHTML}

Пожалуйста, внеси указанные изменения, сохраняя структуру и стиль оформления. Верни полный исправленный HTML (только содержимое body, без тега).`;
}

export const HTML_TEMPLATE = {
  doctype: '<!doctype html>',
  head: `<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Commercial Proposal</title>
<!-- Print rules for PDF -->
<link rel="stylesheet" href="./print.css" media="print">
<style>
  :root{
    /* Brand palette */
    --primary:#255C9E;   /* Blue Rakun primary */
    --primary-2:#4a75aa; /* supportive blue */
    --primary-0:#e9edf5; /* light tint */
    --ink:#161616;
    --table-head-text:#5a779b;
    --totals-value-text:#5a779b;
    --totals-label-text: var(--table-head-text);

    /* Neutrals */
    --bg:#ffffff; --fg:#414141; --muted:#6b7280;

    /* Rhythm */
    --unit:8px; --radius:0px; --maxw:920px;
    --s-1:8px; --s-2:12px; --s-3:16px; --s-4:24px;
  }

  /* Base */
  html,body{ background:var(--bg); color:var(--fg); }
  body{
    margin:0;
    font-family:"Gotham","Montserrat","Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif;
    -webkit-font-smoothing:antialiased;
    line-height:1.6; letter-spacing:.01em;
  }
  .page{ max-width:var(--maxw); margin: 0 auto; padding: calc(var(--unit)*4); }

  /* Brand header (placeholder logo) */
  .brand{
    display:flex; align-items:center; gap: calc(var(--unit)*2);
    padding: calc(var(--unit)*3) 0 calc(var(--unit)*2);
    border-bottom:1px solid #e5e7eb;
  }
  .brand svg{ width:44px; height:44px; display:block; }
  .brand-title{ font-weight:600; letter-spacing:.02em; color:var(--ink); }
  .brand-sub{ color:#6b7280; font-size:.95rem; margin-top:2px; }

  /* Sections (no decorative lines) */
  .section{ display:flow-root; margin-block:24px 0; padding-block-start:8px; }
  .section + .section{ background:none; padding-block-start:24px; }

  /* Headings — branded hierarchy */
  h1,h2,h3{ line-height:1.25; margin:0; }
  h1{
    font-size: clamp(28px,4.4vw,36px);
    font-weight:700;
    letter-spacing:-0.005em;
    color:var(--ink);
    margin-bottom:6px;
  }
  h2{
    font-size: clamp(21px,3.3vw,26px);
    font-weight:600;
    letter-spacing:.01em;
    color:var(--primary);
    padding-bottom:0;
    text-transform: uppercase;
  }
  .section > * + h2{ margin-top:32px; }

  h3{
    font-size: clamp(16px,2.5vw,19px);
    font-weight:600;
    font-variant-caps: all-small-caps;
    letter-spacing:.06em;
    color:var(--primary-2);
    margin-top:22px;
  }
  .muted{ color:#475569; } /* slate-600 */

  /* Vertical rhythm */
  .section > *{ margin:0; }
  .section > * + *{ margin-top: var(--s-3); }
  .section > * + h3{ margin-top: var(--s-4); }
  h2 + *{ margin-top:14px !important; }
  h3 + *{ margin-top:12px !important; }

  /* Paragraphs */
  p{ margin:0; }
  p + p{ margin-top: var(--s-3); }
  p + ul, p + .table{ margin-top: var(--s-3) !important; }

  /* Lists (as in reference) */
  ul{ margin:0; padding:0 0 0 20px; list-style-type: disc; }
  ul>li{ margin-top: var(--s-2); }
  ul>li:first-child{ margin-top:0; }
  ul ul{ margin-top: var(--s-1); padding-left:20px; list-style-type: circle; }
  ul ul>li{ margin-top: var(--s-1); }
  ul ul>li:first-child{ margin-top:0; }
  ul + h2, ul + h3{ margin-top: var(--s-4) !important; }

  /* Tables — color-only theming and strong numeric alignment */
  .table{
    width:100%; border-collapse:separate; border-spacing:0;
    border:none;
    border-radius:var(--radius); overflow:hidden;
    margin-top: var(--s-2);
    background:#fff;
  }
  .table thead th{
    text-align:left;
    background: var(--primary-0);
    color: var(--table-head-text);
    font-weight:600;
  }
  .table th,.table td{
    padding: calc(var(--unit)*2) calc(var(--unit)*2.5);
    vertical-align:top; font-variant-numeric: tabular-nums;
  }
  /* RIGHT alignment for numeric/time columns (header + body) */
  .table th.num,
  .table td.num{
    text-align:right;
    white-space:nowrap;
  }
  .table tbody tr + tr td{
    border-top:.25px solid color-mix(in oklab, var(--primary) 10%, #fff);
  }
  /* Perimeter only around tbody */
  .table tbody td{ border-left:.25px solid color-mix(in oklab, var(--primary) 15%, #fff); border-right:.25px solid color-mix(in oklab, var(--primary) 15%, #fff); }
  .table tbody tr:first-child td{ border-top:.25px solid color-mix(in oklab, var(--primary) 15%, #fff); }
  .table tbody tr:last-child td{ border-bottom:.25px solid color-mix(in oklab, var(--primary) 15%, #fff); }
  /* Rounded corners for tbody box */
  .table tbody tr:first-child td:first-child{ border-top-left-radius: var(--radius); }
  .table tbody tr:first-child td:last-child{ border-top-right-radius: var(--radius); }
  .table tbody tr:last-child td:first-child{ border-bottom-left-radius: var(--radius); }
  .table tbody tr:last-child td:last-child{ border-bottom-right-radius: var(--radius); }
  .indent{ padding-left:36px !important; color:#4b5563; }

  /* Totals */
  .totals{
    margin-top: var(--s-4);
    padding: calc(var(--unit)*3);
    border:none;
    border-radius:var(--radius);
    background: color-mix(in oklab, var(--primary-0) 70%, #fff);
    display:grid; gap: calc(var(--unit)*1.25);
  }
  .lead-row{ display:flex; align-items:baseline; gap:.75rem; }
  .lead-row .label{ font-weight:700; color:var(--table-head-text); }
  .lead-row .lead{
    flex:1; height:1px; transform:translateY(-2px);
    background: repeating-linear-gradient(to right,
      transparent 0 6px, color-mix(in oklab, var(--primary) 18%, #fff) 6px 8px);
  }
  .lead-row .value{ min-width:9ch; text-align:right; font-variant-numeric: tabular-nums; color:var(--totals-value-text); font-weight:700; }

  /* Notes */
  .notes{
    padding: calc(var(--unit)*2.5);
    border-left:3px solid var(--primary);
    background: #f8f9fa;
    border-radius:8px;
  }
  .notes p{ margin:0 0 var(--s-2); } .notes p:last-child{ margin:0; }

  /* Schedule table density */
  .tight td{ padding-top: calc(var(--unit)*1.5); padding-bottom: calc(var(--unit)*1.5); }

  /* Footer */
  .footer{ margin-top: calc(var(--unit)*6); color:#64748b; font-size:.95rem; text-align:center; }

  /* PDF Logo Container */
  .pdf-logo {
    display: none; /* Скрыт в браузере */
  }

  /* Print */
  @media print{
    /* @page is in print.css */

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .page{
      margin:0;
      padding: 0 calc(var(--unit)*4);
      max-width: 100%;
    }

    .section{
      page-break-inside: auto !important;
      break-inside: auto !important;
      orphans: 3;
      widows: 3;
    }

    .table, .totals, .notes {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    h1, h2, h3{
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    h3 + ul, h2 + p, h3 + p{
      page-break-before: avoid !important;
      break-before: avoid !important;
    }

    tr{
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .section + .section{ background:none; padding-block-start:20px; }
    .section > * + *{ margin-top:14px; }
    h2 + * , h3 + * { margin-top:12px !important; }
    ul + h2, ul + h3{ margin-top:20px !important; }

    .lead-row .lead {
      background: none !important;
      transform: none !important;
      border-bottom: 0.75pt dotted rgba(0,0,0,0.2) !important;
      height: auto !important;
      padding-bottom: 2px;
    }

    .table tbody tr + tr td { border-top-width: 0.75pt !important; }
    .footer{ display:none; }

    /* Logo appears on every page */
    .pdf-logo {
      display: block;
      position: fixed;
      /* Position will be set via JS based on config */
    }
    
    .pdf-logo img {
      max-width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
    }
  }
</style>
</head>`,
  bodyStart: `<body>
  <div class="sheet">
  <main class="page">`,
  bodyEnd: `
    <div class="footer">© Blue Rakun</div>

  </main>
  </div>

  <!-- PDF Logo (injected dynamically during PDF generation) -->
  <div class="pdf-logo" id="pdf-logo"></div>

</body>
</html>`
};

