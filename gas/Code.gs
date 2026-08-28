// ============================================================
// Code.gs — Ponto de entrada: menu, publicação, validação
// ============================================================

const COL = { STATUS: 0, DOC_URL: 1, PUBLIC_URL: 2, HTML_GENERATED_AT: 3, ERROR: 4 };
const HEADER_ROW = 1;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Blog')
    .addItem('Publicar', 'publish')
    .addToUi();
}

function setupSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  if (sheet.getLastRow() > 1) {
    const ui = SpreadsheetApp.getUi();
    const resp = ui.alert(
      'A planilha já tem dados.',
      'Deseja sobrescrever o cabeçalho e manter as linhas existentes?',
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;
  }

  // Cabeçalho
  const headers = ['status', 'doc_url', 'public_url', 'html_generated_at', 'error'];
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f3f3');

  // Larguras de coluna
  sheet.setColumnWidth(1, 110);  // status
  sheet.setColumnWidth(2, 420);  // doc_url
  sheet.setColumnWidth(3, 340);  // public_url
  sheet.setColumnWidth(4, 170);  // html_generated_at
  sheet.setColumnWidth(5, 280);  // error

  // Validação de status na coluna A
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['rascunho', 'publicado', 'arquivado', 'erro'], true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange('A2:A1000').setDataValidation(statusRule);

  // Linha de teste
  if (sheet.getLastRow() <= 1) {
    sheet.getRange(2, 1, 1, 2).setValues([
      ['rascunho', 'https://docs.google.com/document/d/SEU_DOC_ID_AQUI/edit']
    ]);
  }

  ss.rename('Controle Editorial - Blog');
  sheet.setName('Artigos');
  sheet.setFrozenRows(1);

  SpreadsheetApp.getUi().alert('Planilha configurada! Use Blog > Criar doc de teste para gerar o primeiro artigo.');
}

function createTestDoc() {
  const doc  = DocumentApp.create('Artigo de Teste — Blog Linka');
  const body = doc.getBody();

  body.clear();

  // Tabela de metadados
  const meta = [
    ['slug',              'seo-para-crescer-no-google-2025'],
    ['title',             'SEO em 2025: guia completo para ranquear no Google'],
    ['h1',               'Como usar SEO para crescer no Google em 2025'],
    ['meta_description',  'Aprenda as principais estratégias de SEO para 2025 e como aplicar em seu negócio para atrair mais clientes orgânicos.'],
    ['author',            'Eric Linka'],
    ['category',          'SEO'],
    ['featured_image',    ''],
    ['featured_image_alt',''],
    ['published_at',      ''],
    ['updated_at',        ''],
    ['canonical',         ''],
    ['robots',            'index,follow'],
  ];

  const table = body.appendTable(meta);
  table.getRow(0).editAsText().setBold(true);

  // Conteúdo do artigo
  body.appendParagraph('').setHeading(DocumentApp.ParagraphHeading.NORMAL);

  const h1 = body.appendParagraph('Como usar SEO para crescer no Google em 2025');
  h1.setHeading(DocumentApp.ParagraphHeading.HEADING1);

  body.appendParagraph(
    'O SEO continua sendo uma das estratégias mais eficientes para atrair clientes sem pagar por anúncios. ' +
    'Neste guia, você vai aprender o que mudou em 2025 e como aplicar as melhores práticas no seu negócio.'
  );

  const h2 = body.appendParagraph('O que é SEO e por que ele ainda importa');
  h2.setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'SEO (Search Engine Optimization) é o conjunto de técnicas que melhora o posicionamento de um site ' +
    'nos resultados orgânicos do Google. Diferente dos anúncios pagos, o tráfego orgânico continua chegando ' +
    'mesmo quando você para de investir.'
  );

  const h2b = body.appendParagraph('Principais fatores de ranqueamento em 2025');
  h2b.setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const list = [
    'Conteúdo de qualidade e profundidade técnica',
    'Experiência do usuário (Core Web Vitals)',
    'Autoridade de domínio e backlinks relevantes',
    'Otimização para pesquisa por voz e IA',
    'E-E-A-T: experiência, expertise, autoridade e confiança',
  ];
  list.forEach(item => {
    body.appendListItem(item).setGlyphType(DocumentApp.GlyphType.BULLET);
  });

  body.appendParagraph('');
  body.appendParagraph(
    'Aplicar essas estratégias de forma consistente é o que separa os sites que aparecem na primeira página ' +
    'dos que ficam invisíveis. Comece pelo básico: um conteúdo bem escrito, um site rápido e links de qualidade.'
  );

  // Compartilhar como "qualquer pessoa com link pode ver"
  DriveApp.getFileById(doc.getId())
    .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  doc.saveAndClose();

  // Inserir URL na planilha (linha 2)
  const sheet   = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const docUrl  = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
  sheet.getRange(2, COL.STATUS  + 1).setValue('rascunho');
  sheet.getRange(2, COL.DOC_URL + 1).setValue(docUrl);

  SpreadsheetApp.getUi().alert(
    'Doc de teste criado e vinculado na linha 2!\n\n' + docUrl +
    '\n\nAgora clique em Blog > Publicar para testar o fluxo completo.'
  );
}

