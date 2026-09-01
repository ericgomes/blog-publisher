// ============================================================
// Templates.gs — HTML de artigo e índice usando o layout do site
// ============================================================

const GTM_ID      = 'GTM-P2R23466';
const SITE_NAME   = 'Agência de Marketing Digital';
const SITE_FOOTER = '© 2026 &nbsp; Eric Gomes &amp; Marcelo Caricati';

function siteHead(meta, canonicalUrl, ogType) {
  const ogImage  = meta.featured_image
    ? `\n  <meta property="og:image" content="${escapeHtml(meta.featured_image)}">`
    : `\n  <meta property="og:image" content="https://www.agenciademarketingdigital.com.br/og-image.jpg">`;

  return `<!doctype html>
<html lang="pt-BR" data-theme="light" data-visual="linka">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${GTM_ID}');</script>
  <!-- End Google Tag Manager -->

  <title>${escapeHtml(meta.title || meta.h1)}</title>
  <meta name="description" content="${escapeHtml(meta.meta_description)}">
  <meta name="robots" content="${escapeHtml(meta.robots || 'index,follow')}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">

  <!-- Open Graph -->
  <meta property="og:type" content="${ogType || 'article'}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${escapeHtml(meta.title || meta.h1)}">
  <meta property="og:description" content="${escapeHtml(meta.meta_description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:locale" content="pt_BR">${ogImage}
  ${meta.published_at ? `<meta property="article:published_time" content="${meta.published_at}">` : ''}
  ${meta.updated_at   ? `<meta property="article:modified_time" content="${meta.updated_at}">` : ''}

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="${meta.featured_image ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(meta.title || meta.h1)}">
  <meta name="twitter:description" content="${escapeHtml(meta.meta_description)}">
  ${meta.featured_image ? `<meta name="twitter:image" content="${escapeHtml(meta.featured_image)}">` : ''}

  <!-- Favicon + PWA -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/icon-192.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#9333EA" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#7C3AED" media="(prefers-color-scheme: light)">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.gstatic.com/s/inter/v20/UcCo3FwrK3iLTcviYwY.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&display=swap">
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="alternate" type="application/rss+xml" title="Blog RSS" href="/feed.xml">

  <!-- Tema: aplica antes do render para evitar flash -->
  <script>
    (function(){
      var p = new URLSearchParams(window.location.search).get('tema');
      var v = p || localStorage.getItem('linka-visual') || 'linka-light';
      document.documentElement.setAttribute('data-visual', v);
      document.documentElement.setAttribute('data-theme', v.includes('dark') || v === 'dos' || v === 'militar' ? 'dark' : 'light');
    })();
  </script>

  <noscript><style>
    #top-controls, #scanlines, #mouse-spotlight,
    #cursor-dot, #cursor-ring, .geo-marquee-bar,
    .geo-under-construction { display: none !important; }
    body { padding-top: 0 !important; }
    nav#navbar { position: static !important; }
  </style></noscript>`;
}

