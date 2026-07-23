import type {
  DocsContentSection,
  DocsPageDefinition,
  DocsPageInput,
  DocsPortalDefinition,
  DocsPortalInput,
} from './types';

export function slug(value: string) {
  return value
    .replace(/&/g, 'and')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function pageContent(input: DocsPageInput): readonly DocsContentSection[] {
  if (input.content) return input.content;
  return [
    {
      id: 'working-contract',
      title: 'Working contract',
      paragraphs: [input.contract],
      ...(input.code ? { code: input.code } : {}),
      ...(input.table ? { table: input.table } : {}),
    },
    {
      id: 'how-to-use-it',
      title: 'How to use it',
      paragraphs: [input.practice],
    },
    {
      id: 'boundaries-and-recovery',
      title: 'Boundaries and recovery',
      paragraphs: [input.boundary],
      ...(input.callout ? { callout: input.callout } : {}),
    },
  ];
}

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
        content: pageContent(page),
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
