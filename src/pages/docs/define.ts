import type {
  DocsPageDefinition,
  DocsPortalDefinition,
  DocsPortalInput,
} from './types';

export function definePortal(input: DocsPortalInput): DocsPortalDefinition {
  const sections = input.sections.map((section) => ({
    id: section.id,
    label: section.label,
    pages: section.pages.map(
      (page): DocsPageDefinition => ({
        route: (page.path
          ? `${input.route}/${page.path}`
          : input.route) as `/docs${string}`,
        portalId: input.id,
        sectionId: section.id,
        title: page.title,
        description: page.description,
        keywords: page.keywords ?? [],
        content: page.content!,
        loader: input.loader,
      })
    ),
  }));

  const pages = sections.flatMap((section) => section.pages);
  for (const [index, page] of pages.entries()) {
    page.previous = pages[index - 1]?.route;
    page.next = pages[index + 1]?.route;
  }

  return {
    id: input.id,
    label: input.label,
    shortLabel: input.shortLabel,
    route: input.route,
    description: input.description,
    repository: input.repository,
    kind: input.kind,
    sections,
  };
}