function siteBodyOpen() {
  return `
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

  <a href="#main-content" class="skip-link">Ir para o conteúdo</a>

  <!-- TOP CONTROLS -->
  <div id="top-controls">
    <div id="lang-switcher" role="group" aria-label="Idioma">
      <button type="button" class="lang-btn active" data-lang="pt" title="Português">
        <svg viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" style="display:block"><rect width="24" height="16" fill="#009C3B"/><polygon points="12,2 22,8 12,14 2,8" fill="#FFDF00"/><circle cx="12" cy="8" r="3.8" fill="#002776"/></svg>
      </button>
      <button type="button" class="lang-btn" data-lang="en" title="English">
        <svg viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" style="display:block"><rect width="24" height="16" fill="#B22234"/><rect y="1.23" width="24" height="1.23" fill="#fff"/><rect y="3.69" width="24" height="1.23" fill="#fff"/><rect y="6.15" width="24" height="1.23" fill="#fff"/><rect y="8.62" width="24" height="1.23" fill="#fff"/><rect y="11.08" width="24" height="1.23" fill="#fff"/><rect y="13.54" width="24" height="1.23" fill="#fff"/><rect width="9.6" height="8.62" fill="#3C3B6E"/></svg>
      </button>
      <button type="button" class="lang-btn" data-lang="es" title="Español">
        <svg viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" style="display:block"><rect width="24" height="16" fill="#C60B1E"/><rect y="4" width="24" height="8" fill="#FFC400"/></svg>
      </button>
    </div>
    <div id="visual-switcher" role="group" aria-label="Escolher tema visual">
      <button type="button" id="visual-trigger" aria-haspopup="listbox" aria-expanded="false">
        <span id="visual-label">Claro</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div id="visual-menu" role="listbox">
        <button type="button" class="visual-btn active" data-visual="linka-light">CLARO</button>
        <button type="button" class="visual-btn" data-visual="linka-dark">ESCURO</button>
        <button type="button" class="visual-btn" data-visual="pixelart">PIXEL ART</button>
        <button type="button" class="visual-btn" data-visual="dos">MS-DOS</button>
        <button type="button" class="visual-btn" data-visual="geocities">GEOCITIES</button>
        <button type="button" class="visual-btn" data-visual="copa">BRASIL 🇧🇷</button>
        <button type="button" class="visual-btn" data-visual="brutalist">MINIMALISTA</button>
        <button type="button" class="visual-btn" data-visual="saas">SAAS</button>
        <button type="button" class="visual-btn" data-visual="glass">INDIGO</button>
        <button type="button" class="visual-btn" data-visual="notion">CLEAN</button>
        <button type="button" class="visual-btn" data-visual="militar">MILITAR</button>
      </div>
    </div>
  </div>

  <div id="scanlines" aria-hidden="true"></div>
  <div id="mouse-spotlight" aria-hidden="true"></div>
  <div id="cursor-dot" aria-hidden="true"></div>
  <div id="cursor-ring" aria-hidden="true"></div>

  <div class="geo-marquee-bar" aria-hidden="true">
    <div class="geo-marquee-track">
      <span class="geo-marquee-content"><span class="geo-blink">★ BEM VINDO ★</span> &nbsp;&nbsp;&nbsp; 🔥 MELHOR AGÊNCIA DE MARKETING DIGITAL DO BRASIL 🔥 &nbsp;&nbsp;&nbsp; ✨ SEO · TRÁFEGO PAGO · PERFORMANCE ✨ &nbsp;&nbsp;&nbsp; <span class="geo-blink">★ ERIC GOMES &amp; MARCELO CARICATI ★</span> &nbsp;&nbsp;&nbsp; 💻 DESDE 2013 — MAIS DE 300 CLIENTES ATENDIDOS 💻 &nbsp;&nbsp;&nbsp; 🏆 GOOGLE PREMIER PARTNER 🏆 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span class="geo-marquee-content" aria-hidden="true"><span class="geo-blink">★ BEM VINDO ★</span> &nbsp;&nbsp;&nbsp; 🔥 MELHOR AGÊNCIA DE MARKETING DIGITAL DO BRASIL 🔥 &nbsp;&nbsp;&nbsp; ✨ SEO · TRÁFEGO PAGO · PERFORMANCE ✨ &nbsp;&nbsp;&nbsp; <span class="geo-blink">★ ERIC GOMES &amp; MARCELO CARICATI ★</span> &nbsp;&nbsp;&nbsp; 💻 DESDE 2013 — MAIS DE 300 CLIENTES ATENDIDOS 💻 &nbsp;&nbsp;&nbsp; 🏆 GOOGLE PREMIER PARTNER 🏆 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </div>
  </div>

  <nav id="navbar">
    <div class="nav-links" role="navigation" aria-label="Menu principal">
      <a href="/#sobre" class="nav-link">Sobre</a>
      <a href="/#especialidades" class="nav-link">Especialidades</a>
      <a href="/#eric" class="nav-link">Eric</a>
      <a href="/#marcelo" class="nav-link">Marcelo</a>
      <a href="/blog" class="nav-link">Blog</a>
      <a href="/#contato" class="nav-link">Contato</a>
    </div>
  </nav>`;
}

