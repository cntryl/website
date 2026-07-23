import {
  createRouteRegistry,
  fallback,
  group,
  route,
} from '@askrjs/askr/router';
import type { RouteMeta } from '@askrjs/askr/router';
import { MarketingLayout } from './_layout';
import { marketingPages, type MarketingPath } from './catalog';
import { HomePage } from './home';
import { NotFoundPage } from './not-found';
import { MarketingPage } from './page';
import { metadataForRoute } from '../metadata';

export const marketingRouteMetadata: Readonly<Record<string, RouteMeta>> = {
  '/': metadataForRoute(
    '/',
    'Cntryl | Application communication, read models, and embedded storage',
    'Cntryl tools simplify application communication, queryable read models, and embedded storage with explicit ownership and recovery.'
  ),
  '/404': metadataForRoute(
    '/404',
    'Page not found | Cntryl',
    'The requested Cntryl page does not exist.',
    false
  ),
  ...Object.fromEntries(
    marketingPages.map((page) => [
      page.path,
      metadataForRoute(page.path, page.title, page.description),
    ])
  ),
};

export function registerMarketingRoutes() {
  group({ layout: MarketingLayout }, () => {
    route('/', HomePage, { meta: marketingRouteMetadata['/'] });
    for (const page of marketingPages) {
      route(page.path, MarketingPage, {
        meta: marketingRouteMetadata[page.path],
      });
    }
    route('/404', NotFoundPage, { meta: marketingRouteMetadata['/404'] });
    fallback(NotFoundPage);
  });
}

export const marketingRouteRegistry = createRouteRegistry(() => {
  registerMarketingRoutes();
});

export type { MarketingPath };
