import { docsCatalog, portalById } from './catalog';
import type { DocsPortalId, DocsSearchRecord } from './types';

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
