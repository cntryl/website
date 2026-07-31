import { definePortal } from '../define';
import type { DocsContentSection, DocsPageInput, DocsTable } from '../types';

type DomainId =
  | 'notice'
  | 'stream'
  | 'kv'
  | 'queue'
  | 'rpc'
  | 'lease'
  | 'schedule';

// Each domain page carries one sample per supported client language. Adding a
// language here and to every domainSamples entry adds a tab to all seven
// domain pages, so client usage stays on the domain that defines its behavior.
const clientLanguages = [
  {
    id: 'typescript',
    label: 'TypeScript',
    packageName: '@cntryl/fitz',
    repository: 'https://github.com/cntryl/fitz-ts',
    install: 'npm install @cntryl/fitz',
    host: 'browser and Node applications',
    lead: (title: string) =>
      `Use the TypeScript client from browser or Node application code. The ${title} surface follows the delivery and durability model described above.`,
  },
  {
    id: 'go',
    label: 'Go',
    packageName: 'github.com/cntryl/fitz-go',
    repository: 'https://github.com/cntryl/fitz-go',
    install: 'go get github.com/cntryl/fitz-go@latest',
    host: 'services and worker processes',
    lead: (title: string) =>
      `Use the Go client from a service or worker process. Context cancellation propagates to every ${title} call.`,
  },
  {
    id: 'csharp',
    label: 'C#',
    packageName: 'Cntryl.Fitz',
    repository: 'https://github.com/cntryl/fitz-dotnet',
    install: 'dotnet add package Cntryl.Fitz',
    host: '.NET applications and services',
    lead: (title: string) =>
      `Use the .NET client from an application or service. Await each ${title} operation and pass cancellation through long-running work.`,
  },
  {
    id: 'rust',
    label: 'Rust',
    packageName: 'cntryl-fitz',
    repository: 'https://github.com/cntryl/fitz-rs',
    install: 'cargo add cntryl-fitz',
    host: 'Tokio services and workers',
    lead: (title: string) =>
      `Use the Rust client from an async Tokio service. Keep the client connection alive and reacquire session-owned ${title} state after reconnecting.`,
  },
] as const;

type ClientLanguageId = (typeof clientLanguages)[number]['id'];
type AuthoredLanguageId = 'typescript' | 'go';

function typescriptSample(body: string) {
  return `import { createClient } from '@cntryl/fitz';

const client = await createClient({
  url: 'ws://localhost:4090/ws',
  tokenProvider: async () => process.env.FITZ_TOKEN ?? '',
});

await client.connect();

${body}

await client.close();`;
}

// Samples are authored with four-space indentation so they stay readable in this
// source file, then converted to the tabs gofmt produces before they are shown.
function tabIndent(source: string) {
  return source.replace(/^ +/gm, (spaces) => '\t'.repeat(spaces.length / 4));
}

function goSample(body: string, extraImports: readonly string[] = []) {
  const imports = [...new Set(['"context"', '"log"', ...extraImports])];
  return tabIndent(`package main

import (
    ${imports.join('\n    ')}

    "github.com/cntryl/fitz-go/fitz"
)

func main() {
    ctx := context.Background()

    client := fitz.NewClient("ws://localhost:4090/ws", func(context.Context) (string, error) {
        return "your-jwt-token", nil
    })
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

${body}
}`);
}

function csharpSample(body: string) {
  return `using Cntryl.Fitz;

await using var client = new Client(
    new ClientConfig(
        "ws://localhost:4090/ws",
        TokenProvider: _ => ValueTask.FromResult(Environment.GetEnvironmentVariable("FITZ_TOKEN") ?? "")
    )
);

await client.ConnectWhenReadyAsync();

${body}`;
}

function rustSample(body: string) {
  return `use cntryl_fitz::{Client, Result};

#[tokio::main]
async fn main() -> Result<()> {
    let client = Client::anonymous("ws://localhost:4090/ws")
        .build()?;
    client.connect().await?;

${body}

    client.close().await?;
    Ok(())
}`;
}

const domainSamples: Record<DomainId, Record<AuthoredLanguageId, string>> = {
  notice: {
    typescript: typescriptSample(`const notice = client.notice();
const route = 'notice://realm/app/orders';
const subscription = await notice.subscribe(route, (event) => {
  console.log(new TextDecoder().decode(event.body));
});
await notice.publish(route, new TextEncoder().encode('order-1091'));
await subscription.unsubscribe();`),
    go: goSample(`    notice := client.Notice()
    route := "notice://realm/app/orders"
    sub, err := notice.Subscribe(ctx, route, func(_ context.Context, msg fitz.NoticeMsg) error {
        log.Printf("%s", msg.Body)
        return nil
    })
    if err != nil {
        log.Fatal(err)
    }
    defer sub.Unsubscribe()

    if err := notice.Publish(ctx, route, []byte("order-1091")); err != nil {
        log.Fatal(err)
    }`),
  },
  stream: {
    typescript: typescriptSample(`const stream = client.stream();
const route = 'stream://realm/app/orders';
const session = await stream.begin(route);
await session.append(new TextEncoder().encode('order-1091'));
await session.commit('Sync');
const records = await stream.read(route, 0n, 100);
for (const record of records) {
  console.log(record.offset, new TextDecoder().decode(record.body));
}`),
    go: goSample(`    stream := client.Stream()
    route := "stream://realm/app/orders"
    session, err := stream.Begin(ctx, route)
    if err != nil {
        log.Fatal(err)
    }
    if err := session.Append(ctx, 0, []byte("order-1091")); err != nil {
        log.Fatal(err)
    }
    if err := session.Commit(ctx, fitz.StreamCommitSync); err != nil {
        log.Fatal(err)
    }
    records, err := stream.Read(ctx, route, 0, 100)
    if err != nil {
        log.Fatal(err)
    }
    for records.Next() {
        record := records.Value()
        log.Printf("%d %s", record.Offset, record.Payload)
    }
    if err := records.Err(); err != nil {
        log.Fatal(err)
    }
    records.Close()`),
  },
  kv: {
    typescript: typescriptSample(`const kv = client.kv();
const route = 'kv://realm/app/settings';
const tx = await kv.begin(route, { mode: 'ReadWrite', durability: 'Sync' });
const current = await tx.get(new TextEncoder().encode('theme'));
console.log(current.type === 'found' ? new TextDecoder().decode(current.value) : 'missing');
await tx.put(new TextEncoder().encode('theme'), new TextEncoder().encode('dark'));
await tx.commit();`),
    go: goSample(`    kv := client.KV()
    route := "kv://realm/app/settings"
    tx, err := kv.Begin(ctx, route, fitz.KVDurabilitySync)
    if err != nil {
        log.Fatal(err)
    }
    defer tx.Rollback(ctx)
    if _, err := tx.Get(ctx, []byte("theme")); err != nil {
        log.Fatal(err)
    }
    if err := tx.Put(ctx, []byte("theme"), []byte("dark")); err != nil {
        log.Fatal(err)
    }
    if err := tx.Commit(ctx); err != nil {
        log.Fatal(err)
    }`),
  },
  queue: {
    typescript: typescriptSample(`const queue = client.queue();
const route = 'queue://realm/app/emails';
await queue.enqueue(route, new TextEncoder().encode('welcome:user-42'));
const items = await queue.reserve(route, 30, 1, 30);
if (items[0]) {
  await items[0].complete();
}`),
    go: goSample(`    queue := client.Queue()
    route := "queue://realm/app/emails"
    if _, err := queue.Enqueue(ctx, route, []byte("welcome:user-42")); err != nil {
        log.Fatal(err)
    }
    items, err := queue.Reserve(ctx, route, 30, 1)
    if err != nil {
        log.Fatal(err)
    }
    if len(items) > 0 {
        if err := items[0].Complete(ctx); err != nil {
            log.Fatal(err)
        }
    }`),
  },
  rpc: {
    typescript: typescriptSample(`const rpc = client.rpc();
const route = 'rpc://realm/app/image/resize';
const responses = rpc.call(route, new TextEncoder().encode('asset-7'));
for await (const response of responses) {
  console.log(new TextDecoder().decode(response.body));
}`),
    go: goSample(`    rpc := client.RPC()
    route := "rpc://realm/app/image/resize"
    responses, err := rpc.Call(ctx, route, []byte("asset-7"))
    if err != nil {
        log.Fatal(err)
    }
    defer responses.Close()
    for responses.Next() {
        log.Printf("%s", responses.Value().Body)
    }`),
  },
  lease: {
    typescript: typescriptSample(`const lease = client.lease();
const route = 'lease://realm/app/nightly-compaction';
const held = await lease.acquire(route, 30);
if (held) {
  console.log('fencing token', held.token);
  await held.release();
}`),
    go: goSample(`    lease := client.Lease()
    held, err := lease.Acquire(ctx, "lease://realm/app/nightly-compaction", 30)
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("expires at %d", held.ExpiresAt)
    if err := held.Release(ctx); err != nil {
        log.Fatal(err)
    }`),
  },
  schedule: {
    typescript: typescriptSample(`const schedule = client.schedule();
const route = 'schedule://realm/app/reports/nightly';
await schedule.create(route, '* * * * *', 'single', new TextEncoder().encode('report:daily'));`),
    go: goSample(`    schedule := client.Schedule()
    _, err := schedule.Create(ctx, "schedule://realm/app/reports/nightly", "* * * * *", fitz.ScheduleDeliverySingle, []byte("report:daily"))
    if err != nil {
        log.Fatal(err)
    }`),
  },
};

const csharpBodies: Record<DomainId, string> = {
  notice: `var notice = client.Notice();
var route = "notice://realm/app/orders";
var subscription = await notice.SubscribeAsync(route, (message, _) => {
    Console.WriteLine($"notice bytes: {message.Body.Length}");
    return ValueTask.CompletedTask;
});
await notice.PublishAsync(route, "order-1091"u8.ToArray());
await subscription.UnsubscribeAsync();`,
  stream: `var stream = client.Stream();
var route = "stream://realm/app/orders";
var session = await stream.BeginAsync(route);
await session.AppendAsync(0, "order-1091"u8.ToArray());
await session.CommitAsync();
await foreach (var record in stream.ReadAsync(route, 0))
    Console.WriteLine($"{record.Offset}: {record.Body.Length} bytes");`,
  kv: `var tx = await client.Kv().BeginAsync("kv://realm/app/settings");
await tx.PutAsync("theme"u8.ToArray(), "dark"u8.ToArray());
await tx.CommitAsync();`,
  queue: `var queue = client.Queue();
var route = "queue://realm/app/emails";
await queue.EnqueueAsync(route, "welcome:user-42"u8.ToArray());
var items = await queue.ReserveAsync(route, 30, 1, 30);
if (items.Length > 0) await items[0].CompleteAsync();`,
  rpc: `var rpc = client.Rpc();
await foreach (var response in rpc.CallAsync("rpc://realm/app/image/resize", "asset-7"u8.ToArray()))
    Console.WriteLine($"response bytes: {response.Body.Length}");`,
  lease: `var lease = client.Lease();
var held = await lease.AcquireAsync("lease://realm/app/nightly", 30);
await held.ReleaseAsync();`,
  schedule: `var schedule = client.Schedule();
await schedule.CreateAsync("schedule://realm/app/reports/nightly", "* * * * *",
    Cntryl.Fitz.Abstractions.Domains.Schedule.ScheduleDeliveryMode.Single,
    "report:daily"u8.ToArray());`,
};

const rustBodies: Record<DomainId, string> = {
  notice: `let notice = client.notice();
notice.publish("notice://realm/app/orders", b"order-1091")?;`,
  stream: `let stream = client.stream();
let mut session = stream.begin("stream://realm/app/orders", None)?;
session.append(0, b"order-1091", None, None)?;
session.commit(cntryl_fitz::domains::stream::StreamCommitMode::Sync)?;`,
  kv: `let mut tx = client.kv().begin(
    "kv://realm/app/settings",
    cntryl_fitz::TransactionMode::ReadWrite,
)?;
tx.put(b"theme", b"dark")?;
tx.commit()?;`,
  queue: `let queue = client.queue();
queue.enqueue("queue://realm/app/emails", b"welcome:user-42", None)?;
let items = queue.reserve("queue://realm/app/emails", 30, 1)?;
if let Some(item) = items.first() {
    item.complete()?;
}`,
  rpc: `let rpc = client.rpc();
let mut responses = rpc.call("rpc://realm/app/image/resize", b"asset-7")?;
while let Some(response) = responses.next()? {
    println!("{} bytes", response.body.len());
}`,
  lease: `let lease = client.lease();
let held = lease.acquire("lease://realm/app/nightly", "worker-1", 30)?;
lease.release("lease://realm/app/nightly", "worker-1", held.fencing_token)?;`,
  schedule: `let schedule = client.schedule();
schedule.create("schedule://realm/app/reports/nightly", "* * * * *",
    cntryl_fitz::domains::schedule::ScheduleDeliveryMode::Single,
    b"report:daily")?;`,
};

function domainSample(id: DomainId, language: ClientLanguageId) {
  if (language === 'typescript' || language === 'go') {
    return domainSamples[id][language];
  }
  return language === 'csharp'
    ? csharpSample(csharpBodies[id])
    : rustSample(rustBodies[id]);
}

// One page owns installing and connecting every supported client. Per-operation
// usage stays on the domain pages, so a new language is added here and in
// domainSamples and needs no page of its own.
function clientsPage(): DocsPageInput {
  const content: readonly DocsContentSection[] = [
    {
      id: 'supported-clients',
      title: 'Supported clients',
      paragraphs: [
        'Each supported client connects application code to one broker and exposes the same seven domains. Client releases track the server wire protocol, so choose the client that matches the language your application already runs.',
      ],
      table: {
        headers: ['Language', 'Package', 'Runs in'],
        rows: clientLanguages.map((language) => [
          language.label,
          language.packageName,
          language.host,
        ]),
      },
      callout: {
        title: "TypeScript's TCP transport is Node-only",
        body: 'A browser application can only use the WebSocket transport; TCP is unavailable outside Node. Choose WebSocket up front if the same client code needs to run in a browser.',
      },
    },
    {
      id: 'install-client',
      title: 'Install a client',
      paragraphs: [
        'Choose one client, install it once, then connect during service startup. A single client instance manages one connection and exposes all seven domains — you do not create a separate client per domain.',
        'The domain pages use these same four language tabs for their operation examples, so the install below is the only setup step before any of them will run.',
      ],
      codeTabs: clientLanguages.map((language) => ({
        id: language.id,
        label: language.label,
        code: language.install,
      })),
    },
    {
      id: 'connection-lifecycle',
      title: 'Connection lifecycle',
      paragraphs: [
        'Every client owns startup, readiness, reconnect, and shutdown for one connection. Connect once during service startup and keep the client alive for the process lifetime; the client handles reconnecting on its own when the connection drops.',
        'What the client cannot do for you is restore your session. A reconnect establishes a brand-new session with a new session ID, and everything the previous session owned is gone on the broker side — even if the gap lasted milliseconds. Rebuilding that state is application work, and the right place for it is a connect handler that runs on every connect rather than setup code that runs once.',
        'Committed data is unaffected. The broker recovers KV values, Queue backlogs, Stream records, and Schedule definitions by itself; the table below covers only what you have to re-establish.',
        'Each client sends its own heartbeat to detect a dead connection before the transport would otherwise notice: by default it pings every 10 seconds and reconnects if no response arrives within 30 seconds. Idempotent reads — KV get/scan, Stream read/readPage/peek/metadata, and Lease query — are safely retried by the client on a dropped connection, and a Queue enqueue is retried only after the broker has explicitly rejected it as a transient failure. Everything else that mutates state — KV writes, Stream appends, Queue reservations and acknowledgements, Lease ownership changes, RPC calls, and Notice publishes — is never replayed automatically, because once a request is sent the client cannot tell whether the broker already applied it before the connection dropped.',
      ],
      table: {
        headers: ['After a reconnect, re-establish', 'Domain'],
        rows: [
          [
            'Subscriptions and watch patterns',
            'Notice, KV, Queue, Lease, Schedule',
          ],
          ['Worker registrations', 'RPC'],
          ['Open transactions (re-read, then re-apply)', 'KV'],
          ['Append sessions', 'Stream'],
          ['Held leases (reacquire; the fencing token changes)', 'Lease'],
          ['Read position, from an offset you stored', 'Stream'],
        ],
      },
      callout: {
        title: 'Retry is per domain, not per client',
        body: "Clients reconnect automatically, but they do not replay the operations that were in flight when the connection dropped. Whether an interrupted operation is safe to retry follows that domain's contract — a Queue item returns on its own when the visibility window lapses, while an RPC call must be reissued by the caller and may have already run.",
      },
    },
    {
      id: 'detecting-reconnects',
      title: 'Detecting a reconnect in code',
      paragraphs: [
        'The client reconnects on its own, but your code still has to notice it happened so the connect handler above can run again — each client reports connection-state changes rather than exposing a one-shot connected event, so wire the handler to whichever signal that language uses.',
      ],
      table: {
        headers: ['Client', 'How to detect a reconnect'],
        rows: [
          [
            'TypeScript',
            'onLifecycleEvent callback; check for a Reconnecting event',
          ],
          [
            'Go',
            'WithLifecycleHandler(func(LifecycleEvent)) option, or poll Client.State()',
          ],
          ['C#', 'FitzConnection.OnReconnect(listener), registered once'],
          ['Rust', 'Connection::subscribe_state() watch channel, or state()'],
        ],
      },
    },
    {
      id: 'error-handling',
      title: 'Handling errors',
      paragraphs: [
        "Every domain call can fail, and each client turns the wire status byte and numeric code into a typed error instead of a bare number: a base error for transport, connection, authentication, and timeout failures, plus one typed error per domain (KV, Queue, Notice, RPC, Lease, Stream, Schedule) carrying that domain's code and message. Match on the concrete error type or code, not on a parsed string.",
        'Each client also exposes a retryability check that reflects the same per-domain contract described throughout these docs — a Queue item that timed out waiting for a worker is retryable, an RPC call that already reached the worker is not.',
      ],
      codeTabs: [
        {
          id: 'typescript',
          label: 'TypeScript',
          code: "import { KvError, isRetryable } from '@cntryl/fitz';\n\ntry {\n  await kv.get('key');\n} catch (err) {\n  if (err instanceof KvError) {\n    console.error(err.code, err.domainCode, isRetryable(err));\n  }\n}",
        },
        {
          id: 'go',
          label: 'Go',
          code: 'var de *fitz.DomainError\nif _, err := kv.Get(ctx, "key"); errors.As(err, &de) && de.Code() == fitz.ErrCodeKvKeyNotFound {\n\t// handle missing key\n} else if fitz.IsRetryable(err) {\n\t// retry\n}',
        },
        {
          id: 'csharp',
          label: 'C#',
          code: 'try\n{\n    await kv.GetAsync("key");\n}\ncatch (KvException ex) when (ex.Code == "KEY_NOT_FOUND")\n{\n    // handle missing key\n}\ncatch (KvException ex) when (Retryability.IsRetryable(ex))\n{\n    // retry\n}',
        },
        {
          id: 'rust',
          label: 'Rust',
          code: 'match client.kv().get("key").await {\n    Err(FitzError::Domain { code, message }) => eprintln!("domain error {code}: {message}"),\n    Err(e) if e.is_retryable() => { /* retry */ }\n    Ok(v) => { /* ... */ }\n    Err(e) => return Err(e),\n}',
        },
      ],
    },
    {
      id: 'compatibility-and-conformance',
      title: 'Compatibility and conformance',
      paragraphs: [
        'All four clients are verified against one shared conformance suite, so a domain behaves the same way regardless of the language calling it. Where the examples differ across tabs, the difference is language idiom — async iteration, context cancellation, disposal — and not a difference in what the broker does.',
        'Clients track the server wire protocol, so pin the client release against the server version it connects to and upgrade them together. The Wire Protocol page documents the framing itself if you need to reason about compatibility directly.',
      ],
    },
  ];
  return {
    path: 'clients',
    title: 'Clients',
    description:
      'Install and connect a supported client, then use the domain pages for per-domain behavior.',
    keywords: [...clientLanguages.map((language) => language.label), 'client'],
    content,
  };
}

// Every domain page answers the same five questions in the same order, so a
// reader comparing two domains can scan the equivalent section in each. The
// facts table repeats the route/session rules from Concepts and Routes on the
// page where a developer actually needs them.
type DomainFacts = {
  messageTypes: string;
  routeShape: string;
  wildcards: string;
  durableState: string;
  lostOnDisconnect: string;
  recoveryOwner: string;
};

type DomainDetail = {
  model: readonly string[];
  facts: DomainFacts;
  operations: DocsTable;
  useFor: readonly string[];
  instead: DocsTable;
  callout?: { title: string; body: string };
};

