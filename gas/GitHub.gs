// ============================================================
// GitHub.gs — GitHub REST API: leitura e escrita de arquivos
// ============================================================

function getGithubFile(path) {
  const config = getConfig();
  const url    = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;

  const resp = UrlFetchApp.fetch(url, {
    method: 'GET',
    headers: githubHeaders(config.token),
    muteHttpExceptions: true
  });

  const code = resp.getResponseCode();
  if (code === 404) return null;
  if (code !== 200) throw new Error(`erro ao buscar arquivo no GitHub: ${path} (HTTP ${code})`);

  return JSON.parse(resp.getContentText());
}

function putGithubFile(path, content, message, sha) {
  const config  = getConfig();
  const url     = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  const encoded = Utilities.base64Encode(
    Utilities.newBlob(content, 'text/plain', 'utf-8').getBytes()
  );

  const payload = { message, content: encoded, branch: config.branch };
  if (sha) payload.sha = sha;

  const resp = UrlFetchApp.fetch(url, {
    method: 'PUT',
    headers: { ...githubHeaders(config.token), 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = resp.getResponseCode();
  if (code !== 200 && code !== 201) {
    throw new Error(`erro ao publicar no GitHub: ${path} (HTTP ${code})`);
  }

  return JSON.parse(resp.getContentText());
}

function upsertGithubFile(path, content, message) {
  const existing = getGithubFile(path);
  return putGithubFile(path, content, message, existing ? existing.sha : undefined);
}

function deleteGithubFile(path, message) {
  const file = getGithubFile(path);
  if (!file) return;
  const config = getConfig();
  const url    = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  UrlFetchApp.fetch(url, {
    method: 'DELETE',
    headers: { ...githubHeaders(config.token), 'Content-Type': 'application/json' },
    payload: JSON.stringify({ message: message || `Arquivar: ${path}`, sha: file.sha, branch: config.branch }),
    muteHttpExceptions: true
  });
}

function githubHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json'
  };
}
