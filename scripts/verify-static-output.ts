import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { docsCatalog, docsPortals } from '../src/pages/docs/catalog';
import { routeMetadata } from '../src/pages/_routes';
import { marketingPages } from '../src/pages/marketing/catalog';
import { SITE_URL } from '../src/pages/metadata';

const root = process.cwd();
const dist = resolve(root, 'dist');
const errors: string[] = [];
const assert = (condition: unknown, message: string) => {
  if (!condition) errors.push(message);
};
const read = (path: string) => readFileSync(resolve(dist, path), 'utf8');
const routeFile = (route: string) =>
  route === '/' ? 'index.html' : `${route.slice(1)}/index.html`;

const marketingRoutes = [
  '/',
  ...marketingPages.map((page) => page.path),
  '/404',
];
const docsRoutes = ['/docs', ...docsCatalog.map((page) => page.route)];
const expectations = [
  ...marketingRoutes.map((route) => ({
    route,
    layout: 'marketing',
    headings: [] as readonly string[],
  })),
  ...docsRoutes.map((route) => ({
    route,
    // The docs index is a product chooser and renders in the marketing layout.
    layout: route === '/docs' ? 'marketing' : 'docs',
    headings:
      route === '/docs'
        ? ['search', 'choose-product']
        : (docsCatalog
            .find((page) => page.route === route)
            ?.content.map((section) => section.id) ?? []),
  })),
];
const expectedRoutes = new Set(expectations.map(({ route }) => route));
const retiredRoutes = [
  '/open-source',
  '/docs/fitz-typescript',
  '/docs/fitz-go',
  '/docs/fitz/quick-start',
  '/docs/fitz/setup',
  '/docs/fitz/overview',
  '/docs/fitz/client-selection',
  // Client usage lives on each domain page, not in per-language portals.
  '/docs/fitz/clients/typescript',
  '/docs/fitz/clients/go',
  '/docs/cassie/quick-start',
  '/docs/midge/quick-start',
  // No portal carries an FAQ; questions belong on the page that owns the topic.
  '/docs/midge/faq',
];

assert(existsSync(dist), 'dist/ is missing');
assert(existsSync(resolve(dist, 'metadata.json')), 'metadata.json is missing');
const metadata = JSON.parse(read('metadata.json'));
const generatedRoutes = new Set(
  (metadata.routes ?? []).map(({ path }: { path: string }) => path)
);
assert(
  metadata.totalRoutes === expectations.length,
  `metadata must report ${expectations.length} routes`
);
assert(
  metadata.successful === expectations.length,
  'every route must generate successfully'
);
assert(metadata.failed === 0, 'metadata must report no failures');
assert(
  [...expectedRoutes].every((route) => generatedRoutes.has(route)) &&
    generatedRoutes.size === expectedRoutes.size,
  'metadata route set must exactly match the route catalogs'
);
for (const route of retiredRoutes) {
  assert(!generatedRoutes.has(route), `retired route generated: ${route}`);
  assert(
    !existsSync(resolve(dist, routeFile(route))),
    `retired route document remains: ${route}`
  );
}