function domainPage(
  id: DomainId,
  title: string,
  description: string,
  boundary: string,
  keywords: readonly string[],
  detail: DomainDetail
): DocsPageInput {
  const content: readonly DocsContentSection[] = [
    {
      id: 'model',
      title: `${title} model`,
      paragraphs: detail.model,
      table: {
        headers: ['Property', 'Value'],
        rows: [
          ['MessageType range', detail.facts.messageTypes],
          ['Route shape', detail.facts.routeShape],
          ['Wildcards', detail.facts.wildcards],
          ['Durable state', detail.facts.durableState],
          ['Lost on disconnect', detail.facts.lostOnDisconnect],
          ['Recovery owner', detail.facts.recoveryOwner],
        ],
      },
      ...(detail.callout ? { callout: detail.callout } : {}),
    },
    {
      id: 'operations',
      title: 'Operations',
      paragraphs: [
        `These are the ${title} operations a client calls. Every one is addressed by a route and dispatched by MessageType, and every one is subject to the permission check resolved from the connection's identity at CONNECT time.`,
      ],
      table: detail.operations,
    },
    {
      id: 'use-it-for',
      title: `Use ${title} for`,
      paragraphs: detail.useFor,
    },
    {
      id: 'boundaries',
      title: 'Boundaries',
      paragraphs: [
        boundary,
        `Each ${title} domain contract is complete on its own. Applications may use another domain alongside it when they need a separate guarantee, but no domain is required to make ${title} work. The table below maps the cases that come up most often.`,
      ],
      table: detail.instead,
    },
    {
      id: 'client-examples',
      title: 'Client examples',
      paragraphs: [
        'The same domain operation is shown for each supported client. Select a language before copying the example; routes and payloads are illustrative and should match the realm and resource names in your deployment.',
      ],
      codeTabs: clientLanguages.map((language) => ({
        id: language.id,
        label: language.label,
        code: `${language.lead(title)}\n\n${domainSample(id, language.id)}`,
      })),
    },
  ];
  return {
    path: `domains/${id}`,
    title,
    description,
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
      label: 'Start here',
      pages: [
        {
          path: '',
          title: 'Server Overview',
          description:
            'Understand the Fitz server, its seven domains, and the state that applications rebuild after reconnecting.',
          keywords: ['server', 'broker', 'domains', 'single-node'],
          content: [
            {
              id: 'what-fitz-is',
              title: 'What Fitz is',
              paragraphs: [
                'Fitz is a single-node application broker. It runs as one process that your services connect to over WebSocket or TCP, and it gives them seven ways to communicate and coordinate — Notice, Stream, KV, Queue, RPC, Lease, and Schedule — behind one route model, one identity model, and one set of operational controls.',
                "The reason those seven live together is that most applications need several of them and would otherwise run a message broker, a cache, a job queue, and a scheduler side by side. Fitz consolidates the infrastructure without blurring the guarantees: each domain owns exactly one class of guarantee and never quietly inherits another's.",
                'Everything is addressed the same way, with a route shaped `{scheme}://{realm}/{area}/{resource}`. The durable domains persist through Midge, the same embedded storage engine Cassie uses, so there is no second storage system to operate.',
              ],
            },
            {
              id: 'choose-a-domain',
              title: 'Choose a domain',
              paragraphs: [
                'Picking the right domain is the main design decision when adopting Fitz, and the question that settles it is what happens if a message is missed. If missing it is fine, Notice is enough. If a consumer must be able to catch up, Stream. If work must happen even when nobody is listening, Queue.',
                'Each domain stands on its own and provides its stated guarantee without another domain. An application may use more than one when it independently needs more than one guarantee — for example, it can use Schedule for timing intent and Queue for durable work — but neither domain is a prerequisite for the other.',
              ],
              table: {
                headers: ['Domain', 'Use it for', 'Durable'],
                rows: [
                  [
                    'Notice',
                    'Live awareness — invalidation hints, presence, progress',
                    'No',
                  ],
                  [
                    'Stream',
                    'Durable ordered history that consumers replay from an offset',
                    'Yes',
                  ],
                  [
                    'KV',
                    'Current authoritative state, read and written transactionally',
                    'Yes',
                  ],
                  [
                    'Queue',
                    'Background work split across competing consumers, with retry',
                    'Yes',
                  ],
                  [
                    'RPC',
                    'Live request and response against a connected worker',
                    'No',
                  ],
                  [
                    'Lease',
                    'Ownership and fencing — which process is the one doing this',
                    'No',
                  ],
                  [
                    'Schedule',
                    'Future and recurring timing intent',
                    'Yes, when persistence is enabled',
                  ],
                ],
              },
            },
            {
              id: 'server-boundaries',
              title: 'What Fitz does not do',
              paragraphs: [
                'Fitz is single-node by design. There is no consensus, no replication, and no transparent failover — one broker process owns admission, routing, domain execution, persistence, probes, metrics, and limits. Plan availability around that: a broker restart is a visible event to every connected client.',
                'Sessions are ephemeral, and this is the single most important thing to understand before writing client code. A session exists only for the life of one connection, and a reconnect creates a brand-new session rather than resuming the old one. Subscriptions, open KV transactions, Stream append sessions, held leases, and RPC worker registrations are all gone, even if the reconnect takes milliseconds.',
                "What survives is committed data, not session state. The broker recovers KV values, Queue backlogs, Stream records, and Schedule definitions on its own; everything session-owned is your application's job to rebuild in its reconnect handler.",
              ],
              callout: {
                title: 'Write the reconnect handler first',
                body: 'The most common way to get Fitz wrong is to subscribe and register once at startup and assume it holds. Re-subscribe, re-register workers, re-begin transactions, and reacquire leases on every connect — not just the first — and resume streams from offsets your application stored itself.',
              },
            },
            {
              id: 'where-to-go-next',
              title: 'Where to go next',
              paragraphs: [
                'Getting Started runs a local broker and connects a client end to end. After that, Concepts and Routes is worth reading once in full — the route shape, the RouteFamily and realm isolation axes, and the session lifecycle are assumed by every other page.',
                'From there, read the page for the domain you are adopting, then the Operations section when you move past a local server.',
              ],
              table: {
                headers: ['Question', 'Page'],
                rows: [
                  ['How do I run one and connect to it?', 'Getting Started'],
                  [
                    'How are routes and sessions structured?',
                    'Concepts and Routes',
                  ],
                  ['How do I install a client for my language?', 'Clients'],
                  ['What exactly survives a restart?', 'Durability'],
                  [
                    'How do I secure a non-local deployment?',
                    'Authentication, Security',
                  ],
                  [
                    'How do I run it in production?',
                    'Deployment, Operator Runbook',
                  ],
                  ['What do I monitor?', 'Observability'],
                  [
                    'Something is failing — what does it mean?',
                    'Troubleshooting',
                  ],
                ],
              },
            },
          ],
        },
        {
          path: 'getting-started',
          title: 'Getting Started',
          description:
            'Start a local Fitz server, verify its health, and connect a supported application client.',
          keywords: ['setup', 'Docker', 'healthz', 'fitz-ts', 'fitz-go'],
          content: [
            {
              id: 'start-the-server',
              title: 'Start the server',
              paragraphs: [
                'Run the published container with local storage and authentication disabled. Every port is bound to 127.0.0.1, so this server is reachable only from your workstation.',
                'The three ports map to three listeners: 4090 serves HTTP (health probes) and the WebSocket data plane at /ws, 4091 serves the TCP data plane, and 9090 serves metrics. A client needs 4090 or 4091; the other two are for you.',
                'FITZ_AUTH_REQUIRED=false is what makes this a one-command start — it skips JWT verification and treats every connection as anonymous, assigning RouteFamily 1 to all of them. That is a development-only setting, and it is the first thing to change before this server is reachable by anything else.',
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
                'Confirm the broker is up before pointing a client at it. The HTTP listener exposes health and readiness separately: /healthz reports that the process is alive, while readiness reports that it is prepared to accept work — storage opened, listeners bound.',
                'If this call fails, the problem is the server or the port mapping, not your client. Check the container logs before going further.',
              ],
              code: `curl http://localhost:4090/healthz`,
            },
            {
              id: 'connect-a-client',
              title: 'Connect a client',
              paragraphs: [
                'Install the client for your language and point it at ws://localhost:4090/ws for WebSocket, or localhost:4091 for TCP. Match the client release to the server version it connects to — clients track the wire protocol.',
                'Connecting sends CONNECT as the first message on the connection, which establishes the session that every later request is checked against. With auth disabled the token is ignored, so an empty or throwaway value is fine here and only here.',
              ],
              table: {
                headers: ['Client', 'Install', 'Source'],
                rows: clientLanguages.map((language) => [
                  language.label,
                  language.install,
                  language.repository,
                ]),
              },
            },
            {
              id: 'first-operation',
              title: 'Run one operation',
              paragraphs: [
                'Publish and subscribe on a Notice route to prove the round trip works. Notice is the right first thing to try because it needs no storage configuration and no cleanup — subscribe, publish, and the event arrives at the handler.',
                'Note the ordering: subscribe before you publish. Notice delivers only to subscribers connected at the moment of the publish, so a publish sent first reaches nobody and looks like a failure that is not one.',
                'Once that works, the Domains pages show the same round trip for each of the other six, in all four client languages.',
              ],
              codeTabs: clientLanguages.map((language) => ({
                id: language.id,
                label: language.label,
                code: domainSample('notice', language.id),
              })),
            },
            {
              id: 'production-boundary',
              title: 'Before you deploy this',
              paragraphs: [
                'The configuration above is a development server, and two of its settings are actively unsafe elsewhere: authentication is disabled, and storage is a container-local path that disappears with the container. Neither is a default to carry forward.',
                'Work through the checklist below before a non-local deployment. Each row points at the page that covers it in full.',
              ],
              table: {
                headers: ['Change', 'Why', 'Page'],
                rows: [
                  [
                    'Require authentication and issue JWTs',
                    'Anonymous mode puts every connection in one RouteFamily with no isolation between tenants',
                    'Authentication',
                  ],
                  [
                    'Configure route families and permissions',
                    'RouteFamily is the hard isolation boundary; realm alone is just a naming convention',
                    'Security',
                  ],
                  [
                    'Choose storage location and durability',
                    'A container-local path loses every durable domain when the container exits',
                    'Storage, Durability',
                  ],
                  [
                    'Set resource limits',
                    'Bounds connection, message, and per-domain resource consumption before a client can exhaust the broker',
                    'Resource Limits',
                  ],
                  [
                    'Terminate TLS in front of the broker',
                    'The data plane carries JWTs and payloads that should not cross a network in the clear',
                    'Deployment, Security',
                  ],
                  [
                    'Wire probes and metrics to your monitoring',
                    'Single-node means a restart is visible to clients; you want to know first',
                    'Observability',
                  ],
                ],
              },
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
          path: 'concepts-and-routes',
          title: 'Concepts and Routes',
          description:
            'Understand routes, resources, sessions, identities, domains, and delivery boundaries across Fitz.',
          keywords: ['route', 'resource', 'session'],
          content: [
            {
              id: 'route-model',
              title: 'Route model',
              paragraphs: [
                "Every Fitz route follows `{scheme}://{realm}/{area}/{resource}[/{operation}]`, but the scheme (`kv`, `queue`, `notice`, and so on) is advisory only — the broker never parses it to decide behavior. Domain dispatch is driven by the request's domain, one of the seven above, each with its own segment rule for the realm/area/resource(/operation) route.",
                'Use the route to name the realm, area, and resource (plus an operation segment for RPC and Schedule) that a request addresses. Route shape — segment count, wildcard placement, and overall size — is validated before permission checks or domain dispatch run, so a malformed route is rejected up front rather than partway through a domain actor.',
                "A route is bounded independent of domain: at most 4096 bytes and 64 non-empty path segments. Clients may validate routes locally for their own ergonomics, but the broker's check is authoritative and a client cannot treat its own validation as a substitute for the server-side rejection. See Wire Protocol for how routes and domains map to the numeric MessageType values on the wire.",
              ],
              table: {
                headers: ['Domain', 'Route Segments', 'Operation Placement'],
                rows: [
                  [
                    'KV',
                    'Exactly 3 (realm/area/resource)',
                    'Message type, not route',
                  ],
                  ['Queue', '3+, trailing ignored', 'Message type, not route'],
                  [
                    'RPC',
                    'Any (opaque string)',
                    'Route path (e.g. .../operation)',
                  ],
                  [
                    'Lease',
                    '3+, trailing ignored',
                    'Message type; optional route suffix',
                  ],
                  [
                    'Notice',
                    'Any (opaque, wildcards allowed)',
                    'Route path (event segment)',
                  ],
                  [
                    'Stream',
                    '3+ (realm/area/resource)',
                    'Message type, not route',
                  ],
                  [
                    'Schedule',
                    'Exactly 4 (realm/area/resource/operation)',
                    'Route path, required',
                  ],
                ],
              },
            },
            {
              id: 'resources',
              title: 'Resources',
              paragraphs: [
                'The `resource` segment names one entity, Queue, Stream, or lock inside an area, but how strictly it is parsed depends on the domain. KV and Schedule enforce an exact segment count — KV rejects any route that is not exactly `realm/area/resource`, and Schedule requires exactly `realm/area/resource/operation` — while Queue, Lease, and Stream accept three or more segments and silently ignore anything past the third.',
                "RPC and Notice never parse a resource out at all: both store the route as an opaque string, so RPC's trailing segments are just business-logic path components, and Notice's segments after `resource` (the `event`) participate in `*`/`**` wildcard subscription matching instead of a fixed schema.",
                "For the structured domains, authorization canonicalizes on the resource, not the literal request string: `queue://acme/jobs/email/receive` is authorized as `queue://acme/jobs/email`, and `stream://acme/events/orders/append` is authorized as `stream://acme/events/orders`. Extra segments beyond a domain's resource depth carry no authorization meaning outside RPC and Notice.",
              ],
              table: {
                headers: [
                  'Domain',
                  'Segment Rule',
                  'Extra Segments',
                  'Wildcard Resource Segments',
                ],
                rows: [
                  [
                    'KV',
                    'Exactly 3',
                    'Rejected before dispatch',
                    'None for BEGIN/GET/PUT and other data ops; SUBSCRIBE/UNSUBSCRIBE watch patterns accept * and **',
                  ],
                  [
                    'Queue',
                    '3 or more',
                    'Ignored, canonicalized away',
                    'None for ENQUEUE/RESERVE and other work ops; WATCH/UNWATCH availability patterns accept * and **',
                  ],
                  [
                    'RPC',
                    'Any',
                    'N/A — whole string is the identity',
                    'None — worker registration and requests use exact routes only',
                  ],
                  [
                    'Lease',
                    '3 or more',
                    'Ignored, canonicalized away',
                    'None for ACQUIRE/RENEW/RELEASE/QUERY; SUBSCRIBE/UNSUBSCRIBE watch patterns accept * and **',
                  ],
                  [
                    'Notice',
                    'Any',
                    'N/A — opaque string',
                    '* and ** in subscriptions; publishes must be exact',
                  ],
                  [
                    'Stream',
                    '3 or more',
                    'N/A — fixed depth',
                    '* for area/realm-level reads and subscriptions only, never appends',
                  ],
                  [
                    'Schedule',
                    'Exactly 4',
                    'Rejected before dispatch',
                    'None — every operation, including SUBSCRIBE, requires an exact route',
                  ],
                ],
              },
              code: 'kv://acme/app              # too few segments — rejected\nkv://acme/app/users/extra  # extra segment — rejected, KV has no operation in the route\nqueue://acme/tasks/work/v2 # extra segment — accepted, canonicalized to queue://acme/tasks/work',
            },
            {
              id: 'sessions-and-identity',
              title: 'Sessions and identity',
              paragraphs: [
                "A session exists only for the lifetime of one connection. After a client sends CONNECT, the broker assigns an internal session ID, resolves a RouteFamily from the JWT's identity context through server-side configuration (or, in anonymous mode, assigns RouteFamily 1 to every connection), and tracks that session's active subscriptions, transactions, worker registrations, and leases against it.",
                'Identity resolves along two axes that never substitute for each other: RouteFamily is a broker-internal numeric value the server resolves from the JWT, giving hard, column-family-level isolation — `RouteFamily.id()` maps 1:1 to a `ColumnFamilyId`, and `RouteFamily=0` is forbidden for persistent domains. `realm` is just an opaque, application-chosen string segment in the route path with no infrastructure meaning of its own, and the identical realm string can legitimately appear under different RouteFamilies.',
                'Disconnect destroys every piece of session-owned state at once — subscriptions, open KV transactions, Stream append sessions, held leases, RPC worker registrations, and pending RPC requests are all dropped or rolled back — and reconnecting does not resume it: a new CONNECT gets a new session ID, the previous one is permanently invalid, and the application must explicitly re-subscribe, re-begin, and re-register everything it needs.',
              ],
              table: {
                headers: [
                  'Domain',
                  'Live State Lost On Disconnect',
                  'Recovery Owner',
                ],
                rows: [
                  [
                    'Notice',
                    'subscriptions and delivery state',
                    'Client re-subscribes',
                  ],
                  [
                    'Stream',
                    'append sessions and live subscriptions',
                    'Client resumes from its own offsets',
                  ],
                  [
                    'KV',
                    'open transactions and live locks',
                    'Broker recovers committed state; client restarts transactions',
                  ],
                  [
                    'Queue',
                    'inflight ownership, tokens, warm actors',
                    'Broker recovers durable backlog; client handles redelivery',
                  ],
                  [
                    'RPC',
                    'workers, pending requests, reply routing',
                    'Caller and worker retry explicitly',
                  ],
                  [
                    'Lease',
                    'ownership, fencing tokens, waiters',
                    'Client reacquires',
                  ],
                  [
                    'Schedule',
                    'live subscriptions',
                    'Broker reloads timing intent; client rebuilds subscriptions',
                  ],
                ],
              },
              callout: {
                title: 'Reconnect is not resume',
                body: 'A reconnect is a brand-new session with a brand-new session ID, not a continuation of the old one. Nothing session-owned — subscriptions, worker registrations, held leases, or open transactions — survives across the gap, even if the client reconnects within milliseconds; only the domains with independent durable state (KV, Queue, Stream, Schedule) let the broker recover anything, and what it recovers is the committed data, never the session itself.',
              },
            },
            {
              id: 'domain-boundaries',
              title: 'Domain boundaries',
              paragraphs: [
                'Fitz is organized into seven domains — Notice, Stream, KV, Queue, RPC, Lease, and Schedule — each occupying its own exclusive 100-code MessageType block and each owning exactly one class of guarantee: live fanout, durable replay, current state, work delivery, live execution, ownership, or timing intent.',
                'Pick a domain by the guarantee the workflow actually needs: ephemeral live fanout signals go to Notice, durable history to Stream, current authoritative state to KV, background work to Queue, live request/response to RPC, ownership or fencing to Lease, and future timing intent to Schedule. Each choice is independently usable; select more than one only when the application separately needs more than one guarantee.',
                "Domains never inherit one another's guarantees or require one another to function. An application can publish a Notice signal, append a Stream record, or commit a KV value as independent operations; a Notice signal is not Stream history, a Stream subscription is not Notice fanout, and a KV commit does not become an event unless application code explicitly records one. All of this runs inside one broker process — RouteFamily and realm give isolation and namespacing within it, not across machines, and the durable domains persist through Midge's LSM storage rather than any external replica.",
              ],
              table: {
                headers: ['Domain', 'Owns', 'Durable State'],
                rows: [
                  ['Notice', 'Live fanout to connected subscribers', 'None'],
                  [
                    'Stream',
                    'Durable append and replay',
                    'Committed records, offsets, watermarks',
                  ],
                  ['KV', 'Current authoritative state', 'Committed values'],
                  [
                    'Queue',
                    'Work delivery with reservation and redelivery',
                    'Messages/indexes reaching durable storage under the selected write policy',
                  ],
                  ['RPC', 'Live request and response dispatch', 'None'],
                  ['Lease', 'Single-broker ownership coordination', 'None'],
                  [
                    'Schedule',
                    'Durable timing intent',
                    'Definitions and pending fire claims, when persistence is enabled',
                  ],
                ],
              },
            },
          ],
        },
        {
          path: 'authentication',
          title: 'Authentication',
          description:
            'Authenticate clients and administrators, authorize route families, and rotate credentials.',
          keywords: ['auth', 'token', 'route family'],
          content: [
            {
              id: 'authentication-model',
              title: 'Authentication model',
              paragraphs: [
                'Fitz authenticates a connection exactly once, at the wire level: the first Fitz message a client sends on a new WebSocket or TCP connection must be CONNECT with a compact JWT as its entire payload, and every domain request that follows on that connection is checked against the identity and permissions resolved from that single token. FITZ_AUTH_REQUIRED controls whether that check happens at all — true, the default, requires a valid JWT and closes the connection the moment a token is missing or fails verification, while false skips verification entirely and treats the connection as anonymous.',
                "Use FITZ_AUTH_REQUIRED=true for any deployment that terminates real client, browser, or service traffic, and reserve false for local development where standing up an identity provider isn't worth it. Anonymous mode doesn't ask which tenant a connection belongs to: it resolves every session to the fixed internal route family 1 and grants a permission set with unrestricted read, write, and all-access across the kv, stream, queue, notice, rpc, lease, and schedule domains, so it has no place on a network reachable by anyone outside the operator.",
                "CONNECT only establishes who a token belongs to; it does not itself decide whether that identity may run a particular kv, queue, notice, rpc, lease, schedule, or stream operation, and Fitz's auth code deliberately keeps route matching and domain-specific checks out of the verification path — those checks run per request against the permission set CONNECT resolved, as covered under route authorization.",
              ],
              table: {
                headers: [
                  'Mode',
                  'Route family',
                  'Permissions granted',
                  'Invalid or missing JWT',
                ],
                rows: [
                  [
                    'true (default)',
                    'Resolved per connection from the verified identity claim via FITZ_ROUTE_FAMILY_MAP',
                    "Exactly the permission strings the token's claim source encodes",
                    'Broker closes the connection immediately; there is no CONNECT_OK response to wait for',
                  ],
                  [
                    'false',
                    'Always the fixed internal family 1',
                    'Full read/write/all access across kv, stream, queue, notice, rpc, lease, and schedule routes',
                    'Not applicable — no token is checked',
                  ],
                ],
              },
              code: 'CONNECT must be the first Fitz message on a new connection, carrying the JWT as its full payload:\n\n[MessageType=1][Length=N][jwt bytes]\n\nFitz uses silent success: a still-open connection means CONNECT succeeded; a closed connection (optionally with a "connect failed: <reason>" close reason) means it did not.',
            },
            {
              id: 'client-credentials',
              title: 'Client credentials',
              paragraphs: [
                "Fitz verifies the CONNECT JWT's signature one of two ways: JWKS-based verification against FITZ_JWT_JWKS_MAP, an issuer=jwks_url map restricted to absolute HTTPS URLs by default, or a single shared HS256 secret in FITZ_JWT_HMAC_SECRET. JWKS is the documented runtime verification mode for real traffic; the HMAC secret is a local-development fallback that Fitz's own compose.yml and compose.cloud.yml files use by default so docker compose up has a working token flow without an identity provider.",
                "Configure FITZ_JWT_AUDIENCES (or the single-value fallback FITZ_JWT_AUDIENCE) with the audience string your issuer stamps into tokens — Fitz checks it against both verification modes and rejects a token whose aud doesn't intersect the allowlist. JWKS downloads are bounded: they run over HTTPS only unless FITZ_JWT_ALLOW_INSECURE_HTTP=true is set for a local mock issuer, and are pulled through a shared, time- and size-limited cache with coalesced refreshes, so a missing key ID doesn't turn into an unbounded fetch against the identity provider on every connection.",
                "Fitz's auth code only checks signatures and normalizes claims — it has no built-in identity provider, user store, or client-registration API, so issuing tokens, managing client secrets, and running the OAuth or OIDC flow that produces the JWT stay entirely the identity provider's and the calling application's job.",
              ],
              table: {
                headers: ['Verification method', 'Configuration', 'Scope'],
                rows: [
                  [
                    'JWKS (asymmetric)',
                    'FITZ_JWT_JWKS_MAP=issuer=jwks_url[,issuer=jwks_url...], HTTPS only by default',
                    'Runtime verification path documented for real traffic; one JWKS URL per accepted issuer',
                  ],
                  [
                    'HMAC (shared secret)',
                    'FITZ_JWT_HMAC_SECRET=<secret>, used only when no JWKS map is configured',
                    "Local-development fallback; the default in the repo's own compose.yml and compose.cloud.yml",
                  ],
                  [
                    'Audience allowlist',
                    'FITZ_JWT_AUDIENCES=fitz,fitz-broker (default) or single-value FITZ_JWT_AUDIENCE',
                    'Applies to both verification methods; token aud must intersect this list',
                  ],
                ],
              },
              code: 'FITZ_AUTH_REQUIRED=true\nFITZ_JWT_JWKS_MAP=https://idp.example=https://idp.example/.well-known/jwks.json\nFITZ_JWT_AUDIENCES=fitz\nFITZ_ROUTE_FAMILIES=1\nFITZ_ROUTE_FAMILY_MAP=acme=1',
              callout: {
                title: 'HMAC secret is a local-only fallback',
                body: 'FITZ_JWT_HMAC_SECRET exists so a fresh checkout has a working CONNECT flow without an identity provider — it is not a scoped-down JWKS. The shared secret carries no per-issuer scoping, no key rotation, and no revocation path, so the documented baseline for real traffic configures FITZ_JWT_JWKS_MAP and leaves FITZ_JWT_HMAC_SECRET unset.',
              },
            },
            {
              id: 'route-authorization',
              title: 'Route authorization',
              paragraphs: [
                "Route authorization runs in two stages after CONNECT succeeds: identity resolution assigns the connection to exactly one numeric route family, then every request is checked against route-shaped permission strings scoped to realms inside that family. Family resolution reads an identity claim from the verified token — FITZ_AUTH_ORG_CLAIM if it's configured and present, otherwise FITZ_ROUTE_FAMILY_CLAIM, which defaults to tid — and looks its value up in the explicit FITZ_ROUTE_FAMILY_MAP allowlist; a claim value absent from that map, or a family absent from FITZ_ROUTE_FAMILIES, fails CONNECT outright rather than falling back to a default family.",
                "Bind each tenant or environment identifier your identity provider emits — an Auth0 org_id, for example — to one of the numeric families listed in FITZ_ROUTE_FAMILIES through FITZ_ROUTE_FAMILY_MAP, and reach for the claim overrides (FITZ_AUTH_ORG_CLAIM, FITZ_AUTH_CUSTOM_CLAIM, FITZ_AUTH_PERMISSIONS_CLAIM, FITZ_AUTH_ROLE_CLAIM) only when your provider emits namespaced or role-shaped claims instead of Fitz's default names. Once identity resolves, Fitz reads permission strings from the first source present in a fixed precedence order, so a token carrying both a custom claim and top-level permissions always resolves permissions from the custom claim.",
                'Within a family, permission strings are prefix patterns of the form {scheme}://{realm}/**#access — for example notice://prod/orders/**#read or kv://prod/**#write — where #read, #write, or #* set the access level and ** matches everything beneath that path. Realm comparison inside the match is strict, case-sensitive string equality with no fuzzy or prefix-based realm inference, so isolation between tenants depends entirely on realms and route families being assigned correctly upstream, and Fitz has no way to grant a broad prefix while denying a narrower path underneath it.',
              ],
              table: {
                headers: [
                  'Order',
                  'Permission source',
                  'Configuration',
                  'Notes',
                ],
                rows: [
                  [
                    '1',
                    'Custom claim object',
                    'FITZ_AUTH_CUSTOM_CLAIM',
                    'Namespaced claim holding a permissions array; checked first when configured',
                  ],
                  [
                    '2',
                    'Top-level permissions',
                    'permissions (token top-level array)',
                    "Fitz's documented default shape, used in the Auth0 setup",
                  ],
                  [
                    '3',
                    'Permissions claim',
                    'FITZ_AUTH_PERMISSIONS_CLAIM',
                    'Namespaced array claim, checked when top-level permissions is absent',
                  ],
                  [
                    '4',
                    'Role claim',
                    'FITZ_AUTH_ROLE_CLAIM (default roles)',
                    'Accepts already-normalized Fitz permissions or recognized coarse scopes',
                  ],
                  [
                    '5',
                    'scp claim',
                    'scp',
                    'Standard OAuth2 client-credentials scope claim',
                  ],
                  [
                    '6',
                    'scope claim',
                    'scope',
                    'Checked last, after every other source is absent',
                  ],
                ],
              },
              code: 'notice://prod/orders/**#read\nkv://prod/**#write',
              callout: {
                title: 'FITZ_AUTH_ALLOW_JWT_ROUTE_FAMILY is removed',
                body: 'This variable no longer exists and is rejected at startup — a broker configured with it refuses to boot. Use FITZ_ROUTE_FAMILY_MAP and the claim-based mapping above instead.',
              },
            },
            {
              id: 'credential-rotation',
              title: 'Credential rotation',
              paragraphs: [
                'Fitz has no in-band API to revoke or rotate a single outstanding client JWT: a token remains valid against Fitz until its own exp claim elapses or the connection closes, so the documented rotation path is issuing short-lived tokens at the identity provider and having the client reconnect with a fresh CONNECT frame on expiry or on demand. The admin session cookie works differently — its signing key lives only in process memory, generated fresh with a random UUID at each broker start unless an operator pins FITZ_ADMIN_JWT_SECRET, so every protected-admin session is invalidated the moment the broker restarts.',
                'Operators rotate client credentials by changing what the identity provider issues — new signing keys behind the same JWKS endpoint, revoked grants, shorter token lifetimes — rather than by reconfiguring Fitz itself, since Fitz only trusts whatever the JWKS endpoint currently serves. Admin access rotates by resetting FITZ_ADMIN_PASSWORD_HASH to a new Argon2 hash; every login attempt against it also runs through a per-source-IP limiter capped at 5 attempts per rolling one-minute window, tracked for up to 4,096 concurrent client addresses, so repeated bad guesses against one admin account are throttled before they reach Argon2 verification.',
                'None of this is a shared control across a fleet: the login limiter and the session signing key are both process-local state, so a broker restart clears rate-limit counters as well as sessions, and a deployment with more than one Fitz instance behind a load balancer gets an independent limiter and an independent signing key per instance rather than one shared policy. Keeping an edge-level rate limit and pinning FITZ_ADMIN_JWT_SECRET for any deployment that expects sessions to survive a restart are both left to the operator.',
              ],
              table: {
                headers: [
                  'Credential',
                  'Rotation mechanism',
                  'Operational implication',
                ],
                rows: [
                  [
                    'Client JWT',
                    "No revocation or rotation API in Fitz; validity is bounded only by the token's own exp claim",
                    'Applications must issue short-lived tokens and reconnect with a fresh CONNECT frame rather than expect Fitz to invalidate a token early',
                  ],
                  [
                    'Admin session cookie',
                    'Signing key defaults to a random UUID generated at process start (FITZ_ADMIN_JWT_SECRET overrides this)',
                    'Every protected-admin session is invalidated on broker restart unless the operator pins a persistent secret',
                  ],
                  [
                    'Admin login attempts',
                    'Rate-limited per client IP: 5 attempts per rolling 1-minute window, up to 4,096 tracked IPs',
                    "Exceeding the limit returns 429 Too Many Requests; a successful login clears that IP's counter",
                  ],
                ],
              },
              callout: {
                title:
                  'Session invalidation is a restart side effect, not a rotation feature',
                body: "Fitz doesn't expose an endpoint to rotate the admin signing key on demand; regenerating it is simply a byproduct of restarting the broker process. An operator who needs sessions to persist across planned restarts must set FITZ_ADMIN_JWT_SECRET explicitly — leaving it unset trades that persistence for a key that never has to be stored anywhere.",
              },
            },
          ],
        },
        {
          path: 'durability',
          title: 'Durability',
          description:
            'Choose acknowledgement and persistence behavior without hiding the single-node server boundary.',
          keywords: ['durability', 'acknowledgement', 'recovery'],
          content: [
            {
              id: 'durability-model',
              title: 'Durability model',
              paragraphs: [
                'Durability in Fitz is set per domain, not by one broker-wide switch: Notice, RPC, and Lease are always fully ephemeral and hold nothing across a disconnect or restart, while KV, Stream, Queue, and Schedule write through the Midge storage layer and each expose their own write-policy knob for how quickly a commit becomes durable.',
                'Use the three ephemeral domains for state that only matters while a session is connected — live subscriptions, pending RPC calls, lease ownership — and use the four Midge-backed domains when an application needs a value, a record, a backlog item, or a schedule definition to still be true the next time the broker starts.',
                'Only committed durable state is ever recovered at broker startup: every kind of live or session-owned state, including open KV transactions, live Stream subscriptions, Queue inflight tokens, and RPC worker registrations, is rebuilt exclusively by the client reconnecting, never by the broker itself.',
              ],
              table: {
                headers: [
                  'Domain',
                  'Live state (lost on disconnect/restart)',
                  'Durable state',
                ],
                rows: [
                  ['Notice', 'subscriptions, delivery state', 'none'],
                  ['RPC', 'workers, pending requests, reply routing', 'none'],
                  ['Lease', 'ownership, fencing tokens, waiters', 'none'],
                  [
                    'KV',
                    'open transactions, live locks',
                    'committed values, per selected write policy',
                  ],
                  [
                    'Stream',
                    'append sessions, live subscriptions',
                    'committed records, offsets, watermarks',
                  ],
                  [
                    'Queue',
                    'inflight ownership tokens, warm actors',
                    'backlog that reached durable storage under the selected write policy',
                  ],
                  [
                    'Schedule',
                    'live subscriptions',
                    'definitions and pending fire claims (persistent modes)',
                  ],
                ],
              },
            },
            {
              id: 'domain-write-behavior',
              title: 'Domain write behavior',
              paragraphs: [
                "KV and Stream take their durability choice per operation, not per connection: a KV `BEGIN` request carries a `durability` byte (0=Buffered, 1=Sync) that governs that transaction's `COMMIT`, and a Stream `COMMIT` request carries its own `mode` byte (0=Buffered, 1=Sync), so two clients on the same broker can run a buffered write next to a synchronous one at the same time.",
                'Queue sets policy for the whole domain instead, through `FITZ_QUEUE_WRITE_POLICY` (fast, buffered, or strict; fast is the default), and Schedule has no write-policy variable of its own — persistent-mode definitions and pending fire claims simply follow whatever `FITZ_STORAGE_CLOUD_DURABILITY` the broker is configured with.',
                "Choose Sync (KV) or Sync (Stream) for rows and commits an application cannot afford to lose, and choose Buffered for high-throughput writes where losing the most recent commits after a crash is acceptable; the same trade-off applies to Queue's strict versus fast policy.",
                "Buffered KV/Stream commits and Queue's fast policy are not the same risk shape: Buffered and Sync both still write through a WAL-backed transaction boundary that fails closed on restart if the stored state is malformed, but Queue's fast policy skips the WAL entirely, so a crash inside its `FITZ_QUEUE_LOSS_WINDOW_MS` flush window (100ms by default) can leave one side of a split message record, which startup discards along with that queue's derived indexes instead of serving it.",
              ],
              code: "// KV: durability is chosen per transaction, at BEGIN\nconst tx = await kv.begin(route, { mode: 'ReadWrite', durability: 'Sync' });\nawait tx.put(key, value);\nawait tx.commit();\n\n// Stream: durability is chosen per commit, not per session\nconst session = await stream.begin(route);\nawait session.append(body);\nawait session.commit('Buffered');",
              table: {
                headers: ['Domain', 'Where policy is set', 'Values'],
                rows: [
                  [
                    'KV',
                    '`BEGIN` request `durability` byte',
                    '0 = Buffered, 1 = Sync',
                  ],
                  [
                    'Stream',
                    '`COMMIT` request `mode` byte',
                    '0 = Buffered, 1 = Sync',
                  ],
                  [
                    'Queue',
                    '`FITZ_QUEUE_WRITE_POLICY`',
                    'fast (default), buffered, strict',
                  ],
                  [
                    'Schedule',
                    'Follows `FITZ_STORAGE_CLOUD_DURABILITY` once persistence is enabled',
                    'background, strict',
                  ],
                ],
              },
            },
            {
              id: 'local-and-cloud-acknowledgement',
              title: 'Local and cloud acknowledgement',
              paragraphs: [
                'Underneath any domain write policy, `FITZ_STORAGE_MODE` decides whether there is anything durable to write to at all: memory mode never survives a restart, local mode persists to the configured filesystem path, and cloud mode combines a local cache with provider-backed object storage.',
                'In cloud mode, `FITZ_STORAGE_CLOUD_DURABILITY` decides how a broker-selected durable write is acknowledged: `background` (the default) waits only for local sync before returning, while `strict` waits for the storage provider itself to acknowledge the write.',
                'Run `local` for single-node filesystem persistence with the lowest latency, run `cloud` with `background` when the application can tolerate a short async provider-sync window, and run `cloud` with `strict` when a commit must not return success until the storage provider has it.',
                'Cloud durability configuration is still bounded to one broker process: `background` versus `strict` only changes how long that single node waits before acknowledging a write, and neither setting adds provider failover, replication, or multi-node consensus to the deployment.',
              ],
              table: {
                headers: ['FITZ_STORAGE_MODE', 'What acknowledgement means'],
                rows: [
                  [
                    'memory',
                    'Best-effort writes; no restart recovery for any domain',
                  ],
                  [
                    'local',
                    'Domain write policy governs flush to the local filesystem path',
                  ],
                  [
                    'cloud, FITZ_STORAGE_CLOUD_DURABILITY=background',
                    'Local sync completes, then the write syncs to the provider in the background',
                  ],
                  [
                    'cloud, FITZ_STORAGE_CLOUD_DURABILITY=strict',
                    'Waits for the storage provider to acknowledge the write before it completes',
                  ],
                ],
              },
              callout: {
                title: 'Memory mode ignores every domain write policy',
                body: 'Setting a KV `durability` of `Sync`, a Stream `mode` of `Sync`, or `FITZ_QUEUE_WRITE_POLICY=strict` does not create restart recovery under `FITZ_STORAGE_MODE=memory`. The write-policy knob only controls when a commit flushes on top of whichever storage backend is configured — memory mode has no durable backing store for any domain to flush to.',
              },
            },
            {
              id: 'recovery',
              title: 'Recovery',
              paragraphs: [
                'At startup, Fitz initializes the configured storage backend, acquires the active Midge writer lease, and ensures every configured route-family column family exists before registering storage-backed domains; each of those domains synchronously validates or preloads its own durable state, while Notice, RPC, and Lease intentionally start with empty live state.',
                '`/healthz` and `/readyz` return `200` only once storage, auth configuration, durable domain initialization, startup completion, and traffic acceptance are all true; `/targetz` is deliberately weaker and can return `200` for orchestrator handoff while that domain preload is still in progress, and WebSocket and TCP sessions keep rejecting data-plane traffic until the stricter gate passes.',
                "After a restart, poll `/readyz` rather than `/targetz` to know when a broker can actually take domain traffic, and expect Queue's fast policy to durably discard any incomplete split message remnants left inside its flush window — logging the discarded message IDs and invalidating the affected queue's derived indexes — while buffered and strict Queue, KV, and Stream fail closed on the same kind of malformed multi-row state instead of accepting it.",
                'Live session state is never recovered at startup: Notice subscriptions, Stream live subscriptions and append sessions, KV open transactions, Queue inflight ownership tokens, RPC worker registrations and pending calls, Lease ownership, and Schedule subscriptions are rebuilt only by clients that reconnect, and unrecoverable storage corruption keeps the broker not ready for an operator to resolve rather than serving ambiguous partial state.',
              ],
              code: 'curl http://localhost:4090/readyz',
              table: {
                headers: ['Domain', 'Startup treatment'],
                rows: [
                  [
                    'KV',
                    'Committed rows attach directly; malformed engine state remains a storage failure.',
                  ],
                  [
                    'Stream',
                    'Existing rows are decoded and layout-validated; invalid authoritative rows fail closed.',
                  ],
                  [
                    'Queue',
                    'Fast policy discards incomplete header or body remnants and their derived indexes, logs the discarded rows, and continues; buffered and strict policies reject the same state.',
                  ],
                  [
                    'Schedule',
                    'Persisted definitions and pending fire claims preload before readiness; missing definition bodies or malformed claims fail closed.',
                  ],
                ],
              },
            },
          ],
        },
        clientsPage(),
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
          'Notice has no durable history, replay, missed-message recovery, or delivery acknowledgement. Use Stream for history and Queue for durable work.',
          ['notice', 'fanout', 'subscription', 'ephemeral'],
          {
            model: [
              'Notice is the simplest domain in Fitz: a publish reaches every subscriber connected at that instant, and then it is gone. Nothing is written to storage, nothing is acknowledged, and nothing is replayed to a subscriber that connects a moment later.',
              'That makes the design question a single one — can your application tolerate missing an event? If a subscriber is disconnected, mid-reconnect, or simply started late, it does not get the message, and there is no broker-side record it ever existed. Notice is correct when the answer is yes, and when the next event will carry the reader forward anyway.',
              'Notice routes are opaque strings, which makes it the most flexible domain to address. Subscriptions may use `*` to match one segment and `**` to match the remainder, so a single subscription can follow a whole area. Publishes must name an exact route.',
            ],
            facts: {
              messageTypes: '500-599',
              routeShape: 'Any depth — the route is an opaque string',
              wildcards: '* and ** in subscriptions; publishes must be exact',
              durableState: 'None',
              lostOnDisconnect: 'Subscriptions and delivery state',
              recoveryOwner: 'Client re-subscribes',
            },
            operations: {
              headers: ['Operation', 'What it does'],
              rows: [
                [
                  'publish',
                  'Sends one payload to every subscriber whose pattern matches the exact route, right now. Returns without waiting for any subscriber to process it.',
                ],
                [
                  'subscribe',
                  'Registers a pattern on this session and delivers matching events to the handler until the subscription or the connection ends.',
                ],
                [
                  'unsubscribe',
                  'Removes one subscription from the session. Disconnecting removes all of them anyway.',
                ],
              ],
            },
            useFor: [
              'Notice fits any signal where the newest value makes the previous one irrelevant. Cache and view invalidation is the clearest case: a client that misses the hint and reloads a moment later still converges on the right answer.',
              'It also fits presence and live-awareness features (who is online, what is typing, current progress on a job), and standalone live signals whose value is only meaningful to currently connected observers. Notice does not depend on a durable domain, and it never turns a signal into history.',
            ],
            instead: {
              headers: ['If you need', 'Use'],
              rows: [
                [
                  'Subscribers to catch up on what they missed',
                  'Stream — durable ordered records read from an offset',
                ],
                [
                  'Confirmation that work was received and handled',
                  'Queue — reservation and acknowledgement',
                ],
                [
                  'A response back from the receiver',
                  'RPC — request and correlated response',
                ],
                [
                  'The event to survive a broker restart',
                  'Stream or Queue — Notice persists nothing',
                ],
              ],
            },
            callout: {
              title: 'A publish with no subscribers is not an error',
              body: 'Notice does not track intended recipients, so publishing to a route nobody is subscribed to succeeds and delivers to nobody. There is no delivery count to check and no dead-letter path. If silence needs to be detectable, that detection belongs in your application or in a domain that acknowledges.',
            },
          }
        ),
        domainPage(
          'stream',
          'Stream',
          'Use durable ordered append and replay for committed application history.',
          'Clients persist their own resume offsets. Stream live subscriptions emit commit signals, not broker-managed durable cursors or Notice fanout. Stream is not a competing-consumer queue.',
          ['stream', 'append', 'replay', 'offset'],
          {
            model: [
              'Stream is durable, ordered, append-only history. Records get monotonic offsets within a resource, they are never modified in place, and any reader can come back later and read the same range again and get the same bytes. This is the domain to reach for when the sequence of what happened is itself the valuable thing.',
              'Writes go through an append session: begin a session on a route, append one or more records, then commit. Records become readable to others at commit, not at append, so a partially written batch is never observable. The commit mode selects how durable the write is before the call returns.',
              "The critical thing to understand is that Stream does not track where you are. There is no broker-managed consumer group, no committed cursor, and no acknowledgement — reads take an explicit starting offset, and remembering the next one is your application's job. A Stream subscription emits a best-effort commit signal for new records on that Stream route; it is a Stream operation, not a Notice subscription, not a durable cursor, and it does not resume after a reconnect. Use READ with your stored offset for replay.",
            ],
            facts: {
              messageTypes: '600-699',
              routeShape: '3 or more segments (realm/area/resource)',
              wildcards:
                '* for area- and realm-level reads and subscriptions only, never appends',
              durableState: 'Committed records, offsets, and watermarks',
              lostOnDisconnect: 'Append sessions and live subscriptions',
              recoveryOwner: 'Client resumes from its own stored offsets',
            },
            operations: {
              headers: ['Operation', 'What it does'],
              rows: [
                [
                  'begin',
                  'Opens an append session against one Stream route. The session is session-owned and dies with the connection.',
                ],
                [
                  'append',
                  'Adds a record to the open session. Not readable by anyone until the session commits.',
                ],
                [
                  'commit',
                  'Publishes every appended record atomically and assigns offsets. The commit mode selects the durability boundary before the call returns.',
                ],
                [
                  'read',
                  'Reads forward from an explicit offset, up to a limit. Repeating the same call returns the same records.',
                ],
                [
                  'subscribe',
                  'Emits a Stream-specific commit signal when new records arrive. The STREAM_NOTIFY delivery is not a Notice event or a cursor — it resumes nothing after reconnect.',
                ],
              ],
            },
            useFor: [
              'Stream fits anywhere a consumer must be able to rebuild state from scratch: event sourcing, projections and read models (this is how Cassie consumes history), and audit logs where the record of the change matters as much as the current value.',
              'It also fits catch-up after downtime. Because reads are offset-addressed and repeatable, a consumer that was offline for an hour reads forward from its last stored offset and converges — no backlog is lost, and no special recovery mode is needed.',
            ],
            instead: {
              headers: ['If you need', 'Use'],
              rows: [
                [
                  'Work split across competing consumers',
                  'Queue — Stream gives every reader the full sequence',
                ],
                [
                  'The broker to remember your position',
                  'Queue — reservation tracks in-flight work; Stream offsets are yours to store',
                ],
                [
                  'Only the current value, not its history',
                  'KV — reading a Stream to find the latest value is the wrong shape',
                ],
                [
                  'Fanout with no durability cost',
                  'Notice — ephemeral, nothing written',
                ],
              ],
            },
            callout: {
              title: 'Store the resume offset with the work it produced',
              body: 'Because nothing is acknowledged back to the broker, a consumer that processes records and then crashes before saving its offset will reprocess them on restart. Persist the next offset in the same transaction as whatever the records produced — a KV commit, for example — so the position and its effects can never disagree.',
            },
          }
        ),
        domainPage(
          'kv',
          'KV',
          'Use transactional key-value resources for current authoritative state.',
          'KV is current state, not immutable history. Use Stream when the sequence of changes must be durable and replayable.',
          ['KV', 'transaction', 'state', 'key-value'],
          {
            model: [
              'KV holds the current committed value for each key inside one resource. A resource is the transaction boundary: a transaction is opened against exactly one `realm/area/resource` route, and every read and write inside it addresses keys within that scope.',
              'Work is transactional from the start — there is no single-shot put. Begin a transaction with a mode and a durability choice, read and write against it, then commit or roll back. Reads inside the transaction see a consistent view, and writes become visible to others only at commit.',
              'KV enforces its route shape strictly: exactly three segments, no more. A route with a trailing operation segment is rejected before dispatch rather than being canonicalized, because KV takes its operation from the MessageType and never from the route path.',
            ],
            facts: {
              messageTypes: '100-199',
              routeShape: 'Exactly 3 segments (realm/area/resource)',
              wildcards:
                'None for data operations; SUBSCRIBE/UNSUBSCRIBE watch patterns accept * and **',
              durableState: 'Committed values',
              lostOnDisconnect: 'Open transactions and live locks',
              recoveryOwner:
                'Broker recovers committed state; client restarts transactions',
            },
            operations: {
              headers: ['Operation', 'What it does'],
              rows: [
                [
                  'begin',
                  'Opens a transaction on one resource with a mode (ReadOnly or ReadWrite) and a durability choice applied at commit.',
                ],
                [
                  'get',
                  'Reads one key within the transaction view, reporting found or missing rather than guessing a default.',
                ],
                [
                  'put',
                  'Stages a value for a key. Not visible to other sessions until commit.',
                ],
                [
                  'commit',
                  "Applies every staged write atomically under the transaction's durability choice.",
                ],
                [
                  'rollback',
                  'Discards staged writes and closes the transaction. Disconnecting has the same effect.',
                ],
                [
                  'subscribe / unsubscribe',
                  'Watches a key pattern for changes, using * and ** to match. The watch is session-owned and ends with the connection.',
                ],
              ],
            },
            useFor: [
              'KV fits authoritative current state that must be read back exactly as written: feature flags and configuration, per-tenant settings, counters and balances, and any record where the latest value is the answer and older values are of no interest.',
              'Because commits are atomic across keys within a resource, it also fits read-modify-write workflows that must not interleave — reading a value, deciding, and writing back inside one transaction rather than racing two independent updates.',
            ],
            instead: {
              headers: ['If you need', 'Use'],
              rows: [
                [
                  'The full sequence of changes, replayable',
                  'Stream — KV keeps only the current value',
                ],
                [
                  'An atomic write across two resources',
                  'Model it inside one resource — a transaction cannot span routes',
                ],
                [
                  'Work handed to a consumer with retry',
                  'Queue — a KV write is not a work item',
                ],
                [
                  'To signal cheaply that state changed',
                  'Notice — use independently when a separate live signal is useful; KV remains complete without it',
                ],
              ],
            },
            callout: {
              title: 'Open transactions die with the connection',
              body: 'An open KV transaction is session-owned: a disconnect rolls it back, and a reconnect gets a brand-new session that knows nothing about it. Keep transactions short, and treat a reconnect as a signal to re-read and re-apply rather than to resume — the committed state survives, the transaction does not.',
            },
          }
        ),
        domainPage(
          'queue',
          'Queue',
          'Use durable competing-consumer delivery with reservation, retry, and redelivery.',
          'Queue owns work lifecycle, not broadcast fanout, immutable history, or live request-response. Delivery is not exactly once.',
          ['queue', 'work', 'reservation', 'redelivery'],
          {
            model: [
              'Queue is durable work distribution. An item is enqueued once and delivered to exactly one consumer at a time, which is what makes it the right shape for background jobs: add more workers and throughput goes up, because they compete for items rather than each receiving a copy.',
              "Delivery works by reservation rather than acknowledgement-on-receipt. A consumer reserves one or more items for a visibility window, during which no other consumer can see them. Completing an item removes it; releasing it early returns it immediately; and letting the window lapse returns it automatically, which is what makes a crashed worker's items recoverable without any cleanup process.",
              'That design has a direct consequence worth planning for: delivery is at-least-once, not exactly-once. A worker that finishes the job but dies before completing the item will see it redelivered. Make handlers idempotent, or key the work so a repeat is detectable.',
            ],
            facts: {
              messageTypes: '200-299',
              routeShape:
                '3 or more segments; extra segments are canonicalized away',
              wildcards:
                'None for work operations; WATCH/UNWATCH availability patterns accept * and **',
              durableState:
                'Messages and indexes reaching durable storage under the selected write policy',
              lostOnDisconnect: 'In-flight ownership, tokens, and warm actors',
              recoveryOwner:
                'Broker recovers the durable backlog; client handles redelivery',
            },
            operations: {
              headers: ['Operation', 'What it does'],
              rows: [
                [
                  'enqueue',
                  "Adds one item to the queue durably, according to the queue's write policy.",
                ],
                [
                  'reserve',
                  'Claims up to N items for a visibility window, hiding them from other consumers for its duration.',
                ],
                [
                  'complete',
                  'Acknowledges an item as handled and removes it permanently.',
                ],
                [
                  'release',
                  'Returns a reserved item immediately instead of waiting for its window to lapse, making it available to another consumer.',
                ],
                [
                  'watch / unwatch',
                  'Subscribes to availability signals on a route pattern so a consumer can reserve on demand rather than polling.',
                ],
              ],
            },
            useFor: [
              'Queue fits work that must happen even if nobody is listening right now: sending email, generating reports and thumbnails, syncing to third parties, and any task where losing the request is worse than running it twice.',
              "It also fits load levelling and bounded retry. A burst of enqueues drains at whatever rate consumers can manage, and a failing item is redelivered on its own — up to the queue's retry policy, after which dead-letter handling can hold it for inspection instead of retrying forever.",
            ],
            instead: {
              headers: ['If you need', 'Use'],
              rows: [
                [
                  'Every consumer to receive every message',
                  'Notice or Stream — Queue gives each item to one active consumer at a time, with at-least-once redelivery',
                ],
                [
                  'A result returned to the caller',
                  "RPC — Queue is fire-and-forget from the producer's side",
                ],
                [
                  'To reread history after processing',
                  'Stream — completed queue items are gone',
                ],
                [
                  'Work to start at a specific future time',
                  'Schedule for timing intent, or Queue for durable retry; each domain stands alone',
                ],
              ],
            },
            callout: {
              title: 'Size the visibility window to the slowest run',
              body: 'If a handler routinely takes longer than the visibility window, the item is redelivered while the first worker is still on it, and two workers do the same job concurrently. Set the window above the realistic worst case rather than the average, and treat frequent duplicate processing as a signal the window is too short rather than a Queue defect.',
            },
          }
        ),
        domainPage(
          'rpc',
          'RPC',
          'Use live request and response dispatch to workers that are connected now.',
          'Pending calls and worker registrations are ephemeral. RPC is not a durable retry queue; use Queue when work must survive disconnect or restart.',
          ['RPC', 'request', 'response', 'worker'],
          {
            model: [
              'RPC is live request and response. A worker registers itself against a route, a caller invokes that route, and the broker correlates the response frames back to the caller while both sessions stay connected. It is the only domain where the caller gets an answer.',
              'Responses are a sequence, not a single value. One call can yield many correlated response frames, which lets a worker return progress updates or a chunked result as it produces them rather than buffering everything and replying once at the end.',
              'Nothing here is durable. If no worker is registered when the call arrives, the call fails immediately — it is not parked until one appears. Pending calls and registrations are session-owned, so a disconnect on either side ends them, and both the caller and the worker are responsible for retrying explicitly.',
            ],
            facts: {
              messageTypes: '300-399',
              routeShape: 'Any depth — the whole route string is the identity',
              wildcards:
                'None — worker registration and calls both use exact routes',
              durableState: 'None',
              lostOnDisconnect:
                'Worker registrations, pending requests, and reply routing',
              recoveryOwner: 'Caller and worker retry explicitly',
            },
            operations: {
              headers: ['Operation', 'What it does'],
              rows: [
                [
                  'register',
                  'Advertises this session as the worker for an exact route. The registration ends with the connection.',
                ],
                [
                  'call',
                  'Sends a request to a registered worker and returns a sequence of correlated response frames. Fails if no worker is registered.',
                ],
                [
                  'respond',
                  'Emits one response frame back to the caller. A worker may respond many times for a single call.',
                ],
              ],
            },
            useFor: [
              'RPC fits interactive work where the caller is waiting and a stale answer is useless: resizing an image a user just uploaded, validating input against a service that owns the rules, or querying a worker that holds state the caller cannot reach directly.',
              'The streaming response shape also fits long-running interactive jobs — a worker can report progress as it goes, so the caller can render a progress bar instead of waiting on a single opaque call.',
            ],
            instead: {
              headers: ['If you need', 'Use'],
              rows: [
                [
                  'Work to survive no worker being available',
                  'Queue — RPC fails the call outright',
                ],
                [
                  'Automatic retry after a crash',
                  'Queue — reservation redelivers; RPC does not',
                ],
                [
                  'To signal many listeners at once',
                  'Notice — RPC targets exactly one worker',
                ],
                [
                  'A record of what was requested',
                  'Stream — RPC persists nothing',
                ],
              ],
            },
            callout: {
              title: 'Re-register workers on every reconnect',
              body: "A worker registration lives on the session, so a reconnect — even an instant one — leaves the route unserved until the worker registers again. Register as part of the client's connect handler rather than once at startup, or calls will begin failing the first time the connection blips.",
            },
          }
        ),
        domainPage(
          'lease',
          'Lease',
          'Use single-broker ownership coordination with TTL expiry and fencing tokens.',
          'Lease state is ephemeral and single-node. It is not distributed consensus, durable lock recovery, or a guarantee of KV or Queue correctness.',
          ['lease', 'ownership', 'TTL', 'fencing'],
          {
            model: [
              'Lease answers one question: which process currently owns this thing? A holder acquires a named lease for a TTL, and no one else can acquire it until the holder releases it or the TTL expires. That expiry is what makes it safe against crashes — a holder that dies without releasing loses the lease automatically.',
              'Because ownership is time-bounded, a holder that intends to keep working must renew before the TTL elapses. A holder that pauses too long — a long stop-the-world GC, a blocked syscall — can lose the lease while still believing it holds it.',
              'That case is exactly what the fencing token is for. Each acquisition returns a token that increases with every change of ownership, and passing it to the resource you are protecting lets that resource reject work carried by a stale token. Ownership alone is a coordination hint; the token is what makes it enforceable.',
            ],
            facts: {
              messageTypes: '400-499',
              routeShape:
                '3 or more segments; extra segments are canonicalized away',
              wildcards:
                'None for ACQUIRE/RENEW/RELEASE/QUERY; SUBSCRIBE/UNSUBSCRIBE watch patterns accept * and **',
              durableState: 'None',
              lostOnDisconnect: 'Ownership, fencing tokens, and waiters',
              recoveryOwner: 'Client reacquires',
            },
            operations: {
              headers: ['Operation', 'What it does'],
              rows: [
                [
                  'acquire',
                  'Claims a named lease for a TTL and returns a fencing token. Fails or waits if another holder owns it.',
                ],
                [
                  'renew',
                  'Extends the TTL for the current holder. Required for any work that outlives the original window.',
                ],
                [
                  'release',
                  'Gives up ownership immediately so the next waiter can proceed, rather than waiting for expiry.',
                ],
                [
                  'query',
                  'Reports the current holder and expiry without attempting to acquire.',
                ],
                [
                  'subscribe / unsubscribe',
                  'Watches ownership changes on a route pattern, so a standby learns when a lease becomes available.',
                ],
              ],
            },
            useFor: [
              'Lease fits singleton work inside one broker: making sure only one instance of a service runs the nightly compaction, drives a migration, or polls an external system, even when several identical instances are deployed.',
              'It also fits leader-like coordination where losing the role is survivable — a standby that watches for the lease to free up and takes over is a normal pattern here, precisely because reacquisition is cheap and expiry is automatic.',
            ],
            instead: {
              headers: ['If you need', 'Use'],
              rows: [
                [
                  'Ownership that survives a broker restart',
                  'Not available — Lease state is ephemeral and single-node',
                ],
                [
                  'Consensus across multiple machines',
                  'Not available — Fitz is a single-node broker',
                ],
                [
                  'Mutual exclusion on stored data',
                  'KV transactions — commits are already atomic',
                ],
                [
                  'One-at-a-time processing of work items',
                  'Queue — reservation already gives exclusivity per item',
                ],
              ],
            },
            callout: {
              title: 'Holding a lease is not the same as being safe',
              body: 'Between checking that you hold a lease and acting on it, the TTL can lapse and another process can acquire it. That is why the fencing token exists: pass it to whatever the lease protects and have that resource reject stale tokens. A lease checked and then trusted indefinitely provides coordination, not exclusion.',
            },
          }
        ),
        domainPage(
          'schedule',
          'Schedule',
          'Use durable future timing intent without turning the broker into a workflow engine.',
          'Schedule owns when an action becomes due, not workflow graphs or downstream completion. Schedule is complete as a timing primitive; an application may choose Queue separately when it also needs durable work acknowledgement and retry.',
          ['schedule', 'timing', 'future work', 'delivery mode'],
          {
            model: [
              'Schedule owns one thing: when something becomes due. A definition names a route, a cron expression, a delivery mode, and a payload; the broker stores it and emits the payload each time it fires. It deliberately stops there — Schedule does not claim to complete or retry downstream work, and it does not need another domain to provide its timing guarantee.',
              'When persistence is enabled, both the definitions and the pending fire claims are durable, so a broker restart does not lose the schedule or forget that a fire was in progress. The delivery mode decides how a fire is dispatched when more than one subscriber could take it; Single hands the fire to exactly one.',
              'Schedule routes are the strictest in Fitz: exactly four segments, `realm/area/resource/operation`, with the operation carried in the route path rather than the MessageType. Anything shorter or longer is rejected before dispatch, and every operation — including subscribe — requires an exact route with no wildcards.',
            ],
            facts: {
              messageTypes: '700-799',
              routeShape:
                'Exactly 4 segments (realm/area/resource/operation), operation required in the path',
              wildcards: 'None — every operation requires an exact route',
              durableState:
                'Definitions and pending fire claims, when persistence is enabled',
              lostOnDisconnect: 'Live subscriptions',
              recoveryOwner:
                'Broker reloads timing intent; client rebuilds subscriptions',
            },
            operations: {
              headers: ['Operation', 'What it does'],
              rows: [
                [
                  'create',
                  'Registers a definition: route, cron expression, delivery mode, and the payload to emit on each fire.',
                ],
                [
                  'delete',
                  'Removes a definition so it stops firing. Pending claims already in flight are not retroactively cancelled.',
                ],
                [
                  'list / query',
                  'Reports the definitions registered for a route, including their timing expression and delivery mode.',
                ],
                [
                  'subscribe',
                  'Receives fires on this session as they become due. Session-owned, so it must be rebuilt after reconnect.',
                ],
              ],
            },
            useFor: [
              'Schedule fits recurring timing intent — nightly reports, hourly reconciliation, periodic cache warming — and delayed one-shot actions like a reminder or a cleanup that should happen some time after an event.',
              "Schedule is useful on its own for delivering timing signals to live subscribers. If an application also needs a durable work lifecycle, it may separately submit work to Queue; that optional composition does not change or complete Schedule's timing contract.",
            ],
            instead: {
              headers: ['If you need', 'Use'],
              rows: [
                [
                  'Retry when the fired work fails',
                  'Queue — a separate domain for reservation and redelivery; Schedule itself only signals due time',
                ],
                [
                  'Acknowledgement that the work completed',
                  'Queue — Schedule confirms the fire, not the outcome',
                ],
                [
                  'Steps that depend on earlier steps',
                  'Your application — Fitz has no workflow engine',
                ],
                [
                  'A durable record of every fire',
                  'Stream — append on fire if the history matters',
                ],
              ],
            },
            callout: {
              title: 'A fire is a starting gun, not a completion',
              body: 'Schedule guarantees that the payload is emitted when due; it does not track whether the resulting work succeeded, and it will not retry it. A subscriber that receives a fire and then crashes has consumed the only signal for that occurrence. An application that also needs completion tracking may use Queue as a separate operation, but Schedule remains usable without it.',
            },
          }
        ),
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      pages: [
        {
          path: 'cloud',
          title: 'Cloud',
          description:
            'Configure Fitz storage for local or provider-backed operation and choose explicit cloud durability boundaries.',
          keywords: ['cloud', 'storage', 'durability', 'provider', 'recovery'],
          content: [
            {
              id: 'storage-modes',
              title: 'Storage modes',
              paragraphs: [
                'FITZ_STORAGE_MODE selects where the durable domains — KV, Queue, Stream, and Schedule — actually keep their data. It does not change any domain contract: Notice, RPC, and Lease hold no durable state in any mode, and a Queue item is delivered the same way whether it lives on a local disk or in an object store.',
                'Cloud mode is a hybrid rather than a replacement for local disk. The broker keeps a local cache and staging directory and backs it with provider objects under one prefix, so the local volume is still on the hot path for performance even though it is no longer the sole record.',
              ],
              table: {
                headers: ['Mode', 'Where data lives', 'Use'],
                rows: [
                  [
                    'memory',
                    'Process memory only',
                    'Development and tests; everything is lost on exit',
                  ],
                  [
                    'local',
                    'A filesystem path you provide',
                    'Single-node persistence where the volume outlives the process',
                  ],
                  [
                    'cloud',
                    'A local cache plus provider-backed objects under one prefix',
                    'Persistence that survives loss of the local volume',
                  ],
                ],
              },
            },
            {
              id: 'cloud-configuration',
              title: 'Cloud configuration',
              paragraphs: [
                'Provider identity, bucket or container, object prefix, credentials, local cache path, and storage I/O timeout are all supplied through the server environment, which the deployment owns rather than the application.',
                "Two of those deserve care. The object prefix must be unique per broker — two brokers sharing a prefix are two writers over one set of objects, which the single-writer model does not allow. And credentials should come from the deployment platform's managed identity where one exists, rather than long-lived keys baked into the environment.",
                'Keep the local cache on a bounded volume. It is working space, not a place data accumulates indefinitely, and a full cache volume surfaces as storage I/O failures rather than as a clear disk-space message.',
              ],
              callout: {
                title:
                  'FITZ_SQRZL_PROVIDER is a local compose setting, not a runtime one',
                body: 'It only selects the emulated provider front door in the compose.cloud.yml local-development flow and is never read by the broker itself — it has no effect on a deployed node and does not belong in production configuration.',
              },
            },
            {
              id: 'durability',
              title: 'Durability',
              paragraphs: [
                'FITZ_STORAGE_CLOUD_DURABILITY selects how far a broker-level cloud write goes before it is acknowledged. background returns once the write is locally durable and continues the upload behind the scenes; strict waits for the covering upload to be acknowledged by the provider before returning.',
                "This setting sits underneath the domain contracts rather than overriding them. A domain's own write policy still decides whether a given operation is durable at all — choosing strict does not make a Notice publish durable, and it does not change what a Queue reservation guarantees. What it changes is how much a durable write has already reached the provider when the broker calls it done.",
                'The practical difference shows up only when the local volume is lost. Under background, writes whose upload had not finished are gone; under strict, an acknowledged write should be recoverable from provider objects alone.',
              ],
              table: {
                headers: [
                  'Setting',
                  'Acknowledged after',
                  'Lost if the local volume dies',
                ],
                rows: [
                  [
                    'background',
                    'The write is locally durable; upload continues afterward',
                    'Anything not yet uploaded',
                  ],
                  [
                    'strict',
                    'The covering upload is acknowledged by the provider',
                    'Nothing already acknowledged',
                  ],
                ],
              },
            },
            {
              id: 'cloud-boundaries',
              title: 'Cloud boundaries',
              paragraphs: [
                'Provider-backed storage changes where bytes live and nothing else. Fitz remains one broker process: there is no consensus, no transparent failover, and no durable session recovery, and pointing two brokers at the same prefix does not produce a cluster.',
                'Prove the arrangement before it carries traffic, and prove it the way it will actually fail. Delete the local cache and restart the broker — if the durable domains do not come back from provider objects alone, the remote copy was never sufficient and you have only been testing the cache.',
                'Run that test against the real provider with the credentials and network policy you deploy with. A simulated or emulated provider exercises the same code path, which makes it useful for deterministic tests and useless for qualifying IAM permissions, quotas, or endpoint reachability.',
              ],
              callout: {
                title: 'Restart is still a visible event',
                body: 'Cloud storage protects committed data, not connections. A broker restart drops every session, so clients still re-subscribe, re-register workers, reacquire leases, and resume streams from their own offsets. Durability and availability are separate problems here, and cloud mode addresses only the first.',
              },
            },
          ],
        },
        {
          path: 'deployment',
          title: 'Deployment',
          description:
            'Run one Fitz broker with explicit process, network, storage, health, and placement ownership.',
          keywords: ['deploy', 'health', 'readiness'],
          content: [
            {
              id: 'process-model',
              title: 'Process model',
              paragraphs: [
                'One Fitz broker is one OS process running five layers in the same address space: an async transport layer (WebSocket, length-prefixed TCP, and an HTTP listener that upgrades to WebSocket), a transport-driven session layer, a fully synchronous runtime and domain core, and the embedded Midge LSM storage layer underneath. Domain handlers never call `.await`, use Tokio primitives, or block on I/O; async execution stays confined to the API edge that reads frames and performs bounded auth or backpressure waits before dispatching into the sync core.',
                'Every provisioned `RouteFamily` gets a fixed-affinity actor mailbox — a 16,384-message normal lane plus a separate bounded control lane — on one of `available_parallelism` shards (capped at the provisioned family count) selected by `(family_id - 1) % shard_count`, and shards drain ready families round-robin so no single busy family starves the rest. Size CPU allocation to the number of route families you provision: adding families spreads mailbox affinity across more shards, while adding connections to existing families does not.',
                'A full mailbox lane returns explicit backpressure to the caller rather than buffering unboundedly, and a panic inside a production domain actor marks readiness unhealthy, halts new data-plane work, and starts drain instead of silently restarting. One process is one broker: there is no multi-process worker pool, clustering, or automatic failover between processes — placement and process supervision stay with the deployment platform.',
              ],
              table: {
                headers: ['Layer', 'Concurrency model', 'Components'],
                rows: [
                  [
                    '1 Transport',
                    'Async',
                    'WebSocket, length-prefixed TCP, HTTP (upgrades to WebSocket)',
                  ],
                  [
                    '2 Session',
                    'Sync, transport-driven',
                    'JWT CONNECT handshake, TLV parsing, permission enforcement',
                  ],
                  [
                    '3 Runtime',
                    'Sync, deterministic',
                    'Router, family actor pools, ingress, mux',
                  ],
                  [
                    '4 Domains',
                    'Sync',
                    'KV, Queue, Notice, Stream, RPC, Lease, Schedule',
                  ],
                  ['5 Storage', 'Persistent, embedded', 'Midge LSM'],
                ],
              },
              callout: {
                title: 'Fail-closed domain actors',
                body: "A panic in a production domain actor marks the broker's readiness unhealthy, stops accepting new data-plane work for that actor, and starts drain. There is no hidden automatic actor restart.",
              },
            },
            {
              id: 'network-listeners',
              title: 'Network listeners',
              paragraphs: [
                'A running broker binds three listeners: HTTP/WebSocket on `FITZ_HTTP_PORT` (default 4090, on `FITZ_BIND_ADDR`, default `0.0.0.0`) serving `/ws`, the admin API, the SPA, and health probes; raw TCP on `FITZ_TCP_PORT` (default 4091); and a dedicated Prometheus listener on `FITZ_METRICS_BIND_ADDR:FITZ_METRICS_PORT` (default `127.0.0.1:9090`) that is intentionally unauthenticated. The main listener returns `404` for `/metrics`, so raw Prometheus text is only ever available from the dedicated port.',
                'Disable TCP independently with `FITZ_TCP_ENABLED=false` when only browser clients connect — HTTP, WebSocket, and admin routes stay enabled regardless — and read authenticated, family-scoped numbers from `/api/v1/{family}/metrics` or broker-wide from `/api/v1/all/metrics` (wildcard authority required) instead of scraping the metrics port for anything beyond raw Prometheus ingestion.',
                'Fitz does not terminate TLS or rotate certificates on either listener; put a TLS-terminating load balancer, sidecar, or private network in front of both, set `FITZ_ASSUME_EXTERNAL_TLS=true` before enabling runtime auth or protected admin on a non-loopback bind, and configure an exact `FITZ_WS_ALLOWED_ORIGINS` allowlist for browser clients.',
              ],
              table: {
                headers: ['Listener', 'Env vars', 'Default', 'Notes'],
                rows: [
                  [
                    'HTTP/WebSocket',
                    'FITZ_HTTP_PORT, FITZ_BIND_ADDR',
                    '4090, 0.0.0.0',
                    '/ws upgrade, /api/v1/*, SPA, health probes',
                  ],
                  [
                    'Raw TCP',
                    'FITZ_TCP_PORT, FITZ_TCP_ENABLED',
                    '4091, true',
                    'Length-prefixed frames; gate-able independent of HTTP/WS',
                  ],
                  [
                    'Prometheus',
                    'FITZ_METRICS_BIND_ADDR, FITZ_METRICS_PORT',
                    '127.0.0.1, 9090',
                    'Unauthenticated raw text; no admin routes',
                  ],
                ],
              },
              code: 'curl http://127.0.0.1:9090/metrics | head -5        # raw Prometheus, unauthenticated\ncurl --cookie "fitz_admin_session=<session>" \\\n  http://localhost:4090/api/v1/1/metrics            # structured JSON, family 1',
              callout: {
                title: 'TLS terminates outside Fitz',
                body: 'Native listener TLS and in-process certificate rotation are not part of this listener set. Fitz refuses to start with runtime auth or protected admin on a non-loopback bind unless `FITZ_ASSUME_EXTERNAL_TLS=true` is set explicitly.',
              },
            },
            {
              id: 'storage-placement',
              title: 'Storage placement',
              paragraphs: [
                'Layer 5 is the Midge LSM engine embedded in the same process. `FITZ_STORAGE_MODE` selects `memory` (ephemeral), `local` (default; persists under `FITZ_STORAGE_PATH`, default `./.fitz`), or `cloud` (a local cache at `FITZ_STORAGE_CACHE_PATH` plus provider-backed object storage, optionally namespaced under `FITZ_STORAGE_PREFIX`), and boot opens that backend and acquires the active Midge writer lease before any domain is marked ready.',
                "Domain data is placed by exact `RouteFamily` inside that one engine, scoped under each route's `{realm}/{area}/{resource}` path — KV keeps current values there, Stream appends commits there plus offset and sequencing metadata, Queue holds its backlog there, and Schedule persists definitions and pending fire claims there. The physical on-disk key encoding adds its own separators and per-domain markers beyond that logical route scope, so give each broker process its own `FITZ_STORAGE_PATH` or `FITZ_STORAGE_CACHE_PATH` and set `FITZ_ROUTE_FAMILIES` to the contiguous allowlist that process actually owns.",
                'Lease has no Layer 5 schema at all: ownership, waiters, TTL, and fencing tokens live only in broker memory and are gone on restart. Cloud mode adds provider-backed persistence and a local cache, not multi-node write access — a second process pointed at the same prefix does not get concurrent writes, it waits for the writer lease.',
              ],
              table: {
                headers: [
                  'Storage mode',
                  'Env var',
                  'Default location',
                  'Behavior',
                ],
                rows: [
                  [
                    'memory',
                    'FITZ_STORAGE_MODE=memory',
                    'none',
                    'Ephemeral, in-process only',
                  ],
                  [
                    'local',
                    'FITZ_STORAGE_MODE=local (default)',
                    'FITZ_STORAGE_PATH=./.fitz',
                    'Single-node filesystem persistence',
                  ],
                  [
                    'cloud',
                    'FITZ_STORAGE_MODE=cloud',
                    'FITZ_STORAGE_CACHE_PATH=./.fitz-cloud-cache',
                    'Local cache plus provider-backed object storage under FITZ_STORAGE_PREFIX',
                  ],
                ],
              },
              callout: {
                title: 'One writer lease per storage path',
                body: 'Startup blocks domain readiness on acquiring the active Midge writer lease. A second process pointed at the same local path or cloud prefix waits for that lease rather than writing concurrently.',
              },
            },
            {
              id: 'health-and-readiness',
              title: 'Health and readiness',
              paragraphs: [
                "Boot starts the HTTP listener before storage opens so `/targetz` can answer immediately, then opens storage and acquires the Midge writer lease, preloads domains, starts TCP, and marks startup complete. `/livez` is process liveness only; `/targetz` is a deliberately weaker orchestrator handoff gate that returns `200` once the HTTP listener is up and the process isn't draining, even while the writer lease is still `not_ready`; `/readyz` and `/healthz` share one strict contract — storage, writer lease, domain init, auth config, and startup complete all `ok` — and gate WebSocket upgrades and TCP sessions; `/startupz` reports whether boot finished.",
                'Use `/targetz` for target eligibility in a single-active rolling handoff so an incoming process can queue up before it owns the writer lease, keep `/healthz` or `/readyz` as the actual traffic-admission signal, and drain a process with `POST /api/v1/runtime/drain` from an authenticated same-origin admin client — during drain `/targetz`, `/readyz`, and `/healthz` return `503` with `"draining"` status while `/livez` stays `200`, Fitz rejects new TCP/WebSocket sessions, waits `FITZ_DRAIN_GRACE_SECONDS` (default 25s), then closes remaining ephemeral sessions and releases the writer lease.',
                'Set the external deregistration delay close to `FITZ_DRAIN_GRACE_SECONDS` and process termination grace longer than it, or a session gets killed mid-drain instead of closed cleanly. If the target-eligible-before-ready overlap is unacceptable, skip `/targetz` for traffic admission and choose a rollout that stops the old writer before the incoming process becomes target-eligible — Fitz does not coordinate that sequencing for you.',
              ],
              table: {
                headers: ['Probe', 'Auth', 'Requires writer lease', 'Meaning'],
                rows: [
                  ['/livez', 'none', 'no', 'Process liveness / restart signal'],
                  [
                    '/targetz',
                    'none',
                    'no',
                    'Orchestrator handoff gate (HTTP up, not draining)',
                  ],
                  ['/readyz', 'none', 'yes', 'Native strict readiness'],
                  [
                    '/healthz',
                    'none',
                    'yes',
                    'Traffic-admission gate (mirrors /readyz)',
                  ],
                  ['/startupz', 'none', 'no', 'Startup complete'],
                ],
              },
              code: 'curl -sf http://localhost:4090/healthz             # strict readiness before data-plane traffic\ncurl -X POST --cookie "fitz_admin_session=<session>" \\\n  http://localhost:4090/api/v1/runtime/drain        # begin a clean drain',
              callout: {
                title: '/targetz is not a readiness proxy',
                body: "`/targetz` can return `200` before the writer lease is acquired — it only proves the HTTP listener is up and the process isn't draining. WebSocket upgrades and TCP sessions still reject traffic until `/healthz` or `/readyz` turns `200`.",
              },
            },
          ],
        },
        {
          path: 'storage',
          title: 'Storage',
          description:
            'Choose memory, local, or provider-backed storage and verify restart recovery.',
          keywords: ['storage', 'local', 'cloud'],
          content: [
            {
              id: 'storage-modes',
              title: 'Storage modes',
              paragraphs: [
                'FITZ_STORAGE_MODE picks exactly one active backend: memory, local, or cloud. Memory is ephemeral in-process state, local persists through the filesystem path in FITZ_STORAGE_PATH, and cloud combines that same kind of local path, used only as a cache, with a provider-backed object store.',
                'The default is local. Legacy storage-mode aliases are rejected at startup, so cloud mode has to be selected explicitly as FITZ_STORAGE_MODE=cloud together with an explicit FITZ_STORAGE_PROVIDER identifier.',
              ],
              table: {
                headers: ['Mode', 'FITZ_STORAGE_MODE', 'Restart recovery'],
                rows: [
                  [
                    'Memory',
                    'memory',
                    'None — in-process state does not survive a restart',
                  ],
                  [
                    'Local',
                    'local',
                    'Commit-visible state recovers from FITZ_STORAGE_PATH',
                  ],
                  [
                    'Cloud',
                    'cloud',
                    'Commit-visible state recovers from the provider store behind the local cache',
                  ],
                ],
              },
            },
            {
              id: 'local-data',
              title: 'Local data',
              paragraphs: [
                'Local mode writes to the directory in FITZ_STORAGE_PATH (default ./.fitz), an embedded Midge LSM engine that Fitz opens in-process; there is no separate storage server to install or connect to. During boot, storage init opens that path and acquires the single active Midge writer lease before any domain is marked ready.',
                'KV, Stream, Queue, and Schedule persist their committed state through Midge at that path; Notice, RPC, and Lease intentionally hold only in-memory live state and start empty on every restart, in local mode as much as any other.',
                "Give each broker process its own FITZ_STORAGE_PATH, since the Midge writer lease is exclusive to one process; FITZ_STORAGE_MEMTABLE_BYTES can override the engine's automatic memtable sizing when a workload needs a fixed budget instead.",
              ],
              code: 'FITZ_STORAGE_MODE=local\nFITZ_STORAGE_PATH=/var/lib/fitz\nFITZ_STORAGE_MEMTABLE_BYTES=67108864',
            },
            {
              id: 'provider-backed-storage',
              title: 'Provider-backed storage',
              paragraphs: [
                'Cloud mode keeps a local directory, FITZ_STORAGE_CACHE_PATH (default ./.fitz-cloud-cache), as a cache in front of a provider-backed object store selected by FITZ_STORAGE_PROVIDER. FITZ_STORAGE_PATH is read only in local mode; cloud mode ignores it in favor of the cache path.',
                'Provider credentials, the bucket, container, endpoint, region, and namespace keys, prefix conventions, and the FITZ_STORAGE_CLOUD_DURABILITY acknowledgement policy are covered on the Cloud page rather than here.',
                "Selecting cloud mode does not change Fitz's process model: it is still one broker holding one active Midge writer lease, not a distributed or replicated store, and the deployment platform still owns provider account setup and network reachability to the object endpoint.",
              ],
              callout: {
                title: 'Two independent loss domains',
                body: 'The local cache and the provider store can fail separately — a redeployed volume or a swapped disk can wipe the cache while provider-held data survives, or the reverse. Only an explicit restart drill against both shows what actually comes back; see Recovery checks below.',
              },
            },
            {
              id: 'recovery-checks',
              title: 'Recovery checks',
              paragraphs: [
                "Recovery relies on three invariants that hold in every storage mode: route-family and realm boundaries are never crossed implicitly (storage init creates one Midge column family per configured route family before any domain goes ready), transaction-scoped writes commit atomically at their configured commit point, and startup recovery replays only data that satisfies the active durability policy's commit-visibility rules — never a partially written transaction.",
                'What comes back after a restart still differs by domain, because Notice, RPC, and Lease are intentionally live-only and never persisted regardless of storage mode.',
                'Verify restart recovery for every domain a deployment depends on: write through it, kill the process, restart, and check both the recovered rows and the /readyz gate. Run that drill twice for cloud mode — once with the local cache intact and once with it deleted — since cache loss and provider-store loss are the two independent failure paths described above.',
              ],
              table: {
                headers: ['Domain', 'What a restart recovers'],
                rows: [
                  ['KV', 'Committed transaction values only'],
                  [
                    'Stream',
                    'Committed append history — offsets, watermarks, and counters',
                  ],
                  [
                    'Queue',
                    "Persisted state per FITZ_QUEUE_WRITE_POLICY; fast mode can discard one incomplete split record and invalidate that queue's derived indexes",
                  ],
                  [
                    'Schedule',
                    'Persisted definitions and pending fire claims (memory mode has no restart guarantee)',
                  ],
                  ['Notice', 'Nothing — live subscriptions are never replayed'],
                  [
                    'RPC',
                    'Nothing — worker registrations and pending calls are cleared',
                  ],
                  [
                    'Lease',
                    'Nothing — ownership and fencing tokens are lost on restart',
                  ],
                ],
              },
              callout: {
                title: 'Fast-mode queue discard is expected behavior',
                body: "Under the default FITZ_QUEUE_WRITE_POLICY=fast, a crash inside the FITZ_QUEUE_LOSS_WINDOW_MS flush window (100ms by default) can leave one side of a split queue record. Startup deletes that incomplete remnant with a sync write, invalidates the affected queue's derived indexes, and logs the discarded message ID before continuing; buffered and strict queue policies fail startup on the same state instead.",
              },
              code: 'docker kill --signal=SIGKILL <container>\ndocker start <container>\ncurl -sf http://localhost:4090/readyz',
            },
          ],
        },
        {
          path: 'security',
          title: 'Security',
          description:
            'Configure authentication, route authorization, secrets, network exposure, and TLS termination.',
          keywords: ['security', 'TLS', 'secrets'],
          content: [
            {
              id: 'authentication',
              title: 'Authentication',
              paragraphs: [
                "Fitz separates two authentication surfaces: runtime auth validates a JWT on every session's CONNECT handshake, while FITZ_ADMIN_AUTH_MODE — protected by default — separately guards the admin API behind a username and an Argon2 password hash. Runtime verification prefers JWKS keys fetched over HTTPS through FITZ_JWT_JWKS_MAP; FITZ_AUTH_REQUIRED defaults to true, and setting it false drops the broker into anonymous mode with no per-connection identity check.",
                "Point FITZ_JWT_JWKS_MAP at your issuer's JWKS URL, set FITZ_JWT_AUDIENCES to the audiences your provider issues, and map the resolved identity claim (tid by default, or an override such as Auth0's org_id) to a provisioned family through FITZ_ROUTE_FAMILY_MAP. JWKS downloads are time- and size-bounded, cached, and coalesced across connections, so a missing key ID doesn't trigger a fresh identity-provider request per session.",
                "FITZ_JWT_HMAC_SECRET and FITZ_JWT_ALLOW_INSECURE_HTTP=true are local-only fallbacks that the broker's own production checklist says not to carry forward. Fitz has no session refresh, so tokens should be short-lived and a client should reconnect with a fresh one on expiry rather than renew a session in place.",
              ],
              code: 'FITZ_AUTH_REQUIRED=true\nFITZ_JWT_JWKS_MAP=https://idp.example=https://idp.example/.well-known/jwks.json\nFITZ_JWT_AUDIENCES=fitz\nFITZ_ROUTE_FAMILIES=1\nFITZ_ROUTE_FAMILY_MAP=acme=1',
              table: {
                headers: ['Variable', 'Default', 'Purpose'],
                rows: [
                  [
                    'FITZ_AUTH_REQUIRED',
                    'true',
                    'Enables JWT validation on CONNECT; false allows anonymous sessions',
                  ],
                  [
                    'FITZ_JWT_JWKS_MAP',
                    'unset',
                    'issuer=jwks_url pairs for runtime token verification; HTTPS only by default',
                  ],
                  [
                    'FITZ_JWT_HMAC_SECRET',
                    'unset',
                    'HS256 shared secret; local-development fallback only',
                  ],
                  [
                    'FITZ_JWT_AUDIENCES',
                    'fitz, fitz-broker',
                    'Allowed audience claim values',
                  ],
                  [
                    'FITZ_JWT_ALLOW_INSECURE_HTTP',
                    'false',
                    'Allows http:// JWKS URLs for local mock environments',
                  ],
                ],
              },
            },
            {
              id: 'authorization',
              title: 'Authorization',
              paragraphs: [
                "Authorization runs on two independent axes: RouteFamily is the broker-internal routing and storage-partition key resolved from a verified identity claim through FITZ_ROUTE_FAMILY_MAP, while realm is an opaque, application-visible namespace label carried inside the route. Fitz checks each frame's route against compiled permission patterns extracted from the token and rejects a mismatch with a domain-specific ERR_UNAUTHORIZED code — for example 1011 for KV or 2009 for Stream — since each domain reserves its own value in its own error-code range rather than sharing one number.",
                'Map each verified identity to one provisioned route family (FITZ_ROUTE_FAMILY_MAP, FITZ_ROUTE_FAMILIES) and shape route-scoped permission patterns from whichever claim source is populated first: FITZ_AUTH_CUSTOM_CLAIM, a top-level permissions claim, FITZ_AUTH_PERMISSIONS_CLAIM, FITZ_AUTH_ROLE_CLAIM, scp, or scope, checked in that fixed order.',
                'RouteFamily and realm are never inferred, aliased, or substituted for one another — a realm value cannot grant cross-family access, and a route family cannot stand in for an application permission pattern. Authorization is enforced per frame at the session layer; Fitz keeps no separate policy store, role-management UI, or group hierarchy beyond what the token already carries.',
              ],
              table: {
                headers: ['Order', 'Source'],
                rows: [
                  ['1', 'FITZ_AUTH_CUSTOM_CLAIM'],
                  ['2', 'Top-level permissions claim'],
                  ['3', 'FITZ_AUTH_PERMISSIONS_CLAIM'],
                  ['4', 'FITZ_AUTH_ROLE_CLAIM'],
                  ['5', 'scp'],
                  ['6', 'scope'],
                ],
              },
            },
            {
              id: 'secrets',
              title: 'Secrets',
              paragraphs: [
                'Fitz holds very little credential material directly: an Argon2 password hash for the admin account (FITZ_ADMIN_PASSWORD_HASH) and a session-signing key it generates itself in memory on every process start. Everything else it touches — JWKS keys, an optional JWT HMAC secret, and cloud storage credentials — is read from configuration or the process environment rather than stored by Fitz.',
                "Compute the Argon2 hash for FITZ_ADMIN_USERNAME / FITZ_ADMIN_PASSWORD_HASH yourself and inject it through your deployment platform's own secret mechanism. For FITZ_STORAGE_MODE=cloud, supply credentials as the cloud provider's native environment variables rather than a Fitz-specific format — the storage backend builder reads provider-native credential, region, and project or account variables directly.",
                'FITZ_ADMIN_JWT_SECRET is no longer required: the admin session-signing key is process-ephemeral, so every admin login cookie is invalidated on broker restart and there is no durable key to back up or rotate. Fitz performs no secret rotation, expiry, or vaulting of its own — rotating the Argon2 hash, the JWKS keys, or cloud credentials is entirely an operator and platform responsibility.',
              ],
              table: {
                headers: ['Material', 'Held by Fitz as', 'Source'],
                rows: [
                  [
                    'Admin password',
                    'Argon2 hash (FITZ_ADMIN_PASSWORD_HASH)',
                    'Operator-computed, supplied via environment',
                  ],
                  [
                    'Admin session key',
                    'Process-ephemeral signing key',
                    'Generated in memory at boot; not configurable',
                  ],
                  [
                    'Runtime JWT verification',
                    'Public JWKS keys over HTTPS, or a dev-only HMAC secret',
                    'External identity provider, or FITZ_JWT_HMAC_SECRET',
                  ],
                  [
                    'Cloud storage credentials',
                    'Provider-native environment variables',
                    "The cloud provider's own credential variables",
                  ],
                ],
              },
            },
            {
              id: 'network-and-tls',
              title: 'Network and TLS',
              paragraphs: [
                "Fitz's WebSocket, HTTP, and TCP listeners speak plaintext — the broker has no native TLS termination, and in-process certificate handling isn't part of the current listeners. Every non-loopback deployment needs an external TLS-terminating load balancer, reverse proxy, or sidecar in front of it, with browser clients connecting through that terminator over wss://.",
                'Place the broker behind your TLS terminator, set FITZ_ASSUME_EXTERNAL_TLS=true to assert that edge exists, and set FITZ_WS_ALLOWED_ORIGINS to your exact public SPA origins (no path, query, or trailing slash) alongside FITZ_ADMIN_PUBLIC_ORIGIN for the admin surface. Set FITZ_TCP_ENABLED=false when only browser WebSocket traffic is needed, or otherwise route raw TCP through that same trusted, TLS-capable boundary.',
                "FITZ_ASSUME_LOCAL_LOOPBACK_EDGE is a separate, container-only assertion for local Compose that never asserts TLS or enables HSTS and must not carry into a real deployment. FITZ_ASSUME_EXTERNAL_TLS only tells Fitz a trusted terminator already exists — it enables TLS-dependent behavior like HSTS, it does not add encryption to the broker's own listeners.",
              ],
              code: 'FITZ_ADMIN_AUTH_MODE=protected\nFITZ_ADMIN_USERNAME=admin\nFITZ_ADMIN_PASSWORD_HASH=<argon2-hash>\nFITZ_ADMIN_PUBLIC_ORIGIN=https://admin.example.com\nFITZ_ADMIN_COOKIE_SECURE=true\nFITZ_WS_ALLOWED_ORIGINS=https://app.example.com\nFITZ_ASSUME_EXTERNAL_TLS=true',
              callout: {
                title: 'Startup refuses without an external TLS assertion',
                body: 'When runtime auth or FITZ_ADMIN_AUTH_MODE=protected is combined with a non-loopback bind, Fitz refuses to start unless FITZ_ASSUME_EXTERNAL_TLS=true is also set. This is a deployment assertion, not a TLS implementation — Fitz does not terminate TLS itself, and native listener TLS is not something the current broker provides.',
              },
            },
          ],
        },
        {
          path: 'observability',
          title: 'Observability',
          description:
            'Use health probes, readiness, metrics, logs, and domain diagnostics to operate Fitz.',
          keywords: ['metrics', 'logs', 'probes'],
          content: [
            {
              id: 'health-and-readiness',
              title: 'Health and readiness',
              paragraphs: [
                'Fitz exposes five purpose-built HTTP probes plus a legacy alias — /livez, /startupz, /readyz, /healthz, /targetz, and /health (an alias for /healthz) — all public and unauthenticated so orchestrators and traffic managers can reach them without a session. /livez only checks process liveness and whether an initialized domain has permanently failed after exhausting supervised restarts; /readyz and /healthz share one readiness contract (storage engine initialized, active single-writer storage lease held, domain actors started, auth configuration validated during boot, listeners bound, not in shutdown handoff) and differ only in intended caller.',
                '/targetz is narrower: it proves the HTTP listener is up and not draining without waiting on the Midge writer lease, so an incoming process can become target-eligible before the outgoing writer gives up storage ownership — it is not a data-plane or storage health signal, and storage_writer_lease can report not_ready while /targetz still returns 200. During a planned drain, /livez keeps returning 200 while /targetz, /readyz, and /healthz return 503 until FITZ_DRAIN_GRACE_SECONDS elapses and existing sessions close.',
              ],
              table: {
                headers: ['Endpoint', 'Auth', 'What it checks'],
                rows: [
                  [
                    '/livez',
                    'None',
                    'Runtime responsive; no domain permanently failed after restart exhaustion',
                  ],
                  [
                    '/startupz',
                    'None',
                    'Boot finished, domain actors ready, listeners bound',
                  ],
                  [
                    '/readyz',
                    'None',
                    'Storage engine, single-writer lease, domains, auth config, listeners; not draining',
                  ],
                  [
                    '/healthz',
                    'None',
                    'Same readiness contract as /readyz; used as the single traffic-admission endpoint',
                  ],
                  [
                    '/targetz',
                    'None',
                    'HTTP listener up and not draining; does not require the writer lease',
                  ],
                  ['/health', 'None', 'Legacy alias for /healthz'],
                ],
              },
            },
            {
              id: 'metrics',
              title: 'Metrics',
              paragraphs: [
                'Fitz exposes two independent metrics surfaces with different transports and authority. Raw Prometheus text is served only by the dedicated listener at FITZ_METRICS_BIND_ADDR:FITZ_METRICS_PORT (default 127.0.0.1:9090) — the main authenticated listener returns 404 for /metrics, so scraping only ever happens against the dedicated port. For the admin UI and operator tooling there is a structured JSON alternative: GET /api/v1/{family}/metrics for one authorized route family, and GET /api/v1/all/metrics for a broker-wide view that requires wildcard route-family authority.',
                'Scrape the dedicated port for counters such as fitz_connections_opened_total, fitz_connections_closed_total, fitz_frames_received_total, fitz_frames_sent_total, and fitz_frames_malformed_total from the transport layer, fitz_domain_operations_total and fitz_domain_errors_total (each labeled by domain) from domain actors, and histograms like fitz_domain_operation_latency_ms, fitz_route_match_latency_us, and fitz_permission_check_latency_us. Use the structured JSON endpoint instead when you need family-scoped numbers inside the admin surface: each entry in its samples array carries name, kind, help, labels, and value, and the family-scoped endpoint contains only samples attributable to that family.',
                'Per-route, per-connection latency attribution is expensive enough to collect that it stays off by default; set FITZ_HOT_PATH_METRICS=true when you need that resolution for an investigation, then turn it back off once you have it.',
                'The dedicated metrics port is unauthenticated by design — no admin cookie, no mutation routes — which is exactly why it must stay private to your scrape network rather than exposed on a public interface; Fitz does not add its own access control there. The structured JSON endpoints take the opposite trade-off: they sit behind the authenticated admin session and family authority model, so they are safe to reach from browser tooling but are not a drop-in for a Prometheus scrape target.',
              ],
              table: {
                headers: ['Surface', 'Endpoint', 'Format', 'Auth', 'Scope'],
                rows: [
                  [
                    'Raw Prometheus',
                    'GET {FITZ_METRICS_BIND_ADDR}:{FITZ_METRICS_PORT}/metrics',
                    'Prometheus text (# HELP / # TYPE)',
                    'None',
                    'Broker-wide, all domains',
                  ],
                  [
                    'Structured JSON (family)',
                    'GET /api/v1/{family}/metrics',
                    'JSON samples array',
                    'Admin session cookie',
                    'One authorized family',
                  ],
                  [
                    'Structured JSON (all)',
                    'GET /api/v1/all/metrics',
                    'JSON samples array',
                    'Admin session, wildcard authority',
                    'Broker-wide',
                  ],
                ],
              },
              code: 'curl http://localhost:9090/metrics | head -6\n# HELP fitz_connections_opened_total Fitz counter metrics\n# TYPE fitz_connections_opened_total counter\nfitz_connections_opened_total 5\n\ncurl -b "$COOKIE" http://localhost:4090/api/v1/queue/metrics\n{\n  "scope": "family",\n  "family": 2,\n  "generated_at": 1769270400000,\n  "samples": [\n    { "name": "fitz_queue_complete_total", "kind": "counter", "help": "...", "labels": {}, "value": 11 }\n  ]\n}',
              callout: {
                title:
                  'Keep the dedicated metrics listener off the public network',
                body: 'FITZ_METRICS_BIND_ADDR defaults to loopback (127.0.0.1) for this reason; if you widen it to bind on a routable interface for a scrape agent, put it behind a network boundary the same way you would any other unauthenticated internal endpoint.',
              },
            },
            {
              id: 'logs',
              title: 'Logs',
              paragraphs: [
                'Fitz logs to stdout in human-readable, colorized text by default. Set FITZ_LOG_FORMAT=json to switch every line to structured JSON, and set FITZ_LOG_LEVEL (trace, debug, info, warn, and so on; default info) to control the base filter. If RUST_LOG is set, it takes precedence over the FITZ_LOG_LEVEL-constructed filter, so standard tracing env-filter syntax can target individual modules without touching FITZ_LOG_LEVEL globally.',
                'Turn on FITZ_LOG_FORMAT=json when shipping logs to a collector that parses structured fields: each line carries timestamp, level, message, target, module_path, and a span object (for example {"name": "boot"}), so a log line can be correlated back to the tracing span that emitted it. Raise FITZ_LOG_LEVEL to debug (or use a RUST_LOG filter) when chasing a specific code path — hot paths such as frame I/O, TLV decode, and routing are sampled at a low fixed rate and largely emit at debug level, so the default info level hides most of that detail until you ask for it.',
                "OpenTelemetry OTLP trace export is a separate layer on top of logging. OTEL_ENABLED defaults to true and OTEL_EXPORTER_OTLP_ENDPOINT defaults to http://localhost:4317, so a broker with no collector listening on that address is exporting spans nobody receives; standing up a real collector and pointing OTEL_EXPORTER_OTLP_ENDPOINT at it (and tuning FITZ_OTEL_SAMPLE_RATIO, FITZ_SERVICE_INSTANCE_ID, and FITZ_DEPLOYMENT_ENVIRONMENT) is the meaningful opt-in step, or set OTEL_ENABLED=false to turn the export path off entirely, as the project's own test runs do.",
              ],
              table: {
                headers: ['Variable', 'Values', 'Default', 'Effect'],
                rows: [
                  [
                    'FITZ_LOG_FORMAT',
                    'text or json',
                    'text',
                    'Log line formatter',
                  ],
                  [
                    'FITZ_LOG_LEVEL',
                    'trace, debug, info, warn, etc',
                    'info',
                    'Base log level',
                  ],
                  [
                    'RUST_LOG',
                    'tracing env-filter syntax',
                    'unset',
                    'Overrides the FITZ_LOG_LEVEL filter when set',
                  ],
                  [
                    'OTEL_ENABLED',
                    'true or false',
                    'true',
                    'Enables the OTLP export path',
                  ],
                  [
                    'OTEL_EXPORTER_OTLP_ENDPOINT',
                    'URL',
                    'http://localhost:4317',
                    'OTLP collector endpoint',
                  ],
                  [
                    'FITZ_OTEL_SAMPLE_RATIO',
                    '0.0 to 1.0',
                    '1.0',
                    'OTEL trace sampling ratio',
                  ],
                  [
                    'FITZ_SERVICE_INSTANCE_ID',
                    'string',
                    'generated UUID',
                    'Service instance metadata on trace resources',
                  ],
                  [
                    'FITZ_DEPLOYMENT_ENVIRONMENT',
                    'string',
                    'unknown',
                    'Deployment environment metadata on trace resources',
                  ],
                ],
              },
              code: 'FITZ_LOG_FORMAT=json FITZ_LOG_LEVEL=info ./target/debug/fitz > /tmp/fitz.log 2>&1 &\ncat /tmp/fitz.log | jq \'.\'\n{\n  "timestamp": "2026-02-21T12:34:56.789Z",\n  "level": "INFO",\n  "message": "Starting Fitz broker",\n  "target": "fitz::boot",\n  "module_path": "fitz::boot",\n  "span": { "name": "boot" }\n}',
            },
            {
              id: 'domain-diagnostics',
              title: 'Domain diagnostics',
              paragraphs: [
                'GET /api/v1/{family}/troubleshooting (and the global GET /api/v1/troubleshooting for wildcard-authority sessions) returns a diagnostic snapshot per resource carrying one of eight canonical diagnosis labels in current_stage: healthy, throughput, contention, backlog_growth, stale_handoff, dead_letter_pressure, worker_starvation, and data_loss_risk. Each snapshot also reports a trend (growing, shrinking, steady, stalled, or unknown), a severity (informational, low, medium, high, or critical), a confidence score with a confidence_justification listing matched and missing signals, and explanation_hints — deterministic text describing the diagnosis and whether it reflects ephemeral, durable, or mixed state.',
                'Start with the label, not the raw counters behind it: throughput means work is moving but the surface is lagging demand; contention means multiple actors are competing for the same resource or route; backlog_growth and stale_handoff flag durable state (queue backlog, an overdue schedule handoff) falling behind; dead_letter_pressure and worker_starvation point at accumulating retries or workers/owners that are not available; data_loss_risk is reserved for cases where the control plane can see an actual durability gap. Follow recommended_next_query to the bounded resource-events timeline for transition history, and use the compare view when the question is what changed rather than what is currently broken.',
                "A troubleshooting snapshot is diagnosis, not remediation. The admin router does not implement endpoints to force a KV rollback, cancel a Notice subscription, cancel an RPC request, release a lease, or trigger a schedule manually; replaying or purging one queue dead letter is the one mutating action that does exist (POST/DELETE on the dead-letters route), so acting on any other diagnosis stays a call to the domain's own client-facing operation, not the admin API.",
              ],
              table: {
                headers: ['Label', 'Explanation hint', 'Durability character'],
                rows: [
                  ['healthy', 'No active pressure detected', 'n/a'],
                  [
                    'throughput',
                    'Work is moving, but the surface is lagging demand',
                    'Mostly live activity with a durable backlog overlay',
                  ],
                  [
                    'contention',
                    'Multiple actors are contending for the same resource',
                    'Usually live coordination state; durable state may still be intact',
                  ],
                  [
                    'backlog_growth',
                    'Backlog is growing faster than it drains',
                    'Durable backlog with live processing lag',
                  ],
                  [
                    'stale_handoff',
                    'A durable handoff is overdue',
                    'Durable ownership or schedule state with live lateness',
                  ],
                  [
                    'dead_letter_pressure',
                    'Dead letters are accumulating',
                    'Durable failure state plus live retry pressure',
                  ],
                  [
                    'worker_starvation',
                    'Work is waiting for workers or owners',
                    'Mostly live capacity pressure',
                  ],
                  [
                    'data_loss_risk',
                    'The control plane sees a durability gap',
                    'Potential durable-state loss; treat as critical',
                  ],
                ],
              },
              code: 'GET /api/v1/queue/troubleshooting\n{\n  "current_stage": "backlog_growth",\n  "trend": "growing",\n  "severity": "high",\n  "likely_bottleneck": "consumer_throughput",\n  "age_seconds": 842,\n  "recent_transition_count": 3,\n  "failure_count": 0,\n  "contention_count": 0,\n  "waiter_count": 12,\n  "confidence": 0.86,\n  "explanation_hints": [\n    "Backlog is growing faster than it drains",\n    "Durable backlog with live processing lag"\n  ],\n  "delta_5m": 140,\n  "delta_1h": 610\n}',
            },
          ],
        },
        {
          path: 'resource-limits',
          title: 'Resource Limits',
          description:
            'Bound connections, sessions, routes, messages, queues, workers, and storage work.',
          keywords: ['limits', 'resources', 'admission'],
          content: [
            {
              id: 'connection-limits',
              title: 'Connection limits',
              paragraphs: [
                'BootConfig and IngressConfig fix two connection ceilings and one frame ceiling at compile time: 10,000 concurrent connections shared across the broker, and a 1,048,576-byte (1 MiB) maximum for the whole multiplexed frame the transport reads before handing it to the TLV decoder.',
                "The HTTP/WebSocket listener layers a second, tighter semaphore on top of the global one: max_connections divided by four and rounded up, then clamped to 1-1,024, so with the default 10,000-connection budget the HTTP/WebSocket path tops out at 1,024 concurrent sockets while the raw TCP listener can still use the full 10,000. Inside a frame, one TLV record's value is separately capped at 65,535 bytes by the u16 length prefix in the wire format, independent of the outer 1 MiB frame budget.",
                'None of max_connections, max_frame_size, or the transport-to-runtime channel capacity is wired to an environment variable in the shipped fitz binary today -- they are compiled-in defaults (10,000 connections, 1 MiB frames, a 1,000-message channel capacity), and there is currently no supported way to change any of the three short of building your own binary against a different configuration.',
              ],
              table: {
                headers: ['Limit', 'Default', 'Scope'],
                rows: [
                  [
                    'Concurrent connections (TCP listener)',
                    '10,000',
                    'Global semaphore shared by every accepted TCP socket',
                  ],
                  [
                    'Concurrent connections (HTTP/WebSocket listener)',
                    '1,024',
                    'Second semaphore: max_connections / 4, clamped to 1-1,024',
                  ],
                  [
                    'Frame size',
                    '1 MiB (1,048,576 bytes)',
                    'Whole multiplexed frame read before TLV decoding',
                  ],
                  [
                    'TLV value length',
                    '65,535 bytes',
                    'Per-record wire cap from the u16 length prefix',
                  ],
                  [
                    'Unauthenticated connection deadline',
                    '10s',
                    'CONNECT_DEADLINE before an unauthenticated transport is dropped',
                  ],
                  [
                    'WebSocket ping interval / pong timeout',
                    '5s / 10s',
                    'Liveness cadence for the WebSocket transport',
                  ],
                  [
                    'TCP keepalive interval',
                    '30s',
                    'Kernel-assisted dead-peer detection for raw TCP',
                  ],
                  [
                    'HTTP header read timeout',
                    '10s',
                    'Time allowed to receive one HTTP request header block',
                  ],
                  [
                    'Non-upgraded HTTP connection lifetime',
                    '60s',
                    'Maximum lifetime for an HTTP connection that never upgrades',
                  ],
                  [
                    'Transport-to-runtime channel capacity',
                    '1,000',
                    'Per-session bounded channel for outbound frames and the session mux',
                  ],
                ],
              },
            },
            {
              id: 'domain-limits',
              title: 'Domain limits',
              paragraphs: [
                'RPC and Stream dispatch route work through family actor pools: every provisioned route family gets two bounded mailboxes on its owning shard, a 16,384-slot normal lane and a 256-slot control lane, and the shard always drains the control lane first so a saturated data-plane lane cannot starve drain, cleanup, or other control traffic.',
                "RPC bounds its own broker-local coordination state on top of that: at most 4,096 pending correlations across the whole broker, 1,000 pending requests per route by default, a worker's declared concurrency credit must fall between 1 and 1,024, and an unanswered request times out after 30 seconds by default -- all of it is in-memory and disappears on disconnect cleanup or broker restart, since RPC makes no durability claim.",
                "Notice caps wildcard subscriptions at 128 per session to keep its in-memory pattern matcher bounded, Lease rejects any Acquire whose requested wait_seconds is greater than the broker's 30-second max_wait_seconds instead of queuing it, and every domain that accepts a route or permission pattern shares one shape limit: 4,096 UTF-8 bytes and 64 non-empty path segments.",
              ],
              table: {
                headers: ['Domain scope', 'Limit', 'Default'],
                rows: [
                  [
                    'RPC / Stream family actor, normal lane',
                    'FAMILY_ACTOR_NORMAL_LANE_CAPACITY',
                    '16,384 messages',
                  ],
                  [
                    'RPC / Stream family actor, control lane',
                    'FAMILY_ACTOR_CONTROL_LANE_CAPACITY',
                    '256 messages, drained first',
                  ],
                  [
                    'RPC pending requests, broker-wide',
                    'RPC_MAX_PENDING_REQUESTS',
                    '4,096 correlations',
                  ],
                  [
                    'RPC pending requests, per route',
                    'RPC_DEFAULT_ROUTE_PENDING_CAPACITY',
                    '1,000 requests',
                  ],
                  [
                    'RPC worker concurrency credit',
                    'max_concurrent (validated range)',
                    '1-1,024',
                  ],
                  [
                    'RPC request timeout',
                    'RPC_DEFAULT_REQUEST_TIMEOUT',
                    '30 seconds',
                  ],
                  [
                    'Notice wildcard subscriptions',
                    'MAX_WILDCARD_SUBSCRIPTIONS_PER_SESSION',
                    '128 per session',
                  ],
                  [
                    'Lease wait_seconds',
                    'max_wait_seconds',
                    '30 seconds, rejected above this',
                  ],
                  [
                    'Route / permission pattern shape',
                    'MAX_ROUTE_BYTES / MAX_ROUTE_SEGMENTS',
                    '4,096 bytes / 64 segments',
                  ],
                ],
              },
            },
            {
              id: 'storage-limits',
              title: 'Storage limits',
              paragraphs: [
                'Fitz does not enforce an application-level byte or row quota on domain storage -- capacity is bounded by the selected StorageMode and whatever disk sits underneath the embedded Midge storage engine. FITZ_STORAGE_MODE chooses memory (fully ephemeral), local (the default, persisted at ./.fitz unless FITZ_STORAGE_PATH is set), or cloud (a local cache directory, default ./.fitz-cloud-cache or FITZ_STORAGE_CACHE_PATH, paired with a provider bucket or container through FITZ_STORAGE_PROVIDER).',
                "FITZ_STORAGE_MEMTABLE_BYTES optionally overrides Midge's own memtable sizing -- it must parse as a positive integer or boot validation fails -- and it tunes how much write volume buffers in memory before a flush, not a ceiling on total stored data. Queue durability is a separate, explicit choice: FITZ_QUEUE_WRITE_POLICY selects fast (the default: skip the WAL on enqueue and flush dirty queue column families in the background inside a 100ms window set by FITZ_QUEUE_LOSS_WINDOW_MS), buffered (WAL writes without a forced fsync per operation), or strict (wait for local sync, or provider acknowledgement in cloud mode).",
                "Cloud durability for other broker-selected sync writes is controlled separately by FITZ_STORAGE_CLOUD_DURABILITY: background accepts local WAL visibility and uploads to the provider asynchronously, while strict waits for the provider's acknowledgement before the write returns to the caller. All three storage-mode branches are validated at boot, so an empty local path, a missing FITZ_STORAGE_PROVIDER, a missing bucket or container, or an empty cache path fail startup before the broker accepts any traffic.",
              ],
              table: {
                headers: ['Storage mode', 'Default location', 'Persistence'],
                rows: [
                  [
                    'memory',
                    'n/a',
                    'Fully ephemeral; nothing survives a restart',
                  ],
                  [
                    'local (default)',
                    './.fitz, or FITZ_STORAGE_PATH',
                    'Local disk through the embedded Midge engine',
                  ],
                  [
                    'cloud',
                    './.fitz-cloud-cache local cache plus a provider bucket or container',
                    'Local cache with provider-backed persistence',
                  ],
                ],
              },
              code: 'FITZ_STORAGE_MODE=local\nFITZ_STORAGE_PATH=/data/fitz\nFITZ_STORAGE_MEMTABLE_BYTES=67108864\nFITZ_QUEUE_WRITE_POLICY=buffered\nFITZ_QUEUE_LOSS_WINDOW_MS=250',
            },
            {
              id: 'admission-behavior',
              title: 'Admission behavior',
              paragraphs: [
                'Hitting a limit produces a domain-specific rejection, not a generic error. A full connection semaphore drops the socket before a session exists; an oversized frame returns IngressError::FrameTooLarge and closes the connection; a full family actor lane returns FamilyActorEnqueueError::NormalLaneFull or ControlLaneFull to the enqueueing router code; and RPC returns RpcErrorCode::Backpressure ("RPC_BACKPRESSURE") once the broker-wide or per-route pending cap is reached, or RpcErrorCode::Timeout ("RPC_TIMEOUT") once a worker goes 30 seconds without replying.',
                "Lease enforces its cap up front rather than softening it: an Acquire that asks to wait longer than the broker's 30-second max_wait_seconds is rejected immediately with a Timeout response and is never queued, so a caller cannot get extra wait time by asking for more of it.",
              ],
              table: {
                headers: ['Domain / layer', 'Trigger', 'Caller-visible signal'],
                rows: [
                  [
                    'Connection (TCP)',
                    'max_connections permit unavailable',
                    'Socket dropped before a session exists; nothing sent on the wire',
                  ],
                  [
                    'Connection (HTTP/WebSocket)',
                    'HTTP semaphore permit unavailable',
                    'Connection closed via reject_http_connection',
                  ],
                  [
                    'Frame',
                    'Frame exceeds the 1 MiB max_frame_size',
                    'IngressError::FrameTooLarge; connection closed',
                  ],
                  [
                    'RPC / Stream family actor',
                    'Normal or control lane full',
                    'FamilyActorEnqueueError::NormalLaneFull / ControlLaneFull',
                  ],
                  [
                    'RPC',
                    'Broker-wide or per-route pending cap reached',
                    'RpcErrorCode::Backpressure ("RPC_BACKPRESSURE")',
                  ],
                  [
                    'RPC',
                    'Worker silent past the 30s request timeout',
                    'RpcErrorCode::Timeout ("RPC_TIMEOUT")',
                  ],
                  [
                    'Lease',
                    'wait_seconds greater than max_wait_seconds (30s)',
                    'LeaseResponse::Timeout, returned immediately, never queued',
                  ],
                  [
                    'Notice',
                    'Subscriber mailbox still full after 200 retries',
                    'Silent drop; fitz_notice_delivery_drops_total increments, no caller signal',
                  ],
                ],
              },
              callout: {
                title: 'Notice publish never reports backpressure',
                body: "Notice is fire-and-forget by design: a delivery attempt against a full subscriber mailbox is retried up to 200 times with a thread yield between attempts, and if the mailbox is still full the broker drops the Notice delivery and increments the fitz_notice_delivery_drops_total counter -- with no error returned to the publisher and no signal to the subscriber that anything was missed. Every other domain in this section returns a caller-visible error when its limit is hit; Notice's publish path does not, and that is intentional, not something application code needs to route around.",
              },
            },
          ],
        },
        {
          path: 'runbook',
          title: 'Operator Runbook',
          description:
            'Start, inspect, drain, restart, recover, and verify one Fitz broker.',
          keywords: ['runbook', 'restart', 'incident'],
          content: [
            {
              id: 'start-and-verify',
              title: 'Start and verify',
              paragraphs: [
                'Before starting, confirm the config and secrets baseline the process needs: the auth and browser perimeter settings and the storage configuration, since Fitz rejects startup outright when runtime auth or protected admin is configured on a non-loopback bind without an explicit external-TLS assertion. Start the process, wait for /startupz to report status "started", then wait for /healthz or /readyz to return 200 before sending any data-plane traffic; both mirror the same readiness contract and only turn healthy once the storage engine is initialized, the Midge-backed single-writer storage lease is acquired, domain actors are running, and auth configuration has passed validation.',
                '/targetz is narrower: it proves the HTTP listener is up and the process is not draining, but it intentionally does not require the storage writer lease, so reserve it for single-active handoff overlap where an incoming process needs to become target-eligible before it owns storage. Do not wire data-plane traffic admission to /targetz; storage_writer_lease can still read not_ready while /targetz returns 200.',
                'Confirm the scrape next: raw Prometheus is served only from the dedicated FITZ_METRICS_BIND_ADDR:FITZ_METRICS_PORT/metrics listener, which is unauthenticated by design and should stay on the private scrape network, while the main authenticated listener returns 404 for /metrics. Close startup verification with one authenticated client round trip on /ws using any supported client.',
              ],
              table: {
                headers: ['Probe', 'Auth', 'Turns healthy when', 'Drives'],
                rows: [
                  [
                    '/startupz',
                    'None',
                    'All initialization finished; domain actors and listeners are ready',
                    'Suppressing premature liveness checks',
                  ],
                  [
                    '/livez',
                    'None',
                    'Runtime is responsive and no initialized domain has permanently failed after exhausting supervised restarts',
                    'Restart decisions',
                  ],
                  [
                    '/targetz',
                    'None',
                    'HTTP listener is up and not draining; writer lease not required',
                    'Handoff target eligibility only',
                  ],
                  [
                    '/healthz, /readyz',
                    'None',
                    'Storage lease acquired, domains initialized, auth validated, listeners bound, not in shutdown handoff',
                    'Data-plane traffic admission',
                  ],
                ],
              },
              code: 'curl -sf http://localhost:4090/startupz\ncurl -sf http://localhost:4090/healthz\ncurl -sf http://localhost:9090/metrics | head -3',
              callout: {
                title: 'targetz is not a readiness check',
                body: '/targetz can return 200 while storage_writer_lease is still not_ready. Gate WebSocket and TCP admission on /healthz or /readyz, and reserve /targetz for orchestrator handoff eligibility only.',
              },
            },
            {
              id: 'drain-traffic',
              title: 'Drain traffic',
              paragraphs: [
                'Trigger a planned drain with POST /api/v1/runtime/drain from an authenticated same-origin admin session that holds wildcard authority, or let the orchestrator send the process termination signal instead; both paths run the same sequence. Fitz stops accepting new TCP and WebSocket sessions, waits the configured FITZ_DRAIN_GRACE_SECONDS (25 seconds by default), then closes the sessions still open and releases the storage writer lease.',
                'While draining, /targetz, /healthz, and /readyz all return 503 with accepting_target_traffic or accepting_traffic reported as "draining" in their checks, while /livez keeps returning 200 so the drain itself is never mistaken for a liveness failure. Set the external deregistration delay close to FITZ_DRAIN_GRACE_SECONDS and the process termination grace longer than it, so the platform in front of Fitz stops sending new sessions before Fitz starts closing the ones already open.',
                "Drain is broker-wide, not per-session: the admin API has no session-detail or session-close route, so there is no way to force one session or one realm's sessions off ahead of the rest. Sessions closed by drain are ephemeral only; subscriptions, worker registrations, leases, and open transactions are rebuilt by each client's own reconnect logic, not carried over by Fitz.",
              ],
              code: 'curl -sf -c admin.cookies -X POST \\\n  -H "Content-Type: application/json" \\\n  -d \'{"username":"admin","password":"..."}\' \\\n  http://localhost:4090/api/v1/session\n\ncurl -sf -b admin.cookies -X POST \\\n  -H "Origin: https://admin.example.com" \\\n  http://localhost:4090/api/v1/runtime/drain',
              callout: {
                title: 'No per-session admin control',
                body: "There is no admin route to close, inspect in detail, or selectively drain a single session. If one client needs to be forced off, the only broker-wide lever is a full drain; anything narrower is an application-level control, such as revoking that client's token.",
              },
            },
            {
              id: 'restart-and-recover',
              title: 'Restart and recover',
              paragraphs: [
                'Single-active rolling swap works by giving one incoming process a window to become target-eligible before the outgoing process gives up its storage writer lease. Configure the traffic manager to gate handoff eligibility on /targetz while keeping /healthz or /readyz as the strict data-plane readiness check that actually admits WebSocket and TCP traffic, and reuse the same drain-grace timing: external deregistration delay close to FITZ_DRAIN_GRACE_SECONDS, termination grace longer than it.',
                "Start the incoming process; it may pass /targetz before it owns the writer lease, but it must still reject WebSocket upgrades and TCP sessions until /healthz or /readyz reports 200. Drain the outgoing process next, either through POST /api/v1/runtime/drain or the orchestrator's termination signal, and confirm its probes show the draining checks before assuming the handoff is safe; only once the outgoing process has released the writer lease and the incoming one shows /healthz or /readyz at 200 should smoke checks run against it.",
                'If the overlap window, target-eligible but not yet writer-lease-holding, is unacceptable for a given platform, gate traffic admission on /healthz or /readyz instead of /targetz and pick a rollout strategy that stops the outgoing writer before the incoming process becomes target-eligible, trading the overlap for a short traffic gap. For an emergency rollback, stop the rollout immediately, revert to the last known-good image and configuration, rerun the full startup verification sequence, and keep elevated monitoring through one complete traffic cycle before standing down.',
              ],
              code: 'GET /targetz  -> 503\n{ "checks": { "accepting_target_traffic": "draining" } }\n\nGET /healthz  -> 503\n{ "checks": { "accepting_traffic": "draining" } }',
              callout: {
                title: 'One writer lease at a time',
                body: 'The single-active pattern deliberately runs two processes at once during handoff, but only one ever holds the storage writer lease. The incoming process is target-eligible before it holds that lease, not before it needs it, and keeps rejecting data-plane sessions until /healthz or /readyz confirms the lease and the rest of the readiness contract.',
              },
            },
            {
              id: 'incident-checks',
              title: 'Incident checks',
              paragraphs: [
                'Classify first, then look: decide whether the issue is auth, routing, storage, transport, or domain behavior before touching any configuration, then check /livez, /healthz, and /readyz alongside the counters for that area, such as auth failures and permission denials, route mismatches and delivery failures, mailbox depth and pending-operation gauges, or TLV codec errors, from the dedicated Prometheus listener or the authenticated /api/v1/{family}/metrics endpoint.',
                'Pull GET /api/v1/{family}/troubleshooting, or /api/v1/troubleshooting broker-wide with wildcard authority, for the canonical diagnosis label, severity, and trend before reading raw counters in isolation; the label separates ephemeral live pressure from durable state and points to a bounded resource-events lookup as the next query. Apply a realm-scoped mitigation, such as a temporary connection or rate limit on the affected realm, when the pressure is isolated to one realm; reduce load and start a controlled rollback instead when it is broker-wide, and record the timeline and root-cause data for the postmortem either way.',
                'The troubleshooting surface reports labels and bounded history, not remote control: the admin API has no route to force a KV transaction rollback, cancel a Notice subscription or pending RPC call, force-release a Lease, trigger a Schedule run early, or close one session. Isolating or recovering a single resource beyond a realm-scoped limit stays an application-level or manual action, not an admin API call.',
              ],
              table: {
                headers: ['Label', 'Meaning'],
                rows: [
                  ['healthy', 'No active pressure detected'],
                  [
                    'throughput',
                    'Work is moving, but the surface is load-bearing and worth watching',
                  ],
                  [
                    'contention',
                    'Multiple actors are competing for the same resource or route',
                  ],
                  [
                    'backlog_growth',
                    'Backlog or lag is growing faster than it drains',
                  ],
                  [
                    'stale_handoff',
                    'A durable handoff or scheduled action is overdue',
                  ],
                  [
                    'dead_letter_pressure',
                    'Retries are accumulating in dead letters',
                  ],
                  [
                    'worker_starvation',
                    'Work is waiting for workers, sessions, or owners',
                  ],
                  [
                    'data_loss_risk',
                    'Reserved for cases where the control plane can see a durability gap',
                  ],
                ],
              },
              code: 'curl -sf -b admin.cookies \\\n  http://localhost:4090/api/v1/acme/troubleshooting',
              callout: {
                title: 'Admin session resets on restart',
                body: 'Protected admin session cookies expire whenever the broker restarts, because the signing key is process-ephemeral. Re-authenticate against /api/v1/session before running admin troubleshooting or drain calls right after a recovery restart.',
              },
            },
          ],
        },
        {
          path: 'migrations',
          title: 'Migrations',
          description:
            'Move Fitz configuration, storage formats, and deployments through a reversible operator workflow.',
          keywords: ['migration', 'rollback'],
          content: [
            {
              id: 'plan-the-change',
              title: 'Plan the change',
              paragraphs: [
                "Fitz ships no migration tool: a migration is an operator-planned change to one broker's route-family configuration, admin API paths, wire protocol, or storage format. Two rules bound what's safe before any node is touched: message-type range assignments stay stable once released -- a domain's reserved block is never reassigned or renumbered later -- and any storage-format change needs a documented upgrade path, not a silent rewrite. A release that carries compatibility risk needs migration notes, and a change to stored data, wire behavior, or deployment config needs rollback instructions before it ships.",
                "Use this step to classify the change as additive, behavioral, or breaking. Real breaking changes in Fitz's history show the scope this can reach: moving to server-side route-family resolution required token issuers to emit identity context and stop emitting the legacy fitz.route_family, fitz.permissions, and JWT realm/areas/scopes claims, removed the FITZ_AUTH_ALLOW_JWT_ROUTE_FAMILY variable entirely (a broker still configured with it now refuses to start), and a later change moved admin domain routes from /api/v1/{domain}/... to /api/v1/{family}/{domain}/..., with the old domain-first paths returning 404.",
                'Because Fitz does not coordinate a rolling state transfer between nodes, the plan has to size a bounded per-node maintenance window rather than a live cutover, and nothing in the repository sequences that window for you.',
              ],
              table: {
                headers: ['Category', 'Requirement'],
                rows: [
                  [
                    'Additive',
                    'Generally safe with version negotiation or default handling',
                  ],
                  [
                    'Behavioral',
                    'Requires an explicit release note and client guidance',
                  ],
                  [
                    'Breaking',
                    'Requires a migration procedure and a rollback plan',
                  ],
                ],
              },
            },
            {
              id: 'back-up-state',
              title: 'Back up state',
              paragraphs: [
                'Fitz has no backup command; backing up state means snapshotting whatever storage backend the node is configured with — the FITZ_STORAGE_PATH directory in local mode, or the provider bucket/container and FITZ_STORAGE_PREFIX in cloud mode — before the maintenance window opens.',
                'Use the per-domain durability table to decide what a backup actually needs to protect: Stream and KV hold committed state, Queue backlog and Schedule definitions and pending fire claims persist under their own write policy, while Notice, RPC, and Lease are live-only and have nothing durable to capture.',
                'Backing up also means validating that a rollback image is available and freezing nonessential schema or config changes for the duration, per the pre-upgrade checklist; the guide gives no restore command, so restoring is the operator reversing whatever snapshot method produced the backup.',
              ],
              table: {
                headers: ['Domain', 'Durable behavior'],
                rows: [
                  ['Notice', 'None; live fanout only'],
                  [
                    'Stream',
                    'Committed history survives according to write mode',
                  ],
                  [
                    'KV',
                    'Committed current state survives according to write mode',
                  ],
                  ['Queue', 'Backlog survives according to queue write policy'],
                  ['RPC', 'None; workers and pending calls are live only'],
                  ['Lease', 'None; ownership is live only'],
                  [
                    'Schedule',
                    'Definitions and pending fire claims survive restart',
                  ],
                ],
              },
            },
            {
              id: 'apply-the-migration',
              title: 'Apply the migration',
              paragraphs: [
                'Applying a migration means stopping traffic to the single broker node, letting it drain active sessions on graceful shutdown, swapping in the upgraded image and configuration, and waiting for readiness validation before traffic returns — there is no rolling or partial-traffic path, because one deployment runs one broker.',
                "Use the window to land configuration changes atomically with the code they depend on: FITZ_ROUTE_FAMILIES and FITZ_ROUTE_FAMILY_MAP, keyed by the FITZ_ROUTE_FAMILY_CLAIM identity claim (tid by default), must be in place before a hardened broker starts accepting authenticated CONNECT, and every client's Schedule codec must upgrade in the same window once CREATE, CREATE_BATCH, and LIST start carrying the [route][cron][mode][payload] shape, since older CREATE payloads are rejected outright with no negotiation. Update admin grants to * or canonical decimal family IDs in the same pass — symbolic, non-canonical, or overflowed grants are rejected when a session is created or validated.",
                'Monitor auth errors, route mismatches, and tail latency as traffic ramps back up, and halt the rollout on sustained error growth; the guide names no automatic rollback trigger, so stopping is an operator judgment call.',
              ],
              code: '# broker config for server-side route-family resolution\nFITZ_ROUTE_FAMILIES=1,2,3\nFITZ_ROUTE_FAMILY_CLAIM=org_id\nFITZ_ROUTE_FAMILY_MAP=org_9f2=1,org_4ab=2,org_77c=3\n\n# admin domain routes move from /api/v1/{domain}/... to /api/v1/{family}/{domain}/...\n# family and route_family query parameters are not a fallback',
            },
            {
              id: 'verify-or-roll-back',
              title: 'Verify or roll back',
              paragraphs: [
                'Verification is smoke-testing each domain, confirming metrics continuity, and recording upgrade notes and any mitigations after traffic returns; there is no built-in verification suite beyond an operator running these checks against the live node.',
                "Use the validated rollback image from the backup step to reverse a bad migration, repeating the same stop-drain-swap-verify sequence with the prior version and configuration; because storage format changes require a documented upgrade or rewrite path rather than a guaranteed downgrade, check the specific change's storage guidance before assuming a rollback restores the previous on-disk format.",
                'Route-family and admin-path changes fail closed rather than degrade: a hardened node rejects authenticated CONNECT when the identity claim is missing, unmapped, or maps to an unprovisioned family, and removed admin paths return 404 with no query-parameter fallback, so a partial rollback that leaves token issuers or callers on the new shapes will error rather than partially work.',
              ],
              callout: {
                title: 'Schedule codec break has no negotiation shim',
                body: 'A broker running the new CREATE/CREATE_BATCH/LIST shape rejects older Schedule client payloads outright, and an unrecognized delivery-mode byte fails with ERR_INVALID_DELIVERY_MODE (7008). Rolling the broker back without rolling back every connected Schedule client in the same window reintroduces the same break in the opposite direction.',
              },
            },
          ],
        },
        {
          path: 'troubleshooting',
          title: 'Troubleshooting',
          description:
            'Diagnose startup, authentication, routing, domain, storage, and resource failures.',
          keywords: ['diagnostics', 'errors'],
          content: [
            {
              id: 'startup-failures',
              title: 'Startup failures',
              paragraphs: [
                'Fitz starts in five ordered stages, and knowing which one it stopped at narrows the cause immediately: configuration validation and resource preflight, then the HTTP listener (so `/targetz` can answer orchestrator checks while the data plane is still closed), then storage initialization and acquisition of the Midge writer lease, then per-domain registration and durable-state validation, and finally the TCP listener.',
                'The probes reflect all of it at once. `/healthz` and `/readyz` return `200` only when storage, the writer lease, domain initialization, auth configuration, and traffic acceptance are simultaneously true — so a broker stuck not-ready is telling you one of those five is unresolved, not that the probe is wrong.',
                "Use `/startupz` to hold off liveness checks during a slow boot, `/targetz` when an incoming process needs to become target-eligible for handoff before it owns the Midge writer lease, and `/healthz` or `/readyz` as the gate that WebSocket upgrades and TCP sessions actually enforce. A broker that stays at `/startupz` `503` past its normal boot time, or whose `/healthz` response never flips `storage_writer_lease` to `ok`, is still stuck in preflight, storage initialization, or writer-lease acquisition, and the stuck stage is visible in that response's `checks` object.",
                "Unrecoverable storage corruption leaves the broker not ready indefinitely. That is deliberate — it waits for an operator to inspect the durable state rather than attempting an automatic repair. The one built-in exception is Queue's fast write policy, which discards an incomplete split header/body remnant, invalidates its derived index, logs the discarded message ID, and continues.",
                'Live session state is never restored from disk, no matter how clean the shutdown was. Open KV transactions, Stream append sessions, Queue inflight tokens, RPC worker registrations, Lease ownership, and Schedule subscriptions all start empty, and clients rebuild them by reconnecting once the broker reports ready.',
              ],
              table: {
                headers: ['Probe', 'Returns 200 when', 'Use it to'],
                rows: [
                  [
                    '/livez',
                    'Runtime is responsive and no initialized domain has permanently failed after exhausting its supervised restarts',
                    'Decide whether the process needs a restart',
                  ],
                  [
                    '/targetz',
                    'The HTTP listener is up and the process is not draining (does not require the Midge writer lease)',
                    'Make an incoming process target-eligible during single-writer handoff, before it owns storage',
                  ],
                  [
                    '/startupz',
                    'All initialization is complete and listeners are bound',
                    'Suppress premature liveness checks during a slow boot',
                  ],
                  [
                    '/healthz',
                    'storage, storage_writer_lease, domains_initialized, domains_healthy, auth_configuration, startup_complete, and accepting_traffic are all ok',
                    'Gate traffic on a platform that checks only one endpoint',
                  ],
                  [
                    '/readyz',
                    'Same criteria as /healthz',
                    "Feed an orchestrator's native readiness probe",
                  ],
                ],
              },
              code: '$ curl -s http://localhost:4090/startupz\n{"status":"started","startup_time_seconds":2.5}\n\n$ curl -s http://localhost:4090/healthz\n{\n  "status": "not_ready",\n  "checks": {\n    "storage": "ok",\n    "storage_writer_lease": "not_ready",\n    "domains_initialized": "not_ready",\n    "domains_healthy": "not_ready",\n    "auth_configuration": "ok",\n    "startup_complete": "not_ready",\n    "accepting_traffic": "not_ready"\n  }\n}',
              callout: {
                title: 'Corruption stops at not-ready, not a repair',
                body: 'A malformed engine row, an invalid authoritative Stream row, or a policy-violating half-transaction all fail closed: the broker stays not ready rather than accepting the ambiguous state, and only an operator restoring or fixing the durable data moves it forward.',
              },
            },
            {
              id: 'connection-failures',
              title: 'Connection failures',
              paragraphs: [
                'Every connection sends exactly one CONNECT frame (MessageType 1) before anything else - a compact JWT in authenticated mode (`FITZ_AUTH_REQUIRED=true`), or by convention an empty payload in anonymous mode, since the broker applies anonymous session state on the first frame without checking the payload. A valid CONNECT gets no acknowledgment at all: the broker stays silent and is immediately ready for domain requests, so a client should send its first domain request right away instead of waiting for a confirmation that never arrives.',
                'CONNECT timing is itself the diagnostic. A connection that closes quickly after CONNECT failed authentication — a missing or invalid JWT, or an identity claim the broker cannot map to a provisioned route family. Retrying the same token produces the same result, so fix the token rather than resend it.',
                'The opposite case is silence. A connection that sends no CONNECT is closed by the broker as a graceful timeout after ten seconds; from the client side, seeing neither a domain response nor a close within 5-10 seconds is your own connect timeout, and the right response is backoff and retry.',
                'Framing problems close the connection outright instead of returning a domain error: a frame over the 1 MB default `max_frame_size` is rejected before the broker allocates a buffer for its payload, and a frame containing a duplicate TLV tag or any other malformed TLV structure closes the connection with a parse error rather than being partially decoded. Both are transport failures - there is nothing to retry on that connection, only a new one to open.',
              ],
              table: {
                headers: ['Error', 'Cause', 'Client action'],
                rows: [
                  [
                    'Connection refused',
                    'Broker unreachable',
                    'Retry with backoff; raise to caller',
                  ],
                  [
                    'Connection reset',
                    'Broker crashed or closed the connection',
                    'Reconnect and rebuild session state',
                  ],
                  [
                    'Frame too large',
                    'Payload exceeds max_frame_size',
                    'Close the connection; raise an error',
                  ],
                  [
                    'Invalid UTF-8',
                    'Malformed frame',
                    'Close the connection; raise an error',
                  ],
                  [
                    'TLV decode error',
                    'Unrecoverable frame format, including duplicate tags',
                    'Close the connection; raise an error',
                  ],
                ],
              },
              code: '1. open transport (WebSocket or TCP)\n2. send CONNECT [type=1][len][jwt bytes]     // empty payload if anonymous\n3. immediately send the first domain request  // no ACK to wait for\n4. domain response arrives   -> connection is authenticated, proceed\n5. connection closes (~1s)   -> auth failure, do not resend this JWT\n6. neither happens in 5-10s  -> close and retry with backoff',
            },
            {
              id: 'domain-failures',
              title: 'Domain failures',
              paragraphs: [
                'Every domain response opens with a one-byte status: `0` for success, `1` for error; an error status is followed by a 32-bit numeric error code and a length-prefixed UTF-8 message (a `u32` length, then that many bytes). RPC is the one exception - its responses also carry a 16-byte `correlation_id` so a caller with several requests in flight can match a specific response, success or error, back to the request that produced it instead of relying on send order the way every other domain does.',
                "Read the code's range first: it identifies the domain that produced the error before you read the message at all. Each domain owns a 100-code block, and within it reserves one code for a permission denial (ERR_UNAUTHORIZED) — but the trailing digit is not consistent across domains, so look it up rather than assume it.",
                "The domain-specific codes beyond that are defined in each domain's own spec, not in a shared registry. The last column below is a sample of the ones that come up most, not the full list.",
                'One ordering rule explains a common confusion: route shape is validated before identity and permission. A malformed route — wrong depth, a wildcard where the domain does not allow one, an extra segment — fails as a protocol error and never reaches a numbered domain code at all.',
              ],
              table: {
                headers: [
                  'Range',
                  'Domain',
                  'Covers',
                  'ERR_UNAUTHORIZED',
                  'Common domain-specific codes',
                ],
                rows: [
                  [
                    '1000-1099',
                    'KV',
                    'Transactions, isolation, durability',
                    '1011',
                    'ERR_ISOLATION_CONFLICT (1004) — a second read-write transaction opened against a resource already open for writes',
                  ],
                  [
                    '2000-2099',
                    'Stream',
                    'Concurrency, watermarks, ordering',
                    '2009',
                    'ERR_CONCURRENCY_CONFLICT (2001)',
                  ],
                  [
                    '3000-3099',
                    'Notice',
                    'Routing, patterns, delivery',
                    '3009',
                    '—',
                  ],
                  [
                    '4000-4099',
                    'Queue',
                    'Leasing, visibility, delivery',
                    '4009',
                    'ERR_INFLIGHT_EXPIRED (4002), ERR_QUEUE_FULL (4005)',
                  ],
                  [
                    '5000-5099',
                    'Lease',
                    'Mutual exclusion, fencing, TTL',
                    '5009',
                    'ERR_LEASE_HELD (5001)',
                  ],
                  [
                    '6000-6099',
                    'RPC',
                    'Routing, backpressure, correlation',
                    '6009',
                    'ERR_WORKER_NOT_FOUND (6002), ERR_RPC_BACKPRESSURE (6003)',
                  ],
                  [
                    '7000-7099',
                    'Schedule',
                    'Scheduling, persistence, execution',
                    '7009',
                    'ERR_INVALID_CRON (7002)',
                  ],
                ],
              },
              code: '# Domain error envelope (same shape for KV, Queue, Notice, Stream, Lease, Schedule)\n[0x01]                    status = 1 (error)\n[0x00 0x00 0x03 0xeb]     error_code = 1003 (u32)\n[0x00 0x00 0x00 0x0d]     error_len = 13\n"Key not found"           error_msg (UTF-8)\n\n# Client-side handling\nif status == 0:\n    return decode_success_payload(payload)\nelse:\n    error_code = read_u32_be(payload)\n    error_len = read_u32_be(payload)\n    error_msg = payload[8:8+error_len].decode("utf-8")\n    raise DomainError(error_code, error_msg)   # RPC responses also carry a\n                                                # correlation_id alongside this\n                                                # envelope to match in-flight requests',
              callout: {
                title: 'Route errors never carry a domain code',
                body: 'A route-shape violation is rejected before JWT or permission checks run, so it never shows up as one of the numbered domain errors above - if a request never got as far as a 1xxx-7xxx code, check the route shape first.',
              },
            },
            {
              id: 'storage-and-resource-diagnostics',
              title: 'Storage and resource diagnostics',
              paragraphs: [
                "Durable Fitz storage is Midge-backed: local mode writes to disk at `FITZ_STORAGE_PATH`, cloud mode keeps a local cache in front of provider object storage, and every domain's actual durability still depends on its own write policy, not just the storage mode. Startup registers each storage-backed domain and validates or preloads its durable state before the broker reports ready - Queue validates persisted queue state and applies its fast-mode remnant cleanup, Schedule preloads persisted definitions and pending fire claims, and KV and Stream attach storage-backed sinks - while Notice, RPC, and Lease intentionally start with empty live state.",
                'Use the authenticated stats and metrics endpoints to see resource pressure before it becomes an outage: `GET /api/v1/{family}/metrics` and `/api/v1/all/metrics` return structured JSON scoped to one route family or the whole broker, `GET /api/v1/stats` reports connection and per-domain counts, and the dedicated Prometheus listener on `FITZ_METRICS_BIND_ADDR:FITZ_METRICS_PORT` (default `127.0.0.1:9090`) stays unauthenticated and separate from the admin API on purpose. Watch rising rejection counts by realm, mailbox depth saturation, and repeated permission-denied or route-mismatch bursts as the operational signals that precede a hard resource limit.',
                "Resource limits - connection counts per realm, subscription and wildcard pattern counts, Queue and Stream depth, memory quotas for sessions and runtime buffers - are enforced by the broker itself and can't be raised from the client side; escalation is a realm-scoped rate limit, more compute, or more durable storage throughput, applied by an operator, not a client retry policy. `FITZ_MIN_MEMORY_BYTES` (default 128 MiB) is a startup preflight floor, not a running limit, and a broker that fails preflight never gets far enough to expose any of the stats above.",
              ],
              table: {
                headers: [
                  'Domain',
                  'Persisted write shape',
                  'Startup treatment',
                ],
                rows: [
                  [
                    'KV',
                    'User values and inventory changes commit in one Midge transaction',
                    'Committed rows attach directly; malformed engine state remains a storage failure',
                  ],
                  [
                    'Queue',
                    'Fast mode skips the WAL, so a crash mid-flush can leave one side of a split header/body record; buffered and strict modes keep a WAL-backed transaction boundary',
                    'Fast mode deletes the incomplete remnant and its derived index and logs the discarded row; buffered and strict modes reject the same state',
                  ],
                  [
                    'Stream',
                    'Event rows, discriminators, counters, metadata, and watermarks for a commit go in one Midge transaction',
                    'Existing rows are decoded and layout-validated; invalid authoritative rows fail closed',
                  ],
                  [
                    'Schedule',
                    'Definitions and bodies are written together',
                    'Persistent definitions and pending claims preload before readiness; missing bodies or malformed claims fail closed',
                  ],
                ],
              },
              code: '$ curl -s -H "Cookie: $ADMIN_SESSION" \\\n  http://localhost:4090/api/v1/queue/stats\n\n$ curl -s -H "Cookie: $ADMIN_SESSION" \\\n  http://localhost:4090/api/v1/all/metrics\n\n$ curl -s http://localhost:9090/metrics | grep fitz_connections_total',
              callout: {
                title: 'Fast queue writes trade a window for throughput',
                body: "FITZ_QUEUE_WRITE_POLICY=fast (the default) skips the WAL on the hot path and flushes in the background within FITZ_QUEUE_LOSS_WINDOW_MS (default 100ms); a crash inside that window can lose the most recent queue mutations, and startup's remnant cleanup is what keeps that loss bounded to whole messages instead of corrupt partial ones. Set FITZ_QUEUE_WRITE_POLICY to buffered or strict where losing up to one flush window of enqueues is not acceptable.",
              },
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
          path: 'configuration',
          title: 'Configuration Reference',
          description:
            'Find Fitz listener, authentication, route, storage, domain, and resource settings.',
          keywords: ['configuration', 'environment'],
          content: [
            {
              id: 'server-settings',
              title: 'Server settings',
              paragraphs: [
                'Server settings configure the network surface of one running Fitz broker process: which ports and bind address serve HTTP, WebSocket, and raw TCP traffic, plus how long a draining broker keeps failing its health probes before it closes active sessions on shutdown.',
                'Set FITZ_HTTP_PORT, FITZ_TCP_PORT, and FITZ_BIND_ADDR to match your container or host network plan before first start, and set FITZ_DRAIN_GRACE_SECONDS below your external termination grace period so /healthz has time to fail and connections have time to drain before the process exits.',
                "These variables size and address one broker's own listeners; they do not add a second broker, a load balancer, or automatic traffic failover, and turning off FITZ_TCP_ENABLED still leaves the HTTP, WebSocket, and admin surface reachable on FITZ_BIND_ADDR.",
              ],
              table: {
                headers: ['Variable', 'Default', 'Purpose'],
                rows: [
                  [
                    'FITZ_HTTP_PORT',
                    '4090',
                    'HTTP and WebSocket listener port.',
                  ],
                  [
                    'FITZ_TCP_ENABLED',
                    'true',
                    'Enables the raw TCP listener; HTTP, admin routes, and WebSocket stay enabled regardless.',
                  ],
                  ['FITZ_TCP_PORT', '4091', 'Raw TCP listener port.'],
                  [
                    'FITZ_BIND_ADDR',
                    '0.0.0.0',
                    'Bind address shared by the HTTP, WebSocket, and TCP listeners.',
                  ],
                  [
                    'FITZ_DRAIN_GRACE_SECONDS',
                    '25',
                    'Seconds a draining broker fails /healthz and /readyz and rejects new TCP/WebSocket sessions before closing active sessions on shutdown.',
                  ],
                  [
                    'FITZ_DRAIN_CLOSE_REASON',
                    'broker draining for redeploy',
                    'Close reason recorded on sessions the broker closes during a planned drain shutdown.',
                  ],
                  [
                    'FITZ_METRICS_BIND_ADDR',
                    '127.0.0.1',
                    'Bind address for the separate Prometheus metrics listener.',
                  ],
                  [
                    'FITZ_METRICS_PORT',
                    '9090',
                    'Port for the separate Prometheus metrics listener.',
                  ],
                ],
              },
              code: 'FITZ_HTTP_PORT=4090\nFITZ_TCP_PORT=4091\nFITZ_BIND_ADDR=0.0.0.0\n# keep below the external termination grace period\nFITZ_DRAIN_GRACE_SECONDS=20',
              callout: {
                title: 'The metrics listener has no authentication of its own',
                body: 'FITZ_METRICS_BIND_ADDR defaults to loopback, but if you bind it to a routable address, the Prometheus endpoint on FITZ_METRICS_PORT serves scrape data to any caller that can reach it; keep it on loopback or a private network segment rather than exposing it publicly.',
              },
            },
            {
              id: 'security-settings',
              title: 'Security settings',
              paragraphs: [
                'Security settings decide whether Fitz requires an authenticated CONNECT JWT at all, how it verifies that token and maps its claims to Fitz permissions and a route family, and how the separate administrative API authenticates its own session.',
                'Turn on FITZ_AUTH_REQUIRED and point FITZ_JWT_JWKS_MAP at your issuer for runtime client traffic, set FITZ_AUTH_ORG_CLAIM or FITZ_ROUTE_FAMILY_CLAIM to the identity claim your provider issues, and set FITZ_ADMIN_AUTH_MODE, FITZ_ADMIN_USERNAME, and FITZ_ADMIN_PASSWORD_HASH separately to protect the admin surface, since admin sessions authenticate independently of client CONNECT tokens.',
                'Permission-source precedence is fixed: a configured custom claim, then top-level permissions, then FITZ_AUTH_PERMISSIONS_CLAIM, then FITZ_AUTH_ROLE_CLAIM, then scp, then scope; identity-claim precedence for route-family resolution checks FITZ_AUTH_ORG_CLAIM first and falls back to FITZ_ROUTE_FAMILY_CLAIM.',
                "FITZ_JWT_HMAC_SECRET is a local-development fallback that enables HS256 token verification only when FITZ_JWT_JWKS_MAP is not configured, and FITZ_JWT_ALLOW_INSECURE_HTTP only relaxes the https-only rule on JWKS URLs for a local mock issuer; neither is meant for a real deployment's token traffic. Fitz does not translate identity-provider roles into Fitz permissions on its own, so every value placed in FITZ_AUTH_ROLE_CLAIM must already be a Fitz permission string such as notice://prod/orders/**#read or a recognized coarse scope such as notice.read.",
              ],
              table: {
                headers: ['Variable', 'Default', 'Purpose'],
                rows: [
                  [
                    'FITZ_AUTH_REQUIRED',
                    'true',
                    'Requires authenticated CONNECT JWT validation; false allows anonymous mode on route family 1.',
                  ],
                  [
                    'FITZ_WS_ALLOWED_ORIGINS',
                    'loopback origins for ports 3000 and 4090',
                    'Exact browser WebSocket Origin allowlist; no path, query, fragment, or trailing slash.',
                  ],
                  [
                    'FITZ_ASSUME_EXTERNAL_TLS',
                    'false',
                    'Confirms a trusted external edge terminates TLS; must be true before Fitz will start auth or protected admin on a non-loopback bind.',
                  ],
                  [
                    'FITZ_ASSUME_LOCAL_LOOPBACK_EDGE',
                    'false',
                    'Confirms a local container edge publishes Fitz only on host loopback; for local development only.',
                  ],
                  [
                    'FITZ_JWT_JWKS_MAP',
                    'Unset',
                    'issuer=jwks_url pairs for runtime verification; JWKS URLs must be absolute https URLs with no credentials or fragment.',
                  ],
                  [
                    'FITZ_JWT_HMAC_SECRET',
                    'Unset',
                    'HS256 local-development fallback used only when JWKS is not configured.',
                  ],
                  [
                    'FITZ_JWT_AUDIENCES',
                    'fitz,fitz-broker',
                    'Audience allowlist checked during JWKS verification.',
                  ],
                  [
                    'FITZ_JWT_AUDIENCE',
                    'Alias fallback',
                    'Single-audience fallback read only when FITZ_JWT_AUDIENCES is unset.',
                  ],
                  [
                    'FITZ_JWT_ALLOW_INSECURE_HTTP',
                    'false',
                    'Allows http:// JWKS URLs for local mock environments only.',
                  ],
                  [
                    'FITZ_AUTH_CUSTOM_CLAIM',
                    'Unset',
                    'Highest-priority permission source; the claim must hold a permissions array object.',
                  ],
                  [
                    'FITZ_AUTH_PERMISSIONS_CLAIM',
                    'Unset',
                    'Array claim checked after top-level permissions and before role/scp/scope.',
                  ],
                  [
                    'FITZ_AUTH_ROLE_CLAIM',
                    'roles',
                    'Role claim source for already-normalized Fitz permissions or recognized coarse scopes.',
                  ],
                  [
                    'FITZ_AUTH_ORG_CLAIM',
                    'Unset',
                    'Identity claim checked before FITZ_ROUTE_FAMILY_CLAIM for route-family resolution.',
                  ],
                  [
                    'FITZ_ADMIN_AUTH_MODE',
                    'protected',
                    'protected requires session login; open bypasses it.',
                  ],
                  [
                    'FITZ_ADMIN_USERNAME',
                    'Unset',
                    'Required together with a password hash for protected admin login.',
                  ],
                  [
                    'FITZ_ADMIN_PASSWORD_HASH',
                    'Unset',
                    'Argon2 password hash required together with a username for protected admin login.',
                  ],
                  [
                    'FITZ_ADMIN_JWT_SECRET',
                    'Generated per process',
                    'Signs protected-admin session cookies. Set a stable secret only when admin sessions must survive a process restart.',
                  ],
                  [
                    'FITZ_ADMIN_SESSION_TTL_SECS',
                    '28800',
                    'Admin session cookie lifetime, in seconds.',
                  ],
                  [
                    'FITZ_ADMIN_COOKIE_SECURE',
                    'true',
                    'Sets the Secure cookie attribute; set false only for loopback or local non-TLS development.',
                  ],
                  [
                    'FITZ_ADMIN_PUBLIC_ORIGIN',
                    'request host on local binds',
                    'Expected same-origin value for protected unsafe admin requests; required on non-loopback binds.',
                  ],
                  [
                    'FITZ_ADMIN_OPEN_USERNAME',
                    'admin',
                    'Username exposed as the admin principal identity while open mode is active.',
                  ],
                ],
              },
              code: 'FITZ_AUTH_REQUIRED=true\nFITZ_JWT_JWKS_MAP=https://issuer.example.com/=https://issuer.example.com/.well-known/jwks.json\nFITZ_ASSUME_EXTERNAL_TLS=true\nFITZ_WS_ALLOWED_ORIGINS=https://app.example.com\nFITZ_ADMIN_AUTH_MODE=protected\nFITZ_ADMIN_PUBLIC_ORIGIN=https://admin.example.com\nFITZ_ADMIN_COOKIE_SECURE=true',
              callout: {
                title:
                  'The admin session signing key is not persisted by default',
                body: 'FITZ_ADMIN_JWT_SECRET is optional: when it is unset, Fitz generates a process-ephemeral signing key for admin session cookies as soon as protected mode is configured, so every protected-admin session cookie is invalidated the next time the broker process restarts; set FITZ_ADMIN_JWT_SECRET explicitly if you need admin sessions to survive a restart.',
              },
            },
            {
              id: 'storage-settings',
              title: 'Storage settings',
              paragraphs: [
                'Storage settings choose where Fitz persists domain state and, in cloud mode, how it caches and acknowledges provider-backed writes: FITZ_STORAGE_MODE selects memory, local, or cloud, and the remaining keys configure the path, provider, prefix, cache, and durability behavior for that mode.',
                'Set FITZ_STORAGE_MODE=local with FITZ_STORAGE_PATH for a single filesystem-backed broker, or FITZ_STORAGE_MODE=cloud with FITZ_STORAGE_PROVIDER plus the bucket, container, region, endpoint, or namespace keys a given provider needs, a unique FITZ_STORAGE_PREFIX per environment, and FITZ_STORAGE_CACHE_PATH for the local cache cloud mode always keeps.',
                "Local and cloud modes both persist through Fitz's embedded Midge LSM storage engine, and the HTTP listener only reports /healthz and /readyz as ready once that engine holds its active writer lease, so a healthy process is also proof storage finished opening.",
                "Persistence follows the selected mode: memory mode uses best-effort writes with no restart-recovery guarantee, local and background-cloud modes wait for a local sync before treating a write as durable, and strict-cloud mode additionally waits for the provider's acknowledgement; provider credentials and native region or project variables are read directly from the process environment under the provider's own variable names rather than a FITZ_-prefixed key, so supplying them is a deployment responsibility outside this table.",
              ],
              table: {
                headers: ['Variable', 'Default', 'Purpose'],
                rows: [
                  [
                    'FITZ_STORAGE_MODE',
                    'local',
                    'Selects memory, local, or cloud storage backend mode.',
                  ],
                  [
                    'FITZ_STORAGE_PATH',
                    './.fitz',
                    'Local filesystem storage path when FITZ_STORAGE_MODE=local.',
                  ],
                  [
                    'FITZ_STORAGE_PROVIDER',
                    'Unset',
                    'Required in cloud mode; one of sqrzl-s3, sqrzl-azure, sqrzl-gcs, aws-s3, s3-compatible, minio, wasabi, oci-s3, azure-blob, or gcs.',
                  ],
                  [
                    'FITZ_STORAGE_PREFIX',
                    'Unset',
                    'Optional object key namespace prefix in cloud mode.',
                  ],
                  [
                    'FITZ_STORAGE_CACHE_PATH',
                    './.fitz-cloud-cache',
                    'Local cache path backing cloud storage mode.',
                  ],
                  [
                    'FITZ_STORAGE_CLOUD_DURABILITY',
                    'background',
                    'background or strict cloud sync behavior for broker-selected durable writes.',
                  ],
                  [
                    'FITZ_STORAGE_MEMTABLE_BYTES',
                    'Auto',
                    'Optional explicit memtable size override for the embedded Midge engine.',
                  ],
                  [
                    'FITZ_STORAGE_BUCKET',
                    'Unset',
                    'Required for bucket-shaped providers such as aws-s3, minio, or wasabi.',
                  ],
                  [
                    'FITZ_STORAGE_CONTAINER',
                    'Unset',
                    'Required for container-shaped providers such as azure-blob.',
                  ],
                  [
                    'FITZ_STORAGE_ENDPOINT',
                    'Unset',
                    'Required for emulator or custom endpoints; some providers derive a default instead.',
                  ],
                  [
                    'FITZ_STORAGE_REGION',
                    'Unset',
                    'Required when the selected provider needs an explicit region.',
                  ],
                  [
                    'FITZ_STORAGE_NAMESPACE',
                    'Unset',
                    'Required when the selected provider needs an explicit namespace, such as oci-s3.',
                  ],
                  [
                    'FITZ_STORAGE_FORCE_PATH_STYLE',
                    'Unset',
                    'true/false path-style addressing toggle for compatible object providers.',
                  ],
                  [
                    'FITZ_STORAGE_ACCOUNT',
                    'Unset',
                    'Reserved for compatibility references only; current runtime provider builders do not read it.',
                  ],
                ],
              },
              code: 'FITZ_STORAGE_MODE=cloud\nFITZ_STORAGE_PROVIDER=aws-s3\nFITZ_STORAGE_BUCKET=fitz-prod-state\nFITZ_STORAGE_REGION=us-east-1\nFITZ_STORAGE_PREFIX=prod/\nFITZ_STORAGE_CACHE_PATH=/var/lib/fitz-cloud-cache\nFITZ_STORAGE_CLOUD_DURABILITY=strict',
              callout: {
                title: 'Provider identifiers are validated at boot',
                body: 'FITZ_STORAGE_PROVIDER accepts exactly sqrzl-s3, sqrzl-azure, sqrzl-gcs, aws-s3, s3-compatible, minio, wasabi, oci-s3, azure-blob, or gcs; any other value fails startup, and legacy shorthand such as FITZ_STORAGE_MODE=s3, gcs, or azure is rejected in favor of FITZ_STORAGE_MODE=cloud with an explicit provider.',
              },
            },
            {
              id: 'domain-and-resource-settings',
              title: 'Domain and resource settings',
              paragraphs: [
                'Fitz routes every operation through a domain-typed address such as stream://realm/area/resource, and FITZ_ROUTE_FAMILIES, FITZ_ROUTE_FAMILY_MAP, and FITZ_ROUTE_FAMILY_CLAIM control which provisioned route family a verified identity is assigned to for that routing and isolation, independently of the realm carried in the route itself.',
                "Use FITZ_ROUTE_FAMILY_MAP to bind an identity claim value, such as a tenant ID, to a numbered route family (for example FITZ_ROUTE_FAMILY_MAP=org_acme=1,xyz=2 alongside FITZ_ROUTE_FAMILIES=1,2), and use FITZ_QUEUE_WRITE_POLICY, FITZ_QUEUE_LOSS_WINDOW_MS, and FITZ_STREAM_STORAGE_LAYOUT to tune the Queue and Stream domains' own write and layout behavior separately from the general storage backend.",
                'FITZ_MIN_MEMORY_BYTES is the only startup resource guard exposed here: the connection ceiling (10,000), maximum frame size (1 MiB), and per-connection channel/queue depth (1,000) that bound a running broker are fixed in the compiled boot configuration with no environment variable override, so the connection, subscription, and queue-depth categories described conceptually on the Resource Limits page are watched through admin stats and metrics rather than tuned through FITZ_ variables.',
              ],
              table: {
                headers: ['Variable', 'Default', 'Purpose'],
                rows: [
                  [
                    'FITZ_ROUTE_FAMILIES',
                    '1',
                    'Comma-separated, contiguous-from-1 allowlist of provisioned route families, e.g. 1,2,3.',
                  ],
                  [
                    'FITZ_ROUTE_FAMILY_MAP',
                    'Empty',
                    'Comma-separated identity=family mappings; required when auth is enabled.',
                  ],
                  [
                    'FITZ_ROUTE_FAMILY_CLAIM',
                    'tid',
                    'Default JWT claim key used to resolve a verified identity to a route family.',
                  ],
                  [
                    'FITZ_QUEUE_WRITE_POLICY',
                    'fast',
                    'fast, buffered, or strict hot-path write policy for the Queue domain.',
                  ],
                  [
                    'FITZ_QUEUE_LOSS_WINDOW_MS',
                    '100',
                    'Target background flush interval, in milliseconds, for fast-policy queue writes.',
                  ],
                  [
                    'FITZ_STREAM_STORAGE_LAYOUT',
                    'promotion-frontier',
                    'Stream domain layout selector; legacy aliases are accepted and normalized to promotion-frontier.',
                  ],
                  [
                    'FITZ_MIN_MEMORY_BYTES',
                    '134217728 (128 MiB)',
                    'Startup preflight minimum cgroup memory threshold; set 0 to bypass the check.',
                  ],
                ],
              },
              code: 'FITZ_ROUTE_FAMILIES=1,2\nFITZ_ROUTE_FAMILY_CLAIM=tid\nFITZ_ROUTE_FAMILY_MAP=org_acme=1,xyz=2',
              callout: {
                title: 'Fast queue writes can lose the newest mutations',
                body: 'FITZ_QUEUE_WRITE_POLICY=fast, the default, skips the write-ahead log on the hot path and flushes dirty queue storage roughly every FITZ_QUEUE_LOSS_WINDOW_MS; a crash before that flush completes can lose the most recent queue sends, completes, dead-letter replays, or purges, while buffered and strict policies wait on a sync (and, in strict cloud mode, a provider-acknowledged) write before accepting each mutation.',
              },
            },
          ],
        },
        {
          path: 'admin-api',
          title: 'Admin API',
          description:
            'Use the administrative API for health, metrics, sessions, domains, deployment, and safety workflows.',
          keywords: ['admin', 'REST', 'metrics'],
          content: [
            {
              id: 'api-model',
              title: 'API model',
              paragraphs: [
                'Every route under /api/v1 authenticates with a cookie-backed admin session: POST /api/v1/session exchanges a username and Argon2 password hash for a fitz_admin_session cookie carrying a JWT signed with a process-ephemeral key by default, so an unconfigured broker loses every session across a restart; setting FITZ_ADMIN_JWT_SECRET pins a stable signing key across restarts instead. Nearly every domain path is also route-family-scoped as /api/v1/{family}/{domain}/..., where {family} is a concrete provisioned route family id or the literal all for the handful of routes that support a cross-family wildcard view.',
                'FITZ_ADMIN_AUTH_MODE selects protected (username and password hash login, same-origin checked mutations) or open (login skipped, meant for loopback-only local inspection), and a normal call sequence logs in once, then issues family-scoped reads against that cookie.',
                'Same-origin validation against FITZ_ADMIN_PUBLIC_ORIGIN applies to mutating routes, so a stolen cookie alone cannot drive a write from another origin, and every 400, 401, 403, 404, and 503 response across the API shares one Error schema rather than domain-specific error bodies. The dedicated Prometheus listener and the five health probes sit outside this cookie model entirely.',
              ],
              table: {
                headers: [
                  'Auth mode',
                  'Login required',
                  'Same-origin check on mutations',
                  'Intended for',
                ],
                rows: [
                  [
                    'protected',
                    'Yes, username and Argon2 password hash',
                    'Yes, against FITZ_ADMIN_PUBLIC_ORIGIN',
                    'Non-loopback deployments',
                  ],
                  [
                    'open',
                    'No, identity is FITZ_ADMIN_OPEN_USERNAME',
                    'Not applicable',
                    'Loopback-only local inspection',
                  ],
                ],
              },
              code: 'curl -c cookies.txt -X POST https://admin.example.com/api/v1/session \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"username":"admin","password":"changeme"}\'\n\ncurl -b cookies.txt https://admin.example.com/api/v1/2/metrics',
            },
            {
              id: 'probes-and-metrics',
              title: 'Probes and metrics',
              paragraphs: [
                'Five unauthenticated probes sit above the admin API (livez, targetz, healthz, readyz, startupz, plus a legacy health alias for healthz), and raw Prometheus text is served only from the separate FITZ_METRICS_BIND_ADDR:FITZ_METRICS_PORT listener (127.0.0.1:9090 by default); the main listener returns 404 for /metrics. Structured JSON for the admin UI comes from GET /api/v1/{family}/metrics and the wildcard GET /api/v1/all/metrics, alongside GET /api/v1/stats and /api/v1/{family}/stats for domain counters, GET /api/v1/topology for a bounded messaging snapshot, GET /api/v1/troubleshooting, and GET /api/v1/search across sessions, kv, stream, queue, schedule, lease, notice, and rpc.',
                "Route target eligibility through targetz during single-writer handoff since it can answer 200 while healthz and readyz still answer 503 (it proves the listener is up and the process isn't draining without waiting on the Midge writer lease); keep livez for restart decisions, and use startupz to suppress premature liveness checks during a slow boot.",
                'targetz explicitly does not check the storage writer lease or data-plane readiness, so it cannot gate WebSocket or TCP admission by itself, and topology and search are documented as read-only observability snapshots, not durable tracing or a replay mechanism; every one of these numbers resets when the broker process restarts.',
              ],
              table: {
                headers: ['Endpoint', 'Auth', 'Question it answers'],
                rows: [
                  ['GET /livez', 'None', 'Should this process be restarted?'],
                  [
                    'GET /targetz',
                    'None',
                    'Can a successor process take target traffic before it holds the writer lease?',
                  ],
                  [
                    'GET /healthz, GET /readyz',
                    'None',
                    'Is this process ready for data-plane traffic right now?',
                  ],
                  ['GET /startupz', 'None', 'Has boot finished?'],
                  [
                    'GET /metrics',
                    'None, dedicated listener only',
                    'Raw Prometheus text on FITZ_METRICS_BIND_ADDR:FITZ_METRICS_PORT',
                  ],
                ],
              },
              code: 'GET /api/v1/stats\n\n{\n  "broker": {\n    "uptime_seconds": 86400,\n    "connections": 142,\n    "sessions": 142,\n    "realms": ["prod", "staging", "dev"],\n    "messages_per_second": 450\n  },\n  "domains": {\n    "kv": { "transactions_active": 23, "keys_total": 12847, "operations_per_second": 120 }\n  }\n}',
            },
            {
              id: 'sessions-and-domains',
              title: 'Sessions and domains',
              paragraphs: [
                "GET /api/v1/sessions and GET /api/v1/{family}/sessions return broker-local session snapshots (session_id, resolved route_family, subject, identity_claim, identity_value, connected_at, idle_seconds, message counters, transport, and remote_addr) sourced from the current process, with no synthesized session realm since realm stays part of Fitz's route and resource identity. Every stateful domain (KV, Stream, Notice, Queue, RPC, Lease, Schedule) exposes the same realm, area, and resource ladder under /api/v1/{family}/{domain}/realms/{realm}/areas/{area}/resources/{resource}, then layers its own children on top.",
                "Drill into KV with an exact-key committed value lookup, a committed prefix scan, or cursor-paginated row browsing; search Stream's committed records or read a realm or area watermark; list Notice's live subscriptions; list RPC operations, their registered workers, and the broker-wide pending-request list; search Lease's live owners and waiters; or list Queue's inflight entries and dead letters, then replay or purge one dead-letter message by id.",
                'There is no session detail or session-close endpoint in the router (a path such as /api/v1/admin/sessions/{id}/close is not mounted), and most domain-detail counters split a durable half from a live half: KV transactions_active, Notice subscriptions_active, RPC workers_registered and requests_pending, and Lease active_leases are current-process in-memory counts that reset on disconnect or restart, while KV committed values, Stream offset and watermark, and Schedule cron and next_run persist across restarts.',
              ],
              table: {
                headers: [
                  'Domain',
                  'Durable state exposed',
                  'Live-only state exposed',
                ],
                rows: [
                  [
                    'KV',
                    'Committed value lookup, prefix scan, row pages',
                    'transactions_active, per-transaction tx_id list',
                  ],
                  [
                    'Stream',
                    'offset, watermark, size_bytes, committed record search/read',
                    'sessions_active (open append sessions)',
                  ],
                  [
                    'Notice',
                    'Realm/area/resource listing only',
                    'subscriptions_active, subscription list, delivery counters',
                  ],
                  [
                    'Queue',
                    'Dead-letter rows (durably stored)',
                    'messages_ready/inflight/delayed counts, inflight entries (warm actors only)',
                  ],
                  [
                    'RPC',
                    'Realm/area/resource/operation listing only',
                    'workers_registered, requests_pending, pending list',
                  ],
                  [
                    'Lease',
                    'Realm/area/resource listing only',
                    'active_leases, ownership/waiter search, fencing_token',
                  ],
                  [
                    'Schedule',
                    'cron, next_run, definitions preloaded at boot',
                    'execution fire deliveries (session-scoped)',
                  ],
                ],
              },
              code: 'curl -b cookies.txt \\\n  "https://admin.example.com/api/v1/2/kv/realms/prod/areas/app/resources/users/value?key=user:42"\n\ncurl -b cookies.txt -X POST \\\n  "https://admin.example.com/api/v1/2/queue/realms/prod/areas/jobs/resources/emails/dead-letters/123456/replay"',
            },
            {
              id: 'safety-boundaries',
              title: 'Safety boundaries',
              paragraphs: [
                "Two checks gate everything under /api/v1: a valid admin session cookie unless FITZ_ADMIN_AUTH_MODE is open, and, for mutating routes specifically, same-origin validation against FITZ_ADMIN_PUBLIC_ORIGIN. Beyond session login and logout, the router's mutation surface is narrow: begin a planned drain with POST /api/v1/runtime/drain, move a retained dead-letter row back to ready state with POST .../dead-letters/{message_id}/replay, or permanently remove one with DELETE .../dead-letters/{message_id}, all scoped to a concrete route family in the path because queue identity includes route family.",
                'Pair runtime drain with orchestrator handoff: call POST /api/v1/runtime/drain from an authenticated same-origin admin client so readiness probes start failing and new sessions get rejected, then let the platform stop routing before it sends the termination signal after FITZ_DRAIN_GRACE_SECONDS.',
                "Several actions an operator might reach for have no admin route today: forcing a KV rollback, cancelling a Notice subscription, cancelling a pending RPC request, releasing a Lease, manually triggering a Schedule, and closing a session by id are all unavailable in the current router, and those states only clear through the domain's own disconnect, timeout, or expiry behavior, or through logic the application owns outside the admin API.",
              ],
              table: {
                headers: ['Admin action', 'Available today'],
                rows: [
                  ['Begin a runtime drain', 'Yes, POST /api/v1/runtime/drain'],
                  [
                    'Replay a queue dead letter',
                    'Yes, POST .../dead-letters/{message_id}/replay',
                  ],
                  [
                    'Purge a queue dead letter',
                    'Yes, DELETE .../dead-letters/{message_id}',
                  ],
                  ['Force a KV rollback', 'Not available'],
                  ['Cancel a Notice subscription', 'Not available'],
                  ['Cancel a pending RPC request', 'Not available'],
                  ['Release a Lease', 'Not available'],
                  ['Manually trigger a Schedule', 'Not available'],
                  ['Close a session by id', 'Not available'],
                ],
              },
              callout: {
                title: 'Same-origin string must match exactly',
                body: "FITZ_ADMIN_PUBLIC_ORIGIN must be an exact origin with no path, query, fragment, or trailing slash, and protected mode on any non-loopback bind requires it; a mismatched value causes the admin UI's own mutating calls to fail same-origin validation.",
              },
            },
          ],
        },
        {
          path: 'wire-protocol',
          title: 'Wire Protocol',
          description:
            'Understand connection flow, framing, routing, operations, and domain message contracts.',
          keywords: ['protocol', 'frame', 'routing'],
          content: [
            {
              id: 'connection-flow',
              title: 'Connection flow',
              paragraphs: [
                "CONNECT (message type 1) must be the first frame a client sends on any new WebSocket or TCP connection, and it carries the raw JWT as the TLV value with no additional length prefix beyond the record's own u16 length field — an empty value (Length=0) is valid when the broker runs in anonymous mode (FITZ_AUTH_REQUIRED=false).",
                'Fitz uses a silent-success model: a valid CONNECT gets no explicit CONNECT_OK frame at all, so a client sends CONNECT and immediately sends its first domain request rather than waiting on an acknowledgment; a still-open connection that goes on to answer domain requests is the only confirmation of success.',
                'An invalid CONNECT shows up only as the broker closing the connection — typically within one second for a rejected JWT, and within ten seconds if no CONNECT arrives at all — and reconnecting always starts a brand-new session, so everything scoped to the old connection is gone and must be rebuilt explicitly rather than resumed.',
              ],
              table: {
                headers: [
                  'State scoped to the connection',
                  'What happens on disconnect',
                ],
                rows: [
                  [
                    'KV / Notice / Stream / Lease / Schedule subscriptions',
                    'Dropped',
                  ],
                  ['KV transactions', 'Rolled back'],
                  ['Stream sessions', 'Aborted'],
                  ['Held leases', 'Released'],
                  ['RPC worker registrations', 'Cleared'],
                  ['Pending RPC requests', 'Discarded'],
                  ['Queued delivery state', 'Discarded'],
                ],
              },
              code: '# Authenticated mode\n[0x01]                    (MessageType=1, CONNECT)\n[0x00 0x63]               (Length=99, u16 BE)\n[...99 bytes of JWT...]\n\n# Anonymous mode: still a valid CONNECT, empty value\n[0x01]\n[0x00 0x00]               (Length=0)\n(no JWT bytes)',
            },
            {
              id: 'framing-and-routing',
              title: 'Framing and routing',
              paragraphs: [
                "Every Fitz message is exactly one flat TLV record: a type field that is a single byte for values 0–254 or the escape byte 0xFF followed by a big-endian u16 for values 255 and up, a u16 big-endian length (0–65535), and a value of exactly that many bytes — the type field is the MessageType itself (the verb's wire code), and the value is the domain payload with its fields concatenated in documented order rather than nested as further TLV records.",
                "WebSocket transport puts one binary frame around exactly one TLV message; TCP transport wraps that same TLV message in a u32 big-endian frame-length prefix so a stream reader knows how many bytes to buffer before decoding, and both transports decode to the identical message body. Routing then layers on top: routes are opaque {scheme}://{realm}/{area}/{resource} strings (for example kv://prod/app/users), and the broker's mux dispatches purely by the numeric MessageType range — KV in 100–199, Queue in 200–299, RPC in 300–399, Lease in 400–499, Notice in 500–599, Stream in 600–699, Schedule in 700–799 — with no overlap between blocks.",
                "Route shape validation is domain-specific and runs before permission or dispatch checks: KV, Lease, RPC, and Schedule require concrete routes with no wildcards, while Notice, Stream, and Queue accept `*` (one segment) or, for Notice, `**` (zero or more segments) in the positions each domain's route table allows. A client may validate route shape locally for ergonomics, but the broker's acceptance is authoritative and local validation cannot substitute for it.",
              ],
              table: {
                headers: ['Layer', 'Structure', 'Notes'],
                rows: [
                  [
                    'TLV type',
                    '1 byte (0–254) or 0xFF + u16 BE (255+)',
                    'Equals the MessageType / verb wire code',
                  ],
                  [
                    'TLV length',
                    'u16 BE',
                    'Value byte count, 0–65535; larger payloads span multiple frames or operations',
                  ],
                  [
                    'TLV value',
                    'Length bytes',
                    'Domain payload fields concatenated in order — never a nested TLV record',
                  ],
                  [
                    'WebSocket frame',
                    'One binary frame = one TLV message',
                    'Text frames are rejected; Fitz is binary only',
                  ],
                  [
                    'TCP frame',
                    'u32 BE frame length + TLV message',
                    'Frame length covers type + length + payload',
                  ],
                ],
              },
              code: '0x68                        (Type: MessageType=104, KV PUT, single byte since <=0xFE)\n0x00 0x2F                   (Length=47 bytes)\n0x00 00 00 00 00 00 00 01    (tx_id=1, u64 BE)\n0x00 00 00 13 "kv://prod/app/users"  (route: u32 BE len + UTF-8 bytes, 19 bytes)\n0x00 00 00 03 "bob"                   (key: u32 BE len + bytes)\n0x00 00 00 05 "alice"                 (value: u32 BE len + bytes)\n# Total frame on the wire: 1 (type) + 2 (length) + 47 (payload) = 50 bytes',
              callout: {
                title: 'Duplicate tags are fatal, not per-field',
                body: 'If a TLV tag appears more than once in a single frame, the frame is malformed by definition and the receiver must close the connection with a TLV parse error — there is no last-value-wins or first-value-wins fallback. A single TLV value also cannot exceed 65535 bytes; oversized payloads must be split across multiple frames or multiple operations, never by repeating a tag within one frame to carry the overflow.',
              },
            },
            {
              id: 'operation-model',
              title: 'Operation model',
              paragraphs: [
                'Every domain response begins with a single status byte — 0 for success, 1 for error — that a client must inspect before touching the rest of the payload: on success the remaining bytes are the domain-specific success payload, on error they are a u32 BE length-prefixed UTF-8 error message. RPC is the one domain that carries a 16-byte correlation_id (a client-generated UUID) on both REQUEST and its matching response so a client can match several concurrent in-flight calls to their results; no other domain carries a correlation id.',
                'Domains multiplex as independent logical channels on one connection — a KV PUT and a Notice PUBLISH can be in flight at the same time because they route to different domain handlers — but within a single domain, responses arrive in the order requests were sent, and sending a second request of the same type before the first response arrives is undefined behavior unless that domain has correlation ids, which only RPC does. Session-scoped operations, such as Stream APPEND after a Stream BEGIN, address an opaque session_id returned by the setup call instead of repeating the full route on every message.',
                'There is no protocol-level backpressure frame: a broker signals a full internal queue through an ordinary domain error response (RPC returns 6003 ERR_RPC_BACKPRESSURE, Queue returns 4005 ERR_QUEUE_FULL), and a client is expected to pause, back off, and retry the operation itself. Notice PUBLISH sits outside this contract entirely — it is fire-and-forget with no response frame, so a broker under backpressure silently drops Notice deliveries and a publisher has no way to observe the drop.',
              ],
              table: {
                headers: ['Status byte', 'Meaning', 'Payload that follows'],
                rows: [
                  [
                    '0x00',
                    'Success',
                    'Domain-specific success payload (e.g. KV GET: u32 BE value_len + value bytes)',
                  ],
                  [
                    '0x01',
                    'Error',
                    'u32 BE error_len + UTF-8 error message bytes',
                  ],
                ],
              },
              code: '# KV GET success\n[0x00]                    (status=0)\n[0x00 0x00 0x00 0x05]     (value_len=5)\n[0x61 0x6c 0x69 0x63 0x65] ("alice")\n\n# KV GET error\n[0x01]                    (status=1)\n[0x00 0x00 0x00 0x0d]     (error_len=13)\n["Key not found"]',
            },
            {
              id: 'domain-messages',
              title: 'Domain messages',
              paragraphs: [
                'Each domain owns an exclusive 100-code block of MessageType values, and every message_id is an exact wire contract rather than just a numeric range: each one has a fixed domain, direction, route scheme, and authorization kind, and wire codes are append-only — once assigned to a domain and verb, an id is never reused for something else.',
                "NOTIFY is a wire direction and operation name, not a cross-domain guarantee. A handful of message types are server-to-client only and cannot be sent by a client: KV NOTIFY (111), Queue NOTIFY (209), Lease NOTIFY (409), Notice NOTIFY (504), Stream NOTIFY (609), Schedule NOTIFY (705), and RPC's delivery id (305). Each belongs to the domain block that owns its code: Notice NOTIFY is Notice fanout, while Stream NOTIFY is only a Stream commit signal for a Stream subscription. Neither one turns the other domain into a different delivery or durability model. RPC has a further asymmetry built from this: a worker sends RESPONSE (303) to the broker, but the broker delivers the matching result to the original caller as message 305, correlated back by the correlation_id from the caller's original REQUEST (302) rather than by forwarding 303 unchanged.",
                "A message_id sitting inside a domain's numeric block is not automatically valid: id 304 is explicitly rejected as an unsupported RPC operation, and any id in 100–799 with no manifest entry at all is rejected the same way (\"unsupported message type\") even though it falls inside a domain's range. Clients cannot infer support for a message type from its numeric block alone — the manifest's fixed id list, not the range, is what a given deployment actually accepts.",
              ],
              table: {
                headers: [
                  'Domain',
                  'Block',
                  'Client-to-server examples',
                  'Server-to-client',
                ],
                rows: [
                  [
                    'KV',
                    '100–111',
                    'BEGIN 100, GET 103, PUT 104, SCAN 108',
                    'NOTIFY 111',
                  ],
                  [
                    'Queue',
                    '200–209',
                    'ENQUEUE 200, RESERVE 202, COMPLETE 204',
                    'NOTIFY 209',
                  ],
                  [
                    'RPC',
                    '300–305',
                    'SUBSCRIBE_WORKER 300, REQUEST 302, RESPONSE 303',
                    'delivery 305',
                  ],
                  [
                    'Lease',
                    '400–409',
                    'ACQUIRE 400, RENEW 401, RELEASE 402',
                    'NOTIFY 409',
                  ],
                  [
                    'Notice',
                    '500–504',
                    'PUBLISH 500, SUBSCRIBE 501',
                    'NOTIFY 504',
                  ],
                  [
                    'Stream',
                    '600–609',
                    'BEGIN 600, APPEND 601, READ 604',
                    'NOTIFY 609',
                  ],
                  [
                    'Schedule',
                    '700–706',
                    'CREATE 700, CANCEL 701, LIST 702',
                    'NOTIFY 705',
                  ],
                ],
              },
            },
          ],
        },
        {
          path: 'supported-boundaries',
          title: 'Supported Boundaries',
          description:
            'Find the guarantees Fitz makes and the distributed, session, and delivery behavior applications still own.',
          keywords: ['guarantees', 'single-node', 'sessions'],
          content: [
            {
              id: 'server-guarantees',
              title: 'Server guarantees',
              paragraphs: [
                'Fitz runs as one broker process that exposes Notice, Stream, KV, Queue, RPC, Lease, and Schedule through a single route model, and its durable paths use Midge-backed persistence: memory storage is ephemeral, local storage writes to disk, and cloud storage combines a local cache with provider storage acknowledged in background or strict mode.',
                'Rely on these guarantees when an application wants durable streams, queues, KV, and schedules plus live fanout, RPC, and lease coordination from one deployable process, and confirm that process is actually healthy through `/healthz`, `/readyz`, `/livez`, and the dedicated Prometheus listener on port 9090 before routing traffic to it.',
                'Fitz states seven things it does not attempt — high availability or consensus, transparent failover, session recovery after disconnect, exactly-once delivery, durable live-subscription recovery, durable RPC pending work, and crash-safe lease ownership — so any application that needs one of those properties has to build it itself.',
              ],
              table: {
                headers: ['Fitz does not provide', 'What holds instead'],
                rows: [
                  [
                    'High availability or consensus',
                    'One broker process serves one deployment unit; there is no multi-node agreement protocol.',
                  ],
                  [
                    'Transparent failover',
                    'A crash or restart ends the running session; clients reconnect and rebuild state themselves.',
                  ],
                  [
                    'Session recovery after disconnect',
                    'Disconnect destroys session-owned state; reconnect starts a new session.',
                  ],
                  [
                    'Exactly-once delivery',
                    'Queue delivers at-least-once; consumers de-duplicate at the application layer.',
                  ],
                  [
                    'Durable live-subscription recovery',
                    'Notice and RPC live state is not persisted or replayed after disconnect.',
                  ],
                  [
                    'Durable RPC pending work',
                    'Pending RPC requests fail on disconnect or worker loss; callers retry explicitly.',
                  ],
                  [
                    'Crash-safe lease ownership',
                    "Fencing tokens are monotonic only within the current broker's running lifetime.",
                  ],
                ],
              },
            },
            {
              id: 'domain-guarantees',
              title: 'Domain guarantees',
              paragraphs: [
                "Each domain owns exactly one guarantee set and never inherits another's: Notice guarantees live fanout to subscribers connected when delivery is computed, Stream guarantees ordered durable append and replay from client-supplied offsets, and KV guarantees transactional correctness for current state in one resource scope. Queue guarantees at-least-once delivery under its configured write policy, RPC guarantees correlated dispatch to one live worker with bounded pending queues, Lease guarantees one live holder per identity with in-process fencing tokens, and Schedule guarantees that persisted definitions and pending fire claims survive restart once their acknowledgement boundary is reached.",
                'Pick a domain by the question the interaction is actually asking: Stream answers what happened, KV answers what is true now, Queue answers who should work on this, RPC answers who can answer this now, Lease answers who owns this now, and Schedule answers when this should happen later.',
                "Domains are independently usable and never absorb one another's contracts: KV remains current state whether or not an application emits a separate Notice signal, and Schedule remains timing intent whether or not an application submits separate work to Queue. If an application combines domains, each operation retains only the guarantee of the domain that owns it.",
              ],
              table: {
                headers: [
                  'Domain',
                  'Durable state',
                  'Lost on disconnect or restart',
                ],
                rows: [
                  ['Notice', 'None', 'subscriptions and delivery state'],
                  [
                    'Stream',
                    'committed records, offsets, watermarks',
                    'append sessions and live subscriptions',
                  ],
                  [
                    'KV',
                    'committed values',
                    'open transactions and live locks',
                  ],
                  [
                    'Queue',
                    'messages and indexes that reached durable storage under the selected write policy',
                    'inflight ownership, tokens, warm actors',
                  ],
                  ['RPC', 'None', 'workers, pending requests, reply routing'],
                  ['Lease', 'None', 'ownership, fencing tokens, waiters'],
                  [
                    'Schedule',
                    'definitions and pending fire claims when persistence is enabled',
                    'live subscriptions',
                  ],
                ],
              },
              callout: {
                title:
                  "Queue's default write policy can lose recent accepted work",
                body: 'FITZ_QUEUE_WRITE_POLICY defaults to fast, and accepted queue mutations under that policy can be lost before the FITZ_QUEUE_LOSS_WINDOW_MS background flush window closes. Buffered and strict policies fail closed on the same incomplete state instead of silently discarding it, and fast-policy startup durably discards incomplete split-message remnants from that loss window and rebuilds the affected queue indexes.',
              },
            },
            {
              id: 'session-boundaries',
              title: 'Session boundaries',
              paragraphs: [
                'A Fitz session is the live connection between one client and the broker, and it is ephemeral by design: disconnect destroys every session-owned state object immediately, and a reconnect authenticates a brand-new session rather than resuming the old one.',
                'Expect this to apply uniformly across domains — Notice subscriptions, RPC worker registrations and pending calls, Lease holdings and waiters, Queue inflight reservations and tokens, KV open transactions, and Stream append sessions and live subscriptions are all session-scoped and gone the moment the connection closes.',
                "Durable state is unaffected because it was never session-scoped: Stream's committed records, KV's committed values, Queue's durably written backlog, and Schedule's persisted definitions and pending fire claims survive disconnect and restart; only the live coordination layered on top — cursors, locks, reservations, subscriptions — is destroyed.",
              ],
              table: {
                headers: [
                  'Domain surface',
                  'Required client behavior after reconnect',
                ],
                rows: [
                  [
                    'Notice subscriptions',
                    'Re-send the subscribe call for each still-needed route; notices missed while disconnected are not recovered.',
                  ],
                  [
                    'Queue availability subscriptions',
                    'Re-send the subscribe call for each watch; item handles reserved before disconnect are stale and must be reserved again.',
                  ],
                  [
                    'RPC workers and pending calls',
                    'Re-send worker registration for each worker; pending calls fail promptly and callers retry explicitly.',
                  ],
                  [
                    'Lease subscriptions and handles',
                    'Re-send change subscriptions; acquired lease handles are stale and must be reacquired if ownership is still required.',
                  ],
                  [
                    'Stream subscriptions, sessions, and reads',
                    'Re-send live commit subscriptions; open append sessions are stale; resume replay only from offsets the client persisted itself.',
                  ],
                  [
                    'Schedule subscriptions',
                    'Re-send fire subscriptions; the durable definition remains on the broker, but the live fire subscription does not.',
                  ],
                  [
                    'KV transactions',
                    'Treat any open transaction as aborted and begin a fresh one.',
                  ],
                ],
              },
            },
            {
              id: 'application-ownership',
              title: 'Application ownership',
              paragraphs: [
                'Everything the broker will not rebuild automatically is an explicit application responsibility: re-subscribing, re-registering RPC workers, reacquiring leases, resuming Stream reads from client-persisted offsets, and beginning a fresh KV transaction, all performed again after every reconnect.',
                "Apply the same ownership to delivery semantics: Queue's at-least-once guarantee means the application de-duplicates or makes handlers idempotent, RPC's lack of durable retries means the caller decides whether to retry a lost call, and Schedule's due-time-only contract means the application decides whether any downstream work should be submitted separately.",
                "Fitz domains enforce mechanics, not policy — retry counts, escalation rules, multi-step ordering, and checkpoint retention are application decisions that live outside the primitive. Applications may issue independent operations against Notice, Stream, Schedule, or any other domain, but no cross-domain step is hidden or required for a domain's stated functionality.",
              ],
              code: "// Reconnect authenticates a brand-new broker session; nothing above survives it.\nawait client.connect();\nawait notice.subscribe(route, onOrderEvent);                                // Notice: resubscribe\nawait lease.acquire(leaseRoute, 30);                                         // Lease: reacquire ownership\nconst tx = await kv.begin(kvRoute, { mode: 'ReadWrite', durability: 'Sync' }); // KV: start a fresh transaction",
            },
          ],
        },
      ],
    },
  ],
});
