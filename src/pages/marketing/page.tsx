import { For } from '@askrjs/askr';
import { currentRoute, Link } from '@askrjs/askr/router';
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  Container,
  Grid,
} from '@askrjs/themes/components';
import {
  marketingPage,
  type MarketingCallout,
  type MarketingPath,
} from './catalog';
import { list } from '../list';
import { ProductMark } from '../docs/product-mark';
import { GitHubLink } from '../site-header';

// Nobody's meant to notice these — a hover on the hero mark, nothing more.
const productMarkJoke: Record<string, string> = {
  midge: "Small, fast, and doesn't need a database. Also, a cat.",
  fitz: 'If it fitz, i sitz.',
  cassie: 'Query me like one of your SQL databases.',
};

// Each callout that names a docs topic links straight to it.
function CalloutLink({ callout }: { callout: MarketingCallout }) {
  if (!callout.href || !callout.linkLabel) return null;
  return (
    <Badge asChild variant="outline">
      <Link href={callout.href}>{callout.linkLabel}</Link>
    </Badge>
  );
}

export function MarketingPage() {
  const path = (currentRoute().matches?.at(-1)?.path ??
    currentRoute().path) as MarketingPath;
  const page = marketingPage(path);
  const overviewSections: MarketingCallout[] = page.what
    ? [page.what, page.fit]
    : [page.fit];
  const closingCode = 'code' in page.next ? page.next.code : undefined;
  const closingCodeCaption =
    'codeCaption' in page.next ? page.next.codeCaption : undefined;
  return (
    <div class="marketing-page">
      <section
        class={`editorial-hero${page.productId ? ' editorial-hero--product' : ''}`}
        data-marketing-page={page.productId ?? 'ecosystem'}
        aria-labelledby="page-title"
      >
        <Container size="xl">
          <div class="editorial-hero__identity">
            {page.productId ? (
              <ProductMark
                portalId={page.productId}
                size="lg"
                title={productMarkJoke[page.productId]}
              />
            ) : null}
            <div class="editorial-hero__copy">
              <p class="editorial-hero__label">
                {page.productId ? page.label : 'Cntryl ecosystem'}
              </p>
              <h1 id="page-title">{page.headline}</h1>
              <p class="editorial-hero__lede">{page.lede}</p>
              <p class="editorial-hero__audience">{page.audience}</p>
              {page.path !== '/ecosystem' ? (
                <div class="hero-actions">
                  <Button asChild>
                    <Link href={page.next.primaryHref}>
                      {page.next.primaryLabel}
                    </Link>
                  </Button>
                  {'repository' in page.next && page.next.repository ? (
                    <Button asChild variant="ghost" size="sm">
                      <GitHubLink
                        href={page.next.repository}
                        size={15}
                        compact={false}
                      />
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
      <For each={list(overviewSections)} by={(section) => section.title}>
        {(section, index) => (
          <section class="editorial-band">
            <Container
              class={`split-section${String(index) === '1' ? ' split-section--reverse' : ''}`}
              size="xl"
            >
              <div>
                <h2>{section.title}</h2>
              </div>
              <div class="prose-stack">
                <p>{section.body}</p>
                <CalloutLink callout={section} />
              </div>
            </Container>
          </section>
        )}
      </For>
      {page.work.length > 0 ? (
        <section
          class="editorial-evidence"
          data-marketing-page={page.productId ?? 'ecosystem'}
          aria-labelledby="work-title"
        >
          <Container size="xl">
            <header class="section-heading">
              <h2 id="work-title">{page.workTitle}</h2>
            </header>
            <Grid
              class="evidence-grid"
              columns={{ base: 1, md: 3 }}
              gap="md"
            >
              <For
                each={list<{ title: string; body: string }>(page.work)}
                by={(item) => item.title}
              >
                {(item) => (
                  <Card>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.body}</CardDescription>
                  </Card>
                )}
              </For>
            </Grid>
          </Container>
        </section>
      ) : null}
      {page.boundaries ? (
        <section class="editorial-band">
          <Container class="split-section" size="xl">
            <div>
              <h2>{page.boundaries.title}</h2>
            </div>
            <div class="prose-stack">
              <p>{page.boundaries.body}</p>
              <CalloutLink callout={page.boundaries} />
            </div>
          </Container>
        </section>
      ) : null}
      <section
        class="editorial-cta"
        data-marketing-page={page.productId ?? 'ecosystem'}
      >
        <Container
          class={`editorial-cta__inner${closingCode ? ' editorial-cta__inner--code' : ''}`}
          size="xl"
        >
          {closingCode ? (
            <div class="marketing-cta__code">
              <pre>
                <code>{closingCode}</code>
              </pre>
              {closingCodeCaption ? (
                <p class="marketing-cta__code-caption">{closingCodeCaption}</p>
              ) : null}
            </div>
          ) : null}
          <div class="editorial-cta__copy">
            <h2>{page.next.title}</h2>
            <div class="hero-actions">
              <Button asChild>
                <Link href={page.next.primaryHref}>
                  {page.next.primaryLabel}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={page.next.secondaryHref}>
                  {page.next.secondaryLabel}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
