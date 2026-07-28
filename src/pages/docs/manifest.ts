import type { DocsPortalId, ProductKind } from './types';

export type DocsManifestToc = { id: string; title: string };
export type DocsManifestPage = {
  route: string;
  title: string;
  description: string;
  toc: readonly DocsManifestToc[];
};
export type DocsManifestSection = {
  id: string;
  label: string;
  pages: readonly DocsManifestPage[];
};
export type DocsManifestPortal = {
  id: DocsPortalId;
  label: string;
  shortLabel: string;
  kind: ProductKind;
  route: string;
  description: string;
  repository: string;
  sections: readonly DocsManifestSection[];
};

// Generated from src/pages/docs/catalog.ts.
export const docsManifest: readonly DocsManifestPortal[] = [
  {
    id: 'midge',
    label: 'Midge',
    shortLabel: 'Midge',
    kind: 'runtime',
    route: '/docs/midge',
    description:
      'Embedded Rust storage with explicit transaction, durability, and recovery choices.',
    repository: 'https://github.com/cntryl/midge',
    sections: [
      {
        id: 'start',
        label: 'Start here',
        pages: [
          {
            route: '/docs/midge',
            title: 'Overview',
            description:
              'Learn when Midge fits, how its transaction and durability model works, and what remains application-owned.',
            toc: [
              {
                id: 'what-midge-is',
                title: 'What Midge is',
              },
              {
                id: 'when-it-fits',
                title: 'When Midge fits',
              },
              {
                id: 'what-you-own',
                title: 'What your application still owns',
              },
              {
                id: 'where-to-go-next',
                title: 'Where to go next',
              },
            ],
          },
          {
            route: '/docs/midge/getting-started',
            title: 'Getting Started',
            description:
              'Install Midge, commit one value to local storage, reopen the engine, and verify the recovered value.',
            toc: [
              {
                id: 'install',
                title: 'Install',
              },
              {
                id: 'open-the-engine',
                title: 'Open the engine',
              },
              {
                id: 'commit-a-value',
                title: 'Commit a value',
              },
              {
                id: 'reopen-and-verify',
                title: 'Reopen and verify',
              },
              {
                id: 'next-steps',
                title: 'Next steps',
              },
            ],
          },
        ],
      },
      {
        id: 'storage-model',
        label: 'Storage model',
        pages: [
          {
            route: '/docs/midge/column-families',
            title: 'Column Families',
            description:
              'Create and use column families as explicit keyspaces with application-owned encoding.',
            toc: [
              {
                id: 'column-family-model',
                title: 'Column-family model',
              },
              {
                id: 'create-and-look-up',
                title: 'Create and look up',
              },
              {
                id: 'key-and-value-encoding',
                title: 'Key and value encoding',
              },
              {
                id: 'lifecycle-boundaries',
                title: 'Lifecycle boundaries',
              },
            ],
          },
          {
            route: '/docs/midge/transactions-and-mvcc',
            title: 'Transactions and MVCC',
            description:
              'Use snapshot transactions, conflict policies, and commit boundaries with explicit ownership.',
            toc: [
              {
                id: 'snapshot-model',
                title: 'Snapshot model',
              },
              {
                id: 'read-only-transactions',
                title: 'Read-only transactions',
              },
              {
                id: 'read-write-transactions',
                title: 'Read-write transactions',
              },
              {
                id: 'conflict-behavior',
                title: 'Conflict behavior',
              },
            ],
          },
          {
            route: '/docs/midge/operations',
            title: 'Data Operations',
            description:
              'Use short transaction-to-commit examples for puts, batches, inserts, reads, deletes, range deletes, scans, rollback, and durability.',
            toc: [
              {
                id: 'the-shape-of-every-operation',
                title: 'The shape of every operation',
              },
              {
                id: 'transaction-to-commit',
                title: 'Transaction to commit',
              },
              {
                id: 'put',
                title: 'Put a value',
              },
              {
                id: 'batch',
                title: 'Commit a batch',
              },
              {
                id: 'insert',
                title: 'Insert only when absent',
              },
              {
                id: 'read',
                title: 'Read a value',
              },
              {
                id: 'delete',
                title: 'Delete a key',
              },
              {
                id: 'range-delete',
                title: 'Delete a key range',
              },
              {
                id: 'scan',
                title: 'Scan a range or prefix',
              },
              {
                id: 'rollback',
                title: 'Roll back a transaction',
              },
              {
                id: 'commit-durability',
                title: 'Choose commit durability',
              },
              {
                id: 'write-conflicts',
                title: 'Choose write-conflict behavior',
              },
            ],
          },
          {
            route: '/docs/midge/durability',
            title: 'Durability Modes',
            description:
              'Choose the acknowledgement boundary for each commit and test recovery against that choice.',
            toc: [
              {
                id: 'durability-model',
                title: 'Durability model',
              },
              {
                id: 'local-commit-modes',
                title: 'Local commit modes',
              },
              {
                id: 'cloud-commit-modes',
                title: 'Cloud commit modes',
              },
              {
                id: 'recovery-expectations',
                title: 'Recovery expectations',
              },
            ],
          },
          {
            route: '/docs/midge/recovery',
            title: 'Recovery',
            description:
              'Open existing storage, inspect recovery reports, and decide whether to continue, repair, or rebuild.',
            toc: [
              {
                id: 'recovery-model',
                title: 'Recovery model',
              },
              {
                id: 'open-and-inspect',
                title: 'Open and inspect',
              },
              {
                id: 'corruption-and-truncation',
                title: 'Corruption and truncation',
              },
              {
                id: 'repair-or-rebuild',
                title: 'Repair or rebuild',
              },
            ],
          },
          {
            route: '/docs/midge/storage-contract',
            title: 'Storage Contract',
            description:
              'Understand local files, cloud objects, compatibility boundaries, and application-owned backup policy.',
            toc: [
              {
                id: 'local-layout',
                title: 'Local layout',
              },
              {
                id: 'cloud-layout',
                title: 'Cloud layout',
              },
              {
                id: 'format-compatibility',
                title: 'Format compatibility',
              },
              {
                id: 'backup-ownership',
                title: 'Backup ownership',
              },
            ],
          },
        ],
      },
      {
        id: 'configuration',
        label: 'Configuration',
        pages: [
          {
            route: '/docs/midge/options',
            title: 'Options',
            description:
              'Configure every public Midge open option and understand the values derived when the options are built.',
            toc: [
              {
                id: 'storage',
                title: 'Choose storage',
              },
              {
                id: 'derived-configuration',
                title: 'Set the derived configuration',
              },
              {
                id: 'runtime-overrides',
                title: 'Configure runtime overrides',
              },
              {
                id: 'cloud-write-policy',
                title: 'Configure cloud write policy',
              },
              {
                id: 'inspect-derived-values',
                title: 'Inspect the built values',
              },
            ],
          },
          {
            route: '/docs/midge/cloud',
            title: 'Cloud',
            description:
              'Configure Midge for AWS S3, S3-compatible storage, Azure Blob, or Google Cloud Storage with explicit credentials and durability.',
            toc: [
              {
                id: 'cloud-model',
                title: 'The cloud storage model',
              },
              {
                id: 'aws-s3',
                title: 'AWS S3',
              },
              {
                id: 's3-compatible',
                title: 'S3-compatible storage',
              },
              {
                id: 'azure-blob',
                title: 'Azure Blob Storage',
              },
              {
                id: 'google-cloud-storage',
                title: 'Google Cloud Storage',
              },
              {
                id: 'endpoint-overrides',
                title: 'Endpoint and emulator overrides',
              },
              {
                id: 'cloud-commits',
                title: 'Choose the cloud commit boundary',
              },
              {
                id: 'recovery-and-ownership',
                title: 'Recovery and ownership',
              },
            ],
          },
        ],
      },
      {
        id: 'operations',
        label: 'Operations',
        pages: [
          {
            route: '/docs/midge/metrics',
            title: 'Metrics and Reports',
            description:
              'Inspect runtime, storage, recovery, cache, compaction, and verification signals.',
            toc: [
              {
                id: 'runtime-metrics',
                title: 'Runtime metrics',
              },
              {
                id: 'storage-metrics',
                title: 'Storage metrics',
              },
              {
                id: 'recovery-reports',
                title: 'Recovery reports',
              },
              {
                id: 'verification-reports',
                title: 'Verification reports',
              },
            ],
          },
          {
            route: '/docs/midge/resource-controls',
            title: 'Resource Controls',
            description:
              'Bound memory, transactions, cache, compaction, storage I/O, and shutdown work.',
            toc: [
              {
                id: 'memory-budgets',
                title: 'Memory budgets',
              },
              {
                id: 'transaction-limits',
                title: 'Transaction limits',
              },
              {
                id: 'background-work',
                title: 'Background work',
              },
              {
                id: 'storage-and-shutdown-timeouts',
                title: 'Storage and shutdown timeouts',
              },
            ],
          },
          {
            route: '/docs/midge/migration',
            title: 'Migration',
            description:
              'Move Midge data, configuration, and storage providers through a reversible application-owned workflow.',
            toc: [
              {
                id: 'plan-the-change',
                title: 'Plan the change',
              },
              {
                id: 'back-up-state',
                title: 'Back up state',
              },
              {
                id: 'apply-the-migration',
                title: 'Apply the migration',
              },
              {
                id: 'verify-or-roll-back',
                title: 'Verify or roll back',
              },
            ],
          },
          {
            route: '/docs/midge/performance-tuning',
            title: 'Performance Tuning',
            description:
              'Tune workload goals, memory, cache, memtables, compaction, and storage without hiding durability tradeoffs.',
            toc: [
              {
                id: 'measure-the-workload',
                title: 'Measure the workload',
              },
              {
                id: 'derived-configuration',
                title: 'Derived configuration',
              },
              {
                id: 'runtime-overrides',
                title: 'Runtime overrides',
              },
              {
                id: 'verify-the-result',
                title: 'Verify the result',
              },
            ],
          },
          {
            route: '/docs/midge/troubleshooting',
            title: 'Troubleshooting',
            description:
              'Diagnose open, transaction, commit, recovery, cloud, resource, and shutdown failures.',
            toc: [
              {
                id: 'open-failures',
                title: 'Open failures',
              },
              {
                id: 'transaction-and-commit-failures',
                title: 'Transaction and commit failures',
              },
              {
                id: 'recovery-and-cloud-failures',
                title: 'Recovery and cloud failures',
              },
              {
                id: 'resource-and-shutdown-diagnostics',
                title: 'Resource and shutdown diagnostics',
              },
            ],
          },
        ],
      },
      {
        id: 'reference',
        label: 'Reference',
        pages: [
          {
            route: '/docs/midge/api-reference',
            title: 'Public API',
            description:
              'Find the public engine, option, column-family, transaction, query, report, and error types.',
            toc: [
              {
                id: 'engine-and-options',
                title: 'Engine and options',
              },
              {
                id: 'column-families-and-transactions',
                title: 'Column families and transactions',
              },
              {
                id: 'queries-and-results',
                title: 'Queries and results',
              },
              {
                id: 'reports-and-errors',
                title: 'Reports and errors',
              },
            ],
          },
          {
            route: '/docs/midge/configuration',
            title: 'Configuration Reference',
            description:
              'Find every builder input, derived value, runtime override, storage option, and timeout.',
            toc: [
              {
                id: 'builder-inputs',
                title: 'Builder inputs',
              },
              {
                id: 'derived-values',
                title: 'Derived values',
              },
              {
                id: 'runtime-overrides',
                title: 'Runtime overrides',
              },
              {
                id: 'storage-and-timeout-settings',
                title: 'Storage and timeout settings',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fitz',
    label: 'Fitz',
    shortLabel: 'Fitz',
    kind: 'runtime',
    route: '/docs/fitz',
    description:
      'Messaging and coordination models behind one single-node broker boundary.',
    repository: 'https://github.com/cntryl/fitz',
    sections: [
      {
        id: 'server',
        label: 'Start here',
        pages: [
          {
            route: '/docs/fitz',
            title: 'Server Overview',
            description:
              'Understand the Fitz server, its seven domains, and the state that applications rebuild after reconnecting.',
            toc: [
              {
                id: 'what-fitz-is',
                title: 'What Fitz is',
              },
              {
                id: 'choose-a-domain',
                title: 'Choose a domain',
              },
              {
                id: 'server-boundaries',
                title: 'What Fitz does not do',
              },
              {
                id: 'where-to-go-next',
                title: 'Where to go next',
              },
            ],
          },
          {
            route: '/docs/fitz/getting-started',
            title: 'Getting Started',
            description:
              'Start a local Fitz server, verify its health, and connect a supported application client.',
            toc: [
              {
                id: 'start-the-server',
                title: 'Start the server',
              },
              {
                id: 'verify-health',
                title: 'Verify server health',
              },
              {
                id: 'connect-a-client',
                title: 'Connect a client',
              },
              {
                id: 'first-operation',
                title: 'Run one operation',
              },
              {
                id: 'production-boundary',
                title: 'Before you deploy this',
              },
            ],
          },
        ],
      },
      {
        id: 'concepts',
        label: 'Core concepts',
        pages: [
          {
            route: '/docs/fitz/concepts-and-routes',
            title: 'Concepts and Routes',
            description:
              'Understand routes, resources, sessions, identities, domains, and delivery boundaries across Fitz.',
            toc: [
              {
                id: 'route-model',
                title: 'Route model',
              },
              {
                id: 'resources',
                title: 'Resources',
              },
              {
                id: 'sessions-and-identity',
                title: 'Sessions and identity',
              },
              {
                id: 'domain-boundaries',
                title: 'Domain boundaries',
              },
            ],
          },
          {
            route: '/docs/fitz/authentication',
            title: 'Authentication',
            description:
              'Authenticate clients and administrators, authorize route families, and rotate credentials.',
            toc: [
              {
                id: 'authentication-model',
                title: 'Authentication model',
              },
              {
                id: 'client-credentials',
                title: 'Client credentials',
              },
              {
                id: 'route-authorization',
                title: 'Route authorization',
              },
              {
                id: 'credential-rotation',
                title: 'Credential rotation',
              },
            ],
          },
          {
            route: '/docs/fitz/durability',
            title: 'Durability',
            description:
              'Choose acknowledgement and persistence behavior without hiding the single-node server boundary.',
            toc: [
              {
                id: 'durability-model',
                title: 'Durability model',
              },
              {
                id: 'domain-write-behavior',
                title: 'Domain write behavior',
              },
              {
                id: 'local-and-cloud-acknowledgement',
                title: 'Local and cloud acknowledgement',
              },
              {
                id: 'recovery',
                title: 'Recovery',
              },
            ],
          },
          {
            route: '/docs/fitz/clients',
            title: 'Clients',
            description:
              'Install and connect a supported client, then use the domain pages for per-domain behavior.',
            toc: [
              {
                id: 'supported-clients',
                title: 'Supported clients',
              },
              {
                id: 'install-client',
                title: 'Install a client',
              },
              {
                id: 'connection-lifecycle',
                title: 'Connection lifecycle',
              },
              {
                id: 'detecting-reconnects',
                title: 'Detecting a reconnect in code',
              },
              {
                id: 'error-handling',
                title: 'Handling errors',
              },
              {
                id: 'compatibility-and-conformance',
                title: 'Compatibility and conformance',
              },
            ],
          },
        ],
      },
      {
        id: 'domains',
        label: 'Domains',
        pages: [
          {
            route: '/docs/fitz/domains/notice',
            title: 'Notice',
            description:
              'Use live ephemeral fanout for connected subscribers without replay or recovery claims.',
            toc: [
              {
                id: 'model',
                title: 'Notice model',
              },
              {
                id: 'operations',
                title: 'Operations',
              },
              {
                id: 'use-it-for',
                title: 'Use Notice for',
              },
              {
                id: 'boundaries',
                title: 'Boundaries',
              },
              {
                id: 'client-examples',
                title: 'Client examples',
              },
            ],
          },
          {
            route: '/docs/fitz/domains/stream',
            title: 'Stream',
            description:
              'Use durable ordered append and replay for committed application history.',
            toc: [
              {
                id: 'model',
                title: 'Stream model',
              },
              {
                id: 'operations',
                title: 'Operations',
              },
              {
                id: 'use-it-for',
                title: 'Use Stream for',
              },
              {
                id: 'boundaries',
                title: 'Boundaries',
              },
              {
                id: 'client-examples',
                title: 'Client examples',
              },
            ],
          },
          {
            route: '/docs/fitz/domains/kv',
            title: 'KV',
            description:
              'Use transactional key-value resources for current authoritative state.',
            toc: [
              {
                id: 'model',
                title: 'KV model',
              },
              {
                id: 'operations',
                title: 'Operations',
              },
              {
                id: 'use-it-for',
                title: 'Use KV for',
              },
              {
                id: 'boundaries',
                title: 'Boundaries',
              },
              {
                id: 'client-examples',
                title: 'Client examples',
              },
            ],
          },
          {
            route: '/docs/fitz/domains/queue',
            title: 'Queue',
            description:
              'Use durable competing-consumer delivery with reservation, retry, and redelivery.',
            toc: [
              {
                id: 'model',
                title: 'Queue model',
              },
              {
                id: 'operations',
                title: 'Operations',
              },
              {
                id: 'use-it-for',
                title: 'Use Queue for',
              },
              {
                id: 'boundaries',
                title: 'Boundaries',
              },
              {
                id: 'client-examples',
                title: 'Client examples',
              },
            ],
          },
          {
            route: '/docs/fitz/domains/rpc',
            title: 'RPC',
            description:
              'Use live request and response dispatch to workers that are connected now.',
            toc: [
              {
                id: 'model',
                title: 'RPC model',
              },
              {
                id: 'operations',
                title: 'Operations',
              },
              {
                id: 'use-it-for',
                title: 'Use RPC for',
              },
              {
                id: 'boundaries',
                title: 'Boundaries',
              },
              {
                id: 'client-examples',
                title: 'Client examples',
              },
            ],
          },
          {
            route: '/docs/fitz/domains/lease',
            title: 'Lease',
            description:
              'Use single-broker ownership coordination with TTL expiry and fencing tokens.',
            toc: [
              {
                id: 'model',
                title: 'Lease model',
              },
              {
                id: 'operations',
                title: 'Operations',
              },
              {
                id: 'use-it-for',
                title: 'Use Lease for',
              },
              {
                id: 'boundaries',
                title: 'Boundaries',
              },
              {
                id: 'client-examples',
                title: 'Client examples',
              },
            ],
          },
          {
            route: '/docs/fitz/domains/schedule',
            title: 'Schedule',
            description:
              'Use durable future timing intent without turning the broker into a workflow engine.',
            toc: [
              {
                id: 'model',
                title: 'Schedule model',
              },
              {
                id: 'operations',
                title: 'Operations',
              },
              {
                id: 'use-it-for',
                title: 'Use Schedule for',
              },
              {
                id: 'boundaries',
                title: 'Boundaries',
              },
              {
                id: 'client-examples',
                title: 'Client examples',
              },
            ],
          },
        ],
      },
      {
        id: 'operations',
        label: 'Operations',
        pages: [
          {
            route: '/docs/fitz/cloud',
            title: 'Cloud',
            description:
              'Configure Fitz storage for local or provider-backed operation and choose explicit cloud durability boundaries.',
            toc: [
              {
                id: 'storage-modes',
                title: 'Storage modes',
              },
              {
                id: 'cloud-configuration',
                title: 'Cloud configuration',
              },
              {
                id: 'durability',
                title: 'Durability',
              },
              {
                id: 'cloud-boundaries',
                title: 'Cloud boundaries',
              },
            ],
          },
          {
            route: '/docs/fitz/deployment',
            title: 'Deployment',
            description:
              'Run one Fitz broker with explicit process, network, storage, health, and placement ownership.',
            toc: [
              {
                id: 'process-model',
                title: 'Process model',
              },
              {
                id: 'network-listeners',
                title: 'Network listeners',
              },
              {
                id: 'storage-placement',
                title: 'Storage placement',
              },
              {
                id: 'health-and-readiness',
                title: 'Health and readiness',
              },
            ],
          },
          {
            route: '/docs/fitz/storage',
            title: 'Storage',
            description:
              'Choose memory, local, or provider-backed storage and verify restart recovery.',
            toc: [
              {
                id: 'storage-modes',
                title: 'Storage modes',
              },
              {
                id: 'local-data',
                title: 'Local data',
              },
              {
                id: 'provider-backed-storage',
                title: 'Provider-backed storage',
              },
              {
                id: 'recovery-checks',
                title: 'Recovery checks',
              },
            ],
          },
          {
            route: '/docs/fitz/security',
            title: 'Security',
            description:
              'Configure authentication, route authorization, secrets, network exposure, and TLS termination.',
            toc: [
              {
                id: 'authentication',
                title: 'Authentication',
              },
              {
                id: 'authorization',
                title: 'Authorization',
              },
              {
                id: 'secrets',
                title: 'Secrets',
              },
              {
                id: 'network-and-tls',
                title: 'Network and TLS',
              },
            ],
          },
          {
            route: '/docs/fitz/observability',
            title: 'Observability',
            description:
              'Use health probes, readiness, metrics, logs, and domain diagnostics to operate Fitz.',
            toc: [
              {
                id: 'health-and-readiness',
                title: 'Health and readiness',
              },
              {
                id: 'metrics',
                title: 'Metrics',
              },
              {
                id: 'logs',
                title: 'Logs',
              },
              {
                id: 'domain-diagnostics',
                title: 'Domain diagnostics',
              },
            ],
          },
          {
            route: '/docs/fitz/resource-limits',
            title: 'Resource Limits',
            description:
              'Bound connections, sessions, routes, messages, queues, workers, and storage work.',
            toc: [
              {
                id: 'connection-limits',
                title: 'Connection limits',
              },
              {
                id: 'domain-limits',
                title: 'Domain limits',
              },
              {
                id: 'storage-limits',
                title: 'Storage limits',
              },
              {
                id: 'admission-behavior',
                title: 'Admission behavior',
              },
            ],
          },
          {
            route: '/docs/fitz/runbook',
            title: 'Operator Runbook',
            description:
              'Start, inspect, drain, restart, recover, and verify one Fitz broker.',
            toc: [
              {
                id: 'start-and-verify',
                title: 'Start and verify',
              },
              {
                id: 'drain-traffic',
                title: 'Drain traffic',
              },
              {
                id: 'restart-and-recover',
                title: 'Restart and recover',
              },
              {
                id: 'incident-checks',
                title: 'Incident checks',
              },
            ],
          },
          {
            route: '/docs/fitz/migrations',
            title: 'Migrations',
            description:
              'Move Fitz configuration, storage formats, and deployments through a reversible operator workflow.',
            toc: [
              {
                id: 'plan-the-change',
                title: 'Plan the change',
              },
              {
                id: 'back-up-state',
                title: 'Back up state',
              },
              {
                id: 'apply-the-migration',
                title: 'Apply the migration',
              },
              {
                id: 'verify-or-roll-back',
                title: 'Verify or roll back',
              },
            ],
          },
          {
            route: '/docs/fitz/troubleshooting',
            title: 'Troubleshooting',
            description:
              'Diagnose startup, authentication, routing, domain, storage, and resource failures.',
            toc: [
              {
                id: 'startup-failures',
                title: 'Startup failures',
              },
              {
                id: 'connection-failures',
                title: 'Connection failures',
              },
              {
                id: 'domain-failures',
                title: 'Domain failures',
              },
              {
                id: 'storage-and-resource-diagnostics',
                title: 'Storage and resource diagnostics',
              },
            ],
          },
        ],
      },
      {
        id: 'reference',
        label: 'Reference',
        pages: [
          {
            route: '/docs/fitz/configuration',
            title: 'Configuration Reference',
            description:
              'Find Fitz listener, authentication, route, storage, domain, and resource settings.',
            toc: [
              {
                id: 'server-settings',
                title: 'Server settings',
              },
              {
                id: 'security-settings',
                title: 'Security settings',
              },
              {
                id: 'storage-settings',
                title: 'Storage settings',
              },
              {
                id: 'domain-and-resource-settings',
                title: 'Domain and resource settings',
              },
            ],
          },
          {
            route: '/docs/fitz/admin-api',
            title: 'Admin API',
            description:
              'Use the administrative API for health, metrics, sessions, domains, deployment, and safety workflows.',
            toc: [
              {
                id: 'api-model',
                title: 'API model',
              },
              {
                id: 'probes-and-metrics',
                title: 'Probes and metrics',
              },
              {
                id: 'sessions-and-domains',
                title: 'Sessions and domains',
              },
              {
                id: 'safety-boundaries',
                title: 'Safety boundaries',
              },
            ],
          },
          {
            route: '/docs/fitz/wire-protocol',
            title: 'Wire Protocol',
            description:
              'Understand connection flow, framing, routing, operations, and domain message contracts.',
            toc: [
              {
                id: 'connection-flow',
                title: 'Connection flow',
              },
              {
                id: 'framing-and-routing',
                title: 'Framing and routing',
              },
              {
                id: 'operation-model',
                title: 'Operation model',
              },
              {
                id: 'domain-messages',
                title: 'Domain messages',
              },
            ],
          },
          {
            route: '/docs/fitz/supported-boundaries',
            title: 'Supported Boundaries',
            description:
              'Find the guarantees Fitz makes and the distributed, session, and delivery behavior applications still own.',
            toc: [
              {
                id: 'server-guarantees',
                title: 'Server guarantees',
              },
              {
                id: 'domain-guarantees',
                title: 'Domain guarantees',
              },
              {
                id: 'session-boundaries',
                title: 'Session boundaries',
              },
              {
                id: 'application-ownership',
                title: 'Application ownership',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cassie',
    label: 'Cassie',
    shortLabel: 'Cassie',
    kind: 'runtime',
    route: '/docs/cassie',
    description:
      'SQL-queryable read models built from application-owned history.',
    repository: 'https://github.com/cntryl/cassie',
    sections: [
      {
        id: 'start',
        label: 'Start here',
        pages: [
          {
            route: '/docs/cassie',
            title: 'Overview',
            description:
              'Learn when Cassie fits, how projection data becomes queryable, and which history remains application-owned.',
            toc: [
              {
                id: 'what-cassie-is',
                title: 'What Cassie is',
              },
              {
                id: 'how-data-arrives',
                title: 'How data gets in',
              },
              {
                id: 'when-it-fits',
                title: 'When Cassie fits',
              },
              {
                id: 'where-to-go-next',
                title: 'Where to go next',
              },
            ],
          },
          {
            route: '/docs/cassie/getting-started',
            title: 'Getting Started',
            description:
              'Run Cassie’s canonical local example and complete its queryable read-model workflow.',
            toc: [
              {
                id: 'run-the-example',
                title: 'Run the example',
              },
              {
                id: 'what-it-does',
                title: 'What the example does',
              },
              {
                id: 'inspect-the-results',
                title: 'Inspect the results',
              },
              {
                id: 'toward-a-real-integration',
                title: 'Toward a real integration',
              },
            ],
          },
          {
            route: '/docs/cassie/product-boundaries',
            title: 'Product Boundaries',
            description:
              'Separate Cassie-owned query behavior from application-owned history, routing, placement, and replay input.',
            toc: [
              {
                id: 'cassie-owns',
                title: 'Cassie owns',
              },
              {
                id: 'applications-own',
                title: 'Applications own',
              },
              {
                id: 'midge-owns',
                title: 'Midge owns',
              },
              {
                id: 'single-node-boundary',
                title: 'Single-node boundary',
              },
            ],
          },
        ],
      },
      {
        id: 'model',
        label: 'Model and queries',
        pages: [
          {
            route: '/docs/cassie/sql-and-pgwire',
            title: 'SQL and Pgwire',
            description:
              'Connect PostgreSQL clients and use the SQL surface that Cassie exposes for read-model queries.',
            toc: [
              {
                id: 'connect-a-client',
                title: 'Connect a client',
              },
              {
                id: 'execute-parameterized-sql',
                title: 'Execute parameterized SQL',
              },
              {
                id: 'transactions-and-sessions',
                title: 'Transactions and sessions',
              },
              {
                id: 'query-visible-errors',
                title: 'Query-visible errors',
              },
            ],
          },
          {
            route: '/docs/cassie/databases-and-schemas',
            title: 'Databases and Schemas',
            description:
              'Organize read models into the supported server, database, and schema hierarchy.',
            toc: [
              {
                id: 'hierarchy',
                title: 'Hierarchy',
              },
              {
                id: 'create-and-select-a-database',
                title: 'Create and select a database',
              },
              {
                id: 'schemas-and-names',
                title: 'Schemas and names',
              },
              {
                id: 'cross-database-boundary',
                title: 'Cross-database boundary',
              },
            ],
          },
          {
            route: '/docs/cassie/projections-and-replay',
            title: 'Projections and Replay',
            description:
              'Apply deterministic projection work, track progress, and rebuild read models from application-owned history.',
            toc: [
              {
                id: 'projection-contract',
                title: 'Projection contract',
              },
              {
                id: 'checkpoints',
                title: 'Checkpoints',
              },
              {
                id: 'replay',
                title: 'Replay',
              },
              {
                id: 'activation-and-verification',
                title: 'Activation and verification',
              },
            ],
          },
          {
            route: '/docs/cassie/indexes-and-constraints',
            title: 'Indexes and Constraints',
            description:
              'Choose indexes and supported constraints that match read-model query and rebuild behavior.',
            toc: [
              {
                id: 'supported-indexes',
                title: 'Supported indexes',
              },
              {
                id: 'constraint-behavior',
                title: 'Constraint behavior',
              },
              {
                id: 'build-and-rebuild',
                title: 'Build and rebuild',
              },
              {
                id: 'verification',
                title: 'Verification',
              },
            ],
          },
          {
            route: '/docs/cassie/search-and-query',
            title: 'Search and Query Capabilities',
            description:
              'Choose relational, text, vector, analytical, time-series, or graph-shaped retrieval for a read model.',
            toc: [
              {
                id: 'relational-queries',
                title: 'Relational queries',
              },
              {
                id: 'text-and-vector-search',
                title: 'Text and vector search',
              },
              {
                id: 'analytical-and-time-series-queries',
                title: 'Analytical and time-series queries',
              },
              {
                id: 'graph-shaped-queries',
                title: 'Graph-shaped queries',
              },
            ],
          },
        ],
      },
      {
        id: 'operations',
        label: 'Operations',
        pages: [
          {
            route: '/docs/cassie/administration',
            title: 'Administrative REST and UI',
            description:
              'Use the administrative API and UI for database, query, session, and operator workflows.',
            toc: [
              {
                id: 'administrative-surface',
                title: 'Administrative surface',
              },
              {
                id: 'database-operations',
                title: 'Database operations',
              },
              {
                id: 'query-workspace',
                title: 'Query workspace',
              },
              {
                id: 'openapi-contract',
                title: 'OpenAPI contract',
              },
            ],
          },
          {
            route: '/docs/cassie/deployment',
            title: 'Deployment',
            description:
              'Run Cassie with explicit network, storage, process, health, and placement ownership.',
            toc: [
              {
                id: 'process-model',
                title: 'Process model',
              },
              {
                id: 'network-listeners',
                title: 'Network listeners',
              },
              {
                id: 'storage-placement',
                title: 'Storage placement',
              },
              {
                id: 'health-and-readiness',
                title: 'Health and readiness',
              },
            ],
          },
          {
            route: '/docs/cassie/security',
            title: 'Security',
            description:
              'Configure authentication, authorization, session protection, and network exposure.',
            toc: [
              {
                id: 'authentication',
                title: 'Authentication',
              },
              {
                id: 'sql-roles',
                title: 'SQL roles',
              },
              {
                id: 'administrative-sessions',
                title: 'Administrative sessions',
              },
              {
                id: 'network-and-tls',
                title: 'Network and TLS',
              },
            ],
          },
          {
            route: '/docs/cassie/capacity-management',
            title: 'Capacity Management',
            description:
              'Plan resource limits, workload admission, concurrency, and bounded query behavior.',
            toc: [
              {
                id: 'capacity-model',
                title: 'Capacity model',
              },
              {
                id: 'resource-limits',
                title: 'Resource limits',
              },
              {
                id: 'admission-and-concurrency',
                title: 'Admission and concurrency',
              },
              {
                id: 'fallback-behavior',
                title: 'Fallback behavior',
              },
            ],
          },
          {
            route: '/docs/cassie/backup-and-restore',
            title: 'Backup and Restore',
            description:
              'Stream database backups and restores while preserving database boundaries and operator verification.',
            toc: [
              {
                id: 'backup-contract',
                title: 'Backup contract',
              },
              {
                id: 'stream-a-backup',
                title: 'Stream a backup',
              },
              {
                id: 'restore-a-database',
                title: 'Restore a database',
              },
              {
                id: 'verify-restored-state',
                title: 'Verify restored state',
              },
            ],
          },
          {
            route: '/docs/cassie/projection-repair',
            title: 'Projection Repair',
            description:
              'Detect, rebuild, verify, and activate repaired read models from authoritative history.',
            toc: [
              {
                id: 'detect-divergence',
                title: 'Detect divergence',
              },
              {
                id: 'build-a-rebuilt-version',
                title: 'Build a rebuilt version',
              },
              {
                id: 'verify-results',
                title: 'Verify results',
              },
              {
                id: 'activate-or-roll-back',
                title: 'Activate or roll back',
              },
            ],
          },
          {
            route: '/docs/cassie/performance',
            title: 'Performance',
            description:
              'Evaluate Cassie query behavior with bounded resources, explicit fallbacks, and representative workloads.',
            toc: [
              {
                id: 'performance-contract',
                title: 'Performance contract',
              },
              {
                id: 'workload-shape',
                title: 'Workload shape',
              },
              {
                id: 'measure-query-paths',
                title: 'Measure query paths',
              },
              {
                id: 'interpret-fallbacks',
                title: 'Interpret fallbacks',
              },
            ],
          },
          {
            route: '/docs/cassie/troubleshooting',
            title: 'Troubleshooting',
            description:
              'Diagnose startup, SQL, projection, resource, storage, and administrative failures.',
            toc: [
              {
                id: 'startup-failures',
                title: 'Startup failures',
              },
              {
                id: 'sql-and-client-failures',
                title: 'SQL and client failures',
              },
              {
                id: 'projection-failures',
                title: 'Projection failures',
              },
              {
                id: 'storage-and-resource-diagnostics',
                title: 'Storage and resource diagnostics',
              },
            ],
          },
        ],
      },
      {
        id: 'reference',
        label: 'Reference',
        pages: [
          {
            route: '/docs/cassie/compatibility',
            title: 'PostgreSQL Compatibility',
            description:
              'Find the PostgreSQL-like behavior Cassie supports and the server features that remain outside its contract.',
            toc: [
              {
                id: 'compatibility-model',
                title: 'Compatibility model',
              },
              {
                id: 'sql-surface',
                title: 'SQL surface',
              },
              {
                id: 'client-behavior',
                title: 'Client behavior',
              },
              {
                id: 'unsupported-features',
                title: 'Unsupported features',
              },
            ],
          },
          {
            route: '/docs/cassie/configuration',
            title: 'Configuration Reference',
            description:
              'Find Cassie listener, storage, authentication, query, resource, and administrative settings.',
            toc: [
              {
                id: 'server-settings',
                title: 'Server settings',
              },
              {
                id: 'storage-settings',
                title: 'Storage settings',
              },
              {
                id: 'security-settings',
                title: 'Security settings',
              },
              {
                id: 'query-and-resource-settings',
                title: 'Query and resource settings',
              },
            ],
          },
          {
            route: '/docs/cassie/glossary',
            title: 'Glossary',
            description:
              'Use consistent terms for read models, projections, databases, schemas, indexes, and query families.',
            toc: [
              {
                id: 'read-model-terms',
                title: 'Read-model terms',
              },
              {
                id: 'projection-terms',
                title: 'Projection terms',
              },
              {
                id: 'database-terms',
                title: 'Database terms',
              },
              {
                id: 'query-terms',
                title: 'Query terms',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    shortLabel: 'Tools',
    kind: 'supporting',
    route: '/docs/tools',
    description:
      'CLI support for repository validation, inventory generation, and benchmark reporting.',
    repository: 'https://github.com/cntryl/tools',
    sections: [
      {
        id: 'start',
        label: 'Start here',
        pages: [
          {
            route: '/docs/tools',
            title: 'Overview',
            description:
              'Learn which repository workflows Tools supports and what its reports do and do not establish.',
            toc: [
              {
                id: 'cli-surface',
                title: 'CLI surface',
              },
              {
                id: 'first-check',
                title: 'Run the first check',
              },
              {
                id: 'interpret-results',
                title: 'Interpret results',
              },
            ],
          },
          {
            route: '/docs/tools/installation',
            title: 'Installation',
            description:
              'Install the cntryl-tools CLI from its public repository and verify the resulting executable.',
            toc: [
              {
                id: 'requirements',
                title: 'Requirements',
              },
              {
                id: 'install-from-repository',
                title: 'Install from the repository',
              },
              {
                id: 'verify-the-executable',
                title: 'Verify the executable',
              },
              {
                id: 'update-and-uninstall',
                title: 'Update and uninstall',
              },
            ],
          },
          {
            route: '/docs/tools/getting-started',
            title: 'Getting Started',
            description:
              'Install cntryl-tools from GitHub and run test validation in one Rust repository.',
            toc: [
              {
                id: 'install-cli',
                title: 'Install the CLI',
              },
              {
                id: 'validate-checkout',
                title: 'Validate the checkout',
              },
              {
                id: 'ci-boundary',
                title: 'Choose a CI policy',
              },
            ],
          },
        ],
      },
      {
        id: 'commands',
        label: 'Commands',
        pages: [
          {
            route: '/docs/tools/validate-tests',
            title: 'Validate Tests',
            description:
              'Check Rust test naming and arrange-act-assert conventions in the selected repository.',
            toc: [
              {
                id: 'command-inputs',
                title: 'Command inputs',
              },
              {
                id: 'rules',
                title: 'Rules',
              },
              {
                id: 'output',
                title: 'Output',
              },
              {
                id: 'ci-usage',
                title: 'CI usage',
              },
            ],
          },
          {
            route: '/docs/tools/generate-inventory',
            title: 'Generate Inventory',
            description:
              'Scan a repository and produce a reviewable inventory of tests and benchmarks.',
            toc: [
              {
                id: 'command-inputs',
                title: 'Command inputs',
              },
              {
                id: 'discovery',
                title: 'Discovery',
              },
              {
                id: 'inventory-output',
                title: 'Inventory output',
              },
              {
                id: 'review-workflow',
                title: 'Review workflow',
              },
            ],
          },
          {
            route: '/docs/tools/summarize-benchmarks',
            title: 'Summarize Benchmarks',
            description:
              'Turn supported benchmark artifacts into consistent JSON, Markdown, and CSV reports.',
            toc: [
              {
                id: 'supported-inputs',
                title: 'Supported inputs',
              },
              {
                id: 'normalization',
                title: 'Normalization',
              },
              {
                id: 'report-formats',
                title: 'Report formats',
              },
              {
                id: 'interpretation',
                title: 'Interpretation',
              },
            ],
          },
        ],
      },
      {
        id: 'workflows',
        label: 'Workflows',
        pages: [
          {
            route: '/docs/tools/ci-integration',
            title: 'CI Integration',
            description:
              'Run the CLI in continuous integration and decide which results should fail a build.',
            toc: [
              {
                id: 'install-in-ci',
                title: 'Install in CI',
              },
              {
                id: 'choose-commands-per-job',
                title: 'Choose commands per job',
              },
              {
                id: 'interpret-results',
                title: 'Interpret results',
              },
              {
                id: 'failure-policy',
                title: 'Failure policy',
              },
            ],
          },
          {
            route: '/docs/tools/reporting-workflow',
            title: 'Reporting Workflow',
            description:
              'Collect artifacts, produce shared reports, and review them across repositories over time.',
            toc: [
              {
                id: 'collect-artifacts',
                title: 'Collect artifacts',
              },
              {
                id: 'produce-a-report',
                title: 'Produce a report',
              },
              {
                id: 'share-and-review',
                title: 'Share and review',
              },
              {
                id: 'track-changes-over-time',
                title: 'Track changes over time',
              },
            ],
          },
        ],
      },
      {
        id: 'reference',
        label: 'Reference',
        pages: [
          {
            route: '/docs/tools/configuration',
            title: 'Configuration Reference',
            description:
              'Find command flags, repository paths, artifact inputs, and report output settings.',
            toc: [
              {
                id: 'global-options',
                title: 'Global options',
              },
              {
                id: 'repository-inputs',
                title: 'Repository inputs',
              },
              {
                id: 'artifact-inputs',
                title: 'Artifact inputs',
              },
              {
                id: 'output-settings',
                title: 'Output settings',
              },
            ],
          },
          {
            route: '/docs/tools/output-formats',
            title: 'Output Formats',
            description:
              'Read the JSON, Markdown, and CSV report shapes the CLI writes and choose one per consumer.',
            toc: [
              {
                id: 'json-reports',
                title: 'JSON reports',
              },
              {
                id: 'markdown-reports',
                title: 'Markdown reports',
              },
              {
                id: 'csv-reports',
                title: 'CSV reports',
              },
              {
                id: 'choose-a-format',
                title: 'Choose a format',
              },
            ],
          },
          {
            route: '/docs/tools/exit-codes',
            title: 'Exit Codes',
            description:
              'Map each command result to an exit code so automation can act on it.',
            toc: [
              {
                id: 'success',
                title: 'Success',
              },
              {
                id: 'findings-reported',
                title: 'Findings reported',
              },
              {
                id: 'usage-errors',
                title: 'Usage errors',
              },
              {
                id: 'automation-handling',
                title: 'Automation handling',
              },
            ],
          },
          {
            route: '/docs/tools/troubleshooting',
            title: 'Troubleshooting',
            description:
              'Diagnose installation, repository discovery, validation, inventory, and report failures.',
            toc: [
              {
                id: 'installation-failures',
                title: 'Installation failures',
              },
              {
                id: 'repository-discovery',
                title: 'Repository discovery',
              },
              {
                id: 'validation-failures',
                title: 'Validation failures',
              },
              {
                id: 'report-failures',
                title: 'Report failures',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'stress',
    label: 'Stress',
    shortLabel: 'Stress',
    kind: 'supporting',
    route: '/docs/stress',
    description:
      'Repeatable Rust performance measurement with structured artifacts, diagnostics, and gates.',
    repository: 'https://github.com/cntryl/stress',
    sections: [
      {
        id: 'start',
        label: 'Start here',
        pages: [
          {
            route: '/docs/stress',
            title: 'Overview',
            description:
              'Learn how Stress structures Rust benchmarks, artifacts, diagnostics, and author-owned boundaries.',
            toc: [
              {
                id: 'measurement-contract',
                title: 'Measurement contract',
              },
              {
                id: 'write-one-benchmark',
                title: 'Write one benchmark',
              },
              {
                id: 'interpretation-boundary',
                title: 'Interpretation boundary',
              },
            ],
          },
          {
            route: '/docs/stress/getting-started',
            title: 'Getting Started',
            description:
              'Add cntryl-stress, define one Rust benchmark, run it, and locate the structured result.',
            toc: [
              {
                id: 'register-benchmark',
                title: 'Register a benchmark',
              },
              {
                id: 'run-and-locate',
                title: 'Run and locate the artifact',
              },
              {
                id: 'comparison-boundary',
                title: 'Set a comparison boundary',
              },
            ],
          },
        ],
      },
      {
        id: 'authoring',
        label: 'Author benchmarks',
        pages: [
          {
            route: '/docs/stress/benchmark-model',
            title: 'Benchmark Model',
            description:
              'Define measured work, operation counts, setup, samples, and author-owned correctness checks.',
            toc: [
              {
                id: 'benchmark-function',
                title: 'Benchmark function',
              },
              {
                id: 'measured-operation',
                title: 'Measured operation',
              },
              {
                id: 'setup-and-teardown',
                title: 'Setup and teardown',
              },
              {
                id: 'correctness-checks',
                title: 'Correctness checks',
              },
            ],
          },
          {
            route: '/docs/stress/selection-and-runs',
            title: 'Selection and Run Semantics',
            description:
              'Select benchmarks and understand warmup, measurement, repetition, filtering, and exit behavior.',
            toc: [
              {
                id: 'selection',
                title: 'Selection',
              },
              {
                id: 'warmup',
                title: 'Warmup',
              },
              {
                id: 'measurement-runs',
                title: 'Measurement runs',
              },
              {
                id: 'exit-behavior',
                title: 'Exit behavior',
              },
            ],
          },
          {
            route: '/docs/stress/attributes',
            title: 'Attributes',
            description:
              'Configure benchmark identity, tier, profiles, timing, samples, and comparison behavior.',
            toc: [
              {
                id: 'identity',
                title: 'Identity',
              },
              {
                id: 'tier-and-profile',
                title: 'Tier and profile',
              },
              {
                id: 'timing-and-samples',
                title: 'Timing and samples',
              },
              {
                id: 'comparison-settings',
                title: 'Comparison settings',
              },
            ],
          },
          {
            route: '/docs/stress/tier-recipes',
            title: 'Tier Recipes',
            description:
              'Structure focused, lifecycle, integration, endurance, and campaign-style measurements.',
            toc: [
              {
                id: 'pick-a-tier',
                title: 'Pick a tier first',
              },
              {
                id: 'focused-work',
                title: 'Focused work (Tier 1)',
              },
              {
                id: 'lifecycle-work',
                title: 'Lifecycle work (Tier 2)',
              },
              {
                id: 'integration-work',
                title: 'Integration work (Tiers 3-4)',
              },
              {
                id: 'endurance-and-campaigns',
                title: 'Endurance and campaigns (Tiers 5-6)',
              },
            ],
          },
        ],
      },
      {
        id: 'evidence',
        label: 'Evidence',
        pages: [
          {
            route: '/docs/stress/artifacts',
            title: 'Artifacts',
            description:
              'Read current and historical structured results, metadata, samples, percentiles, and findings.',
            toc: [
              {
                id: 'artifact-layout',
                title: 'Artifact layout',
              },
              {
                id: 'run-metadata',
                title: 'Run metadata',
              },
              {
                id: 'measurements-and-samples',
                title: 'Measurements and samples',
              },
              {
                id: 'quality-findings',
                title: 'Quality findings',
              },
            ],
          },
          {
            route: '/docs/stress/comparisons-and-gates',
            title: 'Comparisons and Gates',
            description:
              'Compare compatible runs and apply explicit performance limits to trusted measurements.',
            toc: [
              {
                id: 'comparison-identity',
                title: 'Comparison identity',
              },
              {
                id: 'baselines',
                title: 'Baselines',
              },
              {
                id: 'gates',
                title: 'Gates',
              },
              {
                id: 'failure-output',
                title: 'Failure output',
              },
            ],
          },
          {
            route: '/docs/stress/diagnostics',
            title: 'Diagnostics',
            description:
              'Capture allocation, environment, timing, trust, and benchmark-quality diagnostics.',
            toc: [
              {
                id: 'environment',
                title: 'Environment',
              },
              {
                id: 'timing',
                title: 'Timing',
              },
              {
                id: 'allocation',
                title: 'Allocation',
              },
              {
                id: 'trust-findings',
                title: 'Trust findings',
              },
            ],
          },
        ],
      },
      {
        id: 'reference',
        label: 'Reference',
        pages: [
          {
            route: '/docs/stress/configuration',
            title: 'Configuration Reference',
            description:
              'Find environment variables, run policy, profiles, artifact paths, and runner settings.',
            toc: [
              {
                id: 'environment-variables',
                title: 'Environment variables',
              },
              {
                id: 'run-policy',
                title: 'Run policy',
              },
              {
                id: 'profiles',
                title: 'Profiles',
              },
              {
                id: 'artifact-settings',
                title: 'Artifact settings',
              },
            ],
          },
          {
            route: '/docs/stress/api-reference',
            title: 'Public API',
            description:
              'Find the benchmark macro, context, measurement, runner, policy, artifact, and result APIs.',
            toc: [
              {
                id: 'macros',
                title: 'Macros',
              },
              {
                id: 'benchmark-context',
                title: 'Benchmark context',
              },
              {
                id: 'runner-and-policy',
                title: 'Runner and policy',
              },
              {
                id: 'artifacts-and-results',
                title: 'Artifacts and results',
              },
            ],
          },
          {
            route: '/docs/stress/troubleshooting',
            title: 'Troubleshooting',
            description:
              'Diagnose discovery, execution, measurement, artifact, comparison, and gate failures.',
            toc: [
              {
                id: 'discovery-failures',
                title: 'Discovery failures',
              },
              {
                id: 'execution-failures',
                title: 'Execution failures',
              },
              {
                id: 'artifact-failures',
                title: 'Artifact failures',
              },
              {
                id: 'comparison-and-gate-failures',
                title: 'Comparison and gate failures',
              },
            ],
          },
        ],
      },
    ],
  },
];

export const docsManifestPages = docsManifest.flatMap((portal) =>
  portal.sections.flatMap((section) => section.pages)
);

export const docsManifestByRoute = new Map(
  docsManifestPages.map((page) => [page.route, page])
);

export const docsManifestPortalById = new Map(
  docsManifest.map((portal) => [portal.id, portal])
);

export function docsManifestPortalForRoute(route: string) {
  return docsManifest
    .filter(
      (portal) => route === portal.route || route.startsWith(portal.route + '/')
    )
    .sort((left, right) => right.route.length - left.route.length)[0];
}

export function normalizeDocsRoute(route: string) {
  const path = route.split(/[?#]/)[0] || '/docs';
  if (path === '/') return '/docs';
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function resolveDocsRoute(snapshot: {
  path?: string;
  matches?: readonly { path: string }[];
}) {
  const matched = snapshot.matches?.at(-1)?.path;
  return normalizeDocsRoute(matched ?? snapshot.path ?? '/docs');
}