function siteBodyClose() {
  return `
  <div class="geo-under-construction" aria-hidden="true">
    <div class="geo-construction-sign">
      <div class="geo-construction-stripes"></div>
      <div class="geo-construction-body"><span class="geo-hard-hat">👷</span><span class="geo-blink">SITE EM CONSTRUÇÃO</span><span class="geo-hard-hat">👷</span></div>
      <div class="geo-construction-stripes"></div>
    </div>
    <p class="geo-blink">🚧 VOLTE MAIS TARDE! 🚧</p>
  </div>

  <footer>
    <span>${SITE_FOOTER}</span>
    <div class="footer-links">
      <a href="https://www.linkedin.com/in/ericmottagomes/" target="_blank" rel="noopener noreferrer">Eric Gomes</a>
      <a href="https://www.linkedin.com/in/marcelo-caricati-83ab7018/" target="_blank" rel="noopener noreferrer">Marcelo Caricati</a>
      <a href="/blog" class="nav-link">Blog</a>
    </div>
  </footer>

  <script src="/assets/js/site.js" type="module"></script>
</body>
</html>`;
}

// ── Artigo ───────────────────────────────────────────────────

function buildArticleHtml(meta, bodyHtml, config) {
  const canonical = meta.canonical || `${config.baseUrl}/blog/${meta.slug}`;
  const hasImage  = !!meta.featured_image;

  const schema = buildArticleSchema(meta, canonical, hasImage);
  const breadcrumbSchema = buildBreadcrumbSchema(meta, canonical, config);

  const articleMetaHtml = [
    meta.author      ? `<span class="author">Por ${escapeHtml(meta.author)}</span>` : '',
    meta.published_at ? `<time datetime="${meta.published_at}">${formatDateBR(meta.published_at)}</time>` : '',
    meta.updated_at && meta.updated_at !== meta.published_at
      ? `<span class="updated">Atualizado em <time datetime="${meta.updated_at}">${formatDateBR(meta.updated_at)}</time></span>`
      : '',
    meta.category ? `<a href="/blog?categoria=${encodeURIComponent(meta.category)}" class="category">${escapeHtml(meta.category)}</a>` : ''
  ].filter(Boolean).join('\n        ');

  const featuredImg = hasImage
    ? `<img src="${escapeHtml(meta.featured_image)}" alt="${escapeHtml(meta.featured_image_alt || meta.h1)}" class="featured-image" loading="eager">`
    : '';

  return `${siteHead(meta, canonical, 'article')}
  ${schema}
  ${breadcrumbSchema}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300..700&display=swap" rel="stylesheet">
  <style>
    .blog-article h1, .blog-article h2, .blog-article h3,
    .blog-article h4, .blog-article h5, .blog-article h6 {
      font-family: 'Oswald', sans-serif;
      color: inherit;
    }
    .article-content, .blog-article {
      max-width: 100%;
      overflow-x: hidden;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .article-content img, .article-content table, .article-content pre {
      max-width: 100%;
    }
    #lang-switcher { display: none !important; }
  </style>
</head>
${siteBodyOpen()}

  <main id="main-content">
    <div class="section-wrap">

      <nav aria-label="Breadcrumb" class="breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/blog">Blog</a></li>
          <li aria-current="page">${escapeHtml(meta.h1)}</li>
        </ol>
      </nav>

      <article class="blog-article">
        <header class="article-header">
          ${featuredImg}
          <div class="article-meta">
            ${articleMetaHtml}
          </div>
        </header>

        <div class="article-content">
          ${bodyHtml}
        </div>

        <footer class="article-footer">
          <a href="/blog" class="back-to-blog">&larr; Voltar ao Blog</a>
        </footer>
      </article>

    </div>
  </main>
${siteBodyClose()}`;
}

function buildArticleSchema(meta, canonical, hasImage) {
  const parts = [
    `"@context": "https://schema.org"`,
    `"@type": "BlogPosting"`,
    `"headline": "${escapeJson(meta.h1)}"`,
    `"description": "${escapeJson(meta.meta_description)}"`,
    `"url": "${canonical}"`,
    meta.published_at ? `"datePublished": "${meta.published_at}"` : '',
    meta.updated_at   ? `"dateModified": "${meta.updated_at}"` : '',
    `"author": { "@type": "Person", "name": "${escapeJson(meta.author)}" }`,
    hasImage ? `"image": "${escapeJson(meta.featured_image)}"` : '',
    meta.category ? `"articleSection": "${escapeJson(meta.category)}"` : ''
  ].filter(Boolean).join(',\n    ');

  return `<script type="application/ld+json">
  { ${parts} }
  </script>`;
}

