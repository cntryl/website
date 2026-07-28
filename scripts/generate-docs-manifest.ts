import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { docsPortals } from '../src/pages/docs/catalog';

const manifest = docsPortals.map((portal) => ({
  id: portal.id,
  label: portal.label,
  shortLabel: portal.shortLabel,
  kind: portal.kind,
  route: portal.route,
  description: portal.description,
  repository: portal.repository,
  sections: portal.sections.map((section) => ({
    id: section.id,
    label: section.label,
    pages: section.pages.map((page) => ({
      route: page.route,
      title: page.title,
      description: page.description,
      toc: page.content.map(({ id, title }) => ({ id, title })),
    })),
  })),
}));

const output = `import type { DocsPortalId, ProductKind } from './types';

export type DocsManifestToc = { id: string; title: string };
export type DocsManifestPage = {
  route: string;
  title: string;
  description: string;
  toc: readonly DocsManifestToc[];
};
export type DocsManifestSection = {
  id: string;
  label: string;
  pages: readonly DocsManifestPage[];
};
export type DocsManifestPortal = {
  id: DocsPortalId;
  label: string;
  shortLabel: string;
  kind: ProductKind;
  route: string;
  description: string;
  repository: string;
  sections: readonly DocsManifestSection[];
};

// Generated from src/pages/docs/catalog.ts.
export const docsManifest: readonly DocsManifestPortal[] = ${JSON.stringify(manifest, null, 2)};

export const docsManifestPages = docsManifest.flatMap((portal) =>
  portal.sections.flatMap((section) => section.pages)
);

export const docsManifestByRoute = new Map(
  docsManifestPages.map((page) => [page.route, page])
);

export const docsManifestPortalById = new Map(
  docsManifest.map((portal) => [portal.id, portal])
);

export function docsManifestPortalForRoute(route: string) {
  return docsManifest
    .filter(
      (portal) =>
        route === portal.route || route.startsWith(portal.route + '/')
    )
    .sort((left, right) => right.route.length - left.route.length)[0];
}

export function normalizeDocsRoute(route: string) {
  const path = route.split(/[?#]/)[0] || '/docs';
  if (path === '/') return '/docs';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function resolveDocsRoute(snapshot: {
  path?: string;
  matches?: readonly { path: string }[];
}) {
  const matched = snapshot.matches?.at(-1)?.path;
  return normalizeDocsRoute(matched ?? snapshot.path ?? '/docs');
}
`;

writeFileSync(resolve(process.cwd(), 'src/pages/docs/manifest.ts'), output);
