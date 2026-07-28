import { For } from '@askrjs/askr';
import { Link } from '@askrjs/askr/router';
import { Block, Button, Container, Grid } from '@askrjs/themes/components';
import { docsManifest, docsManifestPortalById } from './manifest';
import { ProductMark } from './product-mark';
import type { DocsPortalId, ProductKind } from './types';
import { list } from '../list';

// Three runtime products, then the two supporting ones.
const PRODUCT_ROWS = [
  { kind: 'runtime', columns: 3 },
  { kind: 'supporting', columns: 2 },
] as const satisfies readonly { kind: ProductKind; columns: number }[];

function portalSectionSummary(portal: (typeof docsManifest)[number]) {
  const labels: string[] = [];
  for (const section of portal.sections) labels.push(section.label);
  return labels.join(' · ');
}

function ProductBlock({ portalId }: { portalId: DocsPortalId; key?: string }) {
  const portal = docsManifestPortalById.get(portalId);
  if (!portal) return null;
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
                    each={list(
                      docsManifest.filter((portal) => portal.kind === row.kind)
                    )}
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

export default DocsHome;
