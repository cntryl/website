// A callout links to the docs page that owns its topic when one exists.
import type { DocsPortalId } from '../docs/types';

export type MarketingCallout = {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
};

export type MarketingPageDefinition = {
  path: `/${string}`;
  productId?: DocsPortalId;
  label: string;
  title: string;
  description: string;
  headline: string;
  lede: string;
  audience: string;
  workTitle: string;
  what?: MarketingCallout;
  fit: MarketingCallout;
  work: readonly { title: string; body: string }[];
  boundaries?: MarketingCallout;
  next: {
    title: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
    repository?: string;
    code?: string;
    // Names what the sample actually shows, so a local example cannot read as
    // a contradiction of a page that sells cloud-backed storage.
    codeCaption?: string;
  };
};

export const marketingPages = [
  {
    path: '/ecosystem',
    productId: undefined,
    label: 'How it works',
    title: 'One storage engine, three ways to use it | Cntryl',
    description:
      'Midge is the storage engine Fitz and Cassie both embed. See what each product owns, what your application still owns, and which one to start with.',
    headline: 'One storage engine. Three ways to use it.',
    lede: 'Midge is an embedded engine that links into a process: no server, no port, no network hop. Fitz embeds it to run a broker. Cassie embeds it to run a queryable database. You can embed it yourself.',
    audience:
      'Start here to decide which product to adopt first, and see what each one takes off your plate.',
    workTitle: 'Three jobs, one engine underneath',
    what: {
      title: 'Nothing here is a second storage system',
      href: '/midge',
      linkLabel: 'How Midge works',
      body: 'Fitz and Cassie both depend on cntryl-midge for storage. Midge owns write-ahead logging, flush, compaction, and restart recovery. Neither product ships a storage layer of its own. Adopting a second Cntryl product does not add a second thing to back up, tune, or reason about at 3am.',
    },
    fit: {
      title: 'The container is not where your data lives',
      href: '/docs',
      linkLabel: 'Browse the documentation',
      body: 'Run Fitz for application communication without adopting Cassie. Point Midge at S3, Azure Blob, or GCS and the broker keeps only a local cache. Resizing the container moves no data. Cassie uses Midge as a local directory instead, but everything in that directory is derived: your event log rebuilds it by replay. Losing the process costs you a restart, not your data.',
    },
    work: [
      {
        title: 'Store data inside your process',
        body: 'Midge gives a Rust application durable state with no database server to run, and a durability choice on every single commit.',
      },
      {
        title: 'Connect running applications',
        body: 'Fitz is one broker instead of a cache, a queue, and a scheduler: live updates, durable history, shared state, and background work, all over one connection.',
      },
      {
        title: 'Query what your application already produced',
        body: 'You define the tables, your handler replays your event log into them, and you query the result with psql, an existing driver, or a BI tool.',
      },
    ],
    boundaries: {
      title: 'One writer each, and your application owns the truth',
      body: 'None of these products do consensus, replication, or transparent failover. Each holds a single-writer lease over its own data. That is a design choice. The authoritative record stays in your application: the event log Cassie replays, the history Fitz streams carry, the bytes you hand Midge. These products make that record fast to serve. None of them tries to become it.',
    },
    next: {
      title: 'Pick the one that matches your problem.',
      primaryHref: '/docs',
      primaryLabel: 'Browse documentation',
      secondaryHref: '/midge',
      secondaryLabel: 'Explore Midge',
    },
  },
  {
    path: '/midge',
    productId: 'midge',
    label: 'Midge',
    title: 'Durable state in your Rust process, backed by S3 | Midge',
    description:
      'Midge is an embedded Rust key-value engine: no server, no port, no network hop. Snapshot transactions, a durability choice on every commit, and the same API on local disk or S3, Azure Blob, and GCS.',
    headline: 'Durable state without running a database.',
    lede: 'Midge is an embedded key-value engine for Rust. It links into your process as a library: no server, no port, no network hop between your code and your data. An LSM engine, snapshot transactions, and named keyspaces.',
    audience:
      'For local-first and edge applications, services that need durable state without operating a database, caches and indexes that must survive a restart, and event logs an application replays on startup.',
    workTitle: 'The decisions Midge puts in your hands',
    what: {
      title: 'You choose durability, per write',
      href: '/docs/midge/durability',
      linkLabel: 'Durability modes',
      body: 'There is no default write option. Each commit says how durable it needs to be, from visible right away to confirmed in the cloud, and you decide per write which one to wait for.',
    },
    fit: {
      title: 'The same API on a laptop or on S3',
      href: '/docs/midge/cloud',
      linkLabel: 'Persistence options',
      body: 'Start in memory, stay on local disk, or target S3, Azure Blob, Google Cloud Storage, or a compatible endpoint. Cloud mode keeps a bounded local cache in front of the object store. Your storage code does not change: develop against a directory, deploy against a bucket.',
    },
    work: [
      {
        title: 'Snapshot transactions over opaque bytes',
        body: 'Atomic multi-key commits with snapshot isolation, scoped to one column family. Keys and values are raw byte strings. Midge never parses, validates, or versions what you store.',
      },
      {
        title: 'No second system to operate',
        body: 'One process owns one database directory under a single-writer lease. Nothing to provision, no connection pool, no query planner between you and a key.',
      },
      {
        title: 'Restart recovery is part of the engine',
        body: "Write-ahead logging, flush, and compaction are the engine's job. What survives a crash follows directly from the durability policy each commit chose.",
      },
    ],
    boundaries: {
      title: 'When to use a database server instead',
      href: '/docs/midge',
      linkLabel: 'When Midge fits',
      body: 'Reach for a database server when more than one process must write the same data, when you need SQL or a query planner, when you need replication or automatic failover, or when a transaction must span two keyspaces atomically. Encoding, schema, access control, and backup scheduling stay yours. None happen by default.',
    },
    next: {
      title: 'Commit your first transaction.',
      primaryHref: '/docs/midge/getting-started',
      primaryLabel: 'Get started',
      secondaryHref: '/docs/midge',
      secondaryLabel: 'Read the overview',
      repository: 'https://github.com/cntryl/midge',
      code: `let mut engine = Engine::open(
    OpenOptions::local("./midge-data").build()?
)?;
let cf = engine.get_column_family("default").unwrap();
let mut tx = engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"hello".to_vec(), b"world".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;`,
      codeCaption:
        'Opening a local directory with a synchronous commit. Swap the open options for S3, Azure Blob, or GCS and the rest of this code is unchanged.',
    },
  },
  {
    path: '/fitz',
    productId: 'fitz',
    label: 'Fitz',
    title: 'Broker, cache, job queue, and scheduler in one process | Fitz',
    description:
      'Fitz is one broker that replaces your cache, queue, and scheduler, with durable data in S3, Azure Blob, or GCS instead of on the box.',
    headline:
      'Your broker, cache, job queue, and scheduler, all in one process.',
    lede: "Fitz is a message broker that also runs your cache, job queue, and scheduler, all as one process instead of four. Consolidating those usually means the guarantees blur together: the cache becomes the queue, the queue becomes the event log, and nobody can say anymore what survives a restart. Fitz doesn't blur: each kind of message keeps its own promise, in one broker.",
    audience:
      "One process, but not one box's worth of data: durable domains live in S3, Azure Blob, or GCS, and the container holds only a cache. Scaling is a resize, not a migration.",
    workTitle: 'What one broker gets you',
    what: {
      title: 'One broker, however you need it',
      href: '/docs/fitz/concepts-and-routes',
      linkLabel: 'Concepts and routes',
      body: "Fitz gives you all of it over one connection, addressed the same way: live updates, a durable queue, a shared value, background work, direct requests. You don't stand up a separate system for each.",
    },
    fit: {
      title: 'Mix patterns without extra plumbing',
      href: '/docs/fitz/durability',
      linkLabel: 'Durability',
      body: "Some of what Fitz handles is ephemeral, some persists, and you can combine them freely. A scheduled job can hand off to a queue for durable retry; a stored value can raise a live update without either depending on the other's guarantees.",
    },
    work: [
      {
        title: 'One address shape for everything',
        body: 'Every resource is addressed the same way, no matter what kind of message it is. One route model, one identity model, one set of operational controls.',
      },
      {
        title: 'Clients that reconnect themselves',
        body: 'Connect over WebSocket or TCP from TypeScript, Go, C#, or Rust. Each client heartbeats, reconnects on its own when the link drops, retries idempotent reads, and reports the state change so your connect handler can pick up from there.',
      },
      {
        title: "The data isn't in the container",
        body: 'Durable domains persist through Midge onto S3, Azure Blob, or GCS, with the broker keeping a local cache. Resize or restart the container without moving data. There is still no second storage system to deploy.',
      },
    ],
    boundaries: {
      title: 'One writer, disposable compute',
      href: '/docs/fitz/supported-boundaries',
      linkLabel: 'Supported boundaries',
      body: "No consensus, no replication, no transparent failover, no exactly-once delivery. One broker holds an exclusive writer lease over its data, and a restart is a visible event to every connected client. Committed state lives in object storage, so swapping the container doesn't move it. Recovery is split: the broker restores what it owns, and the client restores what it owns. The client reconnects on its own, then re-establishes its session in a connect handler. Past one process, partition by route family rather than pointing two brokers at the same data.",
    },
    next: {
      title: 'Start one broker and send one message.',
      primaryHref: '/docs/fitz/getting-started',
      primaryLabel: 'Get started',
      secondaryHref: '/docs/fitz',
      secondaryLabel: 'Read the overview',
      repository: 'https://github.com/cntryl/fitz',
      code: `docker run --rm \\
  -p 127.0.0.1:4090:4090 \\
  -p 127.0.0.1:4091:4091 \\
  -p 127.0.0.1:9090:9090 \\
  -e FITZ_AUTH_REQUIRED=false \\
  -e FITZ_STORAGE_MODE=local \\
  -e FITZ_STORAGE_PATH=/data \\
  ghcr.io/cntryl/fitz:latest`,
      codeCaption:
        'A local development broker: loopback-bound, authentication off, storage on a container path. A deployment sets storage to cloud mode and turns authentication on.',
    },
  },
  {
    path: '/cassie',
    productId: 'cassie',
    label: 'Cassie',
    title: 'A real SQL database for your event log | Cassie',
    description:
      'Cassie is a database with the PostgreSQL wire protocol: you create the schema, tables, and views, replay your event log into them, and query the result with psql, an existing driver, or a BI tool.',
    headline: 'Point psql at your event log.',
    lede: 'Cassie is a database, not a magic materializer. You create the schema, the tables, and the views. Your handler replays your event log into them. Cassie stores the rows and serves them over the PostgreSQL wire protocol, so the driver and BI tool already in your stack just connect.',
    audience:
      'For teams that want to query the data their app already produces, with the SQL client, driver, or BI tool they already have, without standing up and syncing a separate database, search cluster, and vector store.',
    what: {
      title: 'You push events in, and Cassie never reaches out',
      href: '/docs/cassie/projections-and-replay',
      linkLabel: 'Projections and replay',
      body: "Skip the pipeline you'd otherwise build to keep a read model in sync: a CDC tool, a consumer, a materialized-view table. There is no ingestion pipeline to operate and no stream for Cassie to poll. Your handler reads your event log and calls a local replay API with a batch of events, writing into the tables you defined. Three rules apply, each guarded on the Cassie side: events arrive in increasing order, or Cassie rejects the position. Each event carries a stable id, and Cassie skips ids it has already seen. Payloads are deterministic, because Cassie persists exactly what it is handed.",
    },
    workTitle: 'A database you set up and query like any other',
    fit: {
      title: 'A read model you can throw away and rebuild',
      href: '/docs/cassie/getting-started',
      linkLabel: 'Run the example',
      body: "Get those three rules right and replay is repeatable: the same history produces the same rows. Rebuilding a projection from scratch is routine, not risky: drop the tables, replay, and they're right again. Nothing in Cassie is a record you'd be afraid to lose, because none of it is the record.",
    },
    work: [
      {
        title: 'Real schema, real SQL',
        body: 'Create tables, views, and indexes with ordinary DDL. Query them with full SQL, including joins, subqueries, and aggregation, over psql, your existing driver, or a BI client. No bespoke SDK.',
      },
      {
        title: 'Fast reads, not a second copy',
        body: 'Scalar, full-text, vector, and time-series indexes accelerate reads. Every one sits over your rows as an accelerator, never a second copy of them.',
      },
      {
        title: 'Queries that fail instead of degrading',
        body: 'A request can be bounded by deadline, cancellation, SQL complexity, result size, and memory. Hitting a bound returns a deterministic error with a standard SQLSTATE, not a silently truncated result.',
      },
    ],
    boundaries: {
      title: 'Cassie is a database, not the source of truth',
      href: '/docs/cassie/product-boundaries',
      linkLabel: 'Product boundaries',
      body: 'Cassie is not your event stream, not an OLTP database for application writes, and not a distributed SQL engine. Replication, sharding, consensus, and cross-node planning are permanent non-goals. It does not store the source log, choose batch boundaries, resolve a timestamp or generated id on your behalf, or design your schema for you. You create the tables and views; Cassie executes your SQL against them and owns everything between a submitted query and its result. Your event log stays authoritative. Cassie holds a derived copy, not the record.',
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
] as const satisfies readonly MarketingPageDefinition[];

export type MarketingPath = (typeof marketingPages)[number]['path'];

export const repositories = [
  { name: 'midge', href: 'https://github.com/cntryl/midge' },
  { name: 'fitz', href: 'https://github.com/cntryl/fitz' },
  { name: 'cassie', href: 'https://github.com/cntryl/cassie' },
  { name: 'fitz-ts', href: 'https://github.com/cntryl/fitz-ts' },
  { name: 'fitz-go', href: 'https://github.com/cntryl/fitz-go' },
  { name: 'lexkey-rs', href: 'https://github.com/cntryl/lexkey-rs' },
] as const;

export function marketingPage(path: MarketingPath) {
  const page = marketingPages.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`Unknown marketing route: ${path}`);
  return page;
}