const documents = new Map<string, string>();
for (const expectation of expectations) {
  const file = routeFile(expectation.route);
  assert(
    existsSync(resolve(dist, file)),
    `${expectation.route} document is missing`
  );
  if (!existsSync(resolve(dist, file))) continue;

  const html = read(file);
  documents.set(expectation.route, html);
  const expected = routeMetadata[expectation.route]!;
  const titles = [...html.matchAll(/<title([^>]*)>(.*?)<\/title>/g)];
  assert(
    titles.length === 1 &&
      titles[0]?.[1]?.includes('data-askr-head') &&
      titles[0]?.[2] === expected.title,
    `${expectation.route} has the wrong framework-owned title`
  );
  assert(
    html.includes(
      `name="description" content="${expected.description?.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`
    ),
    `${expectation.route} has the wrong description`
  );
  assert(
    html.includes(`rel="canonical" href="${expected.canonical}"`),
    `${expectation.route} has the wrong canonical URL`
  );
  assert(
    html.includes(`name="robots" content="${expected.robots}"`),
    `${expectation.route} has the wrong robots directive`
  );
  assert(
    html.includes(`property="og:url" content="${expected.canonical}"`),
    `${expectation.route} has the wrong Open Graph URL`
  );
  assert(
    !html.includes('property="og:image"'),
    `${expectation.route} must omit og:image`
  );
  assert(
    html.includes(`data-layout="${expectation.layout}"`),
    `${expectation.route} is missing its layout marker`
  );
  assert(
    !html.includes('/logo.svg'),
    `${expectation.route} still references the retired Cntryl logo`
  );
  assert(
    !html.includes('/src/'),
    `${expectation.route} references source files`
  );
  const nativeButtons = [...html.matchAll(/<button\b[^>]*>/g)].map(
    (match) => match[0]
  );
  // Themed parts carry their own slot (button, sidebar-trigger, sidebar-rail);
  // a slotless native button means markup that skipped the theme.
  assert(
    nativeButtons.every((button) => button.includes('data-slot="')),
    `${expectation.route} contains a button outside the Askr theme contract`
  );

  const assets = [
    ...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g),
  ].map((match) => match[1]!);
  assert(
    assets.some((asset) => /-[A-Za-z0-9_-]+\.js$/.test(asset)),
    `${expectation.route} is missing a hashed script`
  );
  assert(
    assets.some((asset) => /-[A-Za-z0-9_-]+\.css$/.test(asset)),
    `${expectation.route} is missing a hashed stylesheet`
  );
  for (const asset of assets) {
    assert(
      existsSync(resolve(dist, `.${asset}`)),
      `${expectation.route} references missing ${asset}`
    );
  }

  if (expectation.layout === 'docs') {
    for (const marker of [
      'Search docs',
      'Toggle documentation navigation',
      'On this page',
      'docs-pagination',
      `data-docs-route="${expectation.route}"`,
    ]) {
      if (expectation.route === '/docs' && marker === 'docs-pagination') {
        continue;
      }
      assert(
        html.includes(marker),
        `${expectation.route} is missing docs marker: ${marker}`
      );
    }
    // A product page shows only its own product in the sidebar.
    const owner = docsPortals.find(
      (portal) =>
        expectation.route === portal.route ||
        expectation.route.startsWith(`${portal.route}/`)
    );
    assert(
      owner !== undefined && html.includes(owner.label),
      `${expectation.route} is missing its sidebar product label`
    );
    assert(
      html.includes('data-docs-sidebar="unified"'),
      `${expectation.route} is missing the unified sidebar contract`
    );
    // Every product is reachable from the top tabs on every docs page.
    for (const portalRoute of docsPortals.map((portal) => portal.route)) {
      assert(
        html.includes(`href="${portalRoute}"`),
        `${expectation.route} is missing product tab ${portalRoute}`
      );
    }
    // Location is shown by the active tab and sidebar, so there is no
    // breadcrumb row to assert.
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!);
    assert(
      new Set(ids).size === ids.length,
      `${expectation.route} contains duplicate anchors`
    );
    for (const heading of expectation.headings) {
      assert(
        ids.includes(heading),
        `${expectation.route} is missing #${heading}`
      );
    }
  }

  assert(
    !/\b(lorem|coming soon|todo|tbd)\b/i.test(html),
    `${expectation.route} contains placeholder prose`
  );
  // Docs pages are technical reference material and may legitimately name a
  // real API identifier (e.g. a TrustClass::Experimental enum variant); this
  // check is about how marketing pages talk about the product, not the
  // product's own vocabulary.
  if (expectation.layout !== 'docs') {
    assert(
      !/\b(alpha|beta|experimental|maturity|roadmap|scorecard)\b|production[- ]ready/i.test(
        html
      ),
      `${expectation.route} contains an accidental readiness label`
    );
  }
}

for (const [route, html] of documents) {
  const links = [...html.matchAll(/href="(\/[^"]*)"/g)].map(
    (match) => match[1]!
  );
  for (const href of links) {
    if (href.startsWith('/assets/')) continue;
    const [path, anchor] = href.split('#');
    const normalized =
      path && path !== '/'
        ? path.endsWith('/')
          ? path.slice(0, -1)
          : path
        : path || route;
    assert(
      expectedRoutes.has(normalized),
      `${route} links to missing route ${normalized}`
    );
    if (anchor && documents.has(normalized)) {
      assert(
        documents.get(normalized)!.includes(`id="${anchor}"`),
        `${route} links to missing anchor ${normalized}#${anchor}`
      );
    }
  }
}

for (const asset of ['robots.txt', 'sitemap.xml']) {
  assert(existsSync(resolve(dist, asset)), `${asset} must be published`);
}
assert(!existsSync(resolve(dist, 'logo.svg')), 'retired logo must not publish');
assert(
  !existsSync(resolve(dist, 'og.png')),
  'retired social card must not publish'
);
const robots = read('robots.txt');
assert(
  robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`),
  'robots.txt must point to the apex sitemap'
);
const sitemap = read('sitemap.xml');
const sitemapRoutes = new Set(
  [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => new URL(match[1]!).pathname.replace(/\/$/, '') || '/'
  )
);
assert(
  [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].every(
    (match) => new URL(match[1]!).origin === SITE_URL
  ),
  'sitemap must use the apex domain'
);
for (const route of expectedRoutes) {
  if (route !== '/404') {
    assert(sitemapRoutes.has(route), `sitemap is missing ${route}`);
  }
}
assert(
  sitemapRoutes.size === expectedRoutes.size - 1,
  'sitemap must contain every indexable route exactly once'
);
assert(existsSync(resolve(dist, '404.html')), 'Pages fallback is missing');
assert(read('404.html') === read('404/index.html'), '404.html must match /404');

const htmlFiles = readdirSync(dist, { recursive: true }).filter((file) =>
  String(file).endsWith('.html')
);
assert(
  htmlFiles.length >= expectations.length,
  'static output is missing generated documents'
);

if (errors.length) {
  console.error(
    `Static output verification failed:\n${errors.map((error) => `- ${error}`).join('\n')}`
  );
  process.exitCode = 1;
} else {
  console.log(
    `Static output verified: ${expectations.length} routes on ${SITE_URL}.`
  );
}
