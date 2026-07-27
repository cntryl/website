import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { routeMetadata } from '../src/pages/_routes';
import {
  docsByRoute,
  docsCatalog,
  docsPortals,
  docsSearchRecords,
  docsTableOfContents,
  normalizeDocsRoute,
  portalForRoute,
  searchDocs,
} from '../src/pages/docs/catalog';
import { documentationCoverage } from '../src/pages/docs/coverage';
import type { DocsPortalId } from '../src/pages/docs/types';
import { homeJourneys } from '../src/pages/marketing/home';
import { marketingPages } from '../src/pages/marketing/catalog';
import { SITE_URL } from '../src/pages/metadata';

const docsRoutes = docsCatalog.map((page) => page.route);
const marketingRoutes = marketingPages.map((page) => page.path);
const allRouteSet = new Set([
  '/',
  '/docs',
  '/404',
  ...marketingRoutes,
  ...docsRoutes,
]);
const allRoutes = [...allRouteSet].sort();
const fitzRequiredRoutes = [
  '/docs/fitz',
  '/docs/fitz/getting-started',
  '/docs/fitz/cloud',
  '/docs/fitz/concepts-and-routes',
  '/docs/fitz/authentication',
  '/docs/fitz/durability',
  '/docs/fitz/clients',
  '/docs/fitz/domains/notice',
  '/docs/fitz/domains/stream',
  '/docs/fitz/domains/kv',
  '/docs/fitz/domains/queue',
  '/docs/fitz/domains/rpc',
  '/docs/fitz/domains/lease',
  '/docs/fitz/domains/schedule',
];