function publish() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data  = sheet.getDataRange().getValues();

  if (data.length <= HEADER_ROW) {
    SpreadsheetApp.getUi().alert('Nenhum artigo encontrado na planilha.');
    return;
  }

  const slugsInBatch       = new Set();
  const newlyPublishedMeta = [];
  let processed = 0;
  let errors    = 0;

  for (let i = HEADER_ROW; i < data.length; i++) {
    const row    = data[i];
    const status = normalizeStatus(row[COL.STATUS]);
    const docUrl = (row[COL.DOC_URL] || '').toString().trim();

    const rowNum = i + 1;

    if (!docUrl) continue;
    if (status === 'publicado') continue;

    if (status === 'arquivado') {
      const publicUrl = (row[COL.PUBLIC_URL] || '').toString().trim();
      if (publicUrl) {
        const slug = publicUrl.split('/').pop();
        if (slug) {
          try { deleteGithubFile(`blog/${slug}.html`, `Arquivar: ${slug}`); } catch (e) {}
          sheet.getRange(rowNum, COL.PUBLIC_URL + 1).setValue('');
          sheet.getRange(rowNum, COL.ERROR + 1).setValue('');
        }
      }
      continue;
    }
    try {
      const meta = processArticleRow(sheet, rowNum, row, slugsInBatch);
      slugsInBatch.add(meta.slug);
      newlyPublishedMeta.push(meta);
      processed++;
    } catch (e) {
      setRowError(sheet, rowNum, e.message);
      errors++;
    }
  }

  rebuildBlogFiles(sheet, newlyPublishedMeta);

  SpreadsheetApp.getUi().alert(
    `Publicação concluída.\nProcessados com sucesso: ${processed}\nErros: ${errors}`
  );
}

function processArticleRow(sheet, rowNum, row, slugsInBatch) {
  const docUrl = (row[COL.DOC_URL] || '').toString().trim();
  if (!docUrl) throw new Error('doc_url vazio');

  const docId = extractDocId(docUrl);
  if (!docId) throw new Error('doc_url inválido');

  const meta = extractMetadataFromDoc(docId);
  validateMeta(meta, slugsInBatch);

  const currentDatetime = formatDate(new Date());
  if (!meta.published_at) {
    meta.published_at = currentDatetime;
  } else {
    const parsed = parseDateFromDoc(meta.published_at);
    meta.published_at = parsed || currentDatetime;
  }
  meta.updated_at = currentDatetime;

  const rawHtml     = exportGoogleDocAsHtml(docId);
  const articleBody = cleanArticleHtml(rawHtml);

  if (!meta.h1) {
    meta.h1 = extractTitleFromHtml(articleBody);
    if (!meta.h1) throw new Error('H1 não encontrado: adicione um H1 no corpo do documento ou o campo h1 nos metadados');
  }

  const config    = getConfig();
  const publicUrl = `${config.baseUrl}/blog/${meta.slug}`;
  const filePath  = `blog/${meta.slug}.html`;

  const html = buildArticleHtml(meta, articleBody, config);
  upsertGithubFile(filePath, html, `Publicar: ${meta.slug}`);
  updateDocAfterPublish(docId, {
    published_at: formatDateBR(meta.published_at),
    updated_at:   formatDateBR(meta.updated_at),
    public_url:   publicUrl
  });

  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  sheet.getRange(rowNum, COL.STATUS          + 1).setValue('publicado');
  sheet.getRange(rowNum, COL.PUBLIC_URL      + 1).setValue(publicUrl);
  sheet.getRange(rowNum, COL.HTML_GENERATED_AT + 1).setValue(now);
  sheet.getRange(rowNum, COL.ERROR           + 1).setValue('');

  return meta;
}

// ── helpers ──────────────────────────────────────────────────

function validateMeta(meta, slugsInBatch) {
  const required = ['slug', 'title', 'meta_description', 'author'];
  for (const field of required) {
    if (!meta[field]) throw new Error(`campo obrigatório ausente: ${field}`);
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(meta.slug)) {
    throw new Error('slug inválido: use apenas letras minúsculas sem acento, números e hífens');
  }

  if (slugsInBatch.has(meta.slug)) {
    throw new Error(`slug duplicado: ${meta.slug}`);
  }
}

function setRowError(sheet, rowNum, message) {
  sheet.getRange(rowNum, COL.STATUS + 1).setValue('erro');
  sheet.getRange(rowNum, COL.ERROR  + 1).setValue(message);
}

function normalizeStatus(value) {
  return (value || '').toString().toLowerCase().trim();
}

function getConfig() {
  const p = PropertiesService.getScriptProperties();
  return {
    token:   p.getProperty('GITHUB_TOKEN'),
    owner:   p.getProperty('GITHUB_OWNER'),
    repo:    p.getProperty('GITHUB_REPO'),
    branch:  p.getProperty('GITHUB_BRANCH') || 'main',
    baseUrl: (p.getProperty('SITE_BASE_URL') || 'https://agenciademarketingdigital.com.br').replace(/\/$/, '')
  };
}

function formatDate(date) {
  const d = Utilities.formatDate(date, 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ss");
  return d + '-03:00';
}
