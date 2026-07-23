import { state } from '@askrjs/askr';
import { currentRoute, Link } from '@askrjs/askr/router';
import { GitHubLogo } from '@askrjs/logos';
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon } from '@askrjs/lucide';
import { Button } from '@askrjs/themes/components';
import {
  docsByRoute,
  docsPortals,
  portalById,
  resolveDocsRoute,
} from './catalog';
import type {
  DocsContentSection,
  DocsPageDefinition,
  DocsTable,
} from './types';
import { DocsSearch } from './search';

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = state(false);

  return (
    <div class="code-block" data-code-block>
      <Button
        class="code-block__copy"
        type="button"
        variant="outline"
        size="xs"
        data-copied={copied() ? 'true' : undefined}
        aria-label="Copy code"
        title="Copy code"
        onPress={() => {
          void navigator.clipboard?.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        <CopyIcon size={15} aria-hidden="true" />
        <span>{copied() ? 'Copied' : 'Copy'}</span>
      </Button>
      <pre>
        <code>{code}</code>
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
            {table.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}:${row.join(':')}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cellIndex}:${cell}`}>{cell}</td>
              ))}
            </tr>
          ))}
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
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.table ? <DataTable table={section.table} /> : null}
      {section.code ? <CodeBlock code={section.code} /> : null}
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

export function DocsHome() {
  return (
    <article class="docs-article docs-home" data-docs-route="/docs">
      <header class="docs-article__header">
        <h1>Choose a product.</h1>
        <p>
          Start with an overview, then follow one verified getting-started path.
        </p>
      </header>
      <section id="search" aria-labelledby="search-heading">
        <h2 id="search-heading">Search product documentation</h2>
        <p>Search the five product portals and their current guides.</p>
        <DocsSearch />
      </section>
      <section id="choose-product" aria-labelledby="choose-product-heading">
        <h2 id="choose-product-heading">Choose a product</h2>
        {(['runtime', 'supporting'] as const).map((kind) => (
          <div key={kind}>
            <h3>
              {kind === 'runtime' ? 'Runtime products' : 'Supporting products'}
            </h3>
            <div class="docs-portal-grid">
              {docsPortals
                .filter((portal) => portal.kind === kind)
                .map((portal) => {
                  const firstGuide = portal.sections.flatMap(
                    (section) => section.pages
                  )[1];
                  return (
                    <article key={portal.id}>
                      <h3>{portal.label}</h3>
                      <p>{portal.description}</p>
                      <div>
                        <Button asChild size="sm">
                          <Link href={portal.route}>
                            Overview
                            <ArrowRightIcon size={16} aria-hidden="true" />
                          </Link>
                        </Button>
                        {firstGuide ? (
                          <Link href={firstGuide.route}>
                            {firstGuide.title}
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
            </div>
          </div>
        ))}
      </section>
    </article>
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
      <nav class="docs-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/docs">Docs</Link>
        <span aria-hidden="true">/</span>
        {page.route !== portal.route ? (
          <>
            <Link href={portal.route}>{portal.label}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span aria-current="page">{page.title}</span>
      </nav>
      <header class="docs-article__header">
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <a class="source-link" href={portal.repository}>
          <GitHubLogo size={15} aria-hidden="true" />
          Source repository
        </a>
      </header>
      {page.content.map((content) => (
        <ContentSection key={content.id} section={content} />
      ))}
      <PreviousNext page={page} />
    </article>
  );
}

export default DocsPage;