function buildBreadcrumbSchema(meta, canonical, config) {
  return `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": "${config.baseUrl}" },
      { "@type": "ListItem", "position": 2, "name": "Blog",  "item": "${config.baseUrl}/blog" },
      { "@type": "ListItem", "position": 3, "name": "${escapeJson(meta.h1)}", "item": "${canonical}" }
    ]
  }
  </script>`;
}

// ── Índice do blog ────────────────────────────────────────────

function buildBlogIndexHtml(posts, config) {
  const indexMeta = {
    title:            `Blog | ${SITE_NAME}`,
    meta_description: 'Artigos sobre marketing digital, SEO, redes sociais e estratégias para crescer online.',
    robots:           'index,follow'
  };

  const items = posts.map(p => {
    const imgHtml  = p.featured_image
      ? `<img src="${escapeHtml(p.featured_image)}" alt="${escapeHtml(p.featured_image_alt || p.title)}" class="post-thumb" loading="lazy">`
      : '';
    const catHtml    = p.category    ? `<span class="category">${escapeHtml(p.category)}</span>` : '';
    const authorHtml = p.author      ? `<span class="author">${escapeHtml(p.author)}</span>` : '';
    const dateHtml   = p.published_at ? `<time datetime="${p.published_at}">${formatDateBR(p.published_at)}</time>` : '';
    const descHtml   = p.meta_description ? `<p class="post-description">${escapeHtml(p.meta_description)}</p>` : '';

    return `    <article class="post-card">
      ${imgHtml}
      <div class="post-card-body">
        ${catHtml}
        <h2 class="post-title"><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a></h2>
        ${descHtml}
        <div class="post-meta">${authorHtml}${authorHtml && dateHtml ? ' &nbsp;·&nbsp; ' : ''}${dateHtml}</div>
        <a href="/blog/${p.slug}" class="read-more" aria-label="Ler: ${escapeHtml(p.title)}">Ler artigo &rarr;</a>
      </div>
    </article>`;
  }).join('\n');

  const empty = posts.length === 0
    ? '<p class="no-posts">Nenhum artigo publicado ainda.</p>'
    : '';

  return `${siteHead(indexMeta, `${config.baseUrl}/blog`, 'website')}
  <style>
    #lang-switcher { display: none !important; }
    .post-grid { display: flex; flex-direction: column; gap: 3.5rem; }
    .post-card { padding-bottom: 3.5rem; border-bottom: 1px solid rgba(128,128,128,0.2); }
    .post-card:last-child { border-bottom: none; }
    .post-card-body { display: flex; flex-direction: column; gap: 0.6rem; }
    .post-title { margin: 0.25rem 0 0; }
    .post-description { margin: 0; opacity: 0.85; }
    .post-meta { margin-top: 0.25rem; opacity: 0.7; font-size: 0.875rem; }
    .read-more { margin-top: 0.5rem; }
    .category { font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; }
  </style>
</head>
${siteBodyOpen()}

  <main id="main-content">
    <div class="section-wrap">
      <header class="blog-header">
        <p class="eyebrow">Conteúdo</p>
        <h1 class="section-title">Blog</h1>
        <p class="section-sub">Estratégias e insights sobre marketing digital.</p>
      </header>

      <section class="post-grid" aria-label="Artigos publicados">
${items}${empty}
      </section>
    </div>
  </main>
${siteBodyClose()}`;
}

// ── Utilitários ───────────────────────────────────────────────

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeJson(str) {
  return (str || '')
    .replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    .replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function formatDateBR(dateStr) {
  if (!dateStr) return '';
  try {
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day]   = datePart.split('-');
    const months = ['janeiro','fevereiro','março','abril','maio','junho',
                    'julho','agosto','setembro','outubro','novembro','dezembro'];
    const date = `${parseInt(day, 10)} de ${months[parseInt(month, 10) - 1]} de ${year}`;
    if (!timePart) return date;
    const [hh, mm] = timePart.split(':');
    return `${date} às ${hh}h${mm}`;
  } catch (e) {
    return dateStr;
  }
}
