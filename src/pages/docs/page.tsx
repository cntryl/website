import { Case, For, Match, Show, state } from '@askrjs/askr';
import { currentRoute, Link } from '@askrjs/askr/router';
import { GitHubLogo } from '@askrjs/logos';
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon } from '@askrjs/lucide';
import { Button } from '@askrjs/themes/components';
import { docsByRoute, portalById, resolveDocsRoute } from './catalog';
import type {
  DocsContentSection,
  DocsPageDefinition,
  DocsTable,
} from './types';
import { list } from '../list';

type CodeTab = NonNullable<DocsContentSection['codeTabs']>[number];

export function CodeBlock({
  id,
  code,
  codeTabs,
}: {
  // Scopes the tab-panel id to this instance. Without it, two code blocks on
  // the same page that both happen to include a tab with the same id (e.g.
  // "typescript") would render duplicate DOM ids.
  id?: string;
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

  const panelId = (tabId: string) =>
    id ? `code-panel-${id}-${tabId}` : `code-panel-${tabId}`;

  return (
    <div
      class={`code-block${codeTabs ? ' code-block--tabs' : ''}`}
      data-code-block
    >
      <Show when={codeTabs}>
        <div class="code-block__tabs" role="tablist" aria-label="Code examples">
          <For each={tabs} by={(tab) => tab.id}>
            {(tab) => (
              <Button
                type="button"
                role="tab"
                aria-selected={tab.active ? 'true' : 'false'}
                aria-controls={panelId(tab.id)}
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
      </Show>
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
        id={codeTabs ? panelId(selectedTab?.id ?? 'default') : undefined}
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
        <CodeBlock
          id={section.id}
          code={section.code}
          codeTabs={section.codeTabs}
        />
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

export function DocsPage() {
  const route = resolveDocsRoute(currentRoute());
  const page = docsByRoute.get(route as `/docs${string}`);

  // <Case>/<Match>, not early returns: DocsPage persists across docs
  // navigation, so which branch renders (index, a real page, not-found) can
  // change from render to render. An early return that skips the <For> below
  // some renders but not others is the hook-order hazard <Case> exists to
  // prevent — see the same reasoning on TableOfContents in _layout.tsx.
  return (
    <Case
      fallback={
        <article class="docs-article">
          <h1>Documentation page not found</h1>
        </article>
      }
    >
      <Match when={page}>
        {() => {
          const current = page!;
          const portal = portalById.get(current.portalId)!;
          return (
            <article class="docs-article" data-docs-route={current.route}>
              <header class="docs-article__header">
                <h1>{current.title}</h1>
                <p>{current.description}</p>
                <a class="source-link" href={portal.repository}>
                  <GitHubLogo size={15} aria-hidden="true" />
                  Source repository
                </a>
              </header>
              <For each={list(current.content)} by={(content) => content.id}>
                {(content) => <ContentSection section={content} />}
              </For>
              <PreviousNext page={current} />
            </article>
          );
        }}
      </Match>
    </Case>
  );
}

export default DocsPage;
