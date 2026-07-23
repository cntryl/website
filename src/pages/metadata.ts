import type { RouteMeta } from '@askrjs/askr/router';

export const SITE_URL = 'https://cntryl.com';

export function metadataForRoute(
  route: string,
  title: string,
  description: string,
  index = true
): RouteMeta {
  const canonical = `${SITE_URL}${route === '/' ? '' : route}`;
  return {
    title,
    description,
    canonical,
    robots: index ? 'index, follow' : 'noindex, nofollow',
    openGraph: {
      'og:type': 'website',
      'og:site_name': 'Cntryl',
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
    },
    html: { lang: 'en' },
  };
}
