import { createRouteRegistry, group, lazy, route } from '@askrjs/askr/router';
import type { RouteMeta } from '@askrjs/askr/router';
import { DocsLayout } from './docs/_layout';
import { docsCatalog, portalById } from './docs/catalog';
import { DocsHome } from './docs/page';
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
    docsCatalog.map((page) => [
      page.route,
      metadataForRoute(
        page.route,
        `${page.title} | ${portalById.get(page.portalId)!.label} | Cntryl`,
        page.description
      ),
    ])
  ),
};

// The docs index is a product chooser, not a product guide, so it uses the
// marketing layout. Only a product's own pages get that product's sidebar.
function registerDocsIndexRoute() {
  group({ layout: MarketingLayout }, () => {
    route('/docs', DocsHome, { meta: routeMetadata['/docs'] });
  });
}

function registerDocsRoutes() {
  registerDocsIndexRoute();
  group({ layout: DocsLayout }, () => {
    for (const page of docsCatalog) {
      route(page.route, lazy(page.loader), {
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
  const components = new Map<
    (typeof docsCatalog)[number]['loader'],
    ReturnType<typeof lazy>
  >();

  const registry = createRouteRegistry(() => {
    registerMarketingRoutes();
    registerDocsIndexRoute();
    group({ layout: DocsLayout }, () => {
      for (const page of docsCatalog) {
        let component = components.get(page.loader);
        if (!component) {
          component = lazy(page.loader);
          components.set(page.loader, component);
        }
        route(page.route, component, {
          meta: routeMetadata[page.route],
        });
      }
    });
  });

  await Promise.all(
    [...components.values()].map((component) => component.preload())
  );
  return registry;
}
