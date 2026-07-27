import { cassiePortal } from './portals/cassie';
import { fitzPortal } from './portals/fitz';
import { midgePortal } from './portals/midge';
import { stressPortal } from './portals/stress';
import { toolsPortal } from './portals/tools';
import type {
  DocsPageDefinition,
  DocsPortalDefinition,
  DocsPortalId,
  DocsSearchRecord,
} from './types';

export const docsPortals = [
  midgePortal,
  fitzPortal,
  cassiePortal,
  toolsPortal,
  stressPortal,
] as const satisfies readonly DocsPortalDefinition[];

export const docsCatalog = docsPortals.flatMap((portal) =>
  portal.sections.flatMap((section) => section.pages)
);

export const docsByRoute = new Map(
  docsCatalog.map((page) => [page.route, page])
);

export const portalById = new Map(
  docsPortals.map((portal) => [portal.id, portal])
);

export function portalForRoute(route: string) {
  return docsPortals
    .filter(
      (portal) => route === portal.route || route.startsWith(`${portal.route}/`)
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

// Joined section labels, used to preview a product's coverage.
export function portalSectionSummary(portal: DocsPortalDefinition) {
  return portal.sections.map((section) => section.label).join(' · ');
}

export function docsTableOfContents(page: DocsPageDefinition) {
  return page.content.map(({ id, title }) => ({ id, title }));
}

export const docsSearchRecords: readonly DocsSearchRecord[] =
  docsCatalog.flatMap((page) => {
    const portal = portalById.get(page.portalId)!;
    const pageRecord: DocsSearchRecord = {
      route: page.route,
      title: page.title,
      description: page.description,
      portalId: page.portalId,
      portalLabel: portal.label,
      terms: [
        ...page.keywords,
        ...page.content.flatMap((section) => [
          section.title,
          ...section.paragraphs,
        ]),
      ],
    };
    return [
      pageRecord,
      ...page.content.map(
        (section): DocsSearchRecord => ({
          route: page.route,
          anchor: section.id,
          title: section.title,
          description: page.title,
          portalId: page.portalId,
          portalLabel: portal.label,
          terms: [...page.keywords, ...section.paragraphs],
        })
      ),
    ];
  });

export function searchDocs(
  query: string,
  portalId: DocsPortalId | 'all' = 'all',
  limit = 24
) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return docsSearchRecords
    .filter((record) => portalId === 'all' || record.portalId === portalId)
    .map((record) => {
      const title = record.title.toLowerCase();
      const haystack = [
        record.title,
        record.description,
        record.portalLabel,
        ...record.terms,
      ]
        .join(' ')
        .toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return undefined;
      const score = terms.reduce(
        (total, term) =>
          total +
          (title === term
            ? 12
            : title.startsWith(term)
              ? 8
              : title.includes(term)
                ? 4
                : 1),
        0
      );
      return { record, score };
    })
    .filter(
      (
        value
      ): value is {
        record: DocsSearchRecord;
        score: number;
      } => Boolean(value)
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.record.title.localeCompare(right.record.title)
    )
    .slice(0, limit)
    .map(({ record }) => record);
}
