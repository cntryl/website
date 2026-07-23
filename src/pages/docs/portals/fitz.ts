import { definePortal } from '../define';
import type { DocsContentSection, DocsPageInput } from '../types';

function domainPage(
  id: string,
  title: string,
  description: string,
  model: string,
  uses: string,
  boundary: string,
  keywords: readonly string[]
): DocsPageInput {
  const content: readonly DocsContentSection[] = [
    {
      id: 'model',
      title: `${title} model`,
      paragraphs: [model],
    },
    {
      id: 'use-it-for',
      title: `Use ${title} for`,
      paragraphs: [uses],
    },
    {
      id: 'boundaries',
      title: 'Boundaries',
      paragraphs: [boundary],
    },
  ];
  return {
    path: `domains/${id}`,
    title,
    description,
    contract: model,
    practice: uses,
    boundary,
    keywords,
    content,
  };
}

export const fitzPortal = definePortal({
  id: 'fitz',
  label: 'Fitz',
  shortLabel: 'Fitz',
  kind: 'runtime',
  route: '/docs/fitz',
  description:
    'Messaging and coordination models behind one single-node broker boundary.',
  repository: 'https://github.com/cntryl/fitz',
  loader: () => import('../routes/fitz'),
  sections: [
    {
      id: 'server',
      label: 'Server',
      pages: [
        {
          path: '',
          title: 'Server Overview',
          description:
            'Understand the Fitz server, its seven domains, and the state that applications rebuild after reconnecting.',
          contract:
            'Fitz is a single-node application broker that exposes seven related communication and coordination domains through one route, identity, deployment, and operator model.',
          practice:
            'Run one broker process, connect through a supported client, and select the domain whose persistence and delivery model matches each application interaction.',
          boundary:
            'Fitz does not provide consensus or transparent failover. Sessions are ephemeral, and applications rebuild session-owned state after reconnecting.',
          keywords: ['server', 'broker', 'domains', 'single-node'],
          content: [
            {
              id: 'what-fitz-is',
              title: 'What Fitz is',
              paragraphs: [
                'Fitz is a single-node application broker. It provides Notice, Stream, KV, Queue, RPC, Lease, and Schedule through one route and identity model.',
              ],
            },
            {
              id: 'server-model',
              title: 'Server model',
              paragraphs: [
                'One broker process owns admission, routing, domain execution, persistence configuration, health probes, metrics, and resource limits. Supported TypeScript and Go clients connect application code to that server boundary.',
              ],
            },
            {
              id: 'choose-a-domain',
              title: 'Choose a domain',
              paragraphs: [
                'Use Notice for live awareness, Stream for durable history, KV for current state, Queue for background work, RPC for live execution, Lease for ownership, and Schedule for future timing intent.',
              ],
            },
            {
              id: 'server-boundaries',
              title: 'Server boundaries',
              paragraphs: [
                'Fitz is single-node. It does not provide consensus, transparent failover, or durable client sessions. Clients rebuild subscriptions, workers, leases, transactions, and resume positions after reconnecting.',
              ],
            },
          ],
        },
        {
          path: 'setup',
          title: 'Setup',
          description:
            'Start a local Fitz server, verify its health, and connect a supported application client.',
          contract:
            'The local path runs an anonymous broker with local storage and loopback-bound HTTP, WebSocket, TCP, and metrics ports.',
          practice:
            'Start the container, verify /healthz, then follow the matching fitz-ts or fitz-go client release to connect and complete one operation.',
          boundary:
            'Anonymous auth and workstation port mappings are development settings. Production setup requires explicit authentication, route families, storage, resource, and network configuration.',
          keywords: ['setup', 'Docker', 'healthz', 'fitz-ts', 'fitz-go'],
          content: [
            {
              id: 'start-the-server',
              title: 'Start the server',
              paragraphs: [
                'Run the published container with local storage and authentication disabled for a loopback-only development server.',
              ],
              code: `docker run --rm \\
  -p 127.0.0.1:4090:4090 \\
  -p 127.0.0.1:4091:4091 \\
  -p 127.0.0.1:9090:9090 \\
  -e FITZ_AUTH_REQUIRED=false \\
  -e FITZ_STORAGE_MODE=local \\
  -e FITZ_STORAGE_PATH=/data \\
  ghcr.io/cntryl/fitz:latest`,
            },
            {
              id: 'verify-health',
              title: 'Verify server health',
              paragraphs: [
                'The HTTP listener exposes health and readiness probes. Confirm health before connecting a client.',
              ],
              code: `curl http://localhost:4090/healthz`,
            },
            {
              id: 'connect-a-client',
              title: 'Connect a client',
              paragraphs: [
                'Use the TypeScript or Go client version that matches the server contract. Connect to ws://localhost:4090/ws for the WebSocket data plane or localhost:4091 for TCP.',
              ],
              table: {
                headers: ['Client', 'Source'],
                rows: [
                  ['TypeScript', 'https://github.com/cntryl/fitz-ts'],
                  ['Go', 'https://github.com/cntryl/fitz-go'],
                ],
              },
            },
            {
              id: 'production-boundary',
              title: 'Production boundary',
              paragraphs: [
                'Before a non-local deployment, configure authentication, allowed route families, storage durability, limits, probes, metrics, TLS termination, and recovery procedures.',
              ],
            },
          ],
        },
        {
          path: 'cloud',
          title: 'Cloud',
          description:
            'Configure Fitz storage for local or provider-backed operation and choose explicit cloud durability boundaries.',
          contract:
            'Fitz supports memory, local, and cloud storage modes. Cloud mode combines local cache state with provider-backed persistence and explicit acknowledgement behavior.',
          practice:
            'Choose a unique provider prefix, supply credentials through the deployment platform, set the intended cloud durability mode, and test restart recovery before serving traffic.',
          boundary:
            'Cloud storage does not change Fitz into a multi-node broker. External infrastructure still owns placement, restart, traffic routing, and failover.',
          keywords: ['cloud', 'storage', 'durability', 'provider', 'recovery'],
          content: [
            {
              id: 'storage-modes',
              title: 'Storage modes',
              paragraphs: [
                'FITZ_STORAGE_MODE selects memory, local, or cloud. Memory is ephemeral. Local persists to the configured filesystem path. Cloud uses a local cache plus provider-backed storage.',
              ],
              table: {
                headers: ['Mode', 'Use'],
                rows: [
                  ['memory', 'Ephemeral development and tests'],
                  ['local', 'Single-node filesystem persistence'],
                  ['cloud', 'Local cache with provider-backed persistence'],
                ],
              },
            },
            {
              id: 'cloud-configuration',
              title: 'Cloud configuration',
              paragraphs: [
                'Configure the provider, bucket or container, unique object prefix, credentials, local cache, and storage I/O timeout through the server environment owned by the deployment.',
              ],
            },
            {
              id: 'durability',
              title: 'Durability',
              paragraphs: [
                'FITZ_STORAGE_CLOUD_DURABILITY accepts background or strict for broker-selected durable cloud writes. Domain contracts and domain-specific write policies still decide whether a particular operation is durable.',
              ],
            },
            {
              id: 'cloud-boundaries',
              title: 'Cloud boundaries',
              paragraphs: [
                'Provider-backed storage preserves the single-node server model. It does not provide consensus, transparent failover, or durable session recovery. Test cache loss, provider recovery, and operator restart behavior explicitly.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'domains',
      label: 'Domains',
      pages: [
        domainPage(
          'notice',
          'Notice',
          'Use live ephemeral fanout for connected subscribers without replay or recovery claims.',
          'Notice publishes low-latency events to subscribers that are connected now. Subscription and delivery state remain session-owned and ephemeral.',
          'Use it for live awareness, lightweight change hints, invalidation signals, and current-process notifications.',
          'Notice has no durable history, replay, missed-message recovery, or delivery acknowledgement. Use Stream for history and Queue for durable work.',
          ['notice', 'fanout', 'subscription', 'ephemeral']
        ),
        domainPage(
          'stream',
          'Stream',
          'Use durable ordered append and replay for committed application history.',
          'Stream appends committed records to ordered durable history and lets clients read or resume from explicit offsets.',
          'Use it for rebuild, catch-up, audit history, deterministic rereads, and durable event sequences.',
          'Clients persist their own resume offsets. Live subscriptions are notifications, not broker-managed durable cursors. Stream is not a competing-consumer queue.',
          ['stream', 'append', 'replay', 'offset']
        ),
        domainPage(
          'kv',
          'KV',
          'Use transactional key-value resources for current authoritative state.',
          'KV stores the current committed value for keys within one resource scope. Open transactions are session-owned; committed state follows the selected write policy.',
          'Use it for configuration, current application state, compare-and-update workflows, and transactional key-value access.',
          'KV is current state, not immutable history. Use Stream when the sequence of changes must be durable and replayable.',
          ['KV', 'transaction', 'state', 'key-value']
        ),
        domainPage(
          'queue',
          'Queue',
          'Use durable competing-consumer delivery with reservation, retry, and redelivery.',
          'Queue stores work and lets consumers reserve, acknowledge, release, or redeliver items according to queue policy.',
          'Use it for background jobs, work backlog, bounded retries, competing consumers, and optional dead-letter handling.',
          'Queue owns work lifecycle, not broadcast fanout, immutable history, or live request-response. Delivery is not exactly once.',
          ['queue', 'work', 'reservation', 'redelivery']
        ),
        domainPage(
          'rpc',
          'RPC',
          'Use live request and response dispatch to workers that are connected now.',
          'RPC routes a request to a registered live worker and correlates response frames while the caller and worker sessions remain connected.',
          'Use it for interactive service execution, bounded live calls, and streaming responses from currently available workers.',
          'Pending calls and worker registrations are ephemeral. RPC is not a durable retry queue; use Queue when work must survive disconnect or restart.',
          ['RPC', 'request', 'response', 'worker']
        ),
        domainPage(
          'lease',
          'Lease',
          'Use single-broker ownership coordination with TTL expiry and fencing tokens.',
          'Lease grants time-bounded ownership inside one running broker and issues fencing tokens for application-level coordination.',
          'Use it for leader-like ownership, exclusive maintenance work, and coordination that can be reacquired after loss.',
          'Lease state is ephemeral and single-node. It is not distributed consensus, durable lock recovery, or a guarantee of KV or Queue correctness.',
          ['lease', 'ownership', 'TTL', 'fencing']
        ),
        domainPage(
          'schedule',
          'Schedule',
          'Use durable future timing intent without turning the broker into a workflow engine.',
          'Schedule stores definitions and pending fire claims when persistence is enabled, then emits work at the configured time through its delivery mode.',
          'Use it for delayed actions, recurring timing intent, and future delivery that can compose with Queue, Notice, or Stream.',
          'Schedule owns when an action becomes due, not workflow graphs or durable downstream completion. Pair it with Queue when fired work needs acknowledgement and retry.',
          ['schedule', 'timing', 'future work', 'delivery mode']
        ),
      ],
    },
  ],
});
