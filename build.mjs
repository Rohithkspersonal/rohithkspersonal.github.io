// Test-site renderer for the Navata OS publish test. Reads <contentRoot>/<slug>/index.md (front matter + article) and navata-publication.json,
// writes _site/<route>/index.html with the SEO tags and manifest meta tags that the OS live verification checks, and copies the manifest beside the page.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const ROOT = 'content/library', OUT = '_site';
const esc = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unq = (value) => { const v = String(value ?? '').trim(); if (v.startsWith('"')) { try { return JSON.parse(v); } catch { /* fall through */ } } return v.replace(/^'|'$/g, ''); };
const routes = [];
mkdirSync(OUT, { recursive: true });
if (existsSync(ROOT)) {
  for (const slug of readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
    const dir = join(ROOT, slug);
    if (!existsSync(join(dir, 'index.md')) || !existsSync(join(dir, 'navata-publication.json'))) continue;
    const raw = readFileSync(join(dir, 'index.md'), 'utf8').replace(/\r\n/g, '\n');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) continue;
    const fm = Object.fromEntries(match[1].split('\n').map((line) => { const at = line.indexOf(':'); return at < 0 ? null : [line.slice(0, at).trim(), unq(line.slice(at + 1))]; }).filter(Boolean));
    const manifest = JSON.parse(readFileSync(join(dir, 'navata-publication.json'), 'utf8'));
    let body = match[2].trim();
    const h1 = body.match(/^# (.+)\n?/);           // the page has ONE h1: the title
    if (h1) body = body.slice(h1[0].length).trim();
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fm.seoTitle || fm.title)}</title>
<link rel="canonical" href="${esc(fm.canonical)}">
<meta name="description" content="${esc(fm.description)}">
<meta property="og:title" content="${esc(fm.seoTitle || fm.title)}">
<meta property="og:description" content="${esc(fm.description)}">
<meta property="og:url" content="${esc(fm.canonical)}">
<meta property="og:type" content="article">
<meta name="navata:publication-id" content="${esc(manifest.publicationId)}">
<meta name="navata:publication-source-sha256" content="${esc(manifest.publicationSourceHash)}">
</head><body><main><h1>${esc(fm.title)}</h1>
${marked.parse(body)}
</main></body></html>
`;
    const target = join(OUT, ...fm.route.split('/').filter(Boolean));
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'index.html'), html);
    copyFileSync(join(dir, 'navata-publication.json'), join(target, 'navata-publication.json'));
    routes.push(fm.route);
  }
}
writeFileSync(join(OUT, 'index.html'), '<!doctype html><title>Navata OS publish test</title><p>Test site for the Navata OS publish engine. Not production.</p>');
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n');
console.log(JSON.stringify({ rendered: routes }));
