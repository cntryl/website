import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { routeMetadata } from '../src/pages/_routes';
import {
  docsByRoute,
  docsCatalog,
  docsNavigationGroups,
  docsPortals,
  docsSearchRecords,
  normalizeDocsRoute,
  portalForRoute,
  searchDocs,
} from '../src/pages/docs/catalog';
import { documentationCoverage } from '../src/pages/docs/coverage';
import { homeJourneys } from '../src/pages/marketing/home';
import { marketingPages } from '../src/pages/marketing/catalog';
import { SITE_URL } from '../src/pages/metadata';

const expectedRoutes = [
  '/',
  '/ecosystem',
  '/midge',
  '/fitz',
  '/cassie',
  '/tools',
  '/stress',
  '/404',
  '/docs',
  '/docs/midge',
  '/docs/midge/getting-started',
  '/docs/midge/options',
  '/docs/midge/cloud',
  '/docs/midge/operations',
  '/docs/fitz',
  '/docs/fitz/setup',
  '/docs/fitz/cloud',
  '/docs/fitz/domains/notice',
  '/docs/fitz/domains/stream',
  '/docs/fitz/domains/kv',
  '/docs/fitz/domains/queue',
  '/docs/fitz/domains/rpc',
  '/docs/fitz/domains/lease',
  '/docs/fitz/domains/schedule',
  '/docs/cassie',
  '/docs/cassie/getting-started',
  '/docs/tools',
  '/docs/tools/getting-started',
  '/docs/stress',
  '/docs/stress/getting-started',
] as const;
const allRoutes = new Set(expectedRoutes);

