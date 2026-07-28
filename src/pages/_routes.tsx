import { createRouteRegistry, group, lazy, route } from '@askrjs/askr/router';
import type { RouteMeta } from '@askrjs/askr/router';
import { DocsLayout } from './docs/_layout';
import { docsManifestPages, docsManifestPortalForRoute } from './docs/manifest';
import { MarketingLayout } from './marketing/_layout';
import {
  marketingRouteMetadata,
  registerMarketingRoutes,
} from './marketing/_routes';
import { metadataForRoute } from './metadata';

export const docsHomeMetadata = metadataForRoute(
  '/docs',
  'Documentation | Cntryl',
  'Choose Midge, Fitz, Cassie, Tools, or Stress documentation and search the product guides.'
);

export const routeMetadata: Readonly<Record<string, RouteMeta>> = {
  ...marketingRouteMetadata,
  '/docs': docsHomeMetadata,
  ...Object.fromEntries(
    docsManifestPages.map((page) => [
      page.route,
      metadataForRoute(
        page.route,
        `${page.title} | ${docsManifestPortalForRoute(page.route)!.label} | Cntryl`,
        page.description
      ),
    ])
  ),
};

// The docs index is a product chooser, not a product guide, so it uses the
// marketing layout. Only a product's own pages get that product's sidebar.
function registerDocsIndexRoute() {
  group({ layout: MarketingLayout }, () => {
    route('/docs', docsHome, { meta: routeMetadata['/docs'] });
  });
}

const docsHome = lazy(() => import('./docs/home'));
const docsPage = lazy(() => import('./docs/page'));

function registerDocsRoutes() {
  registerDocsIndexRoute();
  group({ layout: DocsLayout }, () => {
    for (const page of docsManifestPages) {
      route(page.route, docsPage, {
        meta: routeMetadata[page.route],
      });
    }
  });
}

export const routeRegistry = createRouteRegistry(() => {
  registerMarketingRoutes();
  registerDocsRoutes();
});

// Static generation renders route handlers directly, so settle every lazy
// portal component before handing the registry to the SSG CLI.
export async function createStaticRouteRegistry() {
  const registry = createRouteRegistry(() => {
    registerMarketingRoutes();
    registerDocsIndexRoute();
    group({ layout: DocsLayout }, () => {
      for (const page of docsManifestPages) {
        route(page.route, docsPage, {
          meta: routeMetadata[page.route],
        });
      }
    });
  });

  await Promise.all([docsHome.preload(), docsPage.preload()]);
  return registry;
}
