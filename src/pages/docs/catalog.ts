import { cassiePortal } from './portals/cassie';
import { fitzPortal } from './portals/fitz';
import { midgePortal } from './portals/midge';
import { stressPortal } from './portals/stress';
import { toolsPortal } from './portals/tools';
import type { DocsPageDefinition, DocsPortalDefinition } from './types';

export { normalizeDocsRoute, resolveDocsRoute } from './manifest';

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

// Joined section labels, used to preview a product's coverage.
export function portalSectionSummary(portal: DocsPortalDefinition) {
  return portal.sections.map((section) => section.label).join(' · ');
}

export function docsTableOfContents(page: DocsPageDefinition) {
  return page.content.map(({ id, title }) => ({ id, title }));
}