describe('route and product catalogs', () => {
  it('registers the exact 30-route public set with unique apex metadata', () => {
    expect(Object.keys(routeMetadata).sort()).toEqual(
      [...expectedRoutes].sort()
    );
    expect(
      new Set(Object.values(routeMetadata).map((meta) => meta.title)).size
    ).toBe(30);
    expect(
      new Set(Object.values(routeMetadata).map((meta) => meta.description)).size
    ).toBe(30);
    for (const route of expectedRoutes) {
      const metadata = routeMetadata[route]!;
      expect(metadata.canonical).toBe(
        `${SITE_URL}${route === '/' ? '' : route}`
      );
      expect(metadata.robots).toBe(
        route === '/404' ? 'noindex, nofollow' : 'index, follow'
      );
      expect(metadata.openGraph?.['og:url']).toBe(metadata.canonical);
      expect(metadata.openGraph).not.toHaveProperty('og:image');
    }
  });

  it('has five portal owners with the intended page order', () => {
    expect(docsPortals.map(({ id }) => id)).toEqual([
      'midge',
      'fitz',
      'cassie',
      'tools',
      'stress',
    ]);
    expect(docsCatalog).toHaveLength(21);
    expect(docsPortals.map(({ kind }) => kind)).toEqual([
      'runtime',
      'runtime',
      'runtime',
      'supporting',
      'supporting',
    ]);
    for (const portal of docsPortals) {
      const pages = portal.sections.flatMap((section) => section.pages);
      const expected =
        portal.id === 'midge'
          ? [
              portal.route,
              `${portal.route}/getting-started`,
              `${portal.route}/options`,
              `${portal.route}/cloud`,
              `${portal.route}/operations`,
            ]
          : portal.id === 'fitz'
            ? [
                portal.route,
                `${portal.route}/setup`,
                `${portal.route}/cloud`,
                `${portal.route}/domains/notice`,
                `${portal.route}/domains/stream`,
                `${portal.route}/domains/kv`,
                `${portal.route}/domains/queue`,
                `${portal.route}/domains/rpc`,
                `${portal.route}/domains/lease`,
                `${portal.route}/domains/schedule`,
              ]
            : [portal.route, `${portal.route}/getting-started`];
      expect(pages.map(({ route }) => route)).toEqual(expected);
      for (const [index, page] of pages.entries()) {
        expect(page.previous).toBe(pages[index - 1]?.route);
        expect(page.next).toBe(pages[index + 1]?.route);
      }
      for (const page of pages) {
        expect(docsByRoute.get(page.route)).toBe(page);
        expect(portalForRoute(page.route)).toBe(portal);
        expect(normalizeDocsRoute(`${page.route}/`)).toBe(page.route);
      }
    }
  });

  it('uses one unified documentation navigation hierarchy', () => {
    expect(
      docsNavigationGroups.map((group) => ({
        label: group.label,
        portals: group.portals.map((portal) => portal.id),
      }))
    ).toEqual([
      { label: 'Midge', portals: ['midge'] },
      { label: 'Cassie', portals: ['cassie'] },
      { label: 'Fitz', portals: ['fitz'] },
      { label: 'Other', portals: ['stress', 'tools'] },
    ]);
    expect(
      docsNavigationGroups.flatMap((group) =>
        group.portals.map((portal) => portal.id)
      )
    ).toHaveLength(5);
    const layout = readFileSync(
      resolve(process.cwd(), 'src/pages/docs/_layout.tsx'),
      'utf8'
    );
    expect(layout).not.toContain('ChevronDownIcon');
    expect(layout).not.toContain('ChevronRightIcon');
    expect(layout).not.toContain('<details');
    expect(layout).toContain('data-docs-sidebar="unified"');
    expect(layout).toContain('activePortal.sections.map');
  });

  it('configures every product through the shared sidebar catalog', () => {
    const sidebarPortalIds = docsNavigationGroups.flatMap((group) =>
      group.portals.map((portal) => portal.id)
    );
    expect(sidebarPortalIds).toEqual([
      'midge',
      'cassie',
      'fitz',
      'stress',
      'tools',
    ]);
    expect(new Set(sidebarPortalIds)).toEqual(
      new Set(docsPortals.map((portal) => portal.id))
    );
    for (const portal of docsPortals) {
      expect(portal.sections.length, portal.id).toBeGreaterThan(0);
      expect(
        portal.sections.every(
          (section) => section.label && section.pages.length > 0
        ),
        portal.id
      ).toBe(true);
    }
  });

  it('renders every documentation route through the shared DocsLayout', () => {
    const routes = readFileSync(
      resolve(process.cwd(), 'src/pages/_routes.tsx'),
      'utf8'
    );
    expect(routes).toContain("import { DocsLayout } from './docs/_layout'");
    expect(routes.match(/group\(\{ layout: DocsLayout \}/g)).toHaveLength(2);
    expect(routes).not.toMatch(/(?:Midge|Cassie|Fitz|Tools|Stress)DocsLayout/);
  });

  it('restricts search records and filters to the five product portals', () => {
    expect(new Set(docsSearchRecords.map(({ portalId }) => portalId))).toEqual(
      new Set(['midge', 'fitz', 'cassie', 'tools', 'stress'])
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

  it('maps user material to every page and contributor material to GitHub', () => {
    expect(
      new Set(
        documentationCoverage
          .filter((entry) => entry.disposition === 'site')
          .map((entry) => entry.route)
      )
    ).toEqual(new Set(docsCatalog.map((page) => page.route)));
    for (const entry of documentationCoverage) {
      if (entry.disposition === 'site')
        expect(entry.audience).not.toBe('contributor');
      else {
        expect(entry.audience).toBe('contributor');
        expect(entry.repository).toMatch(/^https:\/\/github\.com\/cntryl\//);
      }
    }
  });
});

describe('editorial contracts', () => {
  const authored = JSON.stringify({ marketingPages, docsCatalog });

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
      ...docsPortals.flatMap((portal) =>
        portal.sections
          .flatMap((section) => section.pages)
          .map((page) => page.route)
      ),
    ].filter((href) => href.startsWith('/'));
    for (const href of links)
      expect(allRoutes.has(href as (typeof expectedRoutes)[number]), href).toBe(
        true
      );
  });

  it('uses Getting Started as every product primary CTA', () => {
    for (const id of ['midge', 'fitz', 'cassie', 'tools', 'stress']) {
      const page = marketingPages.find(({ path }) => path === `/${id}`)!;
      expect(page.next.primaryLabel).toBe('Get started');
      expect(page.next.primaryHref).toBe(
        id === 'fitz' ? '/docs/fitz/setup' : `/docs/${id}/getting-started`
      );
      expect(page.next.secondaryHref).toBe(`/docs/${id}`);
      expect('repository' in page.next ? page.next.repository : undefined).toBe(
        `https://github.com/cntryl/${id}`
      );
    }
  });

  it('states only the verified cross-product relationships', () => {
    const ecosystem = marketingPages.find(({ path }) => path === '/ecosystem')!;
    const copy = JSON.stringify(ecosystem);
    expect(copy).toMatch(/Cassie uses Midge/);
    expect(copy).toMatch(/Fitz is independently useful/);
    expect(copy).not.toMatch(/Fitz (?:uses|requires) (?:Cassie|Midge)/);
    expect(copy).not.toMatch(/\b(?:Tools|Stress)\b/);
  });

  it('keeps supporting products out of the main marketing story', () => {
    expect(homeJourneys.map(({ href }) => href)).toEqual([
      '/midge',
      '/fitz',
      '/cassie',
    ]);
    const home = readFileSync(
      resolve(process.cwd(), 'src/pages/marketing/home.tsx'),
      'utf8'
    );
    const layout = readFileSync(
      resolve(process.cwd(), 'src/pages/marketing/_layout.tsx'),
      'utf8'
    );
    expect(home).not.toMatch(/\b(?:Tools|Stress)\b|\/(?:tools|stress)/);
    expect(layout).toMatch(/repository\.name !== 'tools'/);
    expect(layout).toMatch(/repository\.name !== 'stress'/);
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

  it('stubs the complete Fitz server and domain documentation structure', () => {
    const fitz = docsPortals.find((portal) => portal.id === 'fitz')!;
    expect(
      fitz.sections.map((section) => ({
        label: section.label,
        routes: section.pages.map((page) => page.route),
      }))
    ).toEqual([
      {
        label: 'Server',
        routes: ['/docs/fitz', '/docs/fitz/setup', '/docs/fitz/cloud'],
      },
      {
        label: 'Domains',
        routes: [
          '/docs/fitz/domains/notice',
          '/docs/fitz/domains/stream',
          '/docs/fitz/domains/kv',
          '/docs/fitz/domains/queue',
          '/docs/fitz/domains/rpc',
          '/docs/fitz/domains/lease',
          '/docs/fitz/domains/schedule',
        ],
      },
    ]);
    for (const page of fitz.sections.flatMap((section) => section.pages)) {
      expect(page.content.length, page.route).toBeGreaterThanOrEqual(3);
      expect(
        page.content.map(({ id }) => id),
        `${page.route} aside headings`
      ).toHaveLength(page.content.length);
    }
  });

  it('keeps button appearance owned by the default Askr theme', () => {
    const components = [
      'src/pages/marketing/_layout.tsx',
      'src/pages/marketing/home.tsx',
      'src/pages/marketing/page.tsx',
      'src/pages/marketing/not-found.tsx',
      'src/pages/docs/_layout.tsx',
      'src/pages/docs/search.tsx',
      'src/pages/docs/page.tsx',
    ]
      .map((path) => readFileSync(resolve(process.cwd(), path), 'utf8'))
      .join('\n');
    expect(components).not.toContain('<button');
    const styles = readFileSync(
      resolve(process.cwd(), 'src/styles.css'),
      'utf8'
    );
    for (const [, selector, declarations] of styles.matchAll(
      /([^{}]+)\{([^{}]*)\}/g
    )) {
      if (
        !selector ||
        selector.includes(':not(') ||
        !/(button|data-slot='button'|code-block__copy|docs-search__trigger)/.test(
          selector
        )
      )
        continue;
      expect(declarations, selector.trim()).not.toMatch(
        /\b(?:background(?:-color)?|border(?:-[\w-]+)?|box-shadow|color)\s*:/
      );
    }
  });

  it('uses Spectral for headings without changing body typography', () => {
    const document = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    const styles = readFileSync(
      resolve(process.cwd(), 'src/styles.css'),
      'utf8'
    );
    expect(document).toContain('family=Spectral:wght@400;500;600');
    expect(styles).toMatch(
      /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-family:\s*'Spectral'/
    );
    expect(styles).not.toMatch(/body\s*\{[^}]*font-family:\s*'Spectral'/s);
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
