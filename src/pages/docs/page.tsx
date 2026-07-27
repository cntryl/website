import { For, state } from '@askrjs/askr';
import { currentRoute, Link } from '@askrjs/askr/router';
import { GitHubLogo } from '@askrjs/logos';
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon } from '@askrjs/lucide';
import { Block, Button, Container, Grid } from '@askrjs/themes/components';
import {
  docsByRoute,
  docsPortals,
  portalById,
  portalSectionSummary,
  resolveDocsRoute,
} from './catalog';
import type {
  DocsContentSection,
  DocsPageDefinition,
  DocsTable,
  ProductKind,
} from './types';
import { ProductMark } from './product-mark';
import { list } from '../list';

type CodeTab = NonNullable<DocsContentSection['codeTabs']>[number];

export function CodeBlock({
  code,
  codeTabs,
}: {
  code?: string;
  codeTabs?: readonly CodeTab[];
}) {
  const [copied, setCopied] = state(false);
  const [activeTab, setActiveTab] = state(codeTabs?.[0]?.id ?? '');
  // Read during render, not only inside the <For> children closure below: a
  // state cell that is never read in the component body is not registered as a
  // dependency of this instance, which both triggers askr's "Unused state
  // variable" warning on teardown and leaves the tab highlight stale.
  const activeTabId = activeTab();
  const selectedTab =
    codeTabs?.find((tab) => tab.id === activeTabId) ?? codeTabs?.[0];
  const selectedCode = selectedTab?.code ?? code ?? '';

  // Rebuilt every render (without .map, which this file bans) so each tab's
  // `active` flag travels with the item identity For reconciles on. For does
  // not re-invoke its children function for stable item identities, and
  // `codeTabs` is a module-level constant, so reading activeTab() from the
  // closure alone would freeze the selected tab at its first-render value.
  const tabs: { id: string; label: string; active: boolean }[] = [];
  for (const tab of codeTabs ?? []) {
    tabs.push({
      id: tab.id,
      label: tab.label,
      active: tab.id === selectedTab?.id,
    });
  }

  return (
    <div
      class={`code-block${codeTabs ? ' code-block--tabs' : ''}`}
      data-code-block
    >
      {codeTabs ? (
        <div class="code-block__tabs" role="tablist" aria-label="Code examples">
          <For each={tabs} by={(tab) => tab.id}>
            {(tab) => (
              <Button
                type="button"
                role="tab"
                aria-selected={tab.active}
                aria-controls={`code-panel-${tab.id}`}
                variant="ghost"
                size="xs"
                class="code-block__tab"
                data-active={tab.active ? 'true' : undefined}
                onPress={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            )}
          </For>
        </div>
      ) : null}
      <Button
        class="code-block__copy"
        type="button"
        variant="outline"
        size="xs"
        data-copied={copied() ? 'true' : undefined}
        aria-label="Copy code"
        title="Copy code"
        onPress={() => {
          void navigator.clipboard?.writeText(selectedCode);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        <CopyIcon size={15} aria-hidden="true" />
        <span>{copied() ? 'Copied' : 'Copy'}</span>
      </Button>
      <pre
        id={codeTabs ? `code-panel-${selectedTab?.id ?? 'default'}` : undefined}
        role={codeTabs ? 'tabpanel' : undefined}
        aria-label={
          codeTabs ? `${selectedTab?.label ?? 'Code'} example` : undefined
        }
      >
        <code>{selectedCode}</code>
      </pre>
    </div>
  );
}

function DataTable({ table }: { table: DocsTable }) {
  return (
    <div class="docs-table-wrap">
      <table>
        <thead>
          <tr>
            <For each={list(table.headers)} by={(header) => header}>
              {(header) => <th scope="col">{header}</th>}
            </For>
          </tr>
        </thead>
        <tbody>
          <For
            each={list(table.rows)}
            by={(row, index) => `${index}:${row.join(':')}`}
          >
            {(row) => (
              <tr>
                <For each={list(row)} by={(cell, index) => `${index}:${cell}`}>
                  {(cell) => <td>{cell}</td>}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

function ContentSection({
  section,
}: {
  section: DocsContentSection;
  key?: string;
}) {
  return (
    <section aria-labelledby={section.id}>
      <h2 id={section.id} class="anchored-heading">
        <a href={`#${section.id}`}>{section.title}</a>
      </h2>
      <For each={list(section.paragraphs)} by={(paragraph) => paragraph}>
        {(paragraph) => <p>{paragraph}</p>}
      </For>
      {section.table ? <DataTable table={section.table} /> : null}
      {section.code || section.codeTabs ? (
        <CodeBlock code={section.code} codeTabs={section.codeTabs} />
      ) : null}
      {section.callout ? (
        <aside class="docs-callout">
          <strong>{section.callout.title}</strong>
          <p>{section.callout.body}</p>
        </aside>
      ) : null}
    </section>
  );
}

function PreviousNext({ page }: { page: DocsPageDefinition }) {
  const previous = page.previous ? docsByRoute.get(page.previous) : undefined;
  const next = page.next ? docsByRoute.get(page.next) : undefined;
  return (
    <nav class="docs-pagination" aria-label="Documentation pagination">
      {previous ? (
        <Link href={previous.route}>
          <ArrowLeftIcon size={16} aria-hidden="true" />
          <span>
            <small>Previous</small>
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.route}>
          <span>
            <small>Next</small>
            {next.title}
          </span>
          <ArrowRightIcon size={16} aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

// Three runtime products, then the two supporting ones.
const PRODUCT_ROWS = [
  { kind: 'runtime', columns: 3 },
  { kind: 'supporting', columns: 2 },
] as const satisfies readonly { kind: ProductKind; columns: number }[];

function ProductBlock({ portalId }: { portalId: string; key?: string }) {
  const portal = docsPortals.find((p) => p.id === portalId)!;
  const pages = portal.sections.flatMap((section) => section.pages);
  const firstGuide = pages[1];
  return (
    <Block
      class="docs-index__product"
      as="article"
      direction="column"
      align="start"
    >
      <ProductMark portalId={portal.id} size="lg" />
      <h2>{portal.label}</h2>
      <p>{portal.description}</p>
      {/* The section names show what a product covers before you commit. */}
      <p class="docs-index__sections">{portalSectionSummary(portal)}</p>
      <Block class="docs-index__actions" direction="row" gap="sm">
        <Button asChild size="sm">
          <Link href={portal.route}>Read the docs</Link>
        </Button>
        {firstGuide ? (
          <Button asChild variant="outline" size="sm">
            <Link href={firstGuide.route}>{firstGuide.title}</Link>
          </Button>
        ) : null}
      </Block>
    </Block>
  );
}

export function DocsHome() {
  return (
    <div class="docs-index" data-docs-route="/docs">
      <section
        id="choose-product"
        class="docs-index__products"
        aria-labelledby="docs-index-title"
      >
        <Container size="xl">
          <header class="docs-index__intro">
            <h1 id="docs-index-title">Pick a product to read about</h1>
            <p>
              Every product documents its own model, operations, and reference
              surface. Start with an overview or jump straight into the first
              guide.
            </p>
          </header>
          <div class="docs-index__rows">
            <For each={list(PRODUCT_ROWS)} by={(row) => row.kind}>
              {(row) => (
                <Grid columns={{ base: 1, md: row.columns }} gap="xl">
                  <For
                    each={list(docsPortals.filter((p) => p.kind === row.kind))}
                    by={(portal) => portal.id}
                  >
                    {(portal) => <ProductBlock portalId={portal.id} />}
                  </For>
                </Grid>
              )}
            </For>
          </div>
        </Container>
      </section>
    </div>
  );
}

export function DocsPage() {
  const route = resolveDocsRoute(currentRoute());
  if (route === '/docs') return <DocsHome />;
  const page = docsByRoute.get(route as `/docs${string}`);
  if (!page) {
    return (
      <article class="docs-article">
        <h1>Documentation page not found</h1>
      </article>
    );
  }

  const portal = portalById.get(page.portalId)!;
  return (
    <article class="docs-article" data-docs-route={page.route}>
      <header class="docs-article__header">
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <a class="source-link" href={portal.repository}>
          <GitHubLogo size={15} aria-hidden="true" />
          Source repository
        </a>
      </header>
      <For each={list(page.content)} by={(content) => content.id}>
        {(content) => <ContentSection section={content} />}
      </For>
      <PreviousNext page={page} />
    </article>
  );
}

export default DocsPage;