describe('route and product catalogs', () => {
  it('registers all routes from docs and marketing catalogs', () => {
    expect(Object.keys(routeMetadata).sort()).toEqual(allRoutes);
    for (const route of allRoutes) {
      const metadata = routeMetadata[route]!;
      expect(metadata.title?.length).toBeGreaterThan(0);
      expect(metadata.description?.length).toBeGreaterThan(0);
      expect(metadata.canonical).toBe(
        `${SITE_URL}${route === '/' ? '' : route}`
      );
      expect(metadata.robots).toBe(
        route === '/404' ? 'noindex, nofollow' : 'index, follow'
      );
      expect(metadata.openGraph?.['og:url']).toBe(metadata.canonical);
      expect(metadata.openGraph).not.toHaveProperty('og:image');
    }
    for (const page of docsRoutes) {
      const metadata = routeMetadata[page]!;
      expect(metadata.title).toContain(' | Cntryl');
      expect(metadata.description?.length).toBeGreaterThan(0);
    }
  });

  it('has five portal owners with the expected product shape', () => {
    const catalogRouteSet = new Set(docsRoutes);
    expect(catalogRouteSet.size).toBe(docsRoutes.length);
    expect(docsPortals.map(({ id }) => id)).toEqual([
      'midge',
      'fitz',
      'cassie',
      'tools',
      'stress',
    ]);
    expect(docsPortals.map(({ kind }) => kind)).toEqual([
      'runtime',
      'runtime',
      'runtime',
      'supporting',
      'supporting',
    ]);

    for (const portal of docsPortals) {
      const pages = portal.sections.flatMap((section) => section.pages);
      const pageRoutes = pages.map((page) => page.route);
      expect(new Set(pageRoutes).size).toBe(pageRoutes.length);
      expect(pageRoutes[0]).toBe(portal.route);
      for (const [index, page] of pages.entries()) {
        expect(page.previous).toBe(pages[index - 1]?.route);
        expect(page.next).toBe(pages[index + 1]?.route);
        expect(page.title).toBeTruthy();
        expect(page.description).toBeTruthy();
        expect(page.content.length).toBeGreaterThan(0);
        expect(page.content.map(({ id }) => id)).toHaveLength(
          new Set(page.content.map(({ id }) => id)).size
        );
      }
      for (const route of pageRoutes) {
        expect(docsByRoute.get(route)).toBe(
          portal.sections
            .flatMap((section) => section.pages)
            .find((page) => page.route === route)
        );
        expect(portalForRoute(route)).toBe(portal);
        expect(normalizeDocsRoute(`${route}/`)).toBe(route);
      }
      for (const route of pageRoutes) {
        expect(catalogRouteSet.has(route)).toBe(true);
      }
    }

    const requiredByPortal = {
      midge: [
        '/docs/midge',
        '/docs/midge/getting-started',
        '/docs/midge/options',
        '/docs/midge/cloud',
        '/docs/midge/operations',
      ],
      fitz: fitzRequiredRoutes,
      cassie: ['/docs/cassie', '/docs/cassie/getting-started'],
      tools: ['/docs/tools', '/docs/tools/getting-started'],
      stress: ['/docs/stress', '/docs/stress/getting-started'],
    } as const satisfies Record<DocsPortalId, readonly string[]>;

    for (const portal of docsPortals) {
      const portalRoutes = new Set<string>(
        portal.sections.flatMap((section) =>
          section.pages.map((page) => page.route)
        )
      );
      for (const route of requiredByPortal[portal.id]) {
        expect(portalRoutes.has(route), `${portal.id}: ${route}`).toBe(true);
      }
    }

    const docsCatalogRouteSet = new Set(docsRoutes);
    for (const route of docsCatalogRouteSet) {
      expect(routeMetadata[route]).toBeDefined();
    }
    const registeredDocsRoutes = Object.keys(routeMetadata)
      .filter((route) => route.startsWith('/docs'))
      .sort();
    expect(new Set(registeredDocsRoutes)).toEqual(
      new Set(['/docs', ...docsCatalogRouteSet])
    );
  });

  it('switches products in the top tabs and scopes the sidebar to one', () => {
    const layout = readFileSync(
      resolve(process.cwd(), 'src/pages/docs/_layout.tsx'),
      'utf8'
    );
    const productBar = readFileSync(
      resolve(process.cwd(), 'src/pages/docs/product-bar.tsx'),
      'utf8'
    );
    // Chrome is assembled from Askr theme components, not hand-rolled markup.
    expect(layout).toContain("from '@askrjs/themes/components'");
    for (const part of [
      'SidebarScope',
      'SidebarContent',
      'SidebarGroup',
      'SidebarMenuButton',
      'SidebarInset',
      'SidebarTrigger',
    ]) {
      expect(layout, `layout should use ${part}`).toContain(part);
    }
    // Docs render inside the shared shell rather than defining their own.
    expect(layout).toContain("from '../site-layout'");
    expect(layout).toContain(
      '<SiteLayout variant="docs" portalId={portal.id}>'
    );
    expect(layout).not.toContain('ThemeScope');
    expect(layout).toContain('collapsible="offcanvas"');
    // The product switcher is its own band below the nav, and it belongs to
    // the docs layout only — the docs index does not carry it.
    expect(layout).toContain('<DocsProductBar />');
    expect(productBar).toContain('class="docs-productbar"');
    expect(productBar).toContain('each={list(docsPortals)}');
    expect(productBar).toContain('<Tab href={portal.route} match="prefix">');
    // The sidebar carries one product's sections only. The nav groups are
    // derived from portal.sections each render rather than being handed to For
    // directly, so that each entry's `active` flag changes item identity — For
    // does not re-invoke its children function for stable items, which would
    // otherwise freeze the highlight on the first page opened.
    expect(layout).toContain('for (const section of portal.sections)');
    expect(layout).toContain('active: page.route === activePath');
    expect(layout).toContain('active={page.active}');
    expect(layout).toContain('portalForRoute');
    expect(layout).toContain(
      '<SidebarGroupLabel>{section.label}</SidebarGroupLabel>'
    );
    expect(layout).not.toContain('SectionIcon');
    expect(layout).not.toContain('docs-nav__');
  });

  it('renders every page through one master layout', () => {
    const read = (path: string) =>
      readFileSync(resolve(process.cwd(), path), 'utf8');
    const shell = read('src/pages/site-layout.tsx');
    const header = read('src/pages/site-header.tsx');
    const marketing = read('src/pages/marketing/_layout.tsx');
    const docs = read('src/pages/docs/_layout.tsx');

    // The shell owns the nav, the page, and the footer.
    expect(shell).toContain('<SiteHeader');
    expect(shell).toContain('<SiteFooter />');
    expect(shell).toContain('<main class="site-main">{children}</main>');
    expect(header).toContain('export function SiteHeader');
    // The shared header takes no slot for section-specific rows.
    expect(header).not.toContain('children');

    for (const layout of [marketing, docs]) {
      expect(layout).toContain('SiteLayout');
      // Section layouts build neither their own bar nor their own footer.
      expect(layout).not.toContain('<Navbar');
      expect(layout).not.toContain('<Footer');
    }
  });

  it('renders the docs index in the marketing layout', () => {
    const routes = readFileSync(
      resolve(process.cwd(), 'src/pages/_routes.tsx'),
      'utf8'
    );
    expect(routes).toContain('group({ layout: MarketingLayout }');
    expect(routes).toContain("route('/docs', DocsHome");
    // /docs is a chooser, so it must not sit inside a product sidebar group.
    const docsGroup = routes.slice(
      routes.indexOf('group({ layout: DocsLayout }')
    );
    expect(docsGroup).not.toContain("route('/docs',");
  });

  it('checks every docs route has complete content sections and TOC entries', () => {
    for (const page of docsCatalog) {
      expect(page.content.length).toBeGreaterThan(0);
      expect(docsTableOfContents(page).length).toBeGreaterThan(0);
      expect(
        new Set(page.content.map((section) => section.id)).size,
        page.route
      ).toBe(page.content.length);
      expect(page.content.every((section) => section.id.length > 0)).toBe(true);
      expect(
        page.content.every(
          (section) =>
            section.title.trim().length > 0 &&
            section.paragraphs.length > 0 &&
            section.paragraphs.every((paragraph) => paragraph.trim().length > 0)
        ),
        page.route
      ).toBe(true);
      expect(JSON.stringify(page.content)).not.toContain(
        'defines the decisions, inputs, observable behavior'
      );
    }
  });

  it('does not emit the retired generic outline scaffolding', () => {
    const content = JSON.stringify(docsCatalog);
    expect(content).not.toContain('Follow the');
    expect(content).not.toContain('as a verification point');
    expect(content).not.toContain('Keep the decision inside');
    expect(content).not.toContain('placeholder paragraph');
  });

  it('renders every list through For instead of a plain array map', () => {
    // A mapped array drops items when it has element siblings in the same
    // parent. The SSG renders a string and never shows it, so this only breaks
    // on a fresh client mount. For is the supported list primitive.
    const renderFiles = [
      'src/pages/docs/_layout.tsx',
      'src/pages/docs/page.tsx',
      'src/pages/docs/search.tsx',
      'src/pages/marketing/_layout.tsx',
      'src/pages/marketing/page.tsx',
      'src/pages/marketing/home.tsx',
    ];
    for (const path of renderFiles) {
      const source = readFileSync(resolve(process.cwd(), path), 'utf8');
      expect(
        source,
        `${path} renders a list with .map instead of For`
      ).not.toMatch(/\.map\(/);
    }
  });

  it('renders every documentation route through the shared DocsLayout', () => {
    const routes = readFileSync(
      resolve(process.cwd(), 'src/pages/_routes.tsx'),
      'utf8'
    );
    expect(routes).toContain("import { DocsLayout } from './docs/_layout'");
    expect(routes.match(/group\({ layout: DocsLayout \}/g)).toHaveLength(2);
    expect(routes).not.toMatch(/(?:Midge|Cassie|Fitz|Tools|Stress)DocsLayout/);
  });

  it('boots the combined registry for client navigation between site sections', () => {
    const main = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');
    expect(main).toContain("await import('./pages/_routes')");
    expect(main).not.toContain("window.location.pathname.startsWith('/docs')");
    expect(main).not.toContain('marketingRouteRegistry');
  });

  it('restricts search records and filters to the five product portals', () => {
    expect(new Set(docsSearchRecords.map(({ portalId }) => portalId))).toEqual(
      new Set(docsPortals.map((portal) => portal.id))
    );
    for (const portal of docsPortals) {
      expect(
        searchDocs(portal.label, portal.id).every(
          (record) => record.portalId === portal.id
        )
      ).toBe(true);
    }
    expect(searchDocs('latest.json', 'stress').length).toBeGreaterThan(0);
    expect(searchDocs('validate-tests', 'tools').length).toBeGreaterThan(0);
  });

  it('maps catalog coverage and contributor scope consistently', () => {
    const siteRoutes = new Set(
      documentationCoverage
        .filter((entry) => entry.disposition === 'site')
        .map((entry) => entry.route)
    );
    const contributorRoutes = new Set<string>(
      documentationCoverage
        .filter((entry) => entry.disposition === 'github-only')
        .map((entry) => entry.source)
    );
    for (const page of docsCatalog) {
      expect(
        siteRoutes.has(page.route) || contributorRoutes.has(page.route)
      ).toBe(true);
    }
    for (const entry of documentationCoverage) {
      if (entry.disposition === 'site') {
        expect(docsByRoute.get(entry.route)).toBeDefined();
      } else {
        expect(entry.audience).toBe('contributor');
        expect(entry.repository).toMatch(/^https:\/\/github\.com\/cntryl\//);
      }
    }
  });
});

describe('editorial contracts', () => {
  const authored = JSON.stringify({
    marketingPages,
    docsPortals,
    docsRoutes: docsCatalog,
  });

  it('contains no placeholders, maturity labels, or competitive framing', () => {
    expect(authored).not.toMatch(
      /\b(lorem|coming soon|todo|tbd|placeholder)\b/i
    );
    expect(authored).not.toMatch(
      /\b(alpha|beta|experimental|maturity|roadmap|scorecard)\b|production[- ]ready/i
    );
    expect(authored).not.toMatch(
      /\b(replace|stop assembling|sprawl|wrong tool|superior|better than)\b/i
    );
  });

  it('keeps structured internal links on registered routes', () => {
    const links = [
      ...homeJourneys.map(({ href }) => href),
      ...marketingPages.flatMap(({ next }) => [
        next.primaryHref,
        next.secondaryHref,
      ]),
      ...docsCatalog.map((page) => page.route),
    ].filter((href) => href.startsWith('/'));
    for (const href of links)
      expect(allRouteSet.has(href as typeof href), href).toBe(true);
  });

  it('uses Getting Started as every product primary CTA', () => {
    for (const id of ['midge', 'fitz', 'cassie']) {
      const page = marketingPages.find(({ path }) => path === `/${id}`)!;
      expect(page.next.primaryLabel).toBe('Get started');
      expect(page.next.primaryHref).toBe(`/docs/${id}/getting-started`);
      expect(page.next.secondaryHref).toBe(`/docs/${id}`);
      expect('repository' in page.next ? page.next.repository : undefined).toBe(
        `https://github.com/cntryl/${id}`
      );
    }
  });

  it('states only the verified cross-product relationships', () => {
    const ecosystem = marketingPages.find(({ path }) => path === '/ecosystem')!;
    const copy = JSON.stringify(ecosystem);
    // Verified in the product repos: fitz/Cargo.toml and cassie/Cargo.toml both
    // depend on cntryl-midge, and Cassie's README calls it its only storage
    // layer. The shared engine is the stated value, so the copy must say so.
    expect(copy).toMatch(/Fitz and Cassie both depend on cntryl-midge/);
    expect(copy).toMatch(/Cassie uses Midge/);
    // Fitz needs no Cassie, which is what "independently useful" means here.
    expect(copy).toMatch(/Fitz is independently useful/);
    expect(copy).not.toMatch(/Fitz (?:uses|requires) Cassie/);
    // Nothing may claim a product runs without the engine underneath it.
    expect(copy).not.toMatch(/(?:does not|doesn't) require .*Midge/);
    expect(copy).not.toMatch(/\b(?:Tools|Stress)\b/);
  });

  it('keeps supporting products in docs rather than the marketing story', () => {
    expect(homeJourneys.map(({ href }) => href)).toEqual([
      '/midge',
      '/fitz',
      '/cassie',
    ]);
  });

  it('gives every overview boundaries and a first-guide action', () => {
    for (const portal of docsPortals) {
      const overview = docsByRoute.get(portal.route)!;
      const pages = portal.sections.flatMap((section) => section.pages);
      expect(JSON.stringify(overview.content)).toMatch(
        /what|engine|broker|CLI|framework/i
      );
      expect(JSON.stringify(overview.content)).toMatch(
        /boundar|is not|does not/i
      );
      expect(overview.next).toBe(pages[1]?.route);
    }
  });

  it('documents all public Midge options and core operations', () => {
    const options = JSON.stringify(docsByRoute.get('/docs/midge/options'));
    for (const term of [
      'OpenOptions::in_memory',
      'OpenOptions::local',
      'OpenOptions::cloud',
      '.goal(value)',
      '.memory_budget(value)',
      '.workload(value)',
      '.with_memtable_size_limit(bytes)',
      '.with_memtable_flush_threshold(bytes)',
      '.transaction_memory_pool_size(bytes)',
      '.block_cache_policy(policy)',
      '.cloud_write_policy(policy)',
      '.background_compaction(enabled)',
      '.recovery_policy(policy)',
      '.storage_io_timeout(duration)',
    ]) {
      expect(options, term).toContain(term);
    }

    const operations = JSON.stringify(
      docsByRoute.get('/docs/midge/operations')
    );
    for (const term of [
      'tx.put',
      'tx.insert',
      'tx.delete',
      'tx.delete_range',
      'tx.get',
      'tx.scan',
      'tx.rollback',
      'tx.commit',
    ]) {
      expect(operations, term).toContain(term);
    }
  });

  it('documents every supported Midge cloud provider family', () => {
    const cloud = JSON.stringify(docsByRoute.get('/docs/midge/cloud'));
    for (const term of [
      'CloudProviderConfig::aws_s3',
      's3_compatible_env',
      'CloudProviderConfig::azure_blob',
      'CloudProviderConfig::gcs',
      'S3CredentialSource',
      'AzureCredentialSource',
      'GcsCredentialSource',
      'cloud_async',
      'cloud_strict',
      'local cache',
      'unique prefix',
    ]) {
      expect(cloud, term).toContain(term);
    }
  });

  it('keeps Fitz server and domain documentation complete', () => {
    const fitz = docsPortals.find((portal) => portal.id === 'fitz')!;
    const pages = fitz.sections.flatMap((section) => section.pages);
    for (const route of fitzRequiredRoutes) {
      expect(
        pages.some((page) => page.route === route),
        `missing ${route}`
      ).toBe(true);
    }
    for (const page of pages) {
      expect(page.content.length, page.route).toBeGreaterThanOrEqual(1);
      expect(
        page.content.map(({ id }) => id),
        `${page.route} section ids`
      ).toHaveLength(new Set(page.content.map(({ id }) => id)).size);
      const requiresClientExamples = page.route.includes('/docs/fitz/domains/');
      expect(
        page.content.some(
          (section) =>
            section.title === 'Client examples' &&
            section.codeTabs?.map((tab) => tab.label).join(',') ===
              'TypeScript,Go,C#,Rust'
        ),
        `${page.route} should include four-language client tabs`
      ).toBe(requiresClientExamples);
      if (requiresClientExamples) {
        const domain = page.route.split('/').pop()!;
        const examples = page.content.find(
          (section) => section.title === 'Client examples'
        )!;
        const tabs = examples.codeTabs!;
        expect(tabs).toHaveLength(4);
        for (const tab of tabs) {
          const routePattern = new RegExp(
            `${domain}://[A-Za-z0-9_-]+/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)?`,
            'g'
          );
          const routes = [...tab.code.matchAll(routePattern)].map(
            ([route]) => route
          );
          expect(routes, `${page.route} ${tab.label} route`).not.toHaveLength(
            0
          );
          expect(
            routes.some(
              (route) =>
                route.split('://')[1].split('/').length ===
                (domain === 'schedule' || domain === 'rpc' ? 4 : 3)
            ),
            `${page.route} ${tab.label} route shape`
          ).toBe(true);
          expect(tab.code).not.toContain('orders.updated');
          expect(tab.code).not.toContain('WithToken');
          expect(tab.code).not.toContain('queue.Ack');
        }
      }
    }
  });

  it('uses the Askr GitHub logo for visual GitHub links', () => {
    const components = [
      'src/pages/marketing/_layout.tsx',
      'src/pages/marketing/page.tsx',
      'src/pages/docs/_layout.tsx',
      'src/pages/docs/page.tsx',
    ]
      .map((path) => readFileSync(resolve(process.cwd(), path), 'utf8'))
      .join('\n');
    expect(components).toContain("from '@askrjs/logos'");
    expect(components).toContain('<GitHubLogo');
    expect(components).not.toContain('GitForkIcon');
  });
});
