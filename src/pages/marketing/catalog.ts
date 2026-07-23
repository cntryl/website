export type MarketingPageDefinition = {
  path: `/${string}`;
  label: string;
  title: string;
  description: string;
  headline: string;
  lede: string;
  audience: string;
  what: { title: string; body: string };
  fit: { title: string; body: string };
  work: readonly { title: string; body: string }[];
  boundaries: { title: string; body: string };
  next: {
    title: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
    repository?: string;
  };
};

export const marketingPages = [
  {
    path: '/ecosystem',
    label: 'Ecosystem',
    title: 'The Cntryl ecosystem',
    description:
      'See how three focused Cntryl products support embedded storage, application messaging, and queryable read models.',
    headline: 'Choose the part that fits your application.',
    lede: 'Cntryl includes three runtime products. Each can be adopted on its own.',
    audience:
      'For application and platform teams choosing a clear system boundary.',
    what: {
      title: 'Three products with clear roles',
      body: 'Midge provides embedded Rust storage. Fitz provides messaging and coordination through one broker. Cassie provides SQL-queryable read models.',
    },
    fit: {
      title: 'Adopt one product or several',
      body: 'Start with the capability you need. Cassie uses Midge for storage. Fitz is independently useful and does not require Cassie or Midge in an application.',
    },
    work: [
      {
        title: 'Midge owns embedded storage',
        body: 'Midge stores application-owned data inside a Rust process with explicit durability and recovery choices.',
      },
      {
        title: 'Fitz connects applications',
        body: 'Fitz provides messaging and coordination models through one broker boundary.',
      },
      {
        title: 'Cassie serves read models',
        body: 'Cassie builds queryable projection data from application-owned history and uses Midge for storage.',
      },
    ],
    boundaries: {
      title: 'The products stay independent',
      body: 'Cntryl is not a required stack. Fitz does not depend on Cassie or application-managed Midge. Applications can also adopt Midge without Cassie.',
    },
    next: {
      title: 'Choose a product from the documentation home.',
      primaryHref: '/docs',
      primaryLabel: 'Choose documentation',
      secondaryHref: '/midge',
      secondaryLabel: 'Explore Midge',
    },
  },
  {
    path: '/midge',
    label: 'Midge',
    title: 'Embedded Rust storage with explicit durability | Midge',
    description:
      'Midge is embedded Rust storage with explicit commit durability, recovery behavior, transactions, and resource limits.',
    headline: 'Keep storage inside your Rust process.',
    lede: 'Midge is an embedded key-value engine with explicit durability and recovery choices.',
    audience:
      'For Rust engineers who want an in-process store and need to understand what each commit waited for.',
    what: {
      title: 'A transactional embedded engine',
      body: 'Midge provides snapshot transactions, column families, point reads, writes, deletes, and scans over memory, local disk, or cloud-backed storage.',
    },
    fit: {
      title: 'Storage owned by one process',
      body: 'Use Midge when a Rust application should own its storage lifecycle directly. Cassie uses Midge as its storage layer, but applications can use Midge without Cassie.',
    },
    work: [
      {
        title: 'Choose commit durability',
        body: 'Select synchronous, buffered, best-effort, or cloud acknowledgement behavior at the write boundary.',
      },
      {
        title: 'Read consistent snapshots',
        body: 'Group reads and writes in transactions with a stated conflict policy.',
      },
      {
        title: 'Inspect recovery',
        body: 'Use runtime, recovery, layout, and verification reports after open.',
      },
    ],
    boundaries: {
      title: 'Midge is a library, not a database service',
      body: 'The application owns schema, encoding, access control, process placement, backups, and the decision to repair or rebuild data.',
    },
    next: {
      title: 'Commit one value and verify it after reopen.',
      primaryHref: '/docs/midge/getting-started',
      primaryLabel: 'Get started',
      secondaryHref: '/docs/midge',
      secondaryLabel: 'Read the overview',
      repository: 'https://github.com/cntryl/midge',
    },
  },
  {
    path: '/fitz',
    label: 'Fitz',
    title: 'Messaging and coordination behind one broker | Fitz',
    description:
      'Fitz provides related messaging and coordination models behind one single-node broker boundary.',
    headline: 'Use one broker for related communication models.',
    lede: 'Fitz provides notices, streams, key-value state, queues, RPC, leases, and schedules through one route model.',
    audience:
      'For application and platform teams that need several communication patterns with one broker lifecycle.',
    what: {
      title: 'A single-node application broker',
      body: 'Fitz combines live fanout, durable history, current state, work delivery, requests, ownership coordination, and future timing behind one process.',
    },
    fit: {
      title: 'A boundary between applications',
      body: 'Use Fitz when running applications need to communicate or coordinate. TypeScript and Go clients connect application code to the same broker contract.',
    },
    work: [
      {
        title: 'Deliver live and durable messages',
        body: 'Choose a notice, stream, or queue according to whether work must replay or be claimed.',
      },
      {
        title: 'Coordinate running processes',
        body: 'Use RPC, leases, and schedules for calls, bounded ownership, and future work.',
      },
      {
        title: 'Operate one route model',
        body: 'Use shared authentication, health, metrics, and resource reporting across domains.',
      },
    ],
    boundaries: {
      title: 'Fitz keeps its single-node contract visible',
      body: 'Fitz does not provide consensus or transparent failover. Sessions are ephemeral, and clients rebuild subscriptions, workers, leases, and resume positions after reconnecting. Fitz does not require Cassie or Midge in the application.',
    },
    next: {
      title: 'Start a local broker and complete one operation.',
      primaryHref: '/docs/fitz/setup',
      primaryLabel: 'Get started',
      secondaryHref: '/docs/fitz',
      secondaryLabel: 'Read the overview',
      repository: 'https://github.com/cntryl/fitz',
    },
  },
  {
    path: '/cassie',
    label: 'Cassie',
    title: 'SQL-queryable read models | Cassie',
    description:
      'Cassie builds SQL-queryable read models from application-owned history through a single-node query engine.',
    headline: 'Query read models built from application history.',
    lede: 'Cassie materializes projection data and serves it through a PostgreSQL-compatible wire protocol.',
    audience:
      'For teams using CQRS or event-sourced designs that need query-shaped views of application-owned history.',
    what: {
      title: 'A query engine for projection data',
      body: 'Cassie stores read-model rows and provides supported SQL, indexes, search, analytics, and query-visible errors.',
    },
    fit: {
      title: 'A rebuildable view of owned history',
      body: 'The application event stream remains authoritative. Cassie uses Midge for persistence and recovery while Cassie owns query planning, execution, indexes, and SQL behavior.',
    },
    work: [
      {
        title: 'Serve familiar queries',
        body: 'Connect a supported PostgreSQL client and run parameterized SQL against projection data.',
      },
      {
        title: 'Build useful retrieval paths',
        body: 'Use relational, text, vector, analytical, time-series, and graph-oriented read paths.',
      },
      {
        title: 'Rebuild with checkpoints',
        body: 'Track projection progress, verify results, and activate repaired read models deliberately.',
      },
    ],
    boundaries: {
      title: 'Cassie is not the source of truth',
      body: 'Cassie is a single-node read-model engine, not a distributed SQL system or an event store. External systems own routing, failover, and replay input.',
    },
    next: {
      title: 'Run the local read-model example and query it.',
      primaryHref: '/docs/cassie/getting-started',
      primaryLabel: 'Get started',
      secondaryHref: '/docs/cassie',
      secondaryLabel: 'Read the overview',
      repository: 'https://github.com/cntryl/cassie',
    },
  },
  {
    path: '/tools',
    label: 'Tools',
    title: 'Repository validation and reporting | Cntryl Tools',
    description:
      'Cntryl Tools provides CLI commands for test validation, inventory generation, and benchmark reporting.',
    headline: 'Run consistent repository checks from one CLI.',
    lede: 'Tools validates Rust test conventions, inventories tests and benchmarks, and summarizes benchmark results.',
    audience:
      'For maintainers who want repeatable repository checks and report artifacts.',
    what: {
      title: 'A standalone Rust command-line tool',
      body: 'The cntryl-tools executable provides validate-tests, generate-inventory, and summarize-benchmarks commands.',
    },
    fit: {
      title: 'Support for development workflows',
      body: 'Run Tools from the repository you want to inspect. It can summarize current Stress artifacts into shared benchmark reports.',
    },
    work: [
      {
        title: 'Validate tests',
        body: 'Check Rust tests for naming and arrange-act-assert conventions.',
      },
      {
        title: 'Generate inventory',
        body: 'Scan tests and benchmarks and write an inventory report.',
      },
      {
        title: 'Summarize results',
        body: 'Normalize supported benchmark artifacts and produce JSON, Markdown, and CSV summaries.',
      },
    ],
    boundaries: {
      title: 'Tools reports on a repository',
      body: 'Tools does not run application infrastructure. Its output reflects the checked repository and the artifacts available at command time.',
    },
    next: {
      title: 'Install the CLI and validate one repository.',
      primaryHref: '/docs/tools/getting-started',
      primaryLabel: 'Get started',
      secondaryHref: '/docs/tools',
      secondaryLabel: 'Read the overview',
      repository: 'https://github.com/cntryl/tools',
    },
  },
  {
    path: '/stress',
    label: 'Stress',
    title: 'Repeatable Rust performance measurement | Cntryl Stress',
    description:
      'Cntryl Stress defines Rust benchmarks that produce structured artifacts, diagnostics, and performance gates.',
    headline: 'Turn Rust benchmarks into reviewable evidence.',
    lede: 'Stress provides a small benchmark API and structured output for repeatable performance work.',
    audience:
      'For Rust engineers who need benchmark results that can be inspected, compared, and reported.',
    what: {
      title: 'A Rust benchmarking framework',
      body: 'Stress registers benchmark functions, measures work by intent, records environment and samples, and writes machine-readable results.',
    },
    fit: {
      title: 'Evidence for performance decisions',
      body: 'Use Stress in development dependencies and benchmark targets. Tools can read current Stress artifacts and produce shared summaries.',
    },
    work: [
      {
        title: 'Define focused work',
        body: 'Write benchmark functions that identify measured operations and structured parameters.',
      },
      {
        title: 'Capture diagnostics',
        body: 'Record samples, percentiles, allocation data, trust findings, and comparisons.',
      },
      {
        title: 'Apply gates',
        body: 'Use profiles and baseline comparisons to turn stated limits into repeatable checks.',
      },
    ],
    boundaries: {
      title: 'Stress measures the benchmark you define',
      body: 'A structured artifact does not prove that a workload represents production. Authors still own fixtures, operation counts, environment control, and interpretation.',
    },
    next: {
      title: 'Define one benchmark and inspect its artifact.',
      primaryHref: '/docs/stress/getting-started',
      primaryLabel: 'Get started',
      secondaryHref: '/docs/stress',
      secondaryLabel: 'Read the overview',
      repository: 'https://github.com/cntryl/stress',
    },
  },
] as const satisfies readonly MarketingPageDefinition[];

export type MarketingPath = (typeof marketingPages)[number]['path'];

export const repositories = [
  { name: 'midge', href: 'https://github.com/cntryl/midge' },
  { name: 'fitz', href: 'https://github.com/cntryl/fitz' },
  { name: 'cassie', href: 'https://github.com/cntryl/cassie' },
  { name: 'tools', href: 'https://github.com/cntryl/tools' },
  { name: 'stress', href: 'https://github.com/cntryl/stress' },
  { name: 'fitz-ts', href: 'https://github.com/cntryl/fitz-ts' },
  { name: 'fitz-go', href: 'https://github.com/cntryl/fitz-go' },
  { name: 'lexkey-rs', href: 'https://github.com/cntryl/lexkey-rs' },
] as const;

export function marketingPage(path: MarketingPath) {
  const page = marketingPages.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`Unknown marketing route: ${path}`);
  return page;
}
