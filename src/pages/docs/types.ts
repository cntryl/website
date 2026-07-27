export type DocsPortalId = 'midge' | 'fitz' | 'cassie' | 'tools' | 'stress';
export type ProductKind = 'runtime' | 'supporting';

export type DocsTable = {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
};

export type DocsContentSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  code?: string;
  codeTabs?: readonly {
    id: string;
    label: string;
    code: string;
  }[];
  table?: DocsTable;
  callout?: {
    title: string;
    body: string;
  };
};

export type DocsPageDefinition = {
  route: `/docs${string}`;
  portalId: DocsPortalId;
  sectionId: string;
  title: string;
  description: string;
  keywords: readonly string[];
  content: readonly DocsContentSection[];
  previous?: `/docs${string}`;
  next?: `/docs${string}`;
  loader: () => Promise<{ default: (...args: any[]) => any }>;
};

export type DocsSectionDefinition = {
  id: string;
  label: string;
  pages: readonly DocsPageDefinition[];
};

export type DocsPortalDefinition = {
  id: DocsPortalId;
  label: string;
  shortLabel: string;
  route: `/docs/${string}`;
  description: string;
  repository: `https://github.com/cntryl/${string}`;
  kind: ProductKind;
  sections: readonly DocsSectionDefinition[];
};

export type DocsSearchRecord = {
  route: `/docs${string}`;
  anchor?: string;
  title: string;
  description: string;
  portalId: DocsPortalId;
  portalLabel: string;
  terms: readonly string[];
};

export type DocsPageInput = {
  path: string;
  title: string;
  description: string;
  keywords?: readonly string[];
  code?: string;
  table?: DocsTable;
  callout?: {
    title: string;
    body: string;
  };
  content: readonly DocsContentSection[];
};

export type DocsSectionInput = {
  id: string;
  label: string;
  pages: readonly DocsPageInput[];
};

export type DocsPortalInput = Omit<
  DocsPortalDefinition,
  'sections' | 'route'
> & {
  route: `/docs/${string}`;
  sections: readonly DocsSectionInput[];
  loader: DocsPageDefinition['loader'];
};
