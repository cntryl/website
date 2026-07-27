import type {
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

export function authoredPage(
  path: string,
  title: string,
  description: string,
  headings: readonly string[],
  keywords: readonly string[] = []
): DocsPageInput {
  const source = `${path} ${title} ${description}`.toLowerCase();
  const isTools =
    /installation|validate-tests|generate-inventory|summarize-benchmarks|ci-integration|reporting-workflow|output-formats|exit-codes/.test(
      path
    ) ||
    /repository|rust test|cli|inventory|report format|command flag/.test(
      source
    );
  const isStress =
    /benchmark-model|selection-and-runs|attributes|tier-recipes|artifacts|comparisons-and-gates|diagnostics/.test(
      path
    ) ||
    (/benchmark|stress|sample|tier|baseline|artifact|diagnostic/.test(source) &&
      !isTools);
  const isCassie =
    /product-boundaries|sql-and-pgwire|databases-and-schemas|projections-and-replay|indexes-and-constraints|search-and-query|administration|capacity-management|backup-and-restore|projection-repair|performance|compatibility|glossary/.test(
      path
    ) ||
    (path === 'deployment' && /cassie|read-model|database/.test(source)) ||
    /cassie|read-model|postgresql|projection|query|database|pgwire/.test(
      source
    );
  const isFitz =
    /concepts-and-routes|authentication|observability|resource-limits|runbook|migrations|admin-api|wire-protocol|supported-boundaries/.test(
      path
    ) ||
    /fitz|broker|domain|route|session|listener|single-node server/.test(source);
  const productContext = isStress
    ? 'Stress records measured samples and structured artifacts; it does not decide whether a workload is representative or whether a regression is acceptable.'
    : isTools
      ? 'Tools inspects the checkout and artifacts it is given, then reports findings; repository policy and product correctness remain with the caller.'
      : isCassie
        ? 'Cassie owns query execution and read-model behavior; application code owns source history, replay input, and the meaning of each projection.'
        : isFitz
          ? 'Fitz is a single-node broker. Each domain has its own delivery and persistence semantics, while sessions and application routing remain explicit.'
          : 'Midge is embedded Rust storage. The application owns schema, placement, backup policy, and the durability acknowledgement selected at commit.';

  const exampleFor = () => {
    if (isTools && path === 'installation') {
      return 'cargo install --git https://github.com/cntryl/tools --locked\ncntryl-tools --help';
    }
    if (isTools && path === 'validate-tests')
      return 'cntryl-tools validate-tests';
    if (isTools && path === 'generate-inventory')
      return 'cntryl-tools generate-inventory';
    if (isTools && path === 'summarize-benchmarks') {
      return 'cntryl-tools summarize-benchmarks --help';
    }
    if (isTools && path === 'ci-integration') {
      return 'cntryl-tools validate-tests\ncntryl-tools generate-inventory';
    }
    if (isStress && path === 'benchmark-model') {
      return 'use cntryl_stress::{black_box, stress, stress_main, StressContext};\n\n#[stress(tier = 1)]\nfn parse_route_hot_path(ctx: &mut StressContext) {\n    let route = b"tenant-a.queue.primary";\n    ctx.measure("dot lookup", || black_box(route.iter().position(|byte| *byte == b\'.\')));\n}\n\nstress_main!();';
    }
    if (isStress && path === 'artifacts')
      return 'find target/stress -name latest.json -print';
    if (isStress && path === 'configuration') {
      return 'STRESS_RUN_ID=local cargo bench --bench storage_stress';
    }
    return undefined;
  };

  const sectionCopy = (heading: string, index: number) => {
    const focus = heading.toLowerCase();
    if (index === 0) return description;
    if (/requirement|install|setup/.test(focus)) {
      return `Start with the required toolchain and the smallest local configuration for ${title.toLowerCase()}. Verify the installed version before relying on later output. ${productContext}`;
    }
    if (/input|parameter|configuration|setting/.test(focus)) {
      return `Treat ${heading.toLowerCase()} as explicit input to the ${title.toLowerCase()} contract. Record the selected values, paths, and policies so the result can be reproduced. ${productContext}`;
    }
    if (/output|artifact|result|report/.test(focus)) {
      return `Read the ${heading.toLowerCase()} as evidence from the operation, not as an automatic approval. Preserve the relevant identifiers and inspect failures before changing policy. ${productContext}`;
    }
    if (/failure|troubleshoot|diagnos|error/.test(focus)) {
      return `When ${heading.toLowerCase()} fails, keep the original input and first observable error, then isolate the product boundary involved before retrying. ${productContext}`;
    }
    if (/security|auth|secret|tls|role/.test(focus)) {
      return `Keep ${heading.toLowerCase()} explicit at the deployment boundary: identify who may perform the operation, what surface is exposed, and how credentials are rotated. ${productContext}`;
    }
    if (/query|search|projection|replay|index|schema|database/.test(focus)) {
      return `Use ${heading.toLowerCase()} to make the read path observable: name the source or input, the shape produced, and the verification query or result that proves it. ${productContext}`;
    }
    if (
      /measure|sample|benchmark|tier|run|comparison|gate|diagnostic/.test(focus)
    ) {
      return `Keep ${heading.toLowerCase()} tied to a named workload, stable inputs, and the artifact produced by the run. Do not compare results until the measurement shape and environment are compatible. ${productContext}`;
    }
    return `Document ${heading.toLowerCase()} with the concrete input, observable result, and operator or application decision that surrounds it. ${productContext}`;
  };

  const content = headings.map((heading, index) => ({
    id: slug(heading),
    title: heading,
    paragraphs: [sectionCopy(heading, index)],
    ...(index === headings.length - 1 && exampleFor()
      ? { code: exampleFor() }
      : {}),
  }));

  return {
    path,
    title,
    description,
    contract: description,
    practice: `Use the ${title.toLowerCase()} guide to make the relevant application or operator decisions in sequence.`,
    boundary: `Keep the ${title.toLowerCase()} contract aligned with the product boundary and verify the resulting behavior at its public interface.`,
    keywords,
    content,
  };
}

// Existing catalog declarations use this compatibility name; the implementation
// creates sections from the supplied editorial contract and product boundary.
export const outlinePage = authoredPage;

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
