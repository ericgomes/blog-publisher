// ============================================================
// Docs.gs — Leitura e conversão de Google Docs
// ============================================================

function parseDateFromDoc(str) {
  if (!str) return null;

  // Já é ISO datetime: 2026-06-20T09:02:15-03:00
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str;

  // Formato amigável: "20 de junho de 2026 às 09h02"
  const months = {
    'janeiro':1,'fevereiro':2,'março':3,'abril':4,'maio':5,'junho':6,
    'julho':7,'agosto':8,'setembro':9,'outubro':10,'novembro':11,'dezembro':12
  };
  const friendly = str.match(/(\d{1,2}) de (\w+) de (\d{4}) às (\d{1,2})h(\d{2})/);
  if (friendly) {
    const [, d, mon, y, h, m] = friendly;
    const mo = months[mon.toLowerCase()];
    if (!mo) return null;
    const pad = n => String(n).padStart(2, '0');
    return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(m)}:00-03:00`;
  }

  // Data simples: 2026-06-20
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str + 'T00:00:00-03:00';

  return null;
}

function extractTitleFromHtml(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) return '';
  return match[1].replace(/<[^>]+>/g, '').trim();
}

function extractDocId(docUrl) {
  const match = (docUrl || '').match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractMetadataFromDoc(docId) {
  let doc;
  try {
    doc = DocumentApp.openById(docId);
  } catch (e) {
    throw new Error('não foi possível acessar o Google Docs');
  }

  const body     = doc.getBody();
  const numItems = body.getNumChildren();

  let metaTable = null;
  for (let i = 0; i < numItems; i++) {
    const child = body.getChild(i);
    if (child.getType() === DocumentApp.ElementType.TABLE) {
      metaTable = child.asTable();
      break;
    }
  }

  if (!metaTable) throw new Error('primeira tabela de metadados não encontrada');

  const meta = {};
  for (let r = 0; r < metaTable.getNumRows(); r++) {
    const row = metaTable.getRow(r);
    if (row.getNumCells() < 2) continue;
    const key   = row.getCell(0).getText().trim().toLowerCase();
    const value = row.getCell(1).getText().trim();
    if (key) meta[key] = value;
  }

  meta.tags = meta.tags
    ? meta.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return meta;
}

function exportGoogleDocAsHtml(docId) {
  const url = `https://docs.google.com/feeds/download/documents/export/Export?id=${docId}&exportFormat=html`;
  let resp;
  try {
    resp = UrlFetchApp.fetch(url, {
      headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
      muteHttpExceptions: true
    });
  } catch (e) {
    throw new Error('não foi possível acessar o Google Docs');
  }

  if (resp.getResponseCode() !== 200) {
    throw new Error('não foi possível exportar o Google Docs como HTML');
  }

  return resp.getContentText();
}

function cleanArticleHtml(fullHtml) {
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : fullHtml;

  body = removeFirstTable(body);

  // Remove estilos e classes do Google Docs
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');
  body = body.replace(/\s+style="[^"]*"/g, '');
  body = body.replace(/\s+class="[^"]*"/g, '');
  body = body.replace(/\s+id="[^"]*"/g, '');

  // Simplifica spans desnecessários
  body = body.replace(/<span\s*>([\s\S]*?)<\/span>/g, '$1');

  // Remove parágrafos e quebras de linha vazios
  body = body.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '');
  body = body.replace(/<p>\s*<\/p>/gi, '');
  body = body.replace(/\n{3,}/g, '\n\n');

  return body.trim();
}

function removeFirstTable(html) {
  let depth = 0;
  let start = -1;
  let i     = 0;

  while (i < html.length) {
    const sub = html.slice(i);

    const openMatch = sub.match(/^<table(\s[^>]*)?>/i);
    if (openMatch) {
      if (depth === 0) start = i;
      depth++;
      i += openMatch[0].length;
      continue;
    }

    const closeMatch = sub.match(/^<\/table>/i);
    if (closeMatch) {
      depth--;
      i += closeMatch[0].length;
      if (depth === 0 && start >= 0) {
        return html.slice(0, start) + html.slice(i);
      }
      continue;
    }

    i++;
  }

  return html;
}

function updateDocAfterPublish(docId, updates) {
  const doc   = DocumentApp.openById(docId);
  const body  = doc.getBody();

  let metaTable = null;
  for (let i = 0; i < body.getNumChildren(); i++) {
    const child = body.getChild(i);
    if (child.getType() === DocumentApp.ElementType.TABLE) {
      metaTable = child.asTable();
      break;
    }
  }
  if (!metaTable) return;

  // Índice das chaves já existentes na tabela
  const existingKeys = {};
  for (let r = 0; r < metaTable.getNumRows(); r++) {
    const row = metaTable.getRow(r);
    if (row.getNumCells() < 2) continue;
    const key = row.getCell(0).getText().trim().toLowerCase();
    if (key) existingKeys[key] = r;
  }

  for (const [key, value] of Object.entries(updates)) {
    if (existingKeys[key] !== undefined) {
      const cell = metaTable.getRow(existingKeys[key]).getCell(1);
      key === 'public_url' ? setLinkInCell(cell, value) : cell.setText(value);
    } else {
      const newRow = metaTable.appendTableRow();
      newRow.appendTableCell(key);
      const cell = newRow.appendTableCell('');
      key === 'public_url' ? setLinkInCell(cell, value) : cell.setText(value);
    }
  }

  doc.saveAndClose();
}

function setLinkInCell(cell, url) {
  cell.clear();
  const text = cell.editAsText();
  text.setText(url);
  text.setLinkUrl(0, url.length - 1, url);
}
