// ============================================================
// Build.gs — Regenera blog.json, índice, sitemap e feed
// ============================================================

function rebuildBlogFiles(sheet, newlyPublishedMetas) {
  const config = getConfig();

  // Carrega blog.json existente como cache de metadados
  const cachedPosts = loadCachedPosts();

  // Mescla os posts recém-publicados
  newlyPublishedMetas.forEach(meta => {
    cachedPosts[meta.slug] = buildPostEntry(meta, config);
  });

  // Determina slugs que devem aparecer (status publicado na planilha)
  const publishedSlugs = getPublishedSlugsFromSheet(sheet);

  // Posts finais: somente publicados, em ordem decrescente de data
  const posts = Object.values(cachedPosts)
    .filter(p => publishedSlugs.has(p.slug))
    .sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));

  upsertGithubFile('data/blog.json', buildBlogJson(posts),        'Atualizar blog.json');
  upsertGithubFile('blog.html',      buildBlogIndexHtml(posts, config), 'Atualizar índice do blog');
  upsertGithubFile('sitemap.xml',    buildSitemap(posts, config), 'Atualizar sitemap.xml');
  upsertGithubFile('feed.xml',       buildFeed(posts, config),    'Atualizar feed.xml');
}

function loadCachedPosts() {
  const file = getGithubFile('data/blog.json');
  if (!file) return {};
  try {
    const json  = Utilities.newBlob(Utilities.base64Decode(file.content)).getDataAsString();
    const posts = JSON.parse(json);
    const map   = {};
    posts.forEach(p => { map[p.slug] = p; });
    return map;
  } catch (e) {
    return {};
  }
}

function getPublishedSlugsFromSheet(sheet) {
  const data   = sheet.getDataRange().getValues();
  const slugs  = new Set();

  for (let i = HEADER_ROW; i < data.length; i++) {
    const row       = data[i];
    const status    = normalizeStatus(row[COL.STATUS]);
    const publicUrl = (row[COL.PUBLIC_URL] || '').toString().trim();

    if (status === 'publicado' && publicUrl) {
      const slug = publicUrl.split('/').pop();
      if (slug) slugs.add(slug);
    }
  }

  return slugs;
}

function buildPostEntry(meta, config) {
  return {
    title:            meta.h1               || '',
    slug:             meta.slug             || '',
    url:              `/blog/${meta.slug}`,
    public_url:       `${config.baseUrl}/blog/${meta.slug}`,
    file_path:        `/blog/${meta.slug}.html`,
    meta_description: meta.meta_description || '',
    author:           meta.author           || '',
    category:         meta.category         || '',
    published_at:     meta.published_at     || '',
    updated_at:       meta.updated_at       || '',
    featured_image:   meta.featured_image   || ''
  };
}

function buildBlogJson(posts) {
  return JSON.stringify(posts, null, 2);
}

function buildSitemap(posts, config) {
  const today = formatDate(new Date());

  const urls = [
    { loc: config.baseUrl,         lastmod: today },
    { loc: `${config.baseUrl}/blog`, lastmod: today },
    ...posts.map(p => ({
      loc:     `${config.baseUrl}/blog/${p.slug}`,
      lastmod:  p.updated_at || p.published_at || today
    }))
  ];

  const urlsXml = urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

function buildFeed(posts, config) {
  const items = posts.map(p => {
    const lines = [
      `    <item>`,
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${escapeXml(`${config.baseUrl}/blog/${p.slug}`)}</link>`,
      `      <description>${escapeXml(p.meta_description)}</description>`,
      `      <pubDate>${rssDate(p.published_at)}</pubDate>`,
      `      <guid isPermaLink="true">${escapeXml(`${config.baseUrl}/blog/${p.slug}`)}</guid>`
    ];
    if (p.author)   lines.push(`      <author>${escapeXml(p.author)}</author>`);
    if (p.category) lines.push(`      <category>${escapeXml(p.category)}</category>`);
    lines.push(`    </item>`);
    return lines.join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog | Agência de Marketing Digital</title>
    <link>${escapeXml(config.baseUrl)}</link>
    <description>Artigos sobre marketing digital, SEO e estratégia.</description>
    <language>pt-BR</language>
    <atom:link href="${escapeXml(`${config.baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

// ── utilitários compartilhados ────────────────────────────────

function escapeXml(str) {
  return (str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

function rssDate(dateStr) {
  try { return dateStr ? new Date(dateStr).toUTCString() : new Date().toUTCString(); } catch (e) { return new Date().toUTCString(); }
}
