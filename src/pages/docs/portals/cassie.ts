import { definePortal } from "../define";

export const cassiePortal = definePortal({
  id: "cassie",
  label: "Cassie",
  shortLabel: "Cassie",
  kind: "runtime",
  route: "/docs/cassie",
  description:
    "SQL-queryable read models built from application-owned history.",
  repository: "https://github.com/cntryl/cassie",
  loader: () => import("../routes/cassie"),
  sections: [
    {
      id: "start",
      label: "Start here",
      pages: [
        {
          path: "",
          title: "Overview",
          description:
            "Learn when Cassie fits, how projection data becomes queryable, and which history remains application-owned.",
          contract:
            "Cassie is a single-node query engine for CQRS and event-sourced read models. It materializes projection rows and serves supported SQL through the PostgreSQL wire protocol, with an administrative REST API.",
          practice:
            "The application supplies owned history and deterministic projection work. Cassie stores and queries the resulting view. Cassie uses Midge for persistence and recovery while owning SQL semantics, planning, execution, indexes, search, and resource controls.",
          boundary:
            "Cassie is not the event stream, an OLTP database, or a distributed SQL system. External systems own history, replay input, routing, placement, and failover. Next, run the canonical proof-of-concept and execute its read-model query workflow.",
          content: [
            {
              id: "what-cassie-is",
              title: "What Cassie is",
              paragraphs: [
                "Cassie is a single-node query engine for read models. Your application replays its own event history into Cassie, Cassie materializes that history into rows, and you query those rows with SQL over the PostgreSQL wire protocol — using psql, your existing driver, or any PostgreSQL client already in your stack.",
                "It is built for the read side of CQRS and event-sourced systems, where the authoritative record is an event log and the thing you actually want to query is a derived view of it. Cassie is that derived view: it owns everything between a submitted query and its result, and nothing about the history that produced it.",
                "Beyond ordinary relational SQL, the query surface includes full-text search with BM25 scoring, exact and approximate vector search, hybrid retrieval, time-series access, and graph traversal — all as SQL rather than as a separate API. Persistence and crash recovery come from Midge, the same embedded engine that ships on its own.",
              ],
            },
            {
              id: "how-data-arrives",
              title: "How data gets in",
              paragraphs: [
                "There is no ingestion pipeline to operate and no stream for Cassie to poll. Your application handler reads its own event log and calls the replay contract, which is a local ingestion API — Cassie never reaches out for data.",
                "That puts three responsibilities on the handler, and each one has a matching guardrail on the Cassie side. Events must arrive in increasing source order; Cassie rejects an out-of-order position rather than accepting it. Each event needs a stable unique id; Cassie keeps a duplicate ledger and silently skips ids it has already seen. And the payload must already be deterministic — timestamps, generated ids, and anything derived from a clock or an external call have to be resolved before the event arrives, because Cassie persists exactly what it is given.",
                "Get those three right and replay is repeatable: the same history produces the same rows, which is what makes rebuilding a projection from scratch a routine operation rather than a risky one.",
              ],
            },
            {
              id: "when-it-fits",
              title: "When Cassie fits",
              paragraphs: [
                "Cassie fits when you already have an authoritative event log and want to query a view of it with real SQL — including search and vector workloads — without standing up a separate database, search cluster, and vector store and keeping all three in sync.",
                "It does not fit as a system of record. Cassie is not the event stream, not an OLTP database for application writes, and not a distributed SQL engine. Single-node is a permanent design boundary here, not a gap waiting to be filled: replication, sharding, consensus, and cross-node query planning are explicit non-goals.",
              ],
              table: {
                headers: ["You need", "Cassie"],
                rows: [
                  [
                    "SQL over a derived read model",
                    "Yes — this is the core use case",
                  ],
                  [
                    "Your existing PostgreSQL clients and drivers to work",
                    "Yes — pgwire is the primary interface",
                  ],
                  [
                    "Full-text, vector, and hybrid search in the same query",
                    "Yes — expressed as SQL, not a separate API",
                  ],
                  [
                    "Rebuild the whole view from history on demand",
                    "Yes — deterministic replay makes this routine",
                  ],
                  [
                    "A durable home for the events themselves",
                    "No — the application owns the log; Cassie holds the derived view",
                  ],
                  [
                    "Transactional writes from application code",
                    "No — not an OLTP database; state changes arrive by replay",
                  ],
                  [
                    "Replication, sharding, or failover",
                    "No — permanently single-node by design",
                  ],
                  [
                    "Queries spanning several nodes",
                    "No — a query runs against local data only",
                  ],
                ],
              },
            },
            {
              id: "where-to-go-next",
              title: "Where to go next",
              paragraphs: [
                "Getting Started runs the maintained local example end to end, so you can see projection input, materialized rows, and a query over them in one program before integrating anything.",
                "Product Boundaries is the page to read next and the one to settle arguments with — it states exactly which behavior belongs to Cassie, to Midge, and to your application.",
              ],
              table: {
                headers: ["Question", "Page"],
                rows: [
                  ["How do I see it working locally?", "Getting Started"],
                  [
                    "Who owns what — Cassie, Midge, or my code?",
                    "Product Boundaries",
                  ],
                  ["Which SQL is supported?", "SQL and Pgwire"],
                  [
                    "How do I define and load a projection?",
                    "Projections and Replay",
                  ],
                  [
                    "How do I make queries fast?",
                    "Indexes and Constraints, Performance",
                  ],
                  [
                    "How do I use search or vectors?",
                    "Search and Query Capabilities",
                  ],
                  [
                    "Will my PostgreSQL client work?",
                    "PostgreSQL Compatibility",
                  ],
                  ["How do I run and secure it?", "Deployment, Security"],
                  [
                    "A projection looks wrong — now what?",
                    "Projection Repair, Troubleshooting",
                  ],
                ],
              },
            },
          ],
          keywords: [
            "CQRS",
            "event sourced",
            "SQL",
            "PostgreSQL",
            "projection",
          ],
        },
        {
          path: "getting-started",
          title: "Getting Started",
          description:
            "Run Cassie’s canonical local example and complete its queryable read-model workflow.",
          contract:
            "The repository-owned poc_read_model example is the canonical local path. It creates projection data from application-style history and queries the resulting read model without requiring a separately managed server.",
          practice:
            "Clone the Cassie repository, run the locked example from its root, and inspect the printed query results. The example exercises projection input, persisted read-model state, and a query over that state in one maintained program.",
          boundary:
            "Treat the example as a local workflow, not a deployment configuration. Application history remains authoritative, and a production integration must define checkpoints, replay, verification, authentication, and placement.",
          content: [
            {
              id: "run-the-example",
              title: "Run the example",
              paragraphs: [
                "The fastest way to understand Cassie is to watch one program do the whole loop. poc_read_model is maintained in the repository and exercises projection input, persisted read-model state, and a query over that state in a single run — no server to configure and no separate client to connect.",
                "Run it with --locked so the dependency versions match the ones the example is tested against.",
              ],
              code: `git clone https://github.com/cntryl/cassie.git
cd cassie
cargo run --locked --example poc_read_model`,
            },
            {
              id: "what-it-does",
              title: "What the example does",
              paragraphs: [
                "The program embeds Cassie rather than talking to a running server, so what you see in the output is the same sequence a real integration follows. It defines a projection shape, replays application-style events into it, lets Cassie materialize those events into rows, and then queries the result.",
                "The step worth watching is the third one. Nothing in the query path knows or cares that the rows came from events — by the time a query runs, the read model is just tables, which is exactly why an ordinary PostgreSQL client can query it.",
              ],
              table: {
                headers: [
                  "Stage",
                  "What happens",
                  "Who owns it in a real system",
                ],
                rows: [
                  [
                    "Define",
                    "A projection declares the shape its rows will take",
                    "Your application",
                  ],
                  [
                    "Replay",
                    "Events are handed to Cassie in source order with stable ids",
                    "Your application handler",
                  ],
                  [
                    "Materialize",
                    "Cassie applies the events and persists rows through Midge",
                    "Cassie",
                  ],
                  ["Query", "SQL runs against the materialized rows", "Cassie"],
                ],
              },
            },
            {
              id: "inspect-the-results",
              title: "Inspect the results",
              paragraphs: [
                "Read the printed rows against the events the example replayed, and confirm the values are what that history should produce. This is the habit worth building early: a read model is only ever as correct as the history and the handler that produced it, so verifying rows against their source is the normal way to check projection work.",
                "Then change something. Modify the example's events, rerun it, and watch the query results follow. Because replay is deterministic, the same input always produces the same rows — and that property is what makes rebuilding a projection from scratch a routine operation later on.",
              ],
            },
            {
              id: "toward-a-real-integration",
              title: "Toward a real integration",
              paragraphs: [
                "Treat the example as a workflow, not a deployment configuration. It runs a local, embedded, unauthenticated engine over throwaway storage, and every one of those is something a real deployment decides deliberately.",
                "The gap between the two is smaller than it looks, and it is mostly about the boundary rather than about Cassie itself. Your event log stays authoritative, your handler owns ordering and idempotency, and Cassie holds the derived view — the checklist below is the concrete work that follows from that.",
              ],
              table: {
                headers: ["Decide", "Page"],
                rows: [
                  [
                    "How your handler feeds events in order with stable ids",
                    "Projections and Replay",
                  ],
                  [
                    "Which SQL and client behavior your application depends on",
                    "SQL and Pgwire, PostgreSQL Compatibility",
                  ],
                  [
                    "Indexes and constraints the query shapes need",
                    "Indexes and Constraints",
                  ],
                  [
                    "Where storage lives and how it is sized",
                    "Deployment, Capacity Management",
                  ],
                  ["Authentication, TLS, and network exposure", "Security"],
                  [
                    "How a projection gets rebuilt or repaired",
                    "Projection Repair, Backup and Restore",
                  ],
                ],
              },
            },
          ],
          keywords: ["poc_read_model", "cargo run", "query", "read model"],
        },
        {
          path: "product-boundaries",
          title: "Product Boundaries",
          description:
            "Separate Cassie-owned query behavior from application-owned history, routing, placement, and replay input.",
          contract:
            "Product Boundaries is the reference for which product is accountable for which behavior across the Cassie/Midge/application split: SQL semantics and query execution, storage durability and recovery, and the durable event history that drives replay.",
          practice:
            "An application owns and orders its own event log, replays it into Cassie through the projection contract with deterministic handler output, and only then queries the resulting rows over pgwire; an operator points external routing and failover automation at Cassie's local pg_operational_assignments view instead of expecting Cassie to coordinate placement across nodes itself.",
          boundary:
            "This page does not teach SQL syntax, the replay API, or deployment configuration — it states accountability only, including that Cassie's single-node design is a permanent boundary rather than a gap awaiting distributed features.",
          keywords: ["CQRS", "ownership", "single-node"],
          content: [
            {
              id: "cassie-owns",
              title: "Cassie owns",
              paragraphs: [
                "Cassie owns everything between a submitted query and its result: SQL semantics, planning, execution, logical query layouts, indexes, search, analytics, and resource controls, together with the query-visible errors those subsystems raise. None of that is delegated to Midge, and none of it is left for the calling application to implement.",
                "Resource controls live in the query path itself, not in a side process: a request can be bounded by deadline, cancellation, SQL complexity, transport write timeout, result size, candidate-set size, worker count, and memory. Hitting one of those bounds returns a deterministic query-visible error rather than a silently truncated or degraded result, and unsupported SQL syntax follows the same rule instead of being reinterpreted into different semantics.",
              ],
              table: {
                headers: ["Area", "What Cassie owns"],
                rows: [
                  [
                    "Relational SQL",
                    "Core reads, predicates and three-valued null logic, ordering and pagination, aggregation and grouping, joins, subqueries, common table expressions, set operations, window functions, and read-only views",
                  ],
                  [
                    "Mutation and catalog",
                    "INSERT/UPDATE/DELETE with RETURNING and ON CONFLICT, CSV copy ingestion, transactions with savepoints, databases, schemas, search_path, table and index DDL, and the projection lifecycle mechanics (checkpoints, replay, materialization, activation)",
                  ],
                  [
                    "Retrieval and analytics",
                    "Full-text search with BM25 scoring, exact vector search (cosine, dot, L2), HNSW and IVFFlat approximate candidate generation, hybrid retrieval, embedding-provider integration, time-series access, column-batch analytics, and graph traversal",
                  ],
                  [
                    "Planning and execution",
                    "Plan cache, execution-result cache, cost-based join planning, adaptive plan switching, pull-based streaming execution, and configurable parallelism",
                  ],
                  [
                    "Interfaces",
                    "Pgwire as the primary SQL interface, REST as a secondary administrative API, and the admin UI built on that REST surface",
                  ],
                ],
              },
            },
            {
              id: "applications-own",
              title: "Applications own",
              paragraphs: [
                "The event stream is the source of truth, and Cassie replay is a local read-model ingestion contract layered on top of it. The durable event log itself, its partitioning, its retention, and the order events are delivered in stay with the application handler, not Cassie.",
                "Ordering and retry are enforced at the boundary, not inside Cassie: Cassie rejects an out-of-order position for a given projection/source pair, but the handler is the one that must deliver events in monotonically increasing source order and decide batch boundaries and retry cadence. Idempotency depends on the handler supplying a stable, unique event id per source event — Cassie keeps a duplicate ledger keyed by projection, source identity, and event id and silently skips a repeated id, but two different new ids inside one batch is a replay conflict that fails the whole batch before any row write applies.",
                "Replay input has to already be deterministic. Timestamps, generated ids, and any value derived from a clock, random source, sequence generator, or external service must be resolved by the handler before the event reaches Cassie; Cassie persists exactly what the payload contains and does not run upcasters or resolve non-determinism on the application's behalf.",
              ],
              table: {
                headers: ["Area", "Application handler owns", "Cassie owns"],
                rows: [
                  [
                    "Source stream",
                    "Durable event log, stream partitioning, source retention, event ordering",
                    "No remote stream storage, polling, offsets, or retention",
                  ],
                  [
                    "Event ordering",
                    "Delivering events in monotonically increasing source order",
                    "Rejecting out-of-order positions for a projection/source pair",
                  ],
                  [
                    "Idempotency",
                    "Stable event ids that uniquely identify source events",
                    "A duplicate ledger keyed by projection, source identity, and event id",
                  ],
                  [
                    "Batch identity",
                    "Choosing batch boundaries and retry cadence",
                    "Persisting a replay_batch_id for diagnostics only, never as an offset",
                  ],
                  [
                    "Time and generated values",
                    "Resolving timestamps, generated ids, and other non-deterministic values before replay",
                    "Persisting exactly the values provided in the replay payload",
                  ],
                ],
              },
              callout: {
                title: "A checkpoint is not the source of truth",
                body: "A Cassie snapshot or projection checkpoint is recovery evidence for local projection state, not a substitute for the application event stream. When replay fails, recovery means fixing the handler, ordering, or schema mapping outside Cassie, then resuming from the last committed checkpoint or rebuilding from the durable source stream — Cassie does not reconstruct missing history on its own.",
              },
            },
            {
              id: "midge-owns",
              title: "Midge owns",
              paragraphs: [
                "Cassie uses cntryl-midge directly as its only storage layer and does not maintain a second one. Midge owns persistence, durability, and recovery mechanics — the write-ahead log, crash recovery, and the guarantee that a committed write survives a restart. Cassie's executor and catalog build query behavior on top of that guarantee instead of duplicating it.",
                "That division shows up in what gets stored where: even operational metadata, such as the local routing-assignment rows Cassie exposes through pg_catalog.pg_operational_assignments, is persisted in Midge schema storage and hydrated from it at startup. The CASSIE_MIDGE_DATA_DIR path is the physical location an operator sizes and monitors for free space, since it is Midge's storage, not a Cassie-managed directory.",
              ],
              callout: {
                title: "No on-disk migration",
                body: "The only accepted Cassie-owned on-disk baseline marker is cassie-midge-layout-v1. A Midge data directory without that marker is rejected with a recreate diagnostic instead of an automatic upgrade, and there is no migration or legacy reader for an older layout.",
              },
            },
            {
              id: "single-node-boundary",
              title: "Single-node boundary",
              paragraphs: [
                "Cassie is permanently a single-node query engine. Distributed SQL, cluster membership or management, replication, consensus, sharding and rebalancing, cross-node transactions, multi-node query planning, remote query forwarding, and automatic cross-node repair are not a future path — they are explicit non-goals.",
                "Cassie does track local routing state for external use. pg_catalog.pg_operational_assignments exposes assignment_id, node_id, projection_id, tenant, partition_key, generation, state, routing_hint, and updated_ms for the local node. External routers poll that view on every candidate node, keep the highest generation per assignment scope, and decide where to send traffic; Cassie compares no generations in the query path and never validates that a client reached the right node.",
                "A query always runs against the local Cassie node and local Midge data. If an external router sends traffic to the wrong node, Cassie does not forward the query or issue a remote read on the caller's behalf.",
              ],
              table: {
                headers: ["State", "What it means"],
                rows: [
                  [
                    "claimed",
                    "The local node is expected to serve the assignment; routers may send new traffic when it is the highest observed generation for the scope",
                  ],
                  [
                    "draining",
                    "The local node should receive no new traffic; routers let their own in-flight requests finish before treating it as released",
                  ],
                  [
                    "released",
                    "The local node no longer serves the assignment; routers discard it once a newer claimed assignment is active elsewhere",
                  ],
                  [
                    "failed",
                    "The local node cannot serve the assignment safely; recovery is an external operator workflow such as restore, rebuild, replay, repair, or routing to another node",
                  ],
                ],
              },
              code: "SELECT assignment_id, node_id, projection_id, state, generation\nFROM pg_catalog.pg_operational_assignments\nORDER BY generation DESC;",
              callout: {
                title: "Permanent, not provisional",
                body: "Cassie's single-node boundary is not a pre-release gap: distributed SQL, cluster membership, replication, consensus, sharding, cross-node transactions, multi-node planning, and remote query forwarding are not on a later path. Deployments may run independent Cassie nodes side by side, but routing, placement, failover, and data movement between them stay outside Cassie.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "model",
      label: "Model and queries",
      pages: [
        {
          path: "sql-and-pgwire",
          title: "SQL and Pgwire",
          description:
            "Connect PostgreSQL clients and use the SQL surface that Cassie exposes for read-model queries.",
          contract:
            "SQL and Pgwire covers how a PostgreSQL client authenticates to Cassie, drives the extended query protocol (parse, bind, describe, execute), and reads back session state and errors over the wire. It documents pgwire mechanics only — protocol messages, prepared statements and portals, session settings, transaction verbs, and the SQLSTATE mapping errors are returned with.",
          practice:
            "An operator points a PostgreSQL driver at Cassie's pgwire listener with a database-scoped role and password, the driver negotiates startup parameters and authenticates, and the application then issues parameterized statements through parse/bind/describe/execute, optionally wrapped in BEGIN/COMMIT with SAVEPOINT for partial rollback, reading SQLSTATE codes back on failure.",
          boundary:
            "This page does not decide which PostgreSQL-ecosystem tools, extensions, or catalog columns are supported — that inventory lives on the Compatibility page. It also does not cover projection authoring, storage layout, or how read models are built; it only covers the client-facing protocol surface once a read model already exists.",
          keywords: ["SQL", "PostgreSQL", "pgwire"],
          content: [
            {
              id: "connect-a-client",
              title: "Connect a client",
              paragraphs: [
                "Pgwire is Cassie's primary query interface and listens on 127.0.0.1:5432 by default. Startup negotiates protocol version, user, database, and supported parameters, then authenticates with a password checked against a Cassie role and its stored password hash. Each authenticated connection is bound to exactly one existing database for its lifetime; there is no mid-connection USE or database switch.",
                "Password checks for known and unknown users follow the same code path, and process-local token buckets keyed on normalized user and peer IP bound authentication attempts. When a bucket is exhausted, pgwire returns the same generic authentication failure it would return for a bad password, rather than a distinct rate-limit error, so failed logins cannot be used to enumerate valid usernames.",
                "Passwordless bootstrap access only works for embedded use with no network listener; both the pgwire and REST listeners refuse to start against an empty bootstrap password or a persisted passwordless bootstrap role. A non-loopback listener additionally requires a non-default credential and Cassie-managed TLS, unless an operator explicitly sets CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1 to accept a trusted private hop behind a TLS-terminating proxy.",
                "Database access is granted per role with GRANT CONNECT ON DATABASE and revoked with REVOKE CONNECT ON DATABASE FROM ROLE — one database and one role per statement, with no grant options or multi-grantee lists. Grants and revocations are idempotent, administrators keep implicit access regardless of explicit grants, and every live session revalidates its access on each statement rather than only at connection time.",
              ],
              code: '-- Connect with any PostgreSQL driver or psql:\npsql "postgresql://app_reader:s3cret@127.0.0.1:5432/orders"\n\n-- An administrator grants a role access to a database:\nGRANT CONNECT ON DATABASE orders TO app_reader;\nREVOKE CONNECT ON DATABASE orders FROM former_reader;',
              callout: {
                title: "Non-loopback listeners need TLS and a real password",
                body: "Cassie's default bootstrap password is loopback-only. Exposing pgwire beyond 127.0.0.1 without a non-default credential and Cassie-managed TLS is refused at startup; plaintext listener traffic must never be exposed directly to an untrusted network even when CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1 is set for a trusted private hop.",
              },
            },
            {
              id: "execute-parameterized-sql",
              title: "Execute parameterized SQL",
              paragraphs: [
                "Cassie implements the PostgreSQL extended query protocol end to end: Parse creates a prepared statement, Bind attaches parameter values to produce a portal, Describe reports parameter and row-description metadata, Execute streams rows, and Close/Flush/Sync manage statement, portal, and pipeline state. Named and unnamed prepared statements and portals are scoped to one connection, capped at 1,024 of each, and torn down when explicitly closed or when the connection disconnects.",
                "Parameters accept both text and binary encodings, decoded against the statement's inferred or client-declared OID. In text format, bool, int2/int4/int8, float8, and json parameters decode into their native types and any other declared OID passes through as text. In binary format Cassie decodes a fixed wire-type set — bool, bytea, int2/int4/int8, float8, text/bpchar/varchar, json, uuid, date, time, timestamp, and its vector and array types — and rejects a binary-format bind for an OID outside that set rather than falling back to text. Every bind is also rejected if its parameter count or format-code count doesn't match what Parse produced.",
                "Cassie also accepts the simple query protocol for un-parameterized or multi-statement submissions: up to 256 statements in one message, each returning its own row description, incrementally emitted data rows, and command completion before the connection returns to ready state.",
                "A portal's Execute takes a max_rows limit that bounds only that one response; when more rows remain, the portal suspends and a later Execute resumes it. Result rows are counted cumulatively across resumes and retained memory is shared across every live portal on the connection, so max_rows shapes batching without resetting Cassie's overall query limits.",
              ],
              code: '// tokio-postgres: prepare once, bind twice\nlet stmt = client\n    .prepare("SELECT id, total FROM orders WHERE customer_id = $1")\n    .await?;\n\nlet rows = client.query(&stmt, &[&customer_id]).await?;',
              table: {
                headers: ["Message", "Sent by", "Effect"],
                rows: [
                  [
                    "Parse",
                    "client",
                    "Compiles SQL text into a named or unnamed prepared statement",
                  ],
                  [
                    "Bind",
                    "client",
                    "Attaches parameter values and result formats, producing a portal",
                  ],
                  [
                    "Describe",
                    "client",
                    "Returns parameter types (statement) or row shape (portal)",
                  ],
                  [
                    "Execute",
                    "client",
                    "Runs the portal and streams up to max_rows rows back",
                  ],
                  [
                    "Close",
                    "client",
                    "Releases a named statement or portal and its resources",
                  ],
                  [
                    "Sync",
                    "client",
                    "Ends the pipeline and returns the connection to ready state",
                  ],
                ],
              },
            },
            {
              id: "transactions-and-sessions",
              title: "Transactions and sessions",
              paragraphs: [
                "BEGIN, COMMIT, and ROLLBACK control a per-session transaction, and SAVEPOINT, RELEASE, and ROLLBACK TO SAVEPOINT nest partial rollback inside it, up to 128 savepoints per transaction. Cassie only supports READ COMMITTED isolation: requesting REPEATABLE READ or SERIALIZABLE on BEGIN is rejected outright with SQLSTATE 0A000 rather than silently downgraded. Once a statement inside a transaction fails, the transaction is marked failed and COMMIT is refused until an explicit ROLLBACK clears it.",
                "current_user, current_database(), current_schema(), SHOW search_path, and SET search_path all read and write real session state, backed by the same validated settings contract that handles startup parameters, SET, SHOW, current_setting, set_config, pg_settings, and pg_show_all_settings(). Only three settings are mutable per session — search_path, application_name, and client_min_messages — everything else PostgreSQL clients probe is a fixed, validated value Cassie advertises rather than a knob a session can change.",
                "Setting an unrecognized name or an incompatible value for a fixed setting is an error; Cassie does not silently accept arbitrary PostgreSQL GUCs it doesn't implement. Unqualified relation names resolve through search_path within the connection's bound database only — there is no cross-database relation reference.",
              ],
              table: {
                headers: ["Setting", "Kind", "Default"],
                rows: [
                  ["search_path", "mutable", "public"],
                  ["application_name", "mutable", "(empty)"],
                  ["client_min_messages", "mutable", "notice"],
                  ["server_version", "fixed", "16.0"],
                  ["server_encoding / client_encoding", "fixed", "UTF8"],
                  ["datestyle", "fixed", "ISO, MDY"],
                  ["timezone", "fixed", "UTC"],
                  ["standard_conforming_strings", "fixed", "on"],
                  ["integer_datetimes", "fixed", "on"],
                  ["bytea_output", "fixed", "hex"],
                  ["extra_float_digits", "fixed", "3"],
                ],
              },
              code: "BEGIN;\nSAVEPOINT before_adjustment;\nUPDATE orders SET total = total - 5 WHERE id = 42;\nROLLBACK TO SAVEPOINT before_adjustment;\nCOMMIT;",
            },
            {
              id: "query-visible-errors",
              title: "Query-visible errors",
              paragraphs: [
                "Every error Cassie returns over pgwire carries a PostgreSQL-style SQLSTATE. Parse and planner failures surface as 42601, an unsupported feature — a keyword like LISTEN, NOTIFY, COPY, or UNLISTEN sent through the extended query protocol, or an unsupported transaction isolation level — surfaces as 0A000, and a missing catalog object gets its PostgreSQL-family code: 42P01 for a relation, view, or sequence, 3F000 for a schema, 3D000 for a database, and 42704 for an index, role, rollup, or retention policy.",
                "Constraint violations map to their standard PostgreSQL codes — 23502 not-null, 23505 unique, 23514 check, 23503 foreign key — and each carries the affected table, column, and constraint name back to the client. Resource and admission failures use dedicated codes: 54000 for a query that would exceed a memory or row-count limit, 53300 for exhausted connection or authentication-rate admission, and 57014 for both a deadline exceeded and a cancelled query.",
                "Cancellation follows the standard PostgreSQL flow: a successful startup hands back backend process and secret data, and a cancel request naming that process and secret affects only the matching live backend — an incorrect or stale secret is a silent no-op. Cancellation is cooperative at bounded execution checkpoints and cleans up the query's portal and memory state; a cancelled portal resume returns 57014 with no partial row page rather than a truncated result.",
              ],
              table: {
                headers: ["SQLSTATE", "Meaning", "Example trigger"],
                rows: [
                  ["42601", "Syntax error", "Malformed SQL text"],
                  [
                    "0A000",
                    "Unsupported feature",
                    "LISTEN/NOTIFY/COPY via extended query, non-READ COMMITTED BEGIN",
                  ],
                  [
                    "42P01",
                    "Undefined table/view",
                    "Query against a dropped or unknown relation",
                  ],
                  [
                    "23505",
                    "Unique violation",
                    "INSERT colliding with a unique index",
                  ],
                  [
                    "23503",
                    "Foreign key violation",
                    "INSERT/UPDATE referencing a missing row",
                  ],
                  [
                    "54000",
                    "Resource limit exceeded",
                    "Result set or memory budget exceeded",
                  ],
                  [
                    "57014",
                    "Query canceled / timed out",
                    "Cancel request or deadline exceeded",
                  ],
                  [
                    "53300",
                    "Admission exhausted",
                    "Connection or auth-attempt rate limit hit",
                  ],
                  [
                    "28000",
                    "Invalid authorization",
                    "Bad password or unauthorized role",
                  ],
                ],
              },
              callout: {
                title: "Resource limits fail the statement, not the connection",
                body: "A resource-limit error (54000) or a portal's cumulative row/memory ceiling being exceeded fails only the offending bind or execute; a simple-query connection is left ready for its next query rather than being torn down, and closing the portal, rolling back, or disconnecting is what releases its retained state.",
              },
            },
          ],
        },
        {
          path: "databases-and-schemas",
          title: "Databases and Schemas",
          description:
            "Organize read models into the supported server, database, and schema hierarchy.",
          contract:
            "Databases and schemas are Cassie's SQL-visible namespace hierarchy: each logical database maps to one opaque Midge column family, and every database holds one or more schemas that scope its tables, views, sequences, and graphs.",
          practice:
            "An operator runs CREATE DATABASE and CREATE SCHEMA before any table exists, points each application connection at its target database up front since selection happens only at connect time, and later uses ALTER SCHEMA RENAME TO or an empty-only DROP SCHEMA/DROP DATABASE as a schema's or database's contents change.",
          boundary:
            "Cassie has no statement to rename a database or switch a session's database mid-connection, and it rejects any relation or schema reference that crosses a database boundary outright; composing data from two databases is left to the application, over two separate connections.",
          keywords: ["database", "schema", "catalog"],
          content: [
            {
              id: "hierarchy",
              title: "Hierarchy",
              paragraphs: [
                "Every name Cassie resolves has at most three parts: database, schema, and relation. SchemaId and RelationId join these with dots into a canonical form — database.schema and database.schema.name — and a fourth segment is rejected outright as an unsupported qualified name.",
                "A fresh data directory boots with exactly one database, postgres, holding the three schemas every database starts with: public for user-created tables, views, sequences, and graphs, plus the reserved pg_catalog and information_schema system schemas that back Cassie's virtual catalog views.",
                "pg_catalog and information_schema are not per-database data — their schema names carry no database prefix. information_schema.schemata scopes its rows to the querying session's own database, always listing public, pg_catalog, and information_schema for that database plus any user-created schemas that belong to it. pg_catalog.pg_database instead lists every logical database registered on the instance, regardless of which one the querying session is connected to — on a fresh data directory that is still just the single postgres row.",
              ],
              table: {
                headers: ["Level", "Canonical form", "Example"],
                rows: [
                  ["Database", "name", "postgres"],
                  ["Schema", "database.schema", "postgres.public"],
                  [
                    "Relation",
                    "database.schema.name",
                    "postgres.public.orders",
                  ],
                ],
              },
              code: "SELECT datname FROM pg_catalog.pg_database ORDER BY datname;\n-- postgres\n\nSELECT schema_name FROM information_schema.schemata ORDER BY schema_name;\n-- information_schema\n-- pg_catalog\n-- public",
            },
            {
              id: "create-and-select-a-database",
              title: "Create and select a database",
              paragraphs: [
                "CREATE DATABASE name [IF NOT EXISTS] creates the underlying Midge database, creates its public schema, and registers both in the catalog as one statement. DROP DATABASE name [IF EXISTS] reverses it, but only once the database holds no schema besides public and no collection, view, sequence, graph, rollup, retention policy, or materialized projection: a non-empty drop fails with \"database '<name>' is not empty\", and a session can never drop the database it is currently connected to.",
                "A session's database is fixed once, at connection time — Cassie's SQL surface has no USE or \\c equivalent to change it mid-session. A session bound to a name that does not exist is not rejected at connect time; it fails on its first query with a CassieError::CatalogObjectNotFound error whose kind is CatalogObjectKind::Database.",
                "Database creation journals the intended physical family before it exists and commits the catalog entry only once creation finishes, so a restart can complete or clean up an interrupted CREATE DATABASE or an empty-only DROP DATABASE instead of leaving an orphaned family behind.",
                "Which roles may open a connection at all is a separate grant from what they can do once inside it: GRANT CONNECT ON DATABASE name TO role and its REVOKE counterpart.",
              ],
              code: "CREATE DATABASE analytics;\nCREATE ROLE reader LOGIN PASSWORD 'reader-secret';\nGRANT CONNECT ON DATABASE analytics TO reader;\n-- reader connects with dbname=analytics already fixed in its connection string",
              callout: {
                title: "No ALTER DATABASE",
                body: "Cassie has no statement to rename a database or reassign its ownership once CREATE DATABASE runs. Renaming exists only one level down, via ALTER SCHEMA ... RENAME TO — the database name is final for that database's lifetime.",
              },
            },
            {
              id: "schemas-and-names",
              title: "Schemas and names",
              paragraphs: [
                "CREATE SCHEMA name [IF NOT EXISTS] adds a namespace inside the session's current database; an unqualified schema name never needs a database prefix because Cassie fills in the session's own database while normalizing the statement. DROP SCHEMA name [IF EXISTS] enforces the same emptiness as DROP DATABASE and fails with \"namespace '<name>' is not empty\" when a collection, view, sequence, graph, rollup, retention policy, or materialized projection is still inside it.",
                "ALTER SCHEMA name RENAME TO next_name renames the namespace and walks every relation, view, sequence, graph, rollup, retention policy, and materialized projection stored inside it, rewriting their names and any schema-qualified SQL embedded in view or materialized-projection queries to match. It fails if next_name already exists or is identical to the current name.",
                "public, pg_catalog, and information_schema are reserved: CREATE SCHEMA, DROP SCHEMA, and ALTER SCHEMA — as either the source or the RENAME TO target — all fail against any of the three with \"namespace '<name>' is reserved\", so the default schema and the two system schemas can be neither displaced nor renamed.",
                'An identifier parses to one of three depths — unqualified name, schema-qualified schema.name, or database-qualified database.schema.name — and quoting a segment lets it hold a literal dot, so "tenant.db"."reporting"."orders.archive" still parses as three parts even though two of them contain periods.',
                "Session search_path (default just public) decides which schema an unqualified reference resolves against, and it also drives Postgres-compatible visibility: after SET search_path = reporting, pg_catalog.pg_table_is_visible reports false for a same-named table left in public and true for the one now on the path.",
              ],
              table: {
                headers: ["Form", "Parses as", "Example"],
                rows: [
                  ["Unqualified", "name", "orders"],
                  ["Schema-qualified", "schema.name", "reporting.orders"],
                  [
                    "Database-qualified",
                    "database.schema.name",
                    "tenant_db.reporting.orders",
                  ],
                ],
              },
              code: "CREATE SCHEMA reporting;\nCREATE TABLE reporting.orders (id INT PRIMARY KEY);\nALTER SCHEMA reporting RENAME TO reporting_v2;\nDROP SCHEMA reporting_v2;",
            },
            {
              id: "cross-database-boundary",
              title: "Cross-database boundary",
              paragraphs: [
                "Every logical database maps to exactly one physical Midge column family, generated once as an opaque db-<uuid> name and stored as DatabaseMeta.physical_family. Cassie has no ALTER DATABASE rename statement today, but the repository documents this opacity as deliberate: keeping the physical family name independent of the logical database name means a future logical rename would not require rewriting the family's data.",
                "Two more families sit beside the per-database ones — cf0 for global schema and catalog records plus the database registry, and cf1 for Cassie's own temporary and transient runtime state — and Midge's reserved default family is left unused by Cassie entirely.",
                "Midge::database_tx is the transaction routing boundary, and it enforces the same limit at the storage layer that the SQL layer enforces above it: one transaction cannot span two databases, and it cannot mix a catalog family with a data family in the same commit.",
                'The SQL binder rejects cross-database syntax before it reaches storage: a database-qualified relation name whose database is not the session\'s own returns "cross-database relation references are not supported", a database-qualified schema name returns "cross-database schema references are not supported", and CREATE DATABASE or DROP DATABASE reject a dotted name outright with "database names cannot be qualified".',
              ],
              table: {
                headers: ["Family", "Holds"],
                rows: [
                  [
                    "cf0",
                    "Global schema/catalog records and the database registry",
                  ],
                  ["cf1", "Cassie temporary and transient runtime state"],
                  [
                    "db-*",
                    "One opaque family per logical database's data plane",
                  ],
                  [
                    "default (Midge)",
                    "Reserved compatibility family; unused by Cassie",
                  ],
                ],
              },
              callout: {
                title: "No cross-database queries",
                body: "A session is bound to one database for its lifetime, and no join, foreign key, or view can span two of them. Combining data from two databases is application work performed over two separate connections, not something Cassie's planner can express in one query.",
              },
            },
          ],
        },
        {
          path: "projections-and-replay",
          title: "Projections and Replay",
          description:
            "Apply deterministic projection work, track progress, and rebuild read models from application-owned history.",
          contract:
            "Projection replay is Cassie's batch API for turning application-owned events into local read-model rows and checkpoint state; materialized projections layer a SQL lifecycle (create, build, activate, verify, drop) on top of that same replay and row-storage path.",
          practice:
            "An application pushes ProjectionReplayBatch calls with stable event ids and increasing source positions, watches freshness and last_error in pg_catalog.pg_projection_checkpoints, and only runs ALTER MATERIALIZED PROJECTION ... ACTIVATE VERSION after VERIFY PROJECTION reports the target version verified.",
          boundary:
            "Cassie does not store the source event log, choose batch boundaries or retry cadence, or resolve timestamps, generated ids, or other non-deterministic values in a payload - those stay with the application handler; Cassie owns only the resulting rows, checkpoint metadata, duplicate ledger, and schema validation.",
          keywords: ["projection", "replay", "checkpoint"],
          content: [
            {
              id: "projection-contract",
              title: "Projection contract",
              paragraphs: [
                "Cassie's replay surface is a structured batch call, not a trait an application implements. `replay_projection_batch` accepts a `ProjectionReplayBatch` naming the target `projection`, a `source_identity`, a `batch_id`, a `lag` value, and an ordered list of `ProjectionReplayEvent` records - each carrying `event_id`, `checkpoint`, an optional `position`, `document_id`, and an optional JSON `payload` (a missing payload is a delete of that document). The application chooses how many events go in a batch and how often it calls; Cassie only validates and applies what arrives in that one call.",
                "Cassie persists the resulting rows, the duplicate ledger, and projection metadata through Midge, the same embedded storage engine backing ordinary collections - replay does not introduce a second store. The ownership split is explicit by area:",
              ],
              table: {
                headers: ["Area", "Cassie owns", "Application owns"],
                rows: [
                  [
                    "Source stream",
                    "No remote stream storage, polling, offsets, or retention",
                    "Durable event log, stream partitioning, source retention, event ordering",
                  ],
                  [
                    "Event ordering",
                    "Rejecting out-of-order positions for a projection/source pair",
                    "Delivering events in deterministic source order",
                  ],
                  [
                    "Idempotency",
                    "Duplicate ledger keyed by projection, source identity, and event id",
                    "Stable event ids, unique per source event, across retries",
                  ],
                  [
                    "Batch identity",
                    "Persisting replay_batch_id for diagnostics",
                    "Choosing batch boundaries and retry cadence",
                  ],
                  [
                    "Payload shape",
                    "Schema, constraint, index, and row-write validation",
                    "Deterministic mapping from event payload to projection document",
                  ],
                  [
                    "Schema versions",
                    "Validating metadata against the current Cassie schema",
                    "Event schema compatibility, upcasters, handler version rollout",
                  ],
                  [
                    "Time and generated values",
                    "Persisting values exactly as supplied in the payload",
                    "Resolving timestamps, generated ids, and other non-deterministic values before replay",
                  ],
                  [
                    "Failures",
                    "Failed freshness, last_error, metrics, restart hydration",
                    "Retry decisions, source replay window selection, external alerting",
                  ],
                ],
              },
              callout: {
                title: "A checkpoint is not the event log",
                body: "A projection checkpoint or snapshot is recovery evidence for local read-model state, not a copy of application history. If the durable event log an application owns is gone, Cassie has nothing independent to rebuild a projection from.",
              },
            },
            {
              id: "checkpoints",
              title: "Checkpoints",
              paragraphs: [
                "Every projection carries checkpoint state in its metadata record, one entry per projection: `source_checkpoint` (the opaque token from the last applied event's `checkpoint` field), `source_position` (the last applied monotonic position, used to detect redelivery out of order), `last_applied_event_id`, `replay_batch_id` (diagnostic only - never usable as a source offset), running `applied_event_count` and `skipped_duplicate_count` totals, and `lag`, which the calling batch sets directly: a batch reporting `lag: 0` marks the projection fresh, any other value marks it stale.",
                "Most of this is queryable over the wire, not just in the local API response — the checkpoint and position fields, freshness, and last_error are exposed as columns; applied_event_count and skipped_duplicate_count stay in the metadata record and replay report, not in this view:",
              ],
              code: "SELECT projection_id, collection, source_identity, source_checkpoint,\n       source_position, last_applied_event_id, freshness, last_error\nFROM pg_catalog.pg_projection_checkpoints\nWHERE collection = 'orders_by_customer';",
              table: {
                headers: ["Column", "What it reports"],
                rows: [
                  [
                    "projection_id",
                    "Projection name, or the collection name if no projection_id was set",
                  ],
                  [
                    "collection",
                    "Backing collection the projection metadata is attached to",
                  ],
                  [
                    "kind",
                    "collection or materialized - a streamed collection projection or a SQL-defined materialized projection",
                  ],
                  [
                    "source_identity",
                    "The bound source this projection accepts batches from",
                  ],
                  [
                    "source_checkpoint",
                    "Opaque checkpoint token from the last applied event",
                  ],
                  ["source_position", "Last applied monotonic source position"],
                  [
                    "last_applied_event_id",
                    "event_id of the last event actually applied",
                  ],
                  [
                    "replay_batch_id",
                    "Diagnostic batch id from the last replay call, not an offset",
                  ],
                  [
                    "lag",
                    "Lag value reported by the last batch; 0 means fresh",
                  ],
                  ["freshness", "unknown, fresh, stale, rebuilding, or failed"],
                  [
                    "last_error",
                    "Message from the most recent replay failure, if any",
                  ],
                ],
              },
            },
            {
              id: "replay",
              title: "Replay",
              paragraphs: [
                "A batch call runs through four steps in order: validate that `projection` and `source_identity` are non-empty, load the projection's existing checkpoint metadata and confirm the batch's `source_identity` matches whatever was bound on a previous batch, check every `event_id` in the batch against the duplicate ledger in one call, then apply whatever events remain. Nothing is written until that duplicate check has run for the whole batch.",
                "A representative batch body looks like this - note the second event's null payload, which becomes a delete of that document rather than a row write:",
                "Two outcomes look similar but are handled differently. Redelivering an `event_id` Cassie has already recorded for that projection/source pair is not an error: Cassie skips the row write, increments `skipped_duplicate_count`, and moves on - this is the idempotent path retries are expected to hit. A new `event_id` that appears twice inside the same batch is a different situation, a replay conflict, and Cassie fails the entire batch before any row write happens. An event whose position is at or before the last applied position for that source fails the batch the same way: out of order is rejected outright, never partially applied.",
                "In every failure case, `source_checkpoint` and `last_applied_event_id` do not advance, `freshness` becomes `failed`, and `last_error` records the message - and that failed state is persisted, so it is still visible in `pg_catalog.pg_projection_checkpoints` after a restart, not just in the call's own response.",
              ],
              code: '{\n  "projection": "orders_by_customer",\n  "source_identity": "orders-service",\n  "batch_id": "batch-482",\n  "lag": 0,\n  "events": [\n    { "event_id": "evt-9001", "checkpoint": "0000000482", "position": 482,\n      "document_id": "cust-7731", "payload": { "total_cents": 48210 } },\n    { "event_id": "evt-9002", "checkpoint": "0000000483", "position": 483,\n      "document_id": "cust-7731", "payload": null }\n  ]\n}',
              table: {
                headers: ["Failure cause", "Effect"],
                rows: [
                  [
                    "Projection/source identity mismatch",
                    "Batch rejected before any event is evaluated",
                  ],
                  ["Empty event_id", "Batch rejected before any row write"],
                  [
                    "Duplicate new event_id within one batch",
                    "Batch rejected before any row write",
                  ],
                  [
                    "Out-of-order source position",
                    "Batch rejected before any row write",
                  ],
                  [
                    "Row, schema, constraint, index, or storage write error",
                    "Batch rejected mid-apply, after the Midge write was attempted",
                  ],
                  [
                    "Duplicate-ledger persistence error",
                    "Batch rejected after documents write, before ledger commit",
                  ],
                ],
              },
            },
            {
              id: "activation-and-verification",
              title: "Activation and verification",
              paragraphs: [
                "Materialized projections add a SQL lifecycle on top of the same read-model machinery. `CREATE MATERIALIZED PROJECTION ... AS <query>` defines the query over its source collections and builds a first version; `REFRESH MATERIALIZED PROJECTION` rebuilds the active version's output in place; `ALTER MATERIALIZED PROJECTION ... BUILD VERSION` builds a new version alongside the active one without switching to it; `ALTER MATERIALIZED PROJECTION ... ACTIVATE VERSION <id>` switches which version answers queries; `DROP MATERIALIZED PROJECTION` removes the projection and every version's output collection.",
                "Activation is gated, not automatic. `ACTIVATE VERSION` only succeeds when the target version's state is `built` or `active` and its verification state is `verified`, `skipped`, or `unknown`. Anything else - `stale`, `failed`, or a report showing mismatches - blocks the switch unless the command adds `UNSAFE`, in which case Cassie records the override in the projection's swap metadata (`target_version_id`, `previous_version_id`, `unsafe_override: true`) instead of refusing it.",
                "`VERIFY PROJECTION` runs different checks depending on `MODE`, and each run persists a `pg_catalog`-visible integrity report - state, mismatch/missing/stale counts, checked and skipped components, and whether the finding is repairable - keyed to the exact output collection and version it checked.",
              ],
              code: "CREATE MATERIALIZED PROJECTION orders_by_customer AS\n  SELECT customer_id, sum(total_cents) AS total_cents\n  FROM orders GROUP BY customer_id;\n\nALTER MATERIALIZED PROJECTION orders_by_customer BUILD VERSION;\nVERIFY PROJECTION orders_by_customer VERSION v2 MODE full;\nALTER MATERIALIZED PROJECTION orders_by_customer ACTIVATE VERSION v2;",
              table: {
                headers: ["Mode", "Checks run"],
                rows: [
                  ["full", "Metadata, hashes, and indexes"],
                  ["metadata_only", "Metadata only"],
                  ["hashes_only", "Hashes only"],
                  ["indexes_only", "Indexes only"],
                ],
              },
              callout: {
                title: "A completed retry is not verification",
                body: "Cassie does not swap an active materialized projection version because a batch retry finished locally. Swap it only after replay freshness is fresh, VERIFY PROJECTION reports the target version verified, and the swap itself completes without an error - a locally successful retry is not a substitute for any of the three.",
              },
            },
          ],
        },
        {
          path: "indexes-and-constraints",
          title: "Indexes and Constraints",
          description:
            "Choose indexes and supported constraints that match read-model query and rebuild behavior.",
          contract:
            "Indexes, constraints, and analytical overlays let a Cassie read model answer supported SQL predicates without scanning every row blob, while primary key, unique, NOT NULL, CHECK, DEFAULT, and single-column foreign key constraints gate what a write is allowed to publish.",
          practice:
            "Declare table constraints and CREATE INDEX structures alongside the projection shape, let Cassie populate them from the rows already stored in the table, and read EXPLAIN and /metrics output to confirm the planner used the intended index instead of falling back to a row scan.",
          boundary:
            "Cassie does not implement PostgreSQL operator classes, collation-aware comparison, general predicate implication, or composite foreign keys, and index or constraint state is rebuilt only on the single node that owns it — never replicated or repaired across independent nodes.",
          keywords: ["index", "constraint", "unique"],
          content: [
            {
              id: "supported-indexes",
              title: "Supported indexes",
              paragraphs: [
                "Cassie keeps row blobs as the single source of truth for every table; indexes and analytical overlays exist purely to accelerate reads, and a row fetch remains the correctness fallback whenever a query needs a field an index does not cover. Declaring PRIMARY KEY in CREATE TABLE registers its backing index automatically, so point lookups on the primary key work without a separate CREATE INDEX statement.",
                "Composite indexes plan left-prefix lookups only: an index on (tenant_id, status, created_at) accelerates predicates that use a left-hand prefix of its columns — tenant_id alone, tenant_id plus status, or all three columns in that order — plus combined predicates extracted from simple conjunctions. Arbitrary skip-column lookup, PostgreSQL operator classes, collation-specific comparison, and planner hints are out of scope.",
              ],
              table: {
                headers: ["Index type", "Created with", "Scope"],
                rows: [
                  [
                    "Primary key",
                    "PRIMARY KEY in CREATE TABLE",
                    "Identity point lookup with duplicate and null rejection; its backing index is registered automatically at table creation.",
                  ],
                  [
                    "Secondary scalar",
                    "CREATE INDEX ON applications (status)",
                    "Equality and range acceleration on one scalar column.",
                  ],
                  [
                    "Composite",
                    "CREATE INDEX ON applications (tenant_id, status, created_at)",
                    "Left-prefix lookup only, plus combined predicates from simple conjunctions.",
                  ],
                  [
                    "Covering",
                    "CREATE INDEX ... INCLUDE (id, created_at, applicant_name)",
                    "Stores extra projected columns so a fully covered query skips the row fetch; any field not included still triggers one.",
                  ],
                  [
                    "Partial",
                    "CREATE INDEX ... WHERE status = 'approved'",
                    "Selected only when a query predicate normalizes to the exact same expression as the index predicate; broader predicate implication is not proven.",
                  ],
                  [
                    "Expression",
                    "CREATE INDEX ON users (lower(email))",
                    "Exact-equality seeks on a Cassie-normalized deterministic expression; expression range scans and expression ORDER BY proofs are not supported.",
                  ],
                  [
                    "Full-text",
                    "CREATE INDEX ... USING fulltext (body) WITH (...)",
                    "Inverted index with BM25 scoring and snippets, with named analyzer, tokenizer, stemming, stop-word, and accent-folding options.",
                  ],
                  [
                    "Vector",
                    "CREATE INDEX ... USING vector (embedding) WITH (...)",
                    "Brute-force, HNSW, or IVFFlat candidates over cosine, L2, or dot metrics; matches are re-ranked against the exact stored vector before returning, and an unsupported or stale graph or training shape falls back to the exact brute-force path.",
                  ],
                  [
                    "Time-series",
                    "CREATE INDEX ... USING time_series (created_at) WITH (...)",
                    "Range planning over one declared timestamp column; only fixed minute, hour, or day bucket widths are bucket-native, other widths persist as metadata and run row-backed.",
                  ],
                  [
                    "Column-batch",
                    "CREATE INDEX ... USING column (status, created_at, amount) WITH (...)",
                    "Covered scans, segment-summary predicate pruning, and acceleration for unfiltered, non-grouped count, sum, avg, min, and max; falls back to a row scan for anything a summary cannot answer exactly.",
                  ],
                ],
              },
              code: "-- Composite (left-prefix only)\nCREATE INDEX ON applications (tenant_id, status);\nCREATE INDEX ON applications (tenant_id, status, created_at);\n\n-- Covering\nCREATE INDEX ON applications (tenant_id, status)\nINCLUDE (id, created_at, applicant_name);\n\n-- Partial\nCREATE INDEX ON applications (tenant_id, created_at)\nWHERE status = 'approved';\n\n-- Expression\nCREATE INDEX ON users (lower(email));\n\n-- Full-text\nCREATE INDEX ON documents USING fulltext (body)\nWITH (analyzer = standard, stop_words = none, accent_folding = true);\n\n-- Vector\nCREATE INDEX ON documents USING vector (embedding)\nWITH (source_field = body, metric = l2, index_type = hnsw, m = 16, ef_construction = 64, ef_search = 40);\n\n-- Time-series\nCREATE INDEX idx_events_created_at\nON events USING time_series (created_at)\nWITH (bucket_width = '1 hour', partition_by = tenant_id);\n\n-- Column-batch\nCREATE INDEX idx_applications_column\nON applications USING column (status, created_at, amount)\nWITH (segment_size = 1024);",
            },
            {
              id: "constraint-behavior",
              title: "Constraint behavior",
              paragraphs: [
                "Constraints are correctness gates on projection state, not planner hints. Validation runs before a write becomes visible, a validation failure never partially mutates row blobs or indexes, and constraint metadata persists in the catalog and hydrates again after restart.",
                "Primary key, unique, NOT NULL, CHECK, and DEFAULT stay PostgreSQL-like for the syntax Cassie parses. PRIMARY KEY and UNIQUE both accept a parenthesized column list, so composite keys are supported, and PRIMARY KEY implies NOT NULL while rejecting both duplicate and null identity values. CHECK accepts one parenthesized comparison of a column against a literal, using =, !=, <, <=, >, >=, or LIKE — not arbitrary boolean expressions, AND/OR combinations, or subqueries. DEFAULT accepts a literal value or a nextval() sequence expression pointing at an independently managed sequence; declaring a column SERIAL or BIGSERIAL instead creates and owns its own sequence automatically and adds an implicit NOT NULL.",
                "FOREIGN KEY (column) REFERENCES table(column) validates that a referenced row exists before an insert or update becomes visible, and supports ON DELETE and ON UPDATE actions of CASCADE, SET NULL, SET DEFAULT, RESTRICT, and NO ACTION. A foreign key references exactly one source column — composite, multi-column foreign keys are rejected when the table is created. Cassie is a projection or read-model database built on Midge storage, not a general OLTP system, so these referential actions apply only within the local projection and never reach back into an application's own source-of-truth history.",
              ],
              table: {
                headers: ["Constraint", "SQLSTATE", "Trigger"],
                rows: [
                  [
                    "NOT NULL",
                    "23502",
                    "A write path that enforces NOT NULL sees a missing or null column value.",
                  ],
                  [
                    "UNIQUE",
                    "23505",
                    "An insert or update produces a duplicate value over a unique-constrained key.",
                  ],
                  ["CHECK", "23514", "A row value fails its CHECK comparison."],
                  [
                    "FOREIGN KEY",
                    "23503",
                    "A referenced row is missing, or a RESTRICT or NO ACTION delete or update is blocked by a referencing row.",
                  ],
                ],
              },
              code: "CREATE TABLE constraint_docs (\n    id INT PRIMARY KEY,\n    email TEXT NOT NULL UNIQUE,\n    status TEXT DEFAULT 'pending',\n    score INT CHECK (score >= 18)\n);\n\nCREATE TABLE fk_delete_parents (id INT PRIMARY KEY, title TEXT);\n\nCREATE TABLE fk_delete_cascade_children (\n    parent_id INT,\n    title TEXT,\n    CONSTRAINT fk_delete_cascade_children_fkey\n        FOREIGN KEY (parent_id) REFERENCES fk_delete_parents(id)\n        ON DELETE CASCADE\n);",
            },
            {
              id: "build-and-rebuild",
              title: "Build and rebuild",
              paragraphs: [
                "CREATE INDEX and CREATE TABLE build directly from what already exists: an index scans the rows already stored in its table and populates its structure from them, and table creation registers the declared schema and constraints in the catalog before any row is written against it. Metadata for every index, constraint, and column-batch structure persists in the catalog so a restart hydrates the same structure without a separate rebuild pass.",
                "Time-series bucket state and column-batch segments are treated as latest-only derived sidecars rather than a second source of truth. On startup, Cassie audits each sidecar's version, generation, row counts, and checksums against the authoritative Midge row records, and rebuilds the complete sidecar automatically whenever it is missing, malformed, stale, or inconsistent — there is no compatibility branch that reads an incompatible derived format forward.",
                "Retention policies are a separate lifecycle primitive layered on top of normal document deletion: CREATE RETENTION POLICY persists a policy over one timestamp column and duration, ALTER RETENTION POLICY ... RETAIN FOR ... changes that duration, and nothing is deleted until an explicit ENFORCE RETENTION POLICY ... AT ... command deletes rows older than AT minus the retained duration. Enforcement skips missing or invalid timestamps with diagnostics, and because it runs through the normal document-deletion path, dependent index, vector, and column-batch state for the deleted rows is refreshed as part of the same operation.",
              ],
              code: "CREATE RETENTION POLICY events_retention\nON events USING event_at\nRETAIN FOR '7 days';\n\nALTER RETENTION POLICY events_retention RETAIN FOR '14 days';\n\nENFORCE RETENTION POLICY events_retention AT '2026-01-10T00:00:00Z';",
              callout: {
                title: "IF NOT EXISTS guards the name, not the definition",
                body: "CREATE INDEX IF NOT EXISTS and CREATE TABLE IF NOT EXISTS check the catalog for an object with that exact name only. If one already exists, Cassie returns success and leaves the existing definition in place, even when the new statement's columns, INCLUDE list, WITH options, or predicate differ from what is already registered. Rerunning a changed CREATE INDEX IF NOT EXISTS is not a way to pick up a new definition — drop the index or table by name and issue a plain CREATE statement when its shape needs to change.",
              },
            },
            {
              id: "verification",
              title: "Verification",
              paragraphs: [
                "Every index and analytical overlay is expected to make its planner choice observable, not just its query result. EXPLAIN reports column_batch_index=<name> for an eligible covered column-batch scan and aggregate_acceleration=true when an unfiltered, non-grouped count, sum, avg, min, or max was answered from segment summaries instead of rows. Time-series index selection surfaces its selected bucket width, partition fields, and range-filter diagnostics the same way.",
                "Runtime metrics carry the same signal into monitoring: column-batch indexes expose scan, fallback, byte, segment, decoded-column, and aggregate-acceleration counters; time-series indexes expose bucket-native hits, selected scans, rows, scanned and skipped buckets, last index used, and fallback reasons; and pg_catalog.pg_retention_policies exposes each retention policy's state plus its delete, skip, and error counts.",
                "When an index or column-batch sidecar's local state diverges from the row blobs it was built from, rebuilding it is a separate, operator-run action that stays local to the node that owns the data: it never runs automatically inside query execution and never reaches across independent nodes.",
              ],
              table: {
                headers: ["EXPLAIN output", "Meaning"],
                rows: [
                  [
                    "column_batch_index=<name>",
                    "A projected scan was fully covered by column-batch segments instead of fetching row blobs.",
                  ],
                  [
                    "aggregate_acceleration=true",
                    "An eligible unfiltered, non-grouped aggregate used column-batch segment summaries instead of scanning rows.",
                  ],
                  [
                    "Selected bucket width / partition fields",
                    "A time-series index answered a timestamp range predicate; the plan reports which bucket width and partition columns were used.",
                  ],
                ],
              },
            },
          ],
        },
        {
          path: "search-and-query",
          title: "Search and Query Capabilities",
          description:
            "Choose relational, text, vector, analytical, time-series, or graph-shaped retrieval for a read model.",
          contract:
            "Search and Query Capabilities is the read surface of Cassie: relational SQL, full-text and vector search (including a combined hybrid score), column-batch analytics, fixed-bucket time-series access, and graph traversal all run as SQL or SQL table functions over one pgwire connection, not as separate engines or query languages.",
          practice:
            "An application picks the index kind a query shape needs — scalar/composite, fulltext, vector, column, time_series, or CREATE GRAPH — declares it with CREATE INDEX or CREATE GRAPH, issues ordinary SELECT or table-function SQL against it, and reads EXPLAIN and /metrics to confirm which access path and fallback reason a query actually took.",
          boundary:
            "Every accelerated path — full-text postings, HNSW/IVFFlat candidates, bucket-native time-series membership, column batches, and graph adjacency sidecars — sits over authoritative row blobs as a candidate accelerator, never a second source of truth, and none of it distributes execution, traversal, or coordination beyond Cassie's single node.",
          keywords: ["search", "vector", "analytics", "graph"],
          content: [
            {
              id: "relational-queries",
              title: "Relational queries",
              paragraphs: [
                "A single pgwire connection serves SELECT with projections, aliases, and expressions over FROM/WHERE; comparison and boolean predicates with IS NULL, IN, BETWEEN, and three-valued null logic; ORDER BY with explicit null placement, LIMIT/OFFSET, DISTINCT and DISTINCT ON; count/sum/avg/min/max aggregation with GROUP BY and HAVING; UNION, UNION ALL, INTERSECT, and EXCEPT; and read-only views, including nested views. Inner, left, right, full outer, cross, lateral, apply, semi, and anti joins, scalar/table/predicate/lateral/correlated subqueries, non-recursive and recursive WITH, window functions with ranking, offset, and value forms over documented row frames, and scalar user-defined functions with declared volatility extend that surface for read-model shapes a flat table can't express directly.",
                "Writes go through INSERT, PostgreSQL-style INSERT ... ON CONFLICT DO NOTHING/DO UPDATE with excluded.<column> references, UPDATE, DELETE, RETURNING, and CSV COPY FROM STDIN ingestion, inside transactions with savepoints and read-your-writes visibility. CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS are name-idempotent no-ops rather than diff-and-alter operations — an existing name succeeds even when the requested definition differs, and the object already on disk is left standing.",
                "Cassie is a single-node query engine: it does not distribute execution, coordinate a cluster, or fail over across nodes, and it does not claim full PostgreSQL syntax or catalog parity. Unsupported syntax and resource exhaustion return deterministic, query-visible errors with a fixed SQLSTATE mapping instead of silently changing semantics.",
              ],
              table: {
                headers: ["Condition", "SQLSTATE"],
                rows: [
                  ["Syntax error", "42601"],
                  ["Unsupported feature", "0A000"],
                  ["Undefined object", "PostgreSQL-family SQLSTATE"],
                  ["Query cancellation or deadline", "57014"],
                  ["Resource-limit failure", "54000"],
                  ["Connection admission failure", "53300"],
                ],
              },
              code: "INSERT INTO applications (id, status)\nVALUES ($1, $2)\nON CONFLICT (id) DO UPDATE\n  SET status = excluded.status\nRETURNING id, status;",
            },
            {
              id: "text-and-vector-search",
              title: "Text and vector search",
              paragraphs: [
                "Full-text search is SQL, not a side API. Three functions carry it: search(column, query) is a boolean match predicate, search_score(column, query) returns the exact BM25 score used for ranking, and snippet(column, query) returns a highlighted excerpt.",
                "CREATE INDEX ... USING fulltext declares persisted analyzer options — analyzer (standard or simple), tokenizer (standard or whitespace), case_folding and accent_folding switches, and stop_words (english or none). The same options are reused by indexing, scoring, snippets, and rebuild scans, so all four stay consistent. One current limit to plan around: stemming accepts only none, so Cassie tokenizes and folds case and accents but does not reduce words to stems.",
                "Matches read from persisted posting blocks with bounded candidate fetches, and a transaction's own uncommitted writes are visible through an overlay before they are durable.",
                "Vector search follows the same shape: vector_distance(column, vector) scores cosine, dot-product, and L2 distance, and CREATE INDEX ... USING vector chooses index_type — bruteforce, hnsw, or ivfflat — independently of the metric. HNSW is tuned by m, ef_construction, and ef_search; IVFFlat by lists, probes, training_sample_size, and training_seed.",
                "The property worth knowing is that the index type does not change your results. Brute force streams an exact bounded top-k over every row under cancellation and hard memory limits. HNSW accelerates compatible unfiltered top-k searches by walking a persisted graph, and IVFFlat accelerates compatible L2 top-k searches by probing trained centroid lists — but both then fetch the source row vectors and re-rank them exactly before returning.",
                "So an accelerated query returns the same ordering brute force would for a compatible search. The index changes how candidates are found, not how they are ranked, and there is no approximation for the application to compensate for.",
                "hybrid_score() combines a search_score() term over a text column with a vector_score() term over a vector column into one ranking value; Cassie intersects persisted text, vector, and structured WHERE candidates before computing that final exact score, so an ordinary predicate can sit alongside the hybrid ranking in the same query. Embedding generation for a vector column runs through a configured, response-bounded provider protocol — OpenAI, an OpenAI-compatible endpoint, TEI, Ollama, Voyage, Cohere, or a deterministic local protocol — and third-party provider availability is an external dependency Cassie does not guarantee.",
              ],
              table: {
                headers: ["Option", "Values"],
                rows: [
                  ["index_type", "bruteforce, hnsw, ivfflat"],
                  ["metric", "cosine, l2, dot"],
                  ["HNSW tuning", "m, ef_construction, ef_search"],
                  [
                    "IVFFlat tuning",
                    "lists, probes, training_sample_size, training_seed",
                  ],
                ],
              },
              code: "CREATE INDEX ON documents USING vector (embedding)\nWITH (source_field = body, metric = l2, index_type = hnsw, m = 16, ef_construction = 64, ef_search = 40);\n\nSELECT id, hybrid_score(search_score(body, $1), vector_score(embedding, $2)) AS score\nFROM documents\nWHERE status = $3\nORDER BY score DESC\nLIMIT 10;",
              callout: {
                title:
                  "Vector index acceleration always falls back to exact rows",
                body: "When a collection's HNSW graph or IVFFlat training state is missing, stale, incompatible, empty, or otherwise unsupported for a given search, Cassie executes the exact brute-force row/vector path instead and records a fallback reason in EXPLAIN and /metrics — an accelerated index changes how a query is served, never what it's allowed to return.",
              },
            },
            {
              id: "analytical-and-time-series-queries",
              title: "Analytical and time-series queries",
              paragraphs: [
                "CREATE INDEX ... USING column builds a column-batch (CBM2) representation from row blobs, choosing plain, constant, typed run-length, dictionary, or 128-value frame-of-reference encoding automatically per segment — codec choice is not a SQL or configuration surface. Segment summaries prune covered equality, range, IS NULL, and IS NOT NULL predicates without decoding, covered projected scans can skip row fetches entirely, and unfiltered non-grouped count/sum/avg/min/max can read summary metadata directly. EXPLAIN reports column_batch_index=<name> and aggregate_acceleration=true when a scan or aggregate actually took that path; anything the encoded path can't answer falls back to scanning authoritative rows.",
                "CREATE INDEX ... USING time_series declares a timestamp column and a fixed bucket_width — minute, hour, or day — plus an optional partition_by key, and EXPLAIN reports the selected width, partition fields, and range-filter diagnostics for a query that used it. A bucket_width outside those three values is accepted and persisted as metadata but always executes over the row-backed range path, since no bucket-native format is defined for it yet; even a bucket-native hit loads the authoritative row blobs and runs the normal filter/sort/projection path afterward, so bucket metadata is a candidate accelerator, not a second copy of the data.",
                "CREATE RETENTION POLICY ... RETAIN FOR '<duration>' and ENFORCE RETENTION POLICY ... AT '<timestamp>' are explicit statements, not a background timer. Enforcement deletes rows older than AT minus the retained duration through the normal document-deletion path, skips rows with missing or invalid timestamps and records why, refreshes source rollups, and marks dependent materialized projections stale for re-verification; pg_catalog.pg_retention_policies and runtime metrics expose policy state, deletes, skips, and errors.",
              ],
              table: {
                headers: ["bucket_width", "Execution path"],
                rows: [
                  [
                    "minute, hour, or day",
                    "Bucket-native membership persisted; EXPLAIN reports the selected width and range-filter diagnostics",
                  ],
                  [
                    "any other non-empty value",
                    "Accepted and persisted as metadata only; the query always executes over the row-backed range path",
                  ],
                ],
              },
              code: "CREATE INDEX idx_events_created_at\nON events USING time_series (created_at)\nWITH (bucket_width = '1 hour', partition_by = tenant_id);\n\nCREATE RETENTION POLICY events_retention\nON events USING event_at\nRETAIN FOR '7 days';\n\nENFORCE RETENTION POLICY events_retention AT '2026-01-10T00:00:00Z';",
            },
            {
              id: "graph-shaped-queries",
              title: "Graph-shaped queries",
              paragraphs: [
                "CREATE GRAPH declares normal node and edge backing tables plus persisted graph metadata. Node identity is the pair (node_type, node_id), every edge row carries typed source/target ids, an edge_type, and a non-negative weight, and writing an edge maintains outbound and inbound adjacency sidecars keyed by those typed ids so traversal doesn't have to scan the edge table.",
                "Traversal is three SQL table functions — graph_neighbors, graph_expand, and graph_shortest_path — called and projected like any other table source, including inside CROSS JOIN LATERAL. There is no separate graph query language such as Cypher or Gremlin, no graph mutation language, and no traversal across nodes.",
                "Adjacency sidecars are accelerators, not a second source of truth: edge row blobs remain authoritative, EXPLAIN reports access_path=graph_adjacency for a query that used the sidecar, and /metrics counts graph traversal calls. Dropping a graph's node or edge backing collection removes its sidecars, including replay after an interrupted schema commit.",
              ],
              table: {
                headers: ["Function", "Arguments", "Typical projected columns"],
                rows: [
                  [
                    "graph_neighbors",
                    "graph, node_type, node_id, direction, edge_type, limit",
                    "node_id, edge_type, cost",
                  ],
                  [
                    "graph_expand",
                    "graph, node_type, node_id, max_depth, direction, edge_type, max_results",
                    "node_id, depth",
                  ],
                  [
                    "graph_shortest_path",
                    "graph, from_type, from_id, to_type, to_id, max_depth, direction, edge_type, max_paths",
                    "node_id, cost, depth",
                  ],
                ],
              },
              code: "CREATE GRAPH social (NODES (label TEXT), EDGES (source TEXT));\n\nSELECT node_id, edge_type, cost\nFROM graph_neighbors('social', 'person', 'alice', 'out', 'knows', 10)\nORDER BY node_id;",
            },
          ],
        },
      ],
    },
    {
      id: "operations",
      label: "Operations",
      pages: [
        {
          path: "administration",
          title: "Administrative REST and UI",
          description:
            "Use the administrative API and UI for database, query, session, and operator workflows.",
          contract:
            "Administration covers Cassie's secondary, session-authenticated REST API and the browser admin UI it serves from the same process: health and metrics probes, cookie-session login/logout, collection/document/index/search resources, SQL catalog and database listing, admin query execute/validate/explain with operation_id cancellation, and projection verification-manifest/consistency-report repair endpoints — all formally defined in public/openapi.yml.",
          practice:
            "An operator or the admin UI logs in once against POST /api/v1/auth/login to obtain the cassie_session cookie, then uses it to browse the catalog, run or explain SQL through the admin query endpoints, cancel a long-running statement by its operation_id, or pull a projection verification manifest and consistency report when repairing a read model; pgwire remains the transport for ordinary application queries.",
          boundary:
            "The REST surface never creates a database or schema as a first-class resource, never accepts password-bearing Authorization headers, and provides no distributed execution or cross-node repair — SQL DDL goes through the query endpoints or pgwire, and every admin route still reads through Midge for the data it lists, executes against, or repairs.",
          keywords: ["REST", "admin", "OpenAPI", "UI"],
          content: [
            {
              id: "administrative-surface",
              title: "Administrative surface",
              paragraphs: [
                "Cassie's primary interface for application queries is the PostgreSQL wire protocol; the REST API defined in public/openapi.yml is a secondary, administrative surface for health checks, session-authenticated database and query administration, and the browser-based admin UI the same process serves. Every versioned resource route lives under /api/v1/*; a fixed set of unauthenticated GET routes exists outside that prefix for process and load-balancer health checks.",
                "All four public routes return the same Health shape (ready, and optionally status, collections, and version), but they differ in what they actually check:",
                "Everything else authenticates through a single opaque cassie_session cookie. POST /api/v1/auth/login is the one route exempt from the authentication check and returns a Set-Cookie header alongside a Session{user, role}; GET /api/v1/auth/session reads the current session back, and POST /api/v1/auth/logout revokes it and clears the cookie.",
                "The cookie is always HttpOnly and SameSite=Strict. It and the response's HSTS header gain the Secure attribute only when the connection is direct TLS or the deployment sets CASSIE_REST_EXTERNAL_HTTPS=1 — Forwarded and X-Forwarded-Proto are deliberately ignored for that decision, so a proxy terminating TLS must set the variable explicitly or the cookie ships without Secure.",
                "Login is throttled by process-local normalized-user and peer-IP limits and returns 429 with a Retry-After header once exhausted. Sessions are issued atomically against a 16-per-user default quota and a 1,024 global cap.",
                "Authorization is role-gated at the router. An authenticated session without the admin role is restricted to a fixed read-only allowlist — catalog and database listing, query execute/validate/explain, and query-operation cancellation — and every other /api/* route returns 403 for it.",
                "The same process also serves the admin UI. Any GET path outside /api/ and /assets/ falls through to the compiled index.html (directory CASSIE_ADMIN_UI_DIR, defaulting to ./ui/dist), and /assets/* files are served with path-canonicalization checks and an 8 MiB per-file cap.",
                "Response hardening is applied uniformly: nosniff, frame-deny, no-referrer, and a strict self-scoped Content-Security-Policy on every response; Cache-Control: no-store on API responses; and Strict-Transport-Security (max-age=31536000) on secure connections. State-changing /api/ requests additionally require a same-origin Origin/Host pair and are rejected outright when the request is explicitly cross-origin.",
              ],
              table: {
                headers: ["Route", "Backing check", "Notes"],
                rows: [
                  [
                    "GET /health",
                    "is_started() plus midge.list_collections().len() and the crate version",
                    "status flips between ok and starting",
                  ],
                  [
                    "GET /liveness",
                    'Fixed {"ready": true}',
                    "Does not consult node state",
                  ],
                  [
                    "GET /targetz",
                    'Fixed {"ready": true}',
                    "ECS Fargate target-group probe",
                  ],
                  [
                    "GET /metrics",
                    "Full runtime snapshot: query, pgwire, rest, storage, cache, capacity counters",
                    "Large, additive JSON object",
                  ],
                ],
              },
              code: 'curl -sS -c cookies.txt -X POST https://cassie.local/api/v1/auth/login \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"username":"operator","password":"..."}\'\n\ncurl -sS -b cookies.txt https://cassie.local/api/v1/auth/session\ncurl -sS -b cookies.txt -X POST https://cassie.local/api/v1/auth/logout',
              callout: {
                title: "Non-loopback listeners default to TLS",
                body: "A non-loopback REST listener terminates TLS in Cassie by default. CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1 exists only for a trusted private hop behind a TLS-terminating reverse proxy or load balancer — that plaintext hop must never reach an untrusted network, and setting CASSIE_REST_EXTERNAL_HTTPS=1 does not relax the listener rule.",
              },
            },
            {
              id: "database-operations",
              title: "Database operations",
              paragraphs: [
                "REST has no first-class /api/v1/databases or /api/v1/schemas collection to create or drop against; the single database-scoped read route is GET /api/v1/admin/databases, which lists the databases visible to the authenticated user by name and description, sorted case-insensitively, by calling straight into midge.list_databases(). Creating a database, a schema, or any other DDL object is an authenticated SQL statement, issued through the admin query endpoints covered under Query workspace or directly over pgwire, not a REST resource verb.",
                "What REST does own as resources are collections, their documents, their vector indexes, and search over them. A {collection} path segment accepts a local name, a schema-qualified name, or a canonical database.schema.name identifier such as postgres.public.visible_docs:",
                "GET /api/v1/admin/catalog?database=... groups every SQL-accessible object in that database into tables, views, indexes, udfs, and procedures sections for the admin UI's object browser; each object and each of its columns carries a canonical database.schema.name label plus a data_type and a primary_key flag. A deprecated GET /api/v1/admin/query/schema alias returns the identical QuerySchemaResponse shape for callers that have not moved to /admin/catalog.",
                "Projection repair is also modeled as REST resources rather than SQL: POST /api/v1/admin/projections/{projection}/verification-manifests builds a ProjectionManifest for one projection — per-range and, optionally, per-row digests, plus the hash algorithm and encoder versions used to compute them — and POST /api/v1/admin/projection-consistency-reports compares a set of those manifests into a ProjectionCheckReport whose state lands in consistent, divergent, stale, unverifiable, or incompatible, alongside mismatch, divergent-range, and divergent-row counts. GET on that same consistency-reports path returns the latest stored reports; a POST-only projection-consistency-checks alias and a singular verification-manifest alias remain for callers on the earlier route names.",
              ],
              table: {
                headers: ["Route", "Method", "Behavior"],
                rows: [
                  [
                    "/api/v1/collections",
                    "GET",
                    "List known collection names as stored relation identifiers",
                  ],
                  [
                    "/api/v1/collections",
                    "POST",
                    "Create a collection — always in the default database and public schema",
                  ],
                  [
                    "/api/v1/collections/{collection}/documents",
                    "POST",
                    "Insert one JSON document, returning its server-generated id",
                  ],
                  [
                    "/api/v1/collections/{collection}/documents/{id}",
                    "GET / DELETE",
                    "Fetch or remove one document by id",
                  ],
                  [
                    "/api/v1/collections/{collection}/indexes",
                    "POST",
                    "Create a field index (kind defaults to vector); returns provider/model/dimensions/metric/status",
                  ],
                  [
                    "/api/v1/collections/{collection}/search",
                    "POST",
                    "Run a similarity search on one field and return a QueryResult",
                  ],
                ],
              },
              code: 'curl -sS -b cookies.txt -X POST https://cassie.local/api/v1/collections/support_docs/documents \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"title":"Runbook","body":"Restart procedure"}\'\n\ncurl -sS -b cookies.txt https://cassie.local/api/v1/collections/support_docs/documents/<id>',
              callout: {
                title: "No REST verb creates a database or schema",
                body: "The router calls into midge.list_databases() to read the database list, but nothing under /api/v1/collections, /api/v1/admin/catalog, or /api/v1/admin/databases creates, renames, or drops a database or schema — that DDL work goes through the query endpoints or pgwire instead.",
              },
            },
            {
              id: "query-workspace",
              title: "Query workspace",
              paragraphs: [
                "The admin query endpoints exist for the case the OpenAPI description states directly: authenticated database, schema, table, view, function, and procedure work 'when pgwire is not the transport in use' — for example, the SQL editor in the served admin UI. They are not an alternative application query path; pgwire remains the primary interface.",
                "There are three, and they differ in how far they take a statement. query-executions runs it and returns a QueryResult of columns, rows, and the resolved command. query-validations checks its shape only — valid, command, and inferred columns — without running it, which is what lets an editor report errors as you type.",
                "query-explanations returns PostgreSQL-style EXPLAIN rows plus a structured QueryExplainPlan built for a visual plan explorer: root operator, access path, per-node metrics and badges, cost and row estimates, adaptive-plan diagnostics, and — when analyzed — per-operator actual_rows and actual_ms.",
                "All three take the same {database, sql, operation_id?} body, and all three keep a deprecated singular alias (/query/execute, /query/validate, /query/explain) routed to the same handler as its plural canonical counterpart. Prefer the plural form in new code.",
                "Every call resolves database from the request body (or the database query parameter for catalog lookups), confirms the database exists, and checks the session's role against it — a missing database returns 404 and a role without access to it returns 403, both before the statement runs. A session without the admin role can still reach execute, validate, explain, catalog, database listing, and cancellation, since the router treats those specifically as its read-only SQL allowlist.",
                "Including an operation_id (a UUID) in the request body registers that id against an owner fingerprint — a SHA-256 hash of the session's cookie token, or 'anonymous' without one — before the statement runs. DELETE /api/v1/admin/query-operations/{operation_id} looks up that same id-and-owner pair, signals the query's cancellation handle, and waits up to the 30-second request deadline for the running statement to acknowledge cleanup before returning {operation_id, cancelled: true}. A 1,024-entry ring buffer of completed operation ids is what lets a second cancel attempt come back 409 (already completed) instead of 404 (never existed).",
              ],
              table: {
                headers: ["Status", "Meaning"],
                rows: [
                  [
                    "400",
                    "Malformed body, invalid parameters, or a SQL parser resource limit",
                  ],
                  ["401", "Missing or invalid session cookie"],
                  [
                    "403",
                    "Authenticated but not authorized for the target database or route",
                  ],
                  ["404", "Route, database, or operation_id not found"],
                  [
                    "405",
                    "Route exists; method doesn't (Allow header lists what does)",
                  ],
                  [
                    "408",
                    "Body or route execution passed 30 seconds, or cancellation cleanup wasn't acknowledged in time",
                  ],
                  [
                    "409",
                    "operation_id already registered, or already completed",
                  ],
                  ["413", "Request body over 8 MiB"],
                  [
                    "415",
                    "State-changing request body without Content-Type: application/json",
                  ],
                  [
                    "499",
                    "Client closed the request while the statement was running",
                  ],
                  ["501", "SQL feature not supported"],
                  ["503", "Backend or dependency unavailable"],
                  ["504", "Query execution passed its configured deadline"],
                ],
              },
              code: 'curl -sS -b cookies.txt -X POST https://cassie.local/api/v1/admin/query-executions \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"database":"postgres","sql":"SELECT * FROM public.orders LIMIT 50","operation_id":"5b1e3b8a-8b7a-4a8e-9b8e-2f1a6d9b6b0e"}\'\n\ncurl -sS -b cookies.txt -X DELETE \\\n  https://cassie.local/api/v1/admin/query-operations/5b1e3b8a-8b7a-4a8e-9b8e-2f1a6d9b6b0e',
              callout: {
                title: "Cancellation is owner-scoped, not role-scoped",
                body: "DELETE /api/v1/admin/query-operations/{operation_id} only succeeds for the session whose cookie fingerprint registered that operation_id — a different admin session, or a request with no cookie at all, gets 404 rather than being allowed to cancel someone else's statement.",
              },
            },
            {
              id: "openapi-contract",
              title: "OpenAPI contract",
              paragraphs: [
                "public/openapi.yml is the OpenAPI 3.1.0 document (info.title Cassie REST API, version 0.1.0) that formally owns every route above. Its info.description block restates the transport policy in the same terms this page uses — 8 MiB bodies, 32 KiB headers, a 10-second header-read timeout, a 30-second body/execution timeout, the cookie and TLS rules, the same-origin CORS posture, and the 16-per-user/1,024-global session quotas — so a client reading the spec and an operator reading this page start from identical numbers.",
                "Six tags (Health, Auth, Collections, Catalog, Query, Consistency) group the paths exactly the way this page does, every documented failure across all of them resolves to one Error{error: string} schema, and a cassieAuth apiKey/cookie securityScheme formalizes the cassie_session contract for any OpenAPI-aware client generator. Deprecated aliases carry deprecated: true directly on the operation, next to the canonical operationId each one supersedes, so a spec diff or a generated client surfaces exactly which route names are kept only for compatibility.",
                "The spec is a build input, not just reference material: the admin UI's own package.json runs gen:adapters — the askr generator pointed at ../public/openapi.yml, output to src/adapters/generated — to produce its typed client, and gen:adapters:check re-runs the same generator with --check so the build fails if the checked-in generated client has drifted from the spec.",
              ],
              table: {
                headers: ["Tag", "Routes it covers"],
                rows: [
                  ["Health", "/health, /liveness, /targetz, /metrics"],
                  ["Auth", "login, session, and logout cookie lifecycle"],
                  [
                    "Collections",
                    "collection, document, index, and search resources",
                  ],
                  ["Catalog", "admin catalog and database listing"],
                  [
                    "Query",
                    "query-executions, query-validations, query-explanations, and operation cancellation",
                  ],
                  [
                    "Consistency",
                    "projection verification manifests and consistency reports",
                  ],
                ],
              },
              code: "# from cassie/ui\nnpm run gen:adapters        # regenerate the typed client from ../public/openapi.yml\nnpm run gen:adapters:check  # fail if the generated client has drifted from the spec",
            },
          ],
        },
        {
          path: "deployment",
          title: "Deployment",
          description:
            "Run Cassie with explicit network, storage, process, health, and placement ownership.",
          contract:
            "Cassie's deployment surface is one tokio-based process that owns two network listeners, one Midge-backed storage directory, and a small set of REST health and metrics routes — three of those routes are open by design, one requires an authenticated admin session, and there is no separate control plane or worker fleet to deploy alongside any of it.",
          practice:
            "An operator sets CASSIE_PGWIRE_LISTEN, CASSIE_REST_LISTEN, and CASSIE_MIDGE_DATA_DIR, adds a non-default CASSIE_ADMIN_PASSWORD plus a TLS certificate/key pair (or the explicit insecure-listener override) for any non-loopback bind, starts the binary under a process supervisor, and wires that supervisor's startup or readiness check to /health rather than /liveness or /targetz.",
          boundary:
            "Cassie does not supervise or restart its own process, does not shard or replicate its storage directory across hosts, and does not make /liveness or /targetz reflect internal startup state — restart policy, disk placement, backup cadence, and orchestrator readiness wiring stay operator-owned.",
          keywords: ["deploy", "health", "readiness"],
          content: [
            {
              id: "process-model",
              title: "Process model",
              paragraphs: [
                "Cassie runs as one asynchronous binary built on tokio's multi-threaded runtime (`#[tokio::main]`). On start, `main` loads `CassieRuntimeConfig::from_env()`, constructs the `Cassie` instance — which opens its Midge storage directory — and calls `cassie.startup()`. That call bootstraps storage families, loads the schema and data epochs, replays any pending schema operations and index publications, retries outstanding maintenance debt, reconciles the column-batch, full-text, time-series, graph, and IVFFlat indexes, and hydrates the catalog and runtime feedback state before the process marks itself started.",
                "Once startup finishes, `main` spawns two tokio tasks inside that same process and PID: the pgwire server (`cassie::pgwire::server::run_with_shutdown`) and the REST router (`cassie::rest::router::run_with_shutdown_and_admin_ui_dir`), both driven from the shared `Cassie` state and a shared `Arc<Notify>` shutdown signal. Both protocols run concurrently in one process; Cassie does not fork additional workers, run either listener out of that process, or supervise child processes of its own.",
                "Shutdown is cooperative rather than forced. A `tokio::select!` waits on whichever finishes first among the pgwire task, the REST task, and a `shutdown_signal()` future that resolves on Ctrl-C on every target and additionally on SIGTERM on Unix. Whichever branch fires calls `shutdown.notify_waiters()` and joins the remaining server task before `cassie.shutdown()` runs, flipping the started flag and recording a shutdown timestamp in the runtime metrics snapshot. Cassie has no built-in supervisor or restart policy of its own — a systemd unit, a container runtime's restart policy, or an orchestrator's pod controller is the operator-owned mechanism that brings the binary back up after it exits.",
              ],
            },
            {
              id: "network-listeners",
              title: "Network listeners",
              paragraphs: [
                "Cassie opens two independent listeners from that one process: `CASSIE_PGWIRE_LISTEN` for the PostgreSQL wire protocol and `CASSIE_REST_LISTEN` for the administrative REST API and UI. Both default to loopback-only addresses — `127.0.0.1:5432` and `127.0.0.1:8080` — so a freshly started Cassie process is unreachable from outside its own host until an operator changes either address.",
                "Binding either listener to a non-loopback address is deliberately friction-full. Startup validation rejects the default bootstrap password (`postgres`) on any non-loopback socket, and separately rejects a non-loopback bind that has neither a configured TLS certificate/key pair for that listener nor `CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1` set. Reaching a non-loopback listener therefore requires several explicit decisions at once: a non-default `CASSIE_ADMIN_PASSWORD` (or `CASSIE_ADMIN_PASSWORD_FILE`), plus either a TLS certificate/key pair for that listener or the insecure-listener override. TLS files are also all-or-nothing per listener — supplying only a certificate or only a key fails startup before either listener opens.",
                "`CASSIE_REST_EXTERNAL_HTTPS=1` declares, rather than configures, that a trusted reverse proxy terminates HTTPS in front of Cassie: it makes Cassie emit an HSTS header and mark login/logout cookies `Secure`. It does not by itself open a non-loopback listener, and Cassie does not trust `Forwarded` or `X-Forwarded-Proto` headers from that proxy — the private proxy-to-Cassie hop still needs its own TLS pair or the explicit insecure-listener override.",
              ],
              table: {
                headers: ["Variable", "Default", "Effect"],
                rows: [
                  [
                    "CASSIE_PGWIRE_LISTEN",
                    "127.0.0.1:5432",
                    "Socket address for the pgwire listener",
                  ],
                  [
                    "CASSIE_REST_LISTEN",
                    "127.0.0.1:8080",
                    "Socket address for the REST/admin listener",
                  ],
                  [
                    "CASSIE_PGWIRE_TLS_CERT_FILE",
                    "unset",
                    "PEM certificate for the pgwire listener; must be set together with the key",
                  ],
                  [
                    "CASSIE_PGWIRE_TLS_KEY_FILE",
                    "unset",
                    "PEM private key for the pgwire listener; must be set together with the certificate",
                  ],
                  [
                    "CASSIE_REST_TLS_CERT_FILE",
                    "unset",
                    "PEM certificate for the REST listener; must be set together with the key",
                  ],
                  [
                    "CASSIE_REST_TLS_KEY_FILE",
                    "unset",
                    "PEM private key for the REST listener; must be set together with the certificate",
                  ],
                  [
                    "CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN",
                    "0",
                    "Explicit override permitting a non-loopback bind without TLS on that listener",
                  ],
                  [
                    "CASSIE_REST_EXTERNAL_HTTPS",
                    "0",
                    "Declares HTTPS terminates outside Cassie; enables HSTS and Secure cookies",
                  ],
                ],
              },
              code: "CASSIE_PGWIRE_LISTEN=0.0.0.0:5432\nCASSIE_REST_LISTEN=0.0.0.0:8080\nCASSIE_ADMIN_PASSWORD=<non-default bootstrap secret>\nCASSIE_PGWIRE_TLS_CERT_FILE=/etc/cassie/tls/cert.pem\nCASSIE_PGWIRE_TLS_KEY_FILE=/etc/cassie/tls/key.pem\nCASSIE_REST_TLS_CERT_FILE=/etc/cassie/tls/cert.pem\nCASSIE_REST_TLS_KEY_FILE=/etc/cassie/tls/key.pem",
              callout: {
                title:
                  "The insecure-listener override is for a private hop, not a public one",
                body: "`CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1` is meant for an already-isolated network hop — the shipped `compose.yml` uses it to let the container bind `0.0.0.0` internally while publishing the ports back to host loopback only, with REST TLS expected to terminate at a trusted proxy in front of it. Publishing that plaintext hop directly to an untrusted network defeats the purpose of the override.",
              },
            },
            {
              id: "storage-placement",
              title: "Storage placement",
              paragraphs: [
                "Cassie keeps all persistent state in one directory, set by `CASSIE_MIDGE_DATA_DIR` (default `./.cassie/midge`, relative to the process's working directory). `Cassie::new()` reads that variable and opens it through Midge — `Midge::new_with_data_dir_and_default_database` builds a local `cntryl_midge::OpenOptions` engine rooted at that path — so the directory is the single storage-placement decision the process makes for itself.",
                "Everything `cassie.startup()` does — confirming storage families are ready, loading the schema and data epochs, replaying pending schema operations and index publications, retrying maintenance debt, and reconciling the column-batch, full-text, time-series, graph, and IVFFlat indexes — runs against that same directory before Cassie accepts pgwire or REST traffic. There is no second storage location and no cross-directory replication inside Cassie: placement is one path on one host, by design, not as an interim gap in the implementation.",
                'The shipped container image fixes the convention: the Dockerfile sets `CASSIE_MIDGE_DATA_DIR=/data/midge`, creates `/data` owned by a non-root UID (`65532`), and declares `VOLUME ["/data"]`; `compose.yml` mounts a named volume at `/data` so the directory survives container recreation. Disk type, mount options, filesystem choice, and backup cadence for that directory remain operator decisions — Cassie does not select or manage the underlying block device.',
              ],
              table: {
                headers: ["Variable", "Default", "Effect"],
                rows: [
                  [
                    "CASSIE_MIDGE_DATA_DIR",
                    "./.cassie/midge",
                    "Directory Midge opens for all schema and data storage",
                  ],
                  [
                    "CASSIE_MIDGE_ALLOW_FALLBACK",
                    "unset (off)",
                    "Permits an in-memory engine when the data directory can't be opened; state does not survive a restart",
                  ],
                ],
              },
              callout: {
                title:
                  "Fallback storage is diagnostic, not deployment evidence",
                body: "If Midge cannot open `CASSIE_MIDGE_DATA_DIR`, setting `CASSIE_MIDGE_ALLOW_FALLBACK=1` lets it open an in-memory engine instead of failing closed, and whatever state accumulates does not survive a restart. Treat any such fallback-storage run as diagnostic only, not as evidence of a disk-backed deployment.",
              },
            },
            {
              id: "health-and-readiness",
              title: "Health and readiness",
              paragraphs: [
                "The REST router answers four GET routes for health: `/health`, `/liveness`, `/targetz`, and `/metrics`. The router's public-route check admits any GET route except one under `/api` or named `metrics`, so `/health`, `/liveness`, and `/targetz` need no authentication while `/metrics` does. Because `/metrics` also sits outside the router's read-only allowlist, an authenticated session that reaches it must hold the admin role, not just any valid login — a scraping pipeline needs a real admin credential wired in, not just network reachability.",
                "`/health` calls `Cassie::health()`, which reports `status` (`ok` once `is_started()` is true, otherwise `starting`), the same `ready` boolean, the number of collections Midge currently lists, and the running `CARGO_PKG_VERSION`.",
                '`/liveness` and `/targetz` are currently static stubs: both handlers ignore the `Cassie` instance entirely and return `{"ready": true}` unconditionally. They confirm that the REST listener accepted and answered an HTTP request, and nothing more — not that Midge opened its storage families, that schema and data epochs loaded, or that index reconciliation inside `startup()` finished.',
                "`/health` is the only one of the three that reflects real internal state: its `ready` value turns `true` only after `startup()` completes, and Cassie clears the started flag again once `shutdown()` runs. Point readiness gating at `/health`, not at the stubs.",
                "`/metrics` returns a much larger snapshot than a single boolean — uptime, running query count, and per-subsystem counters covering query execution, REST, pgwire, search, vector and hybrid scoring, storage, plan cache, query cache, execution-result cache, joins, column batches, time series, rollups, projections, retention, and Midge's capacity report — intended for scraping into a metrics pipeline rather than a single up/down check.",
              ],
              table: {
                headers: ["Route", "Handler", "Authentication", "Reflects"],
                rows: [
                  [
                    "GET /health",
                    "Cassie::health()",
                    "None",
                    "is_started(), Midge collection count, CARGO_PKG_VERSION",
                  ],
                  [
                    "GET /liveness",
                    "static stub",
                    "None",
                    "HTTP listener reachable only; ignores Cassie state",
                  ],
                  [
                    "GET /targetz",
                    "static stub",
                    "None",
                    "HTTP listener reachable only; ignores Cassie state",
                  ],
                  [
                    "GET /metrics",
                    "Cassie::metrics()",
                    "Admin-role session required",
                    "uptime, running queries, per-subsystem runtime snapshot, Midge capacity report",
                  ],
                ],
              },
              code: "curl http://127.0.0.1:8080/health\ncurl http://127.0.0.1:8080/liveness",
              callout: {
                title: "Point startup and readiness checks at /health",
                body: 'Because /liveness and /targetz return {"ready": true} as soon as the REST listener accepts a request, wiring an orchestrator\'s startup or readiness check to either of them reports ready before Midge has finished opening storage, loading epochs, or reconciling indexes. Use /health where the check needs to reflect that internal sequence actually completing.',
              },
            },
          ],
        },
        {
          path: "security",
          title: "Security",
          description:
            "Configure authentication, authorization, session protection, and network exposure.",
          contract:
            "Security on Cassie covers the boundary between an external caller — a SQL client on the pgwire port or a browser against the REST admin API — and the read models Cassie serves: Argon2-hashed passwords with a single bootstrap administrator, a binary admin-versus-per-database-CONNECT role model, opaque cookie sessions for the REST API, and independently configurable TLS on both listeners.",
          practice:
            "An operator sets a non-default bootstrap admin password and, for any non-loopback listener, a TLS certificate/key pair before startup; the admin then authenticates over pgwire or REST, runs CREATE ROLE and GRANT CONNECT statements to provision read-only application roles scoped to specific databases, and either lets Cassie terminate TLS directly on both listeners or fronts them with a trusted proxy and declares CASSIE_REST_EXTERNAL_HTTPS=1 for correct cookie/HSTS behavior.",
          boundary:
            'Application-level authorization finer than "admin" or "read-only role scoped to database X" — table, column, or statement-level grants, mutual TLS / client certificates, or a way to mint a second administrator — stays the calling application\'s responsibility; Cassie does not provide it.',
          keywords: ["auth", "roles", "TLS"],
          content: [
            {
              id: "authentication",
              title: "Authentication",
              paragraphs: [
                "pgwire and the REST admin API authenticate through the same core check (authenticate_network_principal): normalize the supplied username, look up a matching role, and verify its password. pgwire uses the PostgreSQL wire protocol's cleartext password exchange — the client answers an AuthenticationCleartextPassword request with the password in a single 'p' message, unscrambled by the protocol itself — so confidentiality in flight depends entirely on the transport, not the auth mechanism. REST's POST /api/v1/auth/login carries the same password once in a JSON body.",
                "Every role's password is stored as an Argon2 hash (Argon2 default parameters, a random salt from OsRng) rather than in cleartext, whether the role is the bootstrap administrator or one created with CREATE ROLE. A single bootstrap administrator identity is configured through CASSIE_ADMIN_USER (default postgres) and CASSIE_ADMIN_PASSWORD or CASSIE_ADMIN_PASSWORD_FILE (the file wins when both are set); the well-known default password is rejected outright at startup for any listener bound to a non-loopback address, so leaving it in place does not silently expose a public listener.",
                "To keep a failed login from doubling as a way to test whether a username exists, Cassie always performs exactly one Argon2 verification per attempt. An unknown username, a role without LOGIN, or a bootstrap username that doesn't match CASSIE_ADMIN_USER is checked against a fixed dummy hash generated once at startup by hashing a random UUID — so a wrong password against a real account and any attempt against a nonexistent one take the same code path and the same verification cost.",
                "Login attempts on both protocols are rate-limited by independent in-memory token buckets keyed on the normalized username and on the peer IP address; a successful login refunds the token it consumed so routine reconnects don't erode the budget, and identities beyond a bounded tracked count share overflow buckets instead of growing memory without limit. Exceeding either budget returns an authentication-rate-limited error before the password is even checked.",
              ],
              table: {
                headers: ["Setting", "Default", "Behavior"],
                rows: [
                  [
                    "CASSIE_ADMIN_USER",
                    "postgres",
                    "Bootstrap administrator role name, normalized to lowercase.",
                  ],
                  [
                    "CASSIE_ADMIN_PASSWORD / _FILE",
                    "postgres",
                    "Bootstrap administrator password; the file form is read in preference to the environment value and rejected if empty after trimming.",
                  ],
                  [
                    "CASSIE_AUTH_USER_ATTEMPTS_PER_MINUTE",
                    "10",
                    "Token-bucket capacity per normalized username for network login attempts.",
                  ],
                  [
                    "CASSIE_AUTH_IP_ATTEMPTS_PER_MINUTE",
                    "60",
                    "Token-bucket capacity per peer IP address for network login attempts.",
                  ],
                  [
                    "CASSIE_AUTH_RATE_LIMIT_MAX_ENTRIES",
                    "4096",
                    "Combined tracked user/IP identities; identities beyond this share a bounded overflow bucket.",
                  ],
                ],
              },
            },
            {
              id: "sql-roles",
              title: "SQL roles",
              paragraphs: [
                "Roles are managed with four statements: CREATE ROLE name LOGIN PASSWORD '...' (or NOLOGIN), ALTER ROLE for flipping the login flag or rotating a password, DROP ROLE, and GRANT CONNECT ON DATABASE db TO role / REVOKE CONNECT ON DATABASE db FROM role. A role receives an implicit CONNECT grant to whichever database was current at CREATE ROLE time; anything beyond that needs an explicit grant. CONNECT is the entire privilege unit — there is no table-, column-, or schema-scoped grant statement, and no wildcard grant that covers every database at once.",
                "Authorization is binary rather than tiered. The bootstrap administrator can read and write every database and run every DDL or role-management statement; every other login role, regardless of what it holds CONNECT grants for, is restricted to read-only statements — SELECT, SHOW, SET, transaction control, and EXPLAIN of a SELECT — against the databases it was explicitly granted. An INSERT, UPDATE, DELETE, or any CREATE/ALTER/DROP or role/grant statement from a non-admin role fails as an insufficient-privilege error before it reaches the executor.",
              ],
              callout: {
                title: "There is exactly one administrator identity",
                body: "No SQL statement can mint a second admin: CREATE ROLE and ALTER ROLE carry no admin flag, the bootstrap role cannot be dropped, and its LOGIN cannot be disabled. A workflow that needs more than one privileged operator has to share the bootstrap credential (or front it with an application-level proxy) rather than provisioning another admin role.",
              },
              table: {
                headers: [
                  "Capability",
                  "Bootstrap admin",
                  "Login role (non-admin)",
                ],
                rows: [
                  [
                    "Read (SELECT, SHOW, SET, EXPLAIN of SELECT, transaction control)",
                    "Every database",
                    "Only databases with an explicit CONNECT grant",
                  ],
                  [
                    "Write (INSERT/UPDATE/DELETE) and DDL (CREATE/ALTER/DROP ...)",
                    "Yes",
                    "No",
                  ],
                  ["CREATE ROLE / ALTER ROLE / DROP ROLE", "Yes", "No"],
                  ["GRANT CONNECT / REVOKE CONNECT", "Yes", "No"],
                  [
                    "Access a database without an explicit CONNECT grant",
                    "Yes (admin bypasses grants)",
                    "No",
                  ],
                ],
              },
              code: "CREATE ROLE reporting LOGIN PASSWORD 'reporting-secret';\nGRANT CONNECT ON DATABASE analytics TO reporting;\nREVOKE CONNECT ON DATABASE analytics FROM reporting;",
            },
            {
              id: "administrative-sessions",
              title: "Administrative sessions",
              paragraphs: [
                "The REST admin API turns a single password check into a reusable session instead of authenticating every request. POST /api/v1/auth/login accepts a JSON username/password, authenticates through the same role and bootstrap-admin path pgwire uses (so it shares the per-user/per-IP rate limiter), and on success mints a random 256-bit token. Cassie never persists that token itself — only its SHA-256 digest is written as the session record's storage key, through the same Midge storage layer Cassie always runs on, so reading the persisted session table back cannot recover a live cookie value.",
                "The token is set as the cassie_session cookie with HttpOnly and SameSite=Strict on every response, and Secure is added whenever the transport is judged secure — either Cassie terminated TLS directly on that connection, or the operator declared CASSIE_REST_EXTERNAL_HTTPS=1. Sessions run for a fixed lifetime that isn't configurable, and are capped both globally across every user and per individual user; a login past either cap fails outright rather than evicting an older session. POST /api/v1/auth/logout deletes the persisted record and clears the cookie.",
                "Every request re-derives a credential fingerprint from the role's name, login flag, admin flag, and current password hash (or the bootstrap password), and compares it against the value captured when the session was issued — it is not just checked once at login. Rotating a role's password, disabling its LOGIN, or dropping the role invalidates every outstanding session tied to it on the next request, with nothing to enumerate or revoke by hand. State-changing calls under /api/ with an Origin header present are also checked for a matching Host, independent of the session cookie.",
              ],
              table: {
                headers: ["Setting", "Value", "Scope"],
                rows: [
                  [
                    "Session lifetime",
                    "8 hours, fixed",
                    "Not configurable via environment",
                  ],
                  [
                    "Global concurrent sessions",
                    "1,024, fixed",
                    "Shared across every authenticated user",
                  ],
                  [
                    "CASSIE_REST_MAX_SESSIONS_PER_USER",
                    "16 (default)",
                    "Per normalized user; capped at the global limit",
                  ],
                ],
              },
              code: 'curl -c cookies.txt -H \'Content-Type: application/json\' \\\n  -d \'{"username":"postgres","password":"\'"$CASSIE_ADMIN_PASSWORD"\'"}\' \\\n  https://cassie.internal:8443/api/v1/auth/login\n\ncurl -b cookies.txt https://cassie.internal:8443/api/v1/auth/session\ncurl -b cookies.txt -X POST https://cassie.internal:8443/api/v1/auth/logout',
            },
            {
              id: "network-and-tls",
              title: "Network and TLS",
              paragraphs: [
                "pgwire and the REST admin API are separate listeners with independent, optional TLS identities: CASSIE_PGWIRE_TLS_CERT_FILE / CASSIE_PGWIRE_TLS_KEY_FILE for the SQL wire protocol, CASSIE_REST_TLS_CERT_FILE / CASSIE_REST_TLS_KEY_FILE for the admin API. Both load a PEM certificate chain and private key into a rustls server configuration built with no client authentication — Cassie proves its own identity to the connecting client but never asks for or checks a client certificate.",
                "Cassie fails closed on transport configuration. A certificate and key must be set together — one without the other is a startup error — and binding either listener to a non-loopback address with no TLS identity refuses to start unless CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1 is set. Loopback addresses are exempt, which is what lets a local listener run without certificates.",
                'One pgwire behavior surprises people: a client\'s SSLRequest is always answered "not supported". TLS is applied to the whole socket at accept time through a raw rustls acceptor, before the wire protocol begins, so encryption comes from dialing a TLS-terminating listener directly rather than from an in-band upgrade on a plaintext one. A client configured to negotiate SSL against a plaintext port will not get there.',
                "Two deployment shapes are both first-class. Cassie can terminate TLS itself on both listeners by mounting the four certificate and key files, or it can run behind a trusted reverse proxy or load balancer that terminates TLS and forwards plaintext to a loopback-bound process — that internal hop still needs CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1 and a non-default admin password to start at all. CASSIE_REST_EXTERNAL_HTTPS=1 tells Cassie which shape is in effect for the REST listener; it doesn't change what Cassie accepts on the wire, only whether it emits an HSTS header and marks the login/logout cookie Secure.",
              ],
              callout: {
                title: "Forwarded headers are not trusted",
                body: "Cassie does not read Forwarded or X-Forwarded-Proto to decide whether a request arrived over TLS. CASSIE_REST_EXTERNAL_HTTPS is a standalone operator declaration, not a header Cassie inspects per request — set it only when a proxy you control is actually terminating HTTPS in front of Cassie, because setting it in front of a plaintext hop makes the login cookie claim Secure without the connection actually being encrypted.",
              },
              table: {
                headers: ["Setting", "Default", "Contract"],
                rows: [
                  [
                    "CASSIE_PGWIRE_TLS_CERT_FILE / _KEY_FILE",
                    "unset",
                    "PEM certificate chain and private key for the pgwire listener; both or neither.",
                  ],
                  [
                    "CASSIE_REST_TLS_CERT_FILE / _KEY_FILE",
                    "unset",
                    "PEM certificate chain and private key for the REST listener; both or neither.",
                  ],
                  [
                    "CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN",
                    "0",
                    "Permits a non-loopback listener to run without a configured TLS identity.",
                  ],
                  [
                    "CASSIE_REST_EXTERNAL_HTTPS",
                    "0",
                    "Declares that a trusted proxy terminates HTTPS in front of Cassie; enables HSTS and Secure cookies without changing what Cassie accepts.",
                  ],
                ],
              },
              code: "# Cassie terminates TLS itself\nCASSIE_PGWIRE_TLS_CERT_FILE=/etc/cassie/tls/pgwire.pem\nCASSIE_PGWIRE_TLS_KEY_FILE=/etc/cassie/tls/pgwire.key\nCASSIE_REST_TLS_CERT_FILE=/etc/cassie/tls/rest.pem\nCASSIE_REST_TLS_KEY_FILE=/etc/cassie/tls/rest.key\n\n# A trusted proxy terminates TLS instead\nCASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1\nCASSIE_REST_EXTERNAL_HTTPS=1",
            },
          ],
        },
        {
          path: "capacity-management",
          title: "Capacity Management",
          description:
            "Plan resource limits, workload admission, concurrency, and bounded query behavior.",
          contract:
            "Capacity management is the set of runtime metrics, EXPLAIN diagnostics, catalog views, configurable resource ceilings, and admission counters that Cassie exposes for one single-node deployment. It tells an operator when a read model, index, or projection shape needs to change, and it reports the SQLSTATE or HTTP status a client sees when a configured limit is hit.",
          practice:
            "An operator sets CASSIE_MAX_QUERY_WORKERS, CASSIE_PGWIRE_MAX_CONNECTIONS, CASSIE_REST_MAX_CONNECTIONS, CASSIE_QUERY_MEMORY_BUDGET_BYTES, and CASSIE_MAX_RESULT_ROWS at process startup, then watches GET /metrics, EXPLAIN fallback_reason, and pg_catalog.pg_operational_assignments over time to decide whether to reshape a projection, add an index, or move a tenant to another independent node.",
          boundary:
            "Cassie does not queue rejected admission requests, does not move tenants or projections between nodes, does not throttle admission based on disk usage, and does not treat /metrics.capacity bytes as a physical disk, compaction, replication, or admission-control contract — all cross-node movement and capacity-threshold policy stay outside Cassie, owned by an operator or an external router.",
          keywords: ["capacity", "limits", "resources"],
          content: [
            {
              id: "capacity-model",
              title: "Capacity model",
              paragraphs: [
                "Capacity management in Cassie is an operator feedback loop for a single-node deployment, not a service-level agreement and not a capacity-based admission-control system. The signals it produces tell an operator when to reshape a projection, add or remove an index, move a tenant to another independent node, schedule rebuild work, or collect stronger benchmark evidence — Cassie surfaces the numbers, an operator or an external system decides and acts.",
                "Three sources feed the loop. GET /metrics (equivalently Cassie::metrics()) returns one JSON payload of runtime, query, storage-family, cache, fallback, projection, and capacity counters. EXPLAIN and EXPLAIN ANALYZE report the access path, storage mode, selected index, and fallback reason chosen for one statement. A set of pg_catalog views — pg_operational_assignments, pg_projection_operations, pg_table_storage, pg_projection_integrity_reports, pg_projection_repair_reports, and pg_maintenance_debt — expose local assignment, projection freshness, storage mode, and repair pressure to any connected SQL client.",
                "The capacity report inside GET /metrics groups the same logical bytes two ways: by the underlying Midge storage family and by a Cassie-level category describing what the bytes hold.",
              ],
              table: {
                headers: ["Grouping", "Buckets"],
                rows: [
                  ["Midge family", "schema, data, temp, default"],
                  [
                    "Cassie category",
                    "row_blobs, scalar_indexes, fulltext, vector_sidecars, column_batches, projection_metadata, temp_artifacts, other",
                  ],
                ],
              },
            },
            {
              id: "resource-limits",
              title: "Resource limits",
              paragraphs: [
                "Cassie enforces a fixed set of ceilings at the transport and execution layers. Each one has a default in CassieRuntimeConfig and is overridable through an environment variable that is read once when the process starts through CassieRuntimeConfig::from_env — there is no live-reload path, so changing a limit means restarting the process.",
                "The query worker cap, the two connection caps, the query memory budget, and the max result row count are the limits that bound a single query's cost. The execution result cache is sized separately and evicts rather than failing a query when it is full.",
              ],
              table: {
                headers: [
                  "Limit",
                  "Environment variable",
                  "Default",
                  "When exceeded",
                ],
                rows: [
                  [
                    "Query worker cap",
                    "CASSIE_MAX_QUERY_WORKERS",
                    "64",
                    'New query rejected immediately with SQLSTATE 53300 ("query admission exhausted"); no queueing',
                  ],
                  [
                    "Pgwire connection cap",
                    "CASSIE_PGWIRE_MAX_CONNECTIONS",
                    "256",
                    'New connection receives SQLSTATE 53300 ("too many connections") at FATAL severity, then the socket closes',
                  ],
                  [
                    "REST connection cap",
                    "CASSIE_REST_MAX_CONNECTIONS",
                    "512",
                    'New connection gets HTTP 503 with a Connection: close header and a "too many connections" JSON body',
                  ],
                  [
                    "REST sessions per user",
                    "CASSIE_REST_MAX_SESSIONS_PER_USER",
                    "16",
                    "Additional sessions for that authenticated user are refused",
                  ],
                  [
                    "Query timeout",
                    "CASSIE_QUERY_TIMEOUT_MS",
                    "30000 (30s)",
                    'Running query is stopped with SQLSTATE 57014 ("query timeout exceeded")',
                  ],
                  [
                    "Query memory budget",
                    "CASSIE_QUERY_MEMORY_BUDGET_BYTES",
                    "10485760 (10 MiB)",
                    'Query fails with SQLSTATE 54000, message "query memory budget exceeded: requested > budget"',
                  ],
                  [
                    "Max result rows",
                    "CASSIE_MAX_RESULT_ROWS",
                    "100000",
                    'Query fails with SQLSTATE 54000, message "query result row limit exceeded: rows > limit"',
                  ],
                  [
                    "Execution result cache size",
                    "CASSIE_EXECUTION_RESULT_CACHE_MAX_ENTRIES / CASSIE_EXECUTION_RESULT_CACHE_MAX_BYTES",
                    "64 entries / 67108864 bytes (64 MiB)",
                    "Oldest cached result is evicted (LRU); the query itself does not fail",
                  ],
                ],
              },
              code: "CASSIE_MAX_QUERY_WORKERS=32 \\\nCASSIE_QUERY_MEMORY_BUDGET_BYTES=20971520 \\\nCASSIE_MAX_RESULT_ROWS=50000 \\\nCASSIE_EXECUTION_RESULT_CACHE_MAX_BYTES=134217728 \\\ncassie",
            },
            {
              id: "admission-and-concurrency",
              title: "Admission and concurrency",
              paragraphs: [
                "Query-worker admission is a non-blocking permit check against an atomic counter. Each call to acquire a permit compares the current count of active query workers against CASSIE_MAX_QUERY_WORKERS; if the count is already at the cap, the call returns immediately with no permit and increments the runtime.query_admission_rejections counter — it does not wait in a queue for one to free up. A granted permit increments runtime.running_queries and runtime.query_admission_permits and is tied to a guard value; the guard's drop implementation releases the permit on any exit path, so a query that finishes, errors, or is cancelled still frees its slot for the next caller.",
                "Connection admission and query-worker admission are independent counted resources. A pgwire or REST connection can stay open while a query on that connection is rejected at the query-worker layer if other sessions have already saturated CASSIE_MAX_QUERY_WORKERS, and conversely a brand-new connection attempt can be refused by CASSIE_PGWIRE_MAX_CONNECTIONS or CASSIE_REST_MAX_CONNECTIONS before it ever reaches the query layer.",
              ],
              table: {
                headers: [
                  "Admission point",
                  "Counted resource",
                  "Runtime metrics",
                ],
                rows: [
                  [
                    "Query execution",
                    "Active query-worker permits (CASSIE_MAX_QUERY_WORKERS)",
                    "runtime.running_queries, runtime.query_admission_permits, runtime.query_admission_rejections",
                  ],
                  [
                    "Pgwire listener",
                    "Open pgwire connections (CASSIE_PGWIRE_MAX_CONNECTIONS)",
                    "Pgwire connection and session counters under GET /metrics",
                  ],
                  [
                    "REST listener",
                    "Open REST connections and per-user sessions (CASSIE_REST_MAX_CONNECTIONS, CASSIE_REST_MAX_SESSIONS_PER_USER)",
                    "REST connection and session counters under GET /metrics",
                  ],
                ],
              },
              callout: {
                title: "No admission queue",
                body: "Every admission point in Cassie rejects a caller the moment its counter is at the configured cap; none of them hold a caller in a wait queue for a slot to open. An application that wants graceful backoff under load has to catch the SQLSTATE 53300 or HTTP 503 response itself and retry — Cassie does not retry or reorder work on the caller's behalf.",
              },
            },
            {
              id: "fallback-behavior",
              title: "Fallback behavior",
              paragraphs: [
                '"Fallback" means two different things in Cassie, and only one of them is automatic.',
                "At the query-execution level, when an interactive read path lacks a matching index, rollup, or materialized projection shape, the planner falls back to a slower path — a row-blob scan, a degraded offset scan, an unfiltered candidate scan — instead of failing the query outright. You see that it happened through EXPLAIN's fallback_reason field and counters such as read_paths.degraded_offset_scans, alongside the rollup, time-series, vector, hybrid, and join fallback counters under GET /metrics.",
                "Treat a repeated fallback on a path that should be using an index or a projection as capacity debt. It means the read-model shape and the query shape have drifted apart, and the fix is to add the missing access path or refresh the stale projection rather than to accept the slower plan.",
                "At the deployment level, there is no automatic fallback at all. Cassie does not move a tenant or a projection to another node on its own, does not throttle or admit queries based on disk usage, and does not rebalance or repair data across nodes by itself. Every one of those actions is external orchestration: an operator or a router claims a target assignment with a higher generation in pg_catalog.pg_operational_assignments, marks the source assignment draining, waits for in-flight work to finish, and only then marks it released. The /metrics.capacity byte counts below are an input an operator reads before making that call, not a trigger that fires it.",
                "Those capacity bytes are logical key and value byte counts derived from Midge's own key encoding for the CASSIE_MIDGE_DATA_DIR backing one Cassie process. They are advisory and local to that one data directory.",
              ],
              code: '{\n  "capacity": {\n    "advisory": true,\n    "local_only": true,\n    "persisted_metadata": false,\n    "entries": 812345,\n    "key_bytes": 41928112,\n    "value_bytes": 903881440,\n    "total_bytes": 945809552,\n    "families": { "schema": { "total_bytes": 512040 }, "data": { "total_bytes": 940381200 }, "temp": { "total_bytes": 3212000 }, "default": { "total_bytes": 2056312 } },\n    "categories": { "row_blobs": { "total_bytes": 610044120 }, "scalar_indexes": { "total_bytes": 180221004 }, "fulltext": { "total_bytes": 12004400 }, "vector_sidecars": { "total_bytes": 40001200 }, "column_batches": { "total_bytes": 88004000 }, "projection_metadata": { "total_bytes": 9004000 }, "temp_artifacts": { "total_bytes": 3212000 }, "other": { "total_bytes": 3318828 } },\n    "errors": []\n  }\n}',
              callout: {
                title: "Advisory bytes, not a disk contract",
                body: "/metrics.capacity numbers are logical byte counts, not a measurement of bytes on disk. They exclude compaction overhead and on-disk compression, they say nothing about free space on the host under CASSIE_MIDGE_DATA_DIR, and they carry no relationship to replication, since Cassie has none. Pair this report with a direct disk-usage check on that path before treating it as a capacity signal, and never wire it directly into an automated movement or admission decision — Cassie has no such decision to wire it into.",
              },
            },
          ],
        },
        {
          path: "backup-and-restore",
          title: "Backup and Restore",
          description:
            "Stream database backups and restores while preserving database boundaries and operator verification.",
          contract:
            "Backup and restore covers two independent local recovery primitives: a whole-instance Midge data-directory snapshot validated by a versioned manifest, and a per-database logical image streamed directly over pgwire. Each is scoped to exactly what it copies, and each validates its own artifact on the way back in rather than trusting the bytes it receives.",
          practice:
            "An operator quiesces or accepts in-flight writes, then either creates a whole-instance snapshot with `Cassie::create_snapshot_from_data_dir` or issues `BACKUP DATABASE ... TO STDOUT` for one database, moves the resulting artifact wherever it needs to go, and restores it into an empty local data directory (`Cassie::restore_snapshot`) or into a not-yet-existing database name (`RESTORE DATABASE ... FROM STDIN`). Verification happens in two layers: Cassie's own manifest/epoch/checksum checks run automatically during restore, and the operator adds an explicit check afterward — querying restored data, running `VERIFY PROJECTION`, or verifying a detached signature when the artifact crossed an untrusted channel.",
          boundary:
            "Cassie does not schedule snapshots, quiesce write traffic, move artifacts off-node, encrypt or retain them, sign them for provenance, or choose failover/routing policy across independent instances — all of that stays with external tooling and the operator. Snapshots and database images are local recovery primitives, not a remote backup service, and passing every built-in check proves an artifact is internally consistent, never who produced it.",
          keywords: ["backup", "restore", "snapshot"],
          content: [
            {
              id: "backup-contract",
              title: "Backup contract",
              paragraphs: [
                "Cassie provides two independent local recovery primitives that should not be conflated: a whole-instance snapshot and restore of the entire Midge data directory, and a per-database logical image stream exposed directly over the pgwire protocol as `BACKUP DATABASE` and `RESTORE DATABASE`. Both are local, single-node recovery primitives — neither one schedules itself, ships bytes off-node, or coordinates with another instance; every step is driven by an operator or a calling application.",
                "The whole-instance path copies the complete Midge data directory — `cf0` (the global schema/catalog registry), `cf1` (Cassie's transient runtime state), and every opaque `db-*` family registered in the source catalog — alongside a `cassie-snapshot-manifest.json` manifest at format version 2. The per-database path emits a bounded sequence of length-delimited frames scoped to exactly one database's physical family; global roles, routines, server metadata, caches, and transient reports are excluded from that stream.",
              ],
              table: {
                headers: [
                  "Mechanism",
                  "Scope",
                  "Artifact format",
                  "Interface",
                  "Target requirement",
                ],
                rows: [
                  [
                    "Whole-instance snapshot",
                    "Entire Midge data directory: `cf0`, `cf1`, and every `db-*` family",
                    "`cassie-snapshot-manifest.json` (format v2) plus a recursive `midge/` directory copy",
                    "`Cassie::create_snapshot_from_data_dir` / `Cassie::restore_snapshot`",
                    "Restore target must be an empty local data directory",
                  ],
                  [
                    "Per-database logical image",
                    "One logical database's data family plus its database-scoped catalog entries",
                    "Length-delimited frames: header, catalog, data, checksummed footer (image version 1, `cassie-midge-layout-v1`)",
                    "`BACKUP DATABASE ... TO STDOUT` / `RESTORE DATABASE ... FROM STDIN` over pgwire (COPY semantics)",
                    "Target database must not already exist",
                  ],
                ],
              },
              callout: {
                title: "Checksums prove integrity, not origin",
                body: "The manifest and the database-image footer both carry checksums that catch corruption and truncation, not who produced the bytes. Cassie does not sign snapshots or database images; an artifact crossing an untrusted channel needs external signing and authenticated transport, which stays outside Cassie's contract.",
              },
            },
            {
              id: "stream-a-backup",
              title: "Stream a backup",
              paragraphs: [
                "A whole-instance snapshot starts with `Cassie::create_snapshot_from_data_dir`, which opens the source Midge directory, records its schema epoch, data epoch, and every collection's generation into the manifest, and only then copies the directory tree. After the copy finishes, Cassie reopens the source and rebuilds the same manifest fields; if the epochs or any collection generation drifted while the copy ran — a writer touched the source mid-copy — the partial snapshot directory is removed and the call returns an error instead of a manifest, so the caller retries against a quiesced source rather than trusting an inconsistent copy.",
                "A per-database backup runs over an ordinary pgwire connection using COPY semantics rather than a separate tool:",
                "The stream is framed as one header frame (image version, source database, source physical family, schema/data epoch, storage layout version), one catalog frame per database-scoped catalog entry, one data frame per raw entry in the source database's family, and a checksummed footer. Each chunk handed back to the client is capped at 64 KiB, so a large database streams without buffering the whole image in memory.",
              ],
              code: "BACKUP DATABASE analytics TO STDOUT;",
            },
            {
              id: "restore-a-database",
              title: "Restore a database",
              paragraphs: [
                "`Cassie::restore_snapshot` targets an empty local data directory only — a target that already contains files is rejected before any bytes are copied. Restore reads and validates the manifest first (format version, Cassie version, compatibility status, and Midge data path) and only copies the Midge directory once that check passes; it then reopens the copied directory, checks recovery state, and rebuilds the manifest fields to confirm the copy matches the source exactly.",
                "Restore over pgwire runs the same COPY-based interface, scoped to one database:",
                "The target database must not already exist. Restore stages an opaque Midge family and keeps it invisible — no catalog entry, no queryable rows — until every frame, catalog rewrite, entry count, and checksum has committed; an error at any point leaves the staged family abortable instead of partially exposed.",
                "Several rejections are shared by both database-copy commands, and a few apply only to one restore path or the other:",
              ],
              code: "RESTORE DATABASE restored FROM STDIN;",
              table: {
                headers: ["Rejected condition", "Applies to"],
                rows: [
                  [
                    "Explicit transaction, active or already failed",
                    "`BACKUP DATABASE` and `RESTORE DATABASE`",
                  ],
                  [
                    "Extended-query (prepared-statement) protocol path",
                    "`BACKUP DATABASE` and `RESTORE DATABASE`",
                  ],
                  [
                    "Session is authenticated read-only",
                    "`BACKUP DATABASE` and `RESTORE DATABASE`",
                  ],
                  ["Target database already exists", "`RESTORE DATABASE` only"],
                  [
                    "Non-v2 (including v1) snapshot manifest format",
                    "Whole-instance restore only",
                  ],
                  [
                    "Incompatible Cassie version or non-`compatible` status",
                    "Whole-instance restore only",
                  ],
                  [
                    "Unsupported Midge data path recorded in the manifest",
                    "Whole-instance restore only",
                  ],
                  [
                    "Invalid projection hash metadata (empty algorithm or zero digest length)",
                    "Whole-instance restore only",
                  ],
                  [
                    "Schema/data epoch or collection-generation mismatch found after copying",
                    "Whole-instance restore only",
                  ],
                  [
                    "Malformed recovery journal or maintenance-debt record",
                    "Whole-instance restore only",
                  ],
                  [
                    "Non-empty target data directory",
                    "Whole-instance restore only",
                  ],
                ],
              },
              callout: {
                title: "Format v2 only, no legacy reader",
                body: "Cassie rejects a v1 (or any non-v2) snapshot manifest outright before touching the target directory. There is no legacy reader and no migration path built in — a v1 snapshot cannot be restored by a current build; the only way back is regenerating the snapshot with a build that emits format v2.",
              },
            },
            {
              id: "verify-restored-state",
              title: "Verify restored state",
              paragraphs: [
                "Whole-instance restore verifies itself before handing control back: once the Midge directory copy completes, Cassie reopens the target, checks recovery state (pending schema cleanups, maintenance debt, pending index publications), and rebuilds the manifest — schema epoch, data epoch, and every collection's generation — comparing it field-for-field against the source manifest. Any mismatch removes the partial target directory and returns an error instead of leaving a half-verified instance on disk; the instance only starts, and only then hydrates catalog, projection, and query state through the normal startup path, once that comparison is exact.",
                "Per-database restore verifies the stream itself: the footer carries the catalog-entry count, the data-entry count, and a SHA-256 checksum computed over every catalog and data frame's key/value bytes, and `finish` refuses to commit unless the counts and checksum accumulated while consuming the stream match the footer exactly. That check proves the bytes arrived intact; it says nothing about who produced them.",
                "Confirming that a restored database or a restored instance's projections actually reflect the source is an operator or application step beyond that automatic check. For a per-database image, querying the restored database directly is the check. For a whole-instance restore, running `VERIFY PROJECTION <name> MODE full` against a restored projection re-derives its row and range hashes and reports divergence through the same audit table (`pg_catalog.pg_projection_repair_reports`) used for any other integrity check — Cassie does not run this automatically as part of restore, so it stays a step an operator adds to the recovery runbook.",
              ],
              callout: {
                title:
                  "Provenance verification stays separate from integrity verification",
                body: "Passing every automatic check only proves an artifact is internally consistent, not that it came from a trusted source. Receive the image and a detached signature over an authenticated channel, resolve the trusted identity from deployment policy rather than metadata bundled with the image, verify the signature against the exact image bytes, and only stream verified bytes into `RESTORE DATABASE ... FROM STDIN` — Cassie defines no signing envelope, key format, or trust store of its own.",
              },
            },
          ],
        },
        {
          path: "projection-repair",
          title: "Projection Repair",
          description:
            "Detect, rebuild, verify, and activate repaired read models from authoritative history.",
          contract:
            "Projection repair is Cassie's admin-triggered path from a VERIFY PROJECTION finding to a rebuilt, re-verified read-model state and, for materialized projections, an explicit version swap — all on the single local instance that owns the affected Midge data directory.",
          practice:
            "An operator runs VERIFY PROJECTION to get a persisted integrity report, dry-runs PLAN REPAIR PROJECTION and checks executable, runs REPAIR PROJECTION with the matching SCOPE, confirms the automatic post-repair verification and its audit row both read verified, then activates a rebuilt materialized version with ALTER MATERIALIZED PROJECTION ... ACTIVATE VERSION once it is ready to serve reads.",
          boundary:
            "Repair never runs on its own, never reaches another node, and never moves traffic or restores backups by itself — snapshot rollback, traffic routing, and incident logging all stay outside Cassie.",
          keywords: ["repair", "rebuild", "verify"],
          content: [
            {
              id: "detect-divergence",
              title: "Detect divergence",
              paragraphs: [
                "Run projection repair only on the Cassie instance that owns the local Midge data directory and projection metadata for the affected projection — Cassie never coordinates repair across instances. Detection itself is never automatic: an operator, or an application acting as one, explicitly runs VERIFY PROJECTION <name> [VERSION <version_id>] MODE hashes_only or MODE full, and Cassie persists the outcome as an integrity report readable afterward from pg_catalog.pg_projection_integrity_reports.",
                "The report's mismatch_count, missing_count, and stale_count mean different things. A stored row hash that no longer matches a freshly computed hash counts as a mismatch; a document with no stored hash record counts as missing; a stored hash whose state isn't current counts as stale. repairable is derived only from the missing and stale counts, so a report with mismatches but zero missing or stale rows still comes back repairable = false.",
              ],
              table: {
                headers: ["MODE value", "Components checked"],
                rows: [
                  ["metadata_only", "Projection metadata presence only"],
                  [
                    "hashes_only",
                    "Row hash digests against stored hash records",
                  ],
                  [
                    "indexes_only",
                    "Local index sidecars and vector index metadata against the current collection generation",
                  ],
                  ["full", "Metadata, hashes, and indexes together"],
                ],
              },
              code: "VERIFY PROJECTION order_totals MODE hashes_only;\n\nSELECT state, mismatch_count, missing_count, stale_count, repairable\nFROM pg_catalog.pg_projection_integrity_reports\nWHERE projection_name = 'order_totals';",
              callout: {
                title: "repairable tracks missing/stale, not mismatches",
                body: "PLAN REPAIR PROJECTION and REPAIR PROJECTION both key their executable check off the same integrity report's repairable flag. A mismatch-only finding — rows present with digests that disagree — cannot be planned or run as a row or range repair; only missing or stale hash records qualify.",
              },
            },
            {
              id: "build-a-rebuilt-version",
              title: "Build a rebuilt version",
              paragraphs: [
                "PLAN REPAIR PROJECTION <name> [VERSION <id>] SCOPE row and SCOPE range are dry runs: each returns the source integrity report's state and counts, the intended action, an executable boolean, and the exact VERIFY PROJECTION command required afterward, without rebuilding anything. Treat executable = false as a hard stop, not a suggestion — it means the latest integrity report doesn't clear that scope's precondition: repairable missing or stale findings for row/range, a MODE indexes_only report for index, or a MODE full report naming the exact target for projection-version and full-rebuild.",
                "REPAIR PROJECTION accepts five scopes. row and range rebuild local hash records; index rebuilds verified local index sidecars; projection-version rebuilds one explicitly named materialized version's output without activating it; full-rebuild refreshes the active version of a materialized projection. The last two apply only to kind = materialized projections — a plain collection projection has no SQL-driven full-content rebuild here; restoring one from scratch is an application-driven replay from the durable source event stream instead.",
                "The repository's local recovery fixture puts a 1,024-row, four-range row-hash manifest through repair, export, and restart — the scale this SQL surface is checked against.",
              ],
              table: {
                headers: ["SCOPE", "Rebuilds", "Write gate held"],
                rows: [
                  [
                    "row / range",
                    "Local row or range hash records",
                    "The affected collection",
                  ],
                  [
                    "index",
                    "Verified local index sidecars",
                    "The affected collection",
                  ],
                  [
                    "projection-version (VERSION required)",
                    "The named materialized version's output, left inactive",
                    "All source collections and the target output collection",
                  ],
                  [
                    "full-rebuild",
                    "The active version of a materialized projection",
                    "All source collections and the target output collection",
                  ],
                ],
              },
              code: "PLAN REPAIR PROJECTION order_totals SCOPE row;\n-- inspect executable before running anything\n\nREPAIR PROJECTION order_totals SCOPE row;\nREPAIR PROJECTION order_totals VERSION v2 SCOPE projection-version;\nREPAIR PROJECTION order_totals SCOPE full-rebuild;",
            },
            {
              id: "verify-results",
              title: "Verify results",
              paragraphs: [
                "Every successful REPAIR PROJECTION immediately re-runs VERIFY PROJECTION <name> MODE full (with VERSION for a projection-version repair) before it returns. If that automatic re-verification doesn't come back verified, the whole REPAIR PROJECTION statement fails with an error — even though the rebuild action already ran — and no audit row gets written for that attempt.",
                "A completed repair's audit row lands in pg_catalog.pg_projection_repair_reports with state = completed and post_verification_state set from that automatic re-run. Query it after any repair, then re-run VERIFY PROJECTION ... MODE full yourself, and proceed only once both the latest repair report and the latest integrity report agree on verified.",
              ],
              table: {
                headers: ["Column", "Meaning"],
                rows: [
                  [
                    "state",
                    "completed once the repair ran and its automatic re-verification passed",
                  ],
                  ["scope", "The SCOPE the repair executed with"],
                  [
                    "action",
                    "The specific rebuild action Cassie performed for that scope",
                  ],
                  [
                    "post_verification_state",
                    "The state from the automatic VERIFY PROJECTION MODE full re-run",
                  ],
                  [
                    "verification_required",
                    "The VERIFY PROJECTION command PLAN REPAIR PROJECTION recommended running afterward",
                  ],
                ],
              },
              code: "SELECT state, scope, action, post_verification_state\nFROM pg_catalog.pg_projection_repair_reports\nWHERE projection_name = 'order_totals';\n\nVERIFY PROJECTION order_totals MODE full;",
              callout: {
                title: "No audit row means no completed repair",
                body: "When the automatic post-repair verification fails, REPAIR PROJECTION returns an error and skips the audit row entirely — a missing report for an attempted repair is itself diagnostic. If verification still fails, stop serving the affected projection path, or route around it, according to deployment policy; Cassie does not redirect query traffic on its own.",
              },
            },
            {
              id: "activate-or-roll-back",
              title: "Activate or roll back",
              paragraphs: [
                "Rebuilding a materialized projection version, with SCOPE projection-version or full-rebuild, never changes which version answers reads. Serving a rebuilt version is a separate, explicit step: ALTER MATERIALIZED PROJECTION <name> ACTIVATE VERSION <version_id> [UNSAFE] swaps the active version and retires whichever version was active before it.",
                "Activation always checks that the target version's state is built or active; that check runs whether or not UNSAFE is present. It also normally requires the target's verification state to be verified, skipped, or unknown — UNSAFE only skips that second, verification-state check. A rejected activation, say from a failed verification state, still records the attempted swap — target, previous version, and the rejection reason — even though the active version doesn't change.",
                "Cassie repair never undoes user data and never copies anything between nodes; recovery beyond a rebuilt and activated version is a local snapshot operation. Restore a pre-repair snapshot into a new local data directory, rebuild or replay the projection there, and activate a verified version; moving read traffic to another independent node is an external router decision, not something Cassie's repair or activation commands perform.",
              ],
              table: {
                headers: ["Check", "UNSAFE skips it?"],
                rows: [
                  [
                    "Target version state is built or active",
                    "No — always enforced",
                  ],
                  [
                    "Target version verification state is verified, skipped, or unknown",
                    "Yes",
                  ],
                ],
              },
              code: "ALTER MATERIALIZED PROJECTION order_totals ACTIVATE VERSION v2;\nALTER MATERIALIZED PROJECTION order_totals ACTIVATE VERSION v2 UNSAFE;",
              callout: {
                title: "Record the trail yourself",
                body: "Cassie's audit surface is per command — one integrity report, one repair report, one swap attempt. Tie them together in the deployment incident log: integrity report id, repair report id, the commands run, the operator, the timestamp, and the follow-up verification state. Cassie keeps no single end-to-end incident record of its own.",
              },
            },
          ],
        },
        {
          path: "performance",
          title: "Performance",
          description:
            "Evaluate Cassie query behavior with bounded resources, explicit fallbacks, and representative workloads.",
          contract:
            "Performance is the set of query-path proof obligations, enforced resource bounds, and cntryl-stress benchmark tiers that make Cassie's speed and memory behavior falsifiable rather than anecdotal. It covers the query memory budget, result-row cap, and write-idle timeouts that bound query execution today, plus the Tier 1-6 benchmark taxonomy that produces retained evidence against two named deployment profiles.",
          practice:
            "An operator sizes CASSIE_QUERY_MEMORY_BUDGET_BYTES, CASSIE_MAX_RESULT_ROWS, and the REST/pgwire write-idle timeouts for its workload, then runs cargo bench --bench 'tier[1-4]_*' during development and the full wildcard suite for acceptance evidence, tagging each run to a named deployment profile before comparing results across commits.",
          boundary:
            "This page does not cover SQL semantics, index selection, or projection replay, and it does not assert a capacity guarantee for the native-linux-amd64-disk profile, since that evidence is still being collected. Amplification, correctness, and cardinality proofs for individual query families stay with the relevant subsystem docs, not this page.",
          keywords: ["performance", "fallback", "resources"],
          content: [
            {
              id: "performance-contract",
              title: "Performance contract",
              paragraphs: [
                "Every performance-sensitive query family carries the same proof obligation: exact result cardinality against a reference path, the selected physical access path with any fallback reason, bounded storage reads, candidate rows, result rows, memory, and workers, cancellation and deadline checks inside long-running work, and one complete artifact drawn from a single commit, toolchain, profile, and fixture definition. Missing access-path evidence is a failed contract on its own — Cassie does not let an operator infer the intended path from latency when the access-path evidence itself is absent.",
                "The practical performance envelope today is a small set of enforced, per-connection resource limits rather than an elastic pool:",
              ],
              table: {
                headers: ["Setting", "Default", "What happens at the limit"],
                rows: [
                  [
                    "CASSIE_QUERY_MEMORY_BUDGET_BYTES",
                    "10,485,760 (10 MiB)",
                    "One shared tracker accounts sorts, hash tables, aggregate state, graph frontiers, and portal buffers; exceeding the budget returns SQLSTATE 54000. Cassie does not spill to disk — a query either stays inside the budget or fails.",
                  ],
                  [
                    "CASSIE_MAX_RESULT_ROWS",
                    "100,000",
                    "Enforced while rows are produced, not after. A pgwire portal's row limit is cumulative across resumes, and retained portal memory is charged cumulatively across every live portal on the connection.",
                  ],
                  [
                    "CASSIE_REST_WRITE_TIMEOUT_MS",
                    "10,000 ms",
                    "Write-idle deadline under REST; a peer that stops accepting output cannot hold a writer open indefinitely.",
                  ],
                  [
                    "CASSIE_PGWIRE_WRITE_TIMEOUT_MS",
                    "10,000 ms",
                    "Same write-idle deadline applied beneath the pgwire protocol implementation.",
                  ],
                ],
              },
            },
            {
              id: "workload-shape",
              title: "Workload shape",
              paragraphs: [
                "Cassie's own benchmark suite is organized under the cntryl-stress Tier 1-6 taxonomy, and each tier owns a distinct workload shape rather than a distinct pass or fail bar. Tiers 1-4 form the normal developer suite, and their combined owner wall time must stay at or below 900 seconds; Tier 5 is a manual scaling and saturation suite; Tier 6 is a long-running soak suite. None of this changes the fact that every measured server is a single node — the tiers describe workload shape and resource behavior on that one node, not distributed scale-out.",
                "Run the suite with cargo bench. The default developer path only needs the Tier 1-4 slice; a complete wildcard run also pulls in both default one-hour Tier 6 scenarios, so it is intentionally long and reserved for full acceptance evidence rather than routine iteration.",
              ],
              table: {
                headers: ["Tier", "Measures", "What Cassie owns there"],
                rows: [
                  [
                    "1 — Hot path",
                    "One production kernel",
                    "Row and layout codecs, the column scalar codec, key encoding, tokenization and BM25 kernels, vector distances, top-k maintenance, and row serialization; runtime, storage, and the SQL pipeline are excluded.",
                  ],
                  [
                    "2 — Subsystem",
                    "One subsystem operation",
                    "Parser, binder, planner, caches, physical operators, selective encoded column scans, posting merge, ANN candidate/probe selection, hybrid fusion, and protocol codecs, capped at 2,048 rows per operation.",
                  ],
                  [
                    "3 — System",
                    "Embedded end-to-end behavior",
                    "Fixed-duration execution of one representative 100k-row case per access-path family: relational/index, join, column analytics, full-text, exact/HNSW/IVF vector, hybrid, graph, time-series, lifecycle, and mixed load.",
                  ],
                  [
                    "4 — Integration",
                    "A real external boundary",
                    "Authenticated loopback pgwire and HTTP servers with real clients over a shared 10k fixture: persistent-connection queries, portals, cancellation, and protocol comparison.",
                  ],
                  [
                    "5 — Scaling/saturation",
                    "Curves and limits",
                    "Query, retrieval, lifecycle, and transport curves across 10k/100k/250k fixtures, 1/2/4/8/16 clients, and 1/2/4 workers — manual, environment-labelled curves, not a capacity claim on their own.",
                  ],
                  [
                    "6 — Soak/endurance",
                    "Long-lived stability",
                    "Exactly two scenarios by default: mixed query/ingest/retrieval over 100k rows, and pgwire/HTTP lifecycle over 10k rows, each running one hour and proving zero failed operations.",
                  ],
                ],
              },
            },
            {
              id: "measure-query-paths",
              title: "Measure query paths",
              paragraphs: [
                "EXPLAIN is the check that a plan is what it claims to be: it must identify scans, ordering, filters, estimates, join order and algorithm, legality barriers, fallback reasons, and memory bounds for the selected tree before a benchmark result counts as access-path evidence. A fast result without that evidence is not usable as a performance claim.",
                "Final benchmark acceptance runs in a fixed order, ending with a uniquely tagged, complete wildcard run:",
                "Every run is tagged to one of two named deployment profiles. workstation-apple-m5-arm64-apfs is Cassie's existing local evidence: an Apple M5 host, arm64, macOS, with disk-backed storage on the local APFS volume. native-linux-amd64-disk is the representative profile: a Linux amd64 host with its CPU, memory, kernel, filesystem, and mounted-volume identity recorded, and fallback storage explicitly disallowed.",
              ],
              code: "cargo bench --locked --no-run --bench '*'\n\nSTRESS_PROFILE=smoke \\\nCASSIE_BENCH_SOAK_DURATION_SECONDS=5 \\\ncargo bench --locked --bench '*'\n\ncargo bench --locked --bench 'tier[1-4]_*'\n\nCASSIE_BENCH_RUN_ID=<unique-run-id> \\\ncargo bench --locked --bench '*'",
              callout: {
                title: "Evidence still pending for the representative profile",
                body: "The workstation-apple-m5-arm64-apfs run is valid Cassie evidence, but it is explicitly not representative native-Linux evidence — it is a comparison boundary, not a capacity claim. Evidence is still being collected for the native-linux-amd64-disk profile: a complete retained run with p50/p95/p99 and disk-backed amplification figures on that profile does not yet exist. Diagnostic smoke profiles (local-dev-fallback-10k and local-dev-fallback-100k) run against fallback storage and cannot stand in for either disk-backed profile.",
              },
            },
            {
              id: "interpret-fallbacks",
              title: "Interpret fallbacks",
              paragraphs: [
                "Cassie's fallback labels are diagnosed and exact, not a hidden slow path. When an access path can't prove its result against a reference path — because a supporting index is missing, a derived sidecar is stale or corrupt, or a source generation changed mid-query — Cassie names the reason and runs the query over its exact row path instead of returning an unproven answer.",
                "The same discipline applies to resource limits. A portal resume or bind that would exceed either the query memory budget or the result-row cap fails with SQLSTATE 54000 without publishing a partial page; closing, rolling back, or disconnecting is what releases the retained state. Cancellation follows the same rule — REST cancellation is only acknowledged once the controlled worker itself observes the cancellation and finishes cleanup, so a dropped request by itself is not evidence that the underlying query work actually stopped.",
              ],
              table: {
                headers: ["Fallback reason", "Where it fires", "What happens"],
                rows: [
                  [
                    "concurrent-source-change",
                    "Exact or approximate vector search, when a candidate batch's persisted source generation changes during reranking, or a row goes missing, malformed, or dimension-invalid",
                    "Discards every row and metric from the attempted path and executes the exact controlled path once",
                  ],
                  [
                    "maintenance_pending / generation_mismatch",
                    "Accelerated column aggregates whose maintenance state or source generation hasn't caught up to the base rows",
                    "Selects the exact row aggregate in place of the accelerated summary path",
                  ],
                  [
                    "summary_missing / summary_checksum_mismatch",
                    "A column summary that is absent or fails its checksum",
                    "Selects the exact row aggregate",
                  ],
                  [
                    "missing-sidecar-manifest / sidecar-format-mismatch / malformed-sidecar",
                    "Graph traversal, when the persisted adjacency sidecar is absent, in the wrong format, or corrupt",
                    "Runs the exact session-aware row path; Midge's authoritative row records remain the recovery source, not the derived sidecar",
                  ],
                  [
                    "labelled row fallback / missing, corrupt, stale, unsupported, or over-limit required chunk",
                    "Time-series queries with an unsupported shape, or a column-batch derived layout (its manifest and chunk set) that is missing, corrupt, stale, unsupported, or over-limit",
                    "Runs the exact row path and never returns a partial accelerated result; the derived sidecar is rebuilt from Midge's authoritative rows rather than patched in place",
                  ],
                ],
              },
            },
          ],
        },
        {
          path: "troubleshooting",
          title: "Troubleshooting",
          description:
            "Diagnose startup, SQL, projection, resource, storage, and administrative failures.",
          contract:
            "Troubleshooting documents Cassie's CassieError-to-SQLSTATE/HTTP mapping, the concrete conditions that stop a Midge data directory or listener from starting, and where projection, storage, and resource failures surface in pg_catalog views and /metrics.",
          practice:
            "An operator or client reads the SQLSTATE and HTTP status returned by a failed pgwire or REST call, matches it against the CassieError family it belongs to, then inspects the corresponding pg_catalog view (pg_projection_checkpoints, pg_maintenance_debt) or /metrics counter for the last_error text before deciding whether to retry, run VERIFY/REPAIR PROJECTION, or recreate the Midge data directory.",
          boundary:
            "This page explains what Cassie's own error codes and catalog rows mean; it is not a Midge-internal debugging guide, a host-resource or OS-level runbook, or a failover procedure, since Cassie runs single-node with no replica to fail over to.",
          keywords: ["diagnostics", "errors"],
          content: [
            {
              id: "startup-failures",
              title: "Startup failures",
              paragraphs: [
                "Every Cassie startup opens its Midge data directory and calls ensure_families_ready, which checks a baseline layout marker stored in the schema family before any query executes. A brand-new data directory gets the marker value cassie-midge-layout-v1 written once; every later boot reads it back and requires an exact match. A different marker value, a legacy row-key prefix from an older key layout, or any pre-baseline Cassie key found in the schema, data, or temp families all fail startup with a storage bootstrap error such as \"incompatible Midge storage layout: found marker '...'; expected baseline marker 'cassie-midge-layout-v1'; recreate the Midge data directory\".",
                "Startup also rejects insecure listener configurations before accepting connections. Passwordless bootstrap is accepted only for embedded use with no network listener at all; pgwire and REST listener startup reject an empty bootstrap password or a persisted passwordless bootstrap role outright. A non-loopback pgwire or REST listener additionally refuses to start on the default bootstrap password, and refuses a bootstrap role that carries no password, naming the offending listener address in the error.",
                "TLS is validated as a pair: CASSIE_PGWIRE_TLS_CERT_FILE/CASSIE_PGWIRE_TLS_KEY_FILE and their REST equivalents must be configured together or not at all, and a non-loopback listener with neither file configured is refused unless CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN=1 explicitly opts into a trusted private hop behind a TLS-terminating proxy. Once both paths are set, Cassie opens each file when the listener starts; a certificate or key file that is missing or unreadable fails startup with an error naming the path and whether the file was not found or could not be read.",
              ],
              table: {
                headers: [
                  "Startup failure",
                  "Typical cause",
                  "SQLSTATE / HTTP",
                ],
                rows: [
                  [
                    "Layout marker mismatch",
                    "Reopening a data directory written under a different Cassie key layout, or one containing legacy/pre-baseline keys",
                    "58030 / 503",
                  ],
                  [
                    "Bootstrap password rejected",
                    "Empty or default bootstrap password, or a passwordless bootstrap role, on a non-loopback pgwire/REST listener",
                    "58030 / 503",
                  ],
                  [
                    "TLS cert/key not paired",
                    "Only a certificate or only a key file configured for a listener",
                    "58030 / 503",
                  ],
                  [
                    "TLS required for listener",
                    "Non-loopback listener with no TLS configured and no insecure override set",
                    "58030 / 503",
                  ],
                  [
                    "TLS file missing/unreadable",
                    "Configured cert or key path cannot be opened when the listener starts",
                    "22000 / 400",
                  ],
                ],
              },
              callout: {
                title: "No migration path across layout markers",
                body: "A layout marker mismatch has no upgrade or repair-in-place path. The documented remedy is to recreate the Midge data directory from application-owned history, not to patch the marker or convert the existing keys forward; Cassie does not ship a tool that rewrites an incompatible on-disk layout into the current baseline.",
              },
            },
            {
              id: "sql-and-client-failures",
              title: "SQL and client failures",
              paragraphs: [
                "Cassie maps most query and connection failures to PostgreSQL-style SQLSTATE codes through the CassieError enum, alongside an HTTP status for the REST surface. Undefined objects (CollectionNotFound, CatalogObjectNotFound) resolve to the PostgreSQL-family code for the specific object kind: 42P01 for a relation, view, or sequence, 3D000 for a database, 3F000 for a schema, and 42704 for an index, role, rollup, or retention policy, all as HTTP 404. Constraint failures (NotNullViolation 23502, UniqueViolation 23505, CheckViolation 23514, ForeignKeyViolation 23503) return HTTP 409, not 400, since Cassie treats them as a conflict with existing state rather than a malformed request.",
                "Parse and invalid-query errors use 42601 (HTTP 400). COPY, LISTEN, NOTIFY, and UNLISTEN are rejected by keyword before parsing with 0A000 (HTTP 501) when they appear as literal SQL statement text; Cassie's supported CSV ingestion instead runs through pgwire's dedicated COPY FROM STDIN sub-protocol, not as a COPY statement handed to the executor. Query timeouts use 57014 with HTTP 504; an explicit cancellation also uses 57014 but reports HTTP 499, and a cancelled resume returns no partial row page. Resource-limit failures use 54000 (HTTP 400).",
                "Authorization failures are deliberately terse: Unauthorized is 28000/401, InsufficientPrivilege is 42501/403, and AuthenticationRateLimited is 53300/429. pgwire authentication is bounded by process-local token buckets keyed on the normalized username and the peer IP; known and unknown usernames walk the same password-verification path, and once a bucket is exhausted pgwire returns the same generic authentication failure rather than revealing whether the username or the password was wrong.",
              ],
              table: {
                headers: ["Condition", "SQLSTATE", "HTTP"],
                rows: [
                  ["Undefined relation/view/sequence", "42P01", "404"],
                  ["Undefined database", "3D000", "404"],
                  ["Undefined schema", "3F000", "404"],
                  [
                    "Undefined index/role/rollup/retention policy",
                    "42704",
                    "404",
                  ],
                  [
                    "NOT NULL / UNIQUE / CHECK / FOREIGN KEY violation",
                    "23502 / 23505 / 23514 / 23503",
                    "409",
                  ],
                  ["Parse or invalid query", "42601", "400"],
                  [
                    "Unsupported statement (COPY/LISTEN/NOTIFY/UNLISTEN as SQL text)",
                    "0A000",
                    "501",
                  ],
                  ["Query timeout", "57014", "504"],
                  ["Query cancellation", "57014", "499"],
                  ["Resource limit exceeded", "54000", "400"],
                  ["Unauthorized", "28000", "401"],
                  ["Insufficient privilege", "42501", "403"],
                  ["Authentication rate limited", "53300", "429"],
                ],
              },
              code: "$ psql \"host=127.0.0.1 dbname=postgres user=app\" \\\n    -c \"insert into orders(id, customer_id) values (1, null);\"\nERROR:  field 'customer_id' cannot be null (null value in column 'customer_id'\n        of relation 'orders' violates not-null constraint)\nSQLSTATE: 23502",
            },
            {
              id: "projection-failures",
              title: "Projection failures",
              paragraphs: [
                "Every projection carries a freshness state — unknown, fresh, stale, rebuilding, or failed — recorded in Cassie's projection metadata and exposed through pg_catalog.pg_projection_checkpoints. A replay batch that raises an error sets freshness to failed and records the failing message verbatim in last_error before the error is returned to the caller. A materialized projection whose refresh build fails does the same and additionally marks its rebuild state and materialized state failed, without touching the active version pointer, so the previously built output keeps its catalog entry until an operator issues a new refresh or repair.",
                "Diagnosis starts from pg_catalog.pg_projection_checkpoints and pg_catalog.pg_projection_integrity_reports, then moves through the documented repair workflow: VERIFY PROJECTION checks hashes, PLAN REPAIR PROJECTION returns a dry-run plan with an executable flag that must be true before running anything, and REPAIR PROJECTION performs the scoped rebuild — row or range rebuilds local hashes, index rebuilds verified local index sidecars, projection-version rebuilds one named materialized version without activating it, and full-rebuild refreshes the active materialized projection. Every successful repair immediately re-runs VERIFY PROJECTION MODE full and writes an audit row to pg_catalog.pg_projection_repair_reports.",
                "Repair is an admin-only, local, explicit workflow: it is never automatic, never part of query planning or execution, and it does not perform distributed repair, replication, quorum reads, remote mutation, or cross-node reconciliation. Row/range and index repairs hold a write gate on the affected collection for the duration of the rebuild; version and full-rebuild repairs gate all source collections and the output collection while the new output is being built.",
              ],
              table: {
                headers: [
                  "pg_projection_checkpoints column",
                  "What it reports",
                ],
                rows: [
                  [
                    "projection_id / collection / kind",
                    "Which projection and whether it is a collection or materialized projection",
                  ],
                  [
                    "source_identity / source_checkpoint / source_position",
                    "The upstream position the projection has consumed through",
                  ],
                  [
                    "last_applied_event_id / replay_batch_id",
                    "The last event applied and the replay batch that applied it",
                  ],
                  [
                    "lag",
                    "How far behind the source the projection currently is",
                  ],
                  ["freshness", "unknown, fresh, stale, rebuilding, or failed"],
                  [
                    "last_error",
                    "The verbatim failure message from the replay or rebuild that last set freshness to failed",
                  ],
                ],
              },
              code: "SELECT projection_id, freshness, lag, last_error\nFROM pg_catalog.pg_projection_checkpoints\nWHERE freshness = 'failed';\n\nVERIFY PROJECTION orders_by_customer MODE full;\nPLAN REPAIR PROJECTION orders_by_customer SCOPE range;\nREPAIR PROJECTION orders_by_customer SCOPE range;",
              callout: {
                title: "executable = false is a hard stop",
                body: "PLAN REPAIR PROJECTION reports whether its scope is executable. Treat executable = false as a hard stop rather than running REPAIR PROJECTION anyway — repair planning requires a persisted local integrity report from a prior VERIFY PROJECTION run, and running repair without one is not a supported path.",
              },
            },
            {
              id: "storage-and-resource-diagnostics",
              title: "Storage and resource diagnostics",
              paragraphs: [
                'Cassie translates every Midge storage error into one of four CassieError variants. A write stall, a fenced handle, or a message containing "write conflict" become StorageRetryable, mapped to SQLSTATE 57P03 (HTTP 503) to signal a transient condition worth retrying. A missing key or an invalid-argument error mentioning "does not exist" becomes StorageMissingFamily; any other Midge error becomes the general Storage variant. Both map to 58030 (HTTP 503), the same code Cassie uses for storage bootstrap failures and configuration errors, so a plain 58030 without the retryable 57P03 code is not worth retrying on its own.',
                'Resource limits fail closed rather than degrading silently. CASSIE_QUERY_MEMORY_BUDGET_BYTES bounds accounted memory per query (default 10485760 bytes); CASSIE_MAX_RESULT_ROWS bounds cumulative result rows across portal resumes (default 100000); both raise 54000 (HTTP 400) when exceeded, and Cassie does not spill to disk as an alternative. Portal max_rows only bounds one execute response and does not reset either limit. CASSIE_MAX_QUERY_WORKERS bounds concurrent local query execution (default 64); an exhausted permit returns "query admission exhausted" as 53300 (HTTP 503). CASSIE_PGWIRE_MAX_CONNECTIONS and CASSIE_REST_MAX_CONNECTIONS bound connection admission independently of query workers, with over-capacity pgwire connections returning 53300 and over-capacity REST connections returning HTTP 503.',
                "GET /metrics is the primary diagnostic surface: it reports runtime query-admission permits and rejections, storage-family operation and error counts, plan/feedback cache occupancy, and /metrics.capacity, an advisory logical byte count per Midge family and per Cassie category (row blobs, scalar indexes, full-text metadata, vector sidecars, column batches, projection metadata, temporary artifacts). pg_catalog.pg_maintenance_debt exposes collection, artifact, target_generation, retry_count, last_error, and fallback_reason for persisted derived-state retry pressure, and EXPLAIN ANALYZE reports the fallback reason behind a degraded read path.",
              ],
              table: {
                headers: ["Env var", "Default", "Bounds", "On exceed"],
                rows: [
                  [
                    "CASSIE_QUERY_TIMEOUT_MS",
                    "30000",
                    "Wall-clock time per query",
                    "57014 / 504",
                  ],
                  [
                    "CASSIE_QUERY_MEMORY_BUDGET_BYTES",
                    "10485760",
                    "Accounted memory per query",
                    "54000 / 400",
                  ],
                  [
                    "CASSIE_MAX_RESULT_ROWS",
                    "100000",
                    "Cumulative result rows per portal",
                    "54000 / 400",
                  ],
                  [
                    "CASSIE_MAX_QUERY_WORKERS",
                    "64",
                    "Concurrent local query execution permits",
                    "53300 / 503",
                  ],
                  [
                    "CASSIE_PGWIRE_MAX_CONNECTIONS",
                    "256",
                    "pgwire connection admission",
                    "53300 / 503",
                  ],
                  [
                    "CASSIE_REST_MAX_CONNECTIONS",
                    "512",
                    "REST connection admission",
                    "HTTP 503",
                  ],
                ],
              },
              callout: {
                title: "57P03 vs. 58030: which storage errors to retry",
                body: "Only StorageRetryable (57P03) marks a Midge condition as transient — a write stall, a fenced handle, or a detected write conflict. Storage, StorageBootstrap, and StorageMissingFamily all share 58030 for conditions that will not resolve by retrying the same operation, such as a missing storage family or an unrecognized argument.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "reference",
      label: "Reference",
      pages: [
        {
          path: "compatibility",
          title: "PostgreSQL Compatibility",
          description:
            "Find the PostgreSQL-like behavior Cassie supports and the server features that remain outside its contract.",
          contract:
            "PostgreSQL compatibility is the ecosystem-facing contract: Cassie speaks enough of the pgwire protocol and SQL surface that common drivers, ORMs, and administration tools can connect, run documented DDL/DML workflows, and read PostgreSQL-shaped errors and catalog rows, without Cassie claiming full PostgreSQL server, extension, or transaction-isolation parity.",
          practice:
            "An application picks a driver — tokio-postgres, psql, psycopg through SQLAlchemy, or Prisma — connects over pgwire with a role bound to one database, and runs its documented DDL and DML against Cassie the way it would against PostgreSQL for that workflow; anything past the tested and documented subset, such as replication, extensions, triggers, or cross-database references, needs a separate operator-owned or application-owned mechanism built above Cassie.",
          boundary:
            "This contract stops at wire- and SQL-surface compatibility for stated workflows: it does not extend to PostgreSQL's extension ABI, replication, foreign-data wrappers, distributed or serializable transactions, or cross-database queries, and a tool lane only counts as confirmed once this repository's own tests exercise it, not because the tool is expected to work.",
          keywords: ["PostgreSQL", "compatibility", "SQL"],
          content: [
            {
              id: "compatibility-model",
              title: "Compatibility model",
              paragraphs: [
                "Cassie provides a PostgreSQL-like query interface for read-model workloads: it aims to work with common drivers and administration tools for documented workflows, not to match PostgreSQL server, extension, catalog, transaction-isolation, or DDL behavior in full. Every authenticated pgwire connection is bound to exactly one existing database, and `SELECT version()` reports a string that starts `PostgreSQL 16.0 compatible Cassie ...`, so a driver that branches on server version recognizes a PostgreSQL-family server without being told it is talking to an unmodified one.",
                "The catalog Cassie exposes behind `pg_catalog` and `information_schema` lookups is a virtual view over Cassie's own objects, not a byte-for-byte copy of PostgreSQL's catalog: it supplies exactly the rows supported clients need — namespaces, classes, attributes, defaults, indexes, constraints, and view definitions — and nothing beyond that. Applications and tools must not depend on catalog columns, OIDs, server settings, extensions, or system functions this contract does not document, because Cassie will not silently grow a matching PostgreSQL feature to satisfy an undocumented lookup.",
                "Database access administration matches a narrow PostgreSQL subset: `GRANT CONNECT ON DATABASE database TO role` and its `REVOKE` counterpart cover one database and one role per statement, are idempotent, and leave administrators with implicit access regardless of grants. Grant options, multiple grantees in a single statement, object ownership, and table-level privileges sit outside this contract, and every active session revalidates its access on each statement rather than only once at connect time.",
              ],
            },
            {
              id: "sql-surface",
              title: "SQL surface",
              paragraphs: [
                "Cassie's mutation surface is `INSERT ... ON CONFLICT`, not a general `UPSERT` statement: `DO NOTHING` accepts an optional conflict target, and `DO UPDATE` requires an explicit primary-key, unique-constraint, or plain unique scalar-index target before it supports existing-row expressions, `excluded.<column>` references, bound parameters, a `WHERE` filter, and `RETURNING`. Standalone `UPSERT` syntax, `ON CONSTRAINT` targeting, concurrent conflict arbitration, and partial- or expression-index conflict inference are not implemented.",
                "`CREATE TABLE IF NOT EXISTS` and `CREATE [UNIQUE] INDEX IF NOT EXISTS` are name-only no-ops across every index kind Cassie ships — scalar, full-text, vector, column, hybrid, and time-series. Drop the `IF NOT EXISTS` clause and a duplicate name is an error instead.",
                "SQL text parsing is bounded rather than open-ended: 1 MiB of source, 100,000 lexical tokens, 128 levels of nesting, and 128 nested block comments, scanned by a linear scanner that ignores delimiters inside quoted strings, quoted identifiers, and comments. Those limits cover direct and pgwire-submitted SQL; bind and `COPY` payloads instead answer to the general 16 MiB frontend frame limit.",
                'The pgwire integration suite exercises this surface directly rather than by inference: a `WITH RECURSIVE` common table expression walks a short sequence to completion, a `CREATE FUNCTION ... RETURNS INT AS "..."` definition is created and called through a parameterized `SELECT`, and a `CREATE PROCEDURE` paired with `CALL` writes a row from a single bound parameter. None of the three is a procedural-language platform: there is no PL/pgSQL-style branching or looping, and no trigger fires on table events — a procedure body is one stored SQL statement invoked by name.',
              ],
              table: {
                headers: ["Condition", "SQLSTATE", "Confirmed by"],
                rows: [
                  [
                    "Syntax error",
                    "42601",
                    "A malformed SELECT is rejected and the same connection serves the next query successfully.",
                  ],
                  [
                    "Undefined relation",
                    "42P01",
                    "Querying a table that was never created returns the table name in the error.",
                  ],
                  [
                    "Invalid schema name",
                    "3F000",
                    "SET search_path to a schema that does not exist names the missing schema in the error.",
                  ],
                  [
                    "Foreign key violation",
                    "23503",
                    "An insert referencing a missing parent row reports the child table, column, and constraint name.",
                  ],
                  [
                    "Unique violation",
                    "23505",
                    "A duplicate unique-column insert reports the table, column, and constraint name.",
                  ],
                  [
                    "Not-null violation",
                    "23502",
                    "A null value for a NOT NULL column reports the table, column, and constraint name.",
                  ],
                  [
                    "Unsupported feature",
                    "0A000",
                    "The documented response for unimplemented modes, such as an unsupported transaction-isolation request.",
                  ],
                  [
                    "Query cancellation or deadline",
                    "57014",
                    "A cancelled query returns this code instead of a partial result.",
                  ],
                  [
                    "Resource-limit failure",
                    "54000",
                    "An execute or bind that would exceed a configured result or memory limit fails with this code.",
                  ],
                  [
                    "Connection admission failure",
                    "53300",
                    "Returned when bounded connection admission is exhausted.",
                  ],
                ],
              },
              callout: {
                title: "IF NOT EXISTS keeps whatever already exists",
                body: "A name match under `IF NOT EXISTS` succeeds even when the requested column list, types, or index definition disagree with what is already there — Cassie keeps the existing object and its schema epoch rather than reconciling the two shapes. Tooling that re-runs `CREATE TABLE IF NOT EXISTS` expecting a diff-and-alter needs to check the live definition itself; Cassie will not flag the mismatch.",
              },
            },
            {
              id: "client-behavior",
              title: "Client behavior",
              paragraphs: [
                "Two lanes run in this repository's automated suite on every invocation: a native pgwire integration harness that boots a real Cassie instance on a loopback port, and `tokio-postgres` driving it through connect, prepared `query`/`query_one`/`execute`, `simple_query`, session settings, DDL, constraint violations, recursive CTEs, and error recovery. Those two lanes are the compatibility claims this repository can back with a passing test run today.",
                "Three more tools have real probes that stay off by default, each behind its own environment variable, because they need a binary or runtime the test suite cannot assume is installed. The SQLAlchemy probe is the most thorough of them: beyond DDL and parameterized DML it performs a catalog lookup and asserts the exact SQLSTATE returned for a duplicate key and for a missing relation, so error codes are checked rather than just error presence.",
                "For pgAdmin and DBeaver the situation is different, and the distinction matters when reading the table below. Their session behavior is asserted directly — pgAdmin's startup sequence and the pg_catalog queries its navigator issues, and DBeaver's application_name round-trip through SHOW, current_setting, and pg_settings — but neither application is actually driven. What is verified is that Cassie answers the protocol conversation those tools have, not that the tools themselves work.",
                "PostgreSQL JDBC has not been exercised by this repository's suite at all. The named certification target — pgAdmin 9.16 and DBeaver 26.1.3 over PostgreSQL JDBC 42.7.11, covering connection, catalog navigation, and Query Tool execution — remains unconfirmed until the normalized, secret-free, deterministic-replay traces its own contract requires are published.",
              ],
              code: 'let mut config = tokio_postgres::Config::new();\nconfig.host("127.0.0.1").port(5432).user("app").password("app-role-password").dbname("app");\nlet (client, connection) = config.connect(NoTls).await?;\ntokio::spawn(connection);\n\nclient.batch_execute("CREATE TABLE docs (title TEXT)").await?;\nclient.execute("INSERT INTO docs (title) VALUES ($1)", &[&"first"]).await?;\nlet row = client.query_one("SELECT version()", &[]).await?;',
              table: {
                headers: ["Client / tool", "Status in this repository"],
                rows: [
                  [
                    "Native pgwire harness",
                    "Runs on every test invocation against a real, loopback Cassie instance",
                  ],
                  [
                    "tokio-postgres",
                    "Runs on every test invocation; covers connect, prepared queries, DDL, constraints, cancellation, and recovery",
                  ],
                  [
                    "psql",
                    "Opt-in probe (CASSIE_RUN_PSQL_COMPAT=1); connects for a documented create/insert/select workflow",
                  ],
                  [
                    "Prisma",
                    "Opt-in probe (CASSIE_RUN_PRISMA_COMPAT=1); connects for a documented db pull introspection workflow",
                  ],
                  [
                    "SQLAlchemy, via psycopg",
                    "Opt-in probe (CASSIE_RUN_SQLALCHEMY_COMPAT=1); connects for DDL, parameterized DML, and catalog/error-code workflows",
                  ],
                  [
                    "pgAdmin session settings and catalog shape",
                    "Session-initialization sequence and pg_catalog rows are asserted directly; the pgAdmin application itself is not driven",
                  ],
                  [
                    "DBeaver session settings",
                    "application_name session round-trip is asserted directly; the DBeaver application itself is not driven",
                  ],
                  [
                    "PostgreSQL JDBC",
                    "Has not yet been exercised through this repository's own test suite",
                  ],
                ],
              },
            },
            {
              id: "unsupported-features",
              title: "Unsupported features",
              paragraphs: [
                "Six categories are unsupported by design, not by omission: replication, extensions and their ABI, foreign-data wrappers, triggers, distributed or serializable transactions, and cross-database queries. An application that needs any of those has to build it above Cassie — there is no extension point that grows Cassie into providing it.",
                "PostgreSQL replication, extensions, foreign-data wrappers, triggers, dashboards, maintenance tooling, a debugger, and backup tooling are explicitly out of scope, and GUI create/alter dialogs sit outside this contract too — supported DDL stays reachable through a query tool's SQL editor even where its graphical designer would not work against Cassie. Cassie does not claim full PostgreSQL, pgAdmin, or DBeaver parity anywhere in this contract.",
                "`CREATE PROCEDURE` and `CALL` exist for storing and invoking one parameterized SQL statement by name, confirmed by the pgwire integration suite — that is not a procedural-language platform. There is no PL/pgSQL-style branching or looping inside a function or procedure body, and no trigger fires on table events, so any conditional or event-driven business logic stays an application responsibility.",
              ],
              callout: {
                title: "Single-node by design",
                body: "Cassie runs as one node: there is no replication, clustering, consensus, or automatic failover across instances. That is a permanent design boundary for this contract, not a gap between now and a later version — an operator who needs multi-node durability or failover has to build it outside Cassie.",
              },
            },
          ],
        },
        {
          path: "configuration",
          title: "Configuration Reference",
          description:
            "Find Cassie listener, storage, authentication, query, resource, and administrative settings.",
          contract:
            "This reference enumerates every CASSIE_* environment variable CassieRuntimeConfig::from_env and the Midge storage adapter read at startup — pgwire/REST listeners, the Midge data directory, bootstrap authentication and TLS, rate limits, and query execution, caching, and embedding-provider controls — together with each variable's default value and effect.",
          practice:
            "An operator sets these variables (or mounts an admin password file) before starting the cassie binary, pairs any non-loopback listener with its TLS certificate/key files or an explicit insecure-listener override, then tunes worker, cache, and timeout values against /metrics and EXPLAIN output as load grows.",
          boundary:
            "The page covers only variables CassieRuntimeConfig::from_env (plus the two CASSIE_MIDGE_* variables Midge itself reads) parses at startup; it does not cover SQL-level session settings, catalog-driven per-database behavior, or any capacity planning, autoscaling, or multi-node coordination, none of which Cassie performs.",
          keywords: ["configuration", "environment"],
          content: [
            {
              id: "server-settings",
              title: "Server settings",
              paragraphs: [
                "Cassie exposes exactly two network-facing listeners, both parsed by CassieRuntimeConfig::from_env at startup: a PostgreSQL wire protocol port for SQL clients and a REST port for the administrative API and the built-in admin UI. Both default to host loopback, so a default install answers only the machine it runs on.",
                "CASSIE_ADMIN_UI_DIR points the REST listener at the built admin UI's static asset directory, and CASSIE_DEFAULT_DATABASE names the database Cassie bootstraps at startup and hands a pgwire client that connects without selecting one.",
                "Binding either listener to a non-loopback address is a deliberate widening, not a silent one: startup validates TLS pairing and the bootstrap password against the actual bind address and refuses to proceed without the paired configuration covered in Security settings below.",
              ],
              table: {
                headers: ["Variable", "Default", "Purpose"],
                rows: [
                  [
                    "CASSIE_PGWIRE_LISTEN",
                    "127.0.0.1:5432",
                    "Bind address for the PostgreSQL wire protocol listener.",
                  ],
                  [
                    "CASSIE_REST_LISTEN",
                    "127.0.0.1:8080",
                    "Bind address for the administrative REST API and the built-in admin UI.",
                  ],
                  [
                    "CASSIE_ADMIN_UI_DIR",
                    "./ui/dist",
                    "Filesystem directory of built admin UI static assets served by the REST listener.",
                  ],
                  [
                    "CASSIE_DEFAULT_DATABASE",
                    "postgres",
                    "Database name Cassie bootstraps at startup and hands a pgwire client that connects without selecting one.",
                  ],
                ],
              },
              code: "CASSIE_PGWIRE_LISTEN=0.0.0.0:5432 \\\nCASSIE_REST_LISTEN=0.0.0.0:8080 \\\nCASSIE_ADMIN_PASSWORD=change-me-now \\\nCASSIE_PGWIRE_TLS_CERT_FILE=/etc/cassie/tls/cert.pem \\\nCASSIE_PGWIRE_TLS_KEY_FILE=/etc/cassie/tls/key.pem \\\nCASSIE_REST_TLS_CERT_FILE=/etc/cassie/tls/cert.pem \\\nCASSIE_REST_TLS_KEY_FILE=/etc/cassie/tls/key.pem \\\ncassie",
            },
            {
              id: "storage-settings",
              title: "Storage settings",
              paragraphs: [
                "Cassie has one storage configuration surface because it uses cntryl-midge directly as its only storage layer: Midge owns persistence, durability, and crash recovery, and Cassie owns SQL semantics, planning, execution, and indexes on top of it. Cassie does not run without a Midge engine underneath it.",
                "CASSIE_MIDGE_DATA_DIR is the one variable that matters for where data lives: every schema, database, and temporary storage family Midge maintains sits under this single directory.",
                "Cassie exposes no data-directory size cap, retention schedule, or backup-rotation variable of its own. /metrics.capacity reports advisory logical byte usage for that directory, but sizing the underlying volume, watching free space, and scheduling snapshots or compaction remain an operator responsibility.",
              ],
              table: {
                headers: ["Variable", "Default", "Purpose"],
                rows: [
                  [
                    "CASSIE_MIDGE_DATA_DIR",
                    "./.cassie/midge",
                    "Directory where the embedded Midge engine persists its schema, database, and temporary storage families.",
                  ],
                  [
                    "CASSIE_MIDGE_ALLOW_FALLBACK",
                    "Unset (disabled)",
                    "When set to 1/true/yes/on, opens an in-memory Midge engine instead of failing startup if the disk-backed engine at CASSIE_MIDGE_DATA_DIR cannot be opened.",
                  ],
                ],
              },
              callout: {
                title: "In-memory fallback is diagnostic, not durable",
                body: "CASSIE_MIDGE_ALLOW_FALLBACK lets Cassie open an in-memory Midge engine when the disk-backed engine at CASSIE_MIDGE_DATA_DIR fails to open. The repository's own deployment-profile documentation treats that fallback as a smoke-test escape hatch only: state does not survive a restart, and neither named deployment profile accepts a fallback-backed run as disk-backed evidence. Reserve it for local tests, not for data an application needs to keep.",
              },
            },
            {
              id: "security-settings",
              title: "Security settings",
              paragraphs: [
                "Cassie's authentication surface is a single bootstrap administrative role, not a broader per-user provisioning system: CASSIE_ADMIN_USER names that role and CASSIE_ADMIN_PASSWORD or CASSIE_ADMIN_PASSWORD_FILE sets its password, checked against every configured pgwire and REST listener at startup.",
                "Boolean settings below accept 1, true, yes, or on for true and 0, false, no, or off for false, case-insensitively; any other value keeps the listed default.",
                "Pgwire and REST each take an independent certificate/key pair: setting only one of CASSIE_PGWIRE_TLS_CERT_FILE or CASSIE_PGWIRE_TLS_KEY_FILE, or likewise for REST, fails startup outright rather than falling back to plaintext. CASSIE_REST_EXTERNAL_HTTPS changes only cookie and header behavior for a proxy-terminated hop; it does not itself authorize a plaintext non-loopback bind, which still needs CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN.",
              ],
              table: {
                headers: ["Category", "Variable", "Default", "Purpose"],
                rows: [
                  [
                    "Bootstrap identity",
                    "CASSIE_ADMIN_USER",
                    "postgres",
                    "Bootstrap administrative role name checked at pgwire/REST login and used for internal role lookups.",
                  ],
                  [
                    "Bootstrap identity",
                    "CASSIE_ADMIN_PASSWORD",
                    "postgres",
                    "Bootstrap administrative password; the literal default is refused on any non-loopback listener, and an explicitly empty value is refused everywhere.",
                  ],
                  [
                    "Bootstrap identity",
                    "CASSIE_ADMIN_PASSWORD_FILE",
                    "Unset",
                    "Path to a file whose trimmed contents supply the administrative password; takes precedence over CASSIE_ADMIN_PASSWORD, and startup fails if the file is missing or empty.",
                  ],
                  [
                    "Transport TLS",
                    "CASSIE_PGWIRE_TLS_CERT_FILE",
                    "Unset",
                    "PEM certificate chain for the pgwire listener; must be paired with CASSIE_PGWIRE_TLS_KEY_FILE or startup fails.",
                  ],
                  [
                    "Transport TLS",
                    "CASSIE_PGWIRE_TLS_KEY_FILE",
                    "Unset",
                    "PEM private key for the pgwire listener; paired with CASSIE_PGWIRE_TLS_CERT_FILE.",
                  ],
                  [
                    "Transport TLS",
                    "CASSIE_REST_TLS_CERT_FILE",
                    "Unset",
                    "PEM certificate chain for the REST listener; must be paired with CASSIE_REST_TLS_KEY_FILE or startup fails.",
                  ],
                  [
                    "Transport TLS",
                    "CASSIE_REST_TLS_KEY_FILE",
                    "Unset",
                    "PEM private key for the REST listener; paired with CASSIE_REST_TLS_CERT_FILE.",
                  ],
                  [
                    "Transport TLS",
                    "CASSIE_ALLOW_INSECURE_NON_LOOPBACK_LISTEN",
                    "false",
                    "Explicit override permitting a non-loopback pgwire or REST bind to run without TLS, intended for an already-isolated private hop rather than direct exposure.",
                  ],
                  [
                    "Transport TLS",
                    "CASSIE_REST_EXTERNAL_HTTPS",
                    "false",
                    "Declares that HTTPS terminates outside Cassie so it emits HSTS headers and marks session cookies Secure; Cassie never trusts Forwarded or X-Forwarded-Proto.",
                  ],
                  [
                    "Rate limits & timeouts",
                    "CASSIE_AUTH_USER_ATTEMPTS_PER_MINUTE",
                    "10",
                    "Per-process login token-bucket capacity for one normalized user name.",
                  ],
                  [
                    "Rate limits & timeouts",
                    "CASSIE_AUTH_IP_ATTEMPTS_PER_MINUTE",
                    "60",
                    "Per-process login token-bucket capacity for one peer IP address.",
                  ],
                  [
                    "Rate limits & timeouts",
                    "CASSIE_AUTH_RATE_LIMIT_MAX_ENTRIES",
                    "4096",
                    "Combined tracked user/IP identities before additional identities share bounded overflow buckets.",
                  ],
                  [
                    "Rate limits & timeouts",
                    "CASSIE_REST_MAX_SESSIONS_PER_USER",
                    "16",
                    "Active opaque REST sessions permitted for one normalized user; the global session ceiling is a fixed 1,024.",
                  ],
                  [
                    "Rate limits & timeouts",
                    "CASSIE_EMBEDDINGS_MAX_RESPONSE_BYTES",
                    "8388608 (8 MiB)",
                    "Maximum success or error response body size accepted from a configured remote embedding provider.",
                  ],
                  [
                    "Rate limits & timeouts",
                    "CASSIE_REST_WRITE_TIMEOUT_MS",
                    "10000",
                    "Write idle deadline for REST connections.",
                  ],
                  [
                    "Rate limits & timeouts",
                    "CASSIE_PGWIRE_WRITE_TIMEOUT_MS",
                    "10000",
                    "Write idle deadline for pgwire connections.",
                  ],
                ],
              },
              callout: {
                title: "Fails closed on the default credential",
                body: "Cassie checks the bootstrap password against every listener address at startup. An empty password is refused everywhere, and the literal default postgres is refused on any listener that is not bound to loopback: Cassie exits with an error instead of serving a well-known credential to a reachable network.",
              },
            },
            {
              id: "query-and-resource-settings",
              title: "Query and resource settings",
              paragraphs: [
                "Cassie bounds query execution and resource consumption entirely with process-local settings and returns an explicit SQL error or HTTP status when a cap is exhausted; nothing here queues work or retries on the caller's behalf.",
                "CASSIE_PARALLEL_SCAN_WORKERS, CASSIE_PARALLEL_SCORING_WORKERS, and CASSIE_PARALLEL_AGGREGATION_WORKERS do not create three independent pools: the runtime bounds total active operator workers by the highest of the three values, so raising one of them raises the ceiling every operator kind draws from. All three default to 1, which is effectively serial per-operator execution until an operator raises them.",
                "Adaptive execution, operator switching, vectorized joins, and operator feedback recording all default to off; the execution result cache is the one exception in this group, enabled by default.",
                "CASSIE_EMBEDDINGS_PROVIDER selects one embedding backend, and Cassie only constructs runtime configuration for the selected provider — setting variables for an unselected provider has no effect. Every provider shares the same three tuning knobs (timeout_seconds, max_batch_size, and max_retries, for per-request timeout, texts per request, and retry attempts) alongside a model name and, for most providers, an explicit vector dimensions count.",
              ],
              table: {
                headers: ["Category", "Variable", "Default", "Purpose"],
                rows: [
                  [
                    "Execution limits",
                    "CASSIE_QUERY_TIMEOUT_MS",
                    "30000",
                    "Wall-clock deadline before Cassie cancels a running query.",
                  ],
                  [
                    "Execution limits",
                    "CASSIE_MAX_RESULT_ROWS",
                    "100000",
                    "Maximum rows a single query may return.",
                  ],
                  [
                    "Execution limits",
                    "CASSIE_CTE_RECURSION_DEPTH",
                    "64",
                    "Maximum recursion depth for a recursive CTE.",
                  ],
                  [
                    "Execution limits",
                    "CASSIE_QUERY_MEMORY_BUDGET_BYTES",
                    "10485760 (10 MiB)",
                    "Per-query memory budget; the only recognized name for it (an earlier CASSIE_TEMP_SPILL_BUDGET_BYTES name has no effect).",
                  ],
                  [
                    "Concurrency admission",
                    "CASSIE_MAX_QUERY_WORKERS",
                    "64",
                    "Global cap on concurrently running queries; exhausted permits return SQLSTATE 53300.",
                  ],
                  [
                    "Concurrency admission",
                    "CASSIE_PGWIRE_MAX_CONNECTIONS",
                    "256",
                    "Concurrent pgwire connection admission cap; over-cap connections are refused with SQLSTATE 53300.",
                  ],
                  [
                    "Concurrency admission",
                    "CASSIE_REST_MAX_CONNECTIONS",
                    "512",
                    "Concurrent REST connection admission cap; over-cap connections receive HTTP 503.",
                  ],
                  [
                    "Concurrency admission",
                    "CASSIE_PARALLEL_SCAN_WORKERS",
                    "1",
                    "Target parallelism for scan operators, drawn from a shared operator-worker budget.",
                  ],
                  [
                    "Concurrency admission",
                    "CASSIE_PARALLEL_SCORING_WORKERS",
                    "1",
                    "Target parallelism for scoring operators (full-text, vector, hybrid), drawn from the same shared budget.",
                  ],
                  [
                    "Concurrency admission",
                    "CASSIE_PARALLEL_AGGREGATION_WORKERS",
                    "1",
                    "Target parallelism for aggregate operators, drawn from the same shared budget.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_EXECUTION_RESULT_CACHE_ENABLED",
                    "true",
                    "Enables reuse of cached full query execution results.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_EXECUTION_RESULT_CACHE_MAX_ENTRIES",
                    "64",
                    "Maximum entries retained in the execution result cache.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_EXECUTION_RESULT_CACHE_MAX_BYTES",
                    "67108864 (64 MiB)",
                    "Maximum combined byte size of cached execution results.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_PLAN_CACHE_ENTRIES",
                    "128",
                    "Maximum cached query plans.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_CF2_PLAN_TTL_SECONDS",
                    "900",
                    "Time-to-live, in seconds, for a cached CF2 plan.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_CF2_PLAN_CANDIDATE_TTL_SECONDS",
                    "300",
                    "Time-to-live, in seconds, for cached CF2 plan candidates.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_CF2_FULLTEXT_STATS_TTL_SECONDS",
                    "300",
                    "Time-to-live, in seconds, for cached full-text statistics used by CF2 planning.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_FEEDBACK_ENTRIES",
                    "128",
                    "Maximum tracked operator feedback entries.",
                  ],
                  [
                    "Result & plan caching",
                    "CASSIE_FEEDBACK_TTL_SECONDS",
                    "900",
                    "Time-to-live, in seconds, for tracked operator feedback entries.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_OPERATOR_FEEDBACK_ENABLED",
                    "false",
                    "Enables recording operator execution feedback that adaptive execution can act on.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_VECTORIZED_JOINS_ENABLED",
                    "false",
                    "Enables the vectorized (batched) join execution path.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_VECTORIZED_JOIN_BATCH_SIZE",
                    "1024",
                    "Row-batch size used by vectorized joins when that path is enabled.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_ADAPTIVE_EXECUTION_ENABLED",
                    "false",
                    "Enables adaptive plan/operator switching during execution.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_ADAPTIVE_MIN_COST_SAVINGS_BPS",
                    "500",
                    "Minimum estimated cost savings, in basis points, required before adaptive execution switches strategy.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_ADAPTIVE_MIN_CONFIDENCE_BPS",
                    "0",
                    "Minimum confidence, in basis points, required before adaptive execution acts on feedback.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_OPERATOR_SWITCHING_ENABLED",
                    "false",
                    "Enables runtime join-operator switching based on observed row counts.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_OPERATOR_SWITCH_JOIN_ROW_THRESHOLD",
                    "4096",
                    "Row-count threshold that triggers an operator switch once operator switching is enabled.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_ADAPTIVE_CANDIDATE_MIN",
                    "16",
                    "Minimum candidate set size considered during adaptive execution.",
                  ],
                  [
                    "Adaptive execution",
                    "CASSIE_ADAPTIVE_CANDIDATE_MAX",
                    "100000",
                    "Maximum candidate set size considered during adaptive execution.",
                  ],
                  [
                    "Embedding provider selection",
                    "CASSIE_EMBEDDINGS_PROVIDER",
                    "disabled",
                    "Selects the embedding backend: disabled, fallback (alias for disabled), openai, openai_compatible, tei, ollama, voyage, cohere, or local; any other value fails startup.",
                  ],
                  [
                    "Embeddings: openai",
                    "CASSIE_OPENAI_API_KEY",
                    "Unset (required)",
                    "API credential for OpenAI embedding requests.",
                  ],
                  [
                    "Embeddings: openai",
                    "CASSIE_OPENAI_MODEL",
                    "text-embedding-3-small",
                    "Embedding model name.",
                  ],
                  [
                    "Embeddings: openai",
                    "CASSIE_OPENAI_BASE_URL",
                    "Unset",
                    "Overrides the OpenAI API endpoint.",
                  ],
                  [
                    "Embeddings: openai",
                    "CASSIE_OPENAI_TIMEOUT_SECONDS",
                    "30",
                    "Per-request timeout.",
                  ],
                  [
                    "Embeddings: openai",
                    "CASSIE_OPENAI_MAX_BATCH_SIZE",
                    "16",
                    "Texts per embedding request.",
                  ],
                  [
                    "Embeddings: openai",
                    "CASSIE_OPENAI_MAX_RETRIES",
                    "3",
                    "Retry attempts on a transient failure.",
                  ],
                  [
                    "Embeddings: openai_compatible",
                    "CASSIE_EMBEDDINGS_BASE_URL",
                    "Unset (required)",
                    "Endpoint for any OpenAI-compatible embedding server.",
                  ],
                  [
                    "Embeddings: openai_compatible",
                    "CASSIE_EMBEDDINGS_API_KEY",
                    "Unset (optional)",
                    "API credential, if the endpoint requires one.",
                  ],
                  [
                    "Embeddings: openai_compatible",
                    "CASSIE_EMBEDDINGS_MODEL",
                    "BAAI/bge-small-en-v1.5",
                    "Embedding model name.",
                  ],
                  [
                    "Embeddings: openai_compatible",
                    "CASSIE_EMBEDDINGS_DIMENSIONS",
                    "384",
                    "Embedding vector width.",
                  ],
                  [
                    "Embeddings: openai_compatible",
                    "CASSIE_EMBEDDINGS_TIMEOUT_SECONDS",
                    "30",
                    "Per-request timeout.",
                  ],
                  [
                    "Embeddings: openai_compatible",
                    "CASSIE_EMBEDDINGS_MAX_BATCH_SIZE",
                    "16",
                    "Texts per embedding request.",
                  ],
                  [
                    "Embeddings: openai_compatible",
                    "CASSIE_EMBEDDINGS_MAX_RETRIES",
                    "3",
                    "Retry attempts on a transient failure.",
                  ],
                  [
                    "Embeddings: tei",
                    "CASSIE_TEI_BASE_URL",
                    "http://127.0.0.1:8080",
                    "Endpoint for a Text Embeddings Inference server.",
                  ],
                  [
                    "Embeddings: tei",
                    "CASSIE_TEI_MODEL",
                    "BAAI/bge-small-en-v1.5",
                    "Embedding model name.",
                  ],
                  [
                    "Embeddings: tei",
                    "CASSIE_TEI_DIMENSIONS",
                    "384",
                    "Embedding vector width.",
                  ],
                  [
                    "Embeddings: tei",
                    "CASSIE_TEI_TIMEOUT_SECONDS",
                    "30",
                    "Per-request timeout.",
                  ],
                  [
                    "Embeddings: tei",
                    "CASSIE_TEI_MAX_BATCH_SIZE",
                    "32",
                    "Texts per embedding request.",
                  ],
                  [
                    "Embeddings: tei",
                    "CASSIE_TEI_MAX_RETRIES",
                    "3",
                    "Retry attempts on a transient failure.",
                  ],
                  [
                    "Embeddings: ollama",
                    "CASSIE_OLLAMA_BASE_URL",
                    "http://127.0.0.1:11434",
                    "Endpoint for a local Ollama server.",
                  ],
                  [
                    "Embeddings: ollama",
                    "CASSIE_OLLAMA_MODEL",
                    "nomic-embed-text",
                    "Embedding model name.",
                  ],
                  [
                    "Embeddings: ollama",
                    "CASSIE_OLLAMA_DIMENSIONS",
                    "768",
                    "Embedding vector width.",
                  ],
                  [
                    "Embeddings: ollama",
                    "CASSIE_OLLAMA_TIMEOUT_SECONDS",
                    "30",
                    "Per-request timeout.",
                  ],
                  [
                    "Embeddings: ollama",
                    "CASSIE_OLLAMA_MAX_BATCH_SIZE",
                    "16",
                    "Texts per embedding request.",
                  ],
                  [
                    "Embeddings: ollama",
                    "CASSIE_OLLAMA_MAX_RETRIES",
                    "3",
                    "Retry attempts on a transient failure.",
                  ],
                  [
                    "Embeddings: voyage",
                    "CASSIE_VOYAGE_API_KEY",
                    "Unset (required)",
                    "API credential for Voyage embedding requests.",
                  ],
                  [
                    "Embeddings: voyage",
                    "CASSIE_VOYAGE_MODEL",
                    "voyage-3.5-lite",
                    "Embedding model name.",
                  ],
                  [
                    "Embeddings: voyage",
                    "CASSIE_VOYAGE_DIMENSIONS",
                    "1024",
                    "Embedding vector width.",
                  ],
                  [
                    "Embeddings: voyage",
                    "CASSIE_VOYAGE_TIMEOUT_SECONDS",
                    "30",
                    "Per-request timeout.",
                  ],
                  [
                    "Embeddings: voyage",
                    "CASSIE_VOYAGE_MAX_BATCH_SIZE",
                    "16",
                    "Texts per embedding request.",
                  ],
                  [
                    "Embeddings: voyage",
                    "CASSIE_VOYAGE_MAX_RETRIES",
                    "3",
                    "Retry attempts on a transient failure.",
                  ],
                  [
                    "Embeddings: voyage",
                    "CASSIE_VOYAGE_BASE_URL",
                    "https://api.voyageai.com",
                    "Voyage API endpoint.",
                  ],
                  [
                    "Embeddings: cohere",
                    "CASSIE_COHERE_API_KEY",
                    "Unset (required)",
                    "API credential for Cohere embedding requests.",
                  ],
                  [
                    "Embeddings: cohere",
                    "CASSIE_COHERE_MODEL",
                    "embed-v4.0",
                    "Embedding model name.",
                  ],
                  [
                    "Embeddings: cohere",
                    "CASSIE_COHERE_DIMENSIONS",
                    "1536",
                    "Embedding vector width.",
                  ],
                  [
                    "Embeddings: cohere",
                    "CASSIE_COHERE_TIMEOUT_SECONDS",
                    "30",
                    "Per-request timeout.",
                  ],
                  [
                    "Embeddings: cohere",
                    "CASSIE_COHERE_MAX_BATCH_SIZE",
                    "96",
                    "Texts per embedding request.",
                  ],
                  [
                    "Embeddings: cohere",
                    "CASSIE_COHERE_MAX_RETRIES",
                    "3",
                    "Retry attempts on a transient failure.",
                  ],
                  [
                    "Embeddings: cohere",
                    "CASSIE_COHERE_BASE_URL",
                    "https://api.cohere.com",
                    "Cohere API endpoint.",
                  ],
                  [
                    "Embeddings: local",
                    "CASSIE_LOCAL_MODEL",
                    "cassie-local-hash-v1",
                    "Label recorded for the built-in local embedding model.",
                  ],
                  [
                    "Embeddings: local",
                    "CASSIE_LOCAL_DIMENSIONS",
                    "384",
                    "Embedding vector width produced by the built-in local embedding model.",
                  ],
                ],
              },
              callout: {
                title: "Unset provider credentials fail at call time",
                body: "CASSIE_OPENAI_API_KEY, CASSIE_VOYAGE_API_KEY, and CASSIE_COHERE_API_KEY all default to an empty string when unset, and Cassie does not check that a required credential is present when it parses CASSIE_EMBEDDINGS_PROVIDER at startup. Selecting a hosted provider without its key succeeds at boot and fails only on the first embedding request.",
              },
            },
          ],
        },
        {
          path: "glossary",
          title: "Glossary",
          description:
            "Use consistent terms for read models, projections, databases, schemas, indexes, and query families.",
          contract:
            "This glossary fixes one meaning for each term Cassie's read-model, replay, database, and query surfaces use elsewhere in these docs: read model, projection, checkpoint, freshness, replay batch, verification, repair, activation, database family, schema/data epoch, assignment, and fallback.",
          practice:
            "Look up a term here before working through a task page such as Projections and Replay, Indexes and Constraints, or Projection Repair, then reuse the exact SQL keyword, catalog view, or state name shown here (for example `freshness = stale`, `SCOPE full-rebuild`, or `fallback_reason`) in the SQL you write, the EXPLAIN output you read, or the operator runbook you file.",
          boundary:
            "This page defines vocabulary; it does not restate full command syntax, error catalogs, or operator runbooks that live on their own pages, and it does not re-teach general relational-database jargon that has nothing specific to Cassie.",
          keywords: ["glossary", "jargon"],
          content: [
            {
              id: "read-model-terms",
              title: "Read-model terms",
              paragraphs: [
                "A read model is the queryable state Cassie serves over SQL: rows materialized from application-owned history and kept separate from that history's own system of record. Cassie owns the read model's stored rows, catalog metadata, indexes, and query execution against them; the application owns the durable event log, its ordering, and its retention.",
                "A projection is the named local target that Cassie's replay path writes into for one `(projection, source_identity)` pair. Cassie validates every projection write against its current schema, constraints, and indexes and rejects out-of-order source positions for that pair, but it does not choose event ordering, interpret payload meaning, or run schema upcasters — those decisions belong to the deterministic handler that produced the write before it reaches Cassie.",
                "A checkpoint is the persisted replay position for a projection. `pg_catalog.pg_projection_checkpoints` exposes it as `source_checkpoint` and `last_applied_event_id`, alongside `freshness`, `last_error`, and `replay_batch_id`. Checkpoint state is hydrated on restart, so an operator can read whether a projection is caught up without replaying anything.",
                "Freshness is the single-word summary of a projection's replay state, stored as one of five values:",
              ],
              table: {
                headers: ["Freshness state", "Meaning"],
                rows: [
                  [
                    "Unknown",
                    "The default state before any replay or verification has produced a result for the projection.",
                  ],
                  [
                    "Fresh",
                    "The projection's checkpoint reflects its replay input with no pending rebuild and no recorded error.",
                  ],
                  [
                    "Stale",
                    "The projection is behind an upstream change — for example a retention policy deleting rows marks dependent materialized projections stale for re-verification.",
                  ],
                  [
                    "Rebuilding",
                    "A rebuild or repair operation is actively rewriting the projection's rows.",
                  ],
                  [
                    "Failed",
                    "The last replay or repair attempt recorded `last_error`; the projection stops advancing until an operator fixes the cause and resumes it.",
                  ],
                ],
              },
              code: "SELECT freshness, last_error, replay_batch_id,\n       source_checkpoint, last_applied_event_id\nFROM pg_catalog.pg_projection_checkpoints;",
            },
            {
              id: "projection-terms",
              title: "Projection terms",
              paragraphs: [
                "Replay is Cassie's local ingestion step: it applies application-supplied, already-ordered events to a projection's rows inside one write-gated batch. A replay batch is identified by `replay_batch_id`, diagnostic metadata attached to that call for observability — it is not the idempotency key and must not be used as a source offset. The idempotency key is the duplicate-ledger entry keyed by projection, source identity, and event id; redelivering an already-applied event id is a no-op that increments a duplicate-skip counter instead of rewriting rows.",
                "A batch with an empty event id, an out-of-order source position, or the same new event id twice is a replay conflict: Cassie fails the entire batch before writing any projection rows and before advancing `source_checkpoint` or `last_applied_event_id`. A batch that passes those checks applies its row and index writes, records duplicate-ledger entries, and only then advances checkpoint metadata.",
                "Verification is the `VERIFY PROJECTION <name> MODE metadata_only|hashes_only|indexes_only|full` command family. It writes a `ProjectionVerificationState` — among them `verified`, `stale`, `missing`, `incompatible`, `unverifiable`, and `skipped` — plus mismatch, missing, and stale counts to `pg_catalog.pg_projection_integrity_reports`. Repair planning refuses to run without a persisted local integrity report to plan against.",
                "Repair is an admin-only, verification-gated local workflow, not a background process. `PLAN REPAIR PROJECTION name SCOPE row|range` returns a dry-run plan with an `executable` flag — treat `executable = false` as a hard stop. `REPAIR PROJECTION` executes one of five scopes, each holding a write gate on the collections it touches, and every executed repair immediately re-runs `VERIFY PROJECTION ... MODE full` and records the outcome — including `post_verification_state` — as an audit row in `pg_catalog.pg_projection_repair_reports`:",
                "Activation is the `ALTER MATERIALIZED PROJECTION name ACTIVATE VERSION version_id` statement: it swaps which built version of a materialized projection serves queries. Cassie refuses the swap unless the target version's state is `built` or `active` and its verification state is `verified`, `skipped`, or `unknown`; an operator can force it anyway with `ACTIVATE VERSION version_id UNSAFE`, which Cassie records in the projection's swap metadata together with the previous version id.",
              ],
              table: {
                headers: ["Repair scope", "What it rebuilds"],
                rows: [
                  ["row", "Row-level hashes for the affected collection."],
                  ["range", "Range-level hashes for the affected collection."],
                  ["index", "Verified local index sidecars."],
                  [
                    "projection-version",
                    "An explicitly named materialized-projection version without activating it; requires `VERSION <id>` and a repairable `MODE full` integrity report for that exact output.",
                  ],
                  [
                    "full-rebuild",
                    "The active materialized projection, refreshed in place.",
                  ],
                ],
              },
              code: "CREATE MATERIALIZED PROJECTION applications_by_tenant AS\n  SELECT tenant_id, status, count(*) AS total\n  FROM applications\n  GROUP BY tenant_id, status;\n\nALTER MATERIALIZED PROJECTION applications_by_tenant BUILD VERSION;\nVERIFY PROJECTION applications_by_tenant MODE full;\nALTER MATERIALIZED PROJECTION applications_by_tenant ACTIVATE VERSION v2;",
              callout: {
                title: "A completed retry is not a verified projection",
                body: "Do not activate a materialized projection version after a replay failure just because a batch retry finished locally. Confirm the projection's checkpoint reports `freshness = fresh` and run `VERIFY PROJECTION ... MODE full` first — verification and fresh checkpoint state are the operator guardrails, not retry completion.",
              },
            },
            {
              id: "database-terms",
              title: "Database terms",
              paragraphs: [
                "A database family is the single physical Midge column family backing one logical Cassie database, under the `cassie-midge-layout-v1` baseline. Its name is opaque, generated once, and persisted in `DatabaseMeta`; the logical database name is never encoded in the physical family name, so renaming a logical database never requires rewriting its data.",
                "Two reserved families sit outside that per-database set: `cf0` holds global schema/catalog records and the database registry, and `cf1` holds Cassie's own temporary and transient runtime state. Midge's built-in `default` family is reserved for compatibility and Cassie does not write to it. `Midge::database_tx` is the routing boundary that enforces the split — one transaction can never span two databases or mix a catalog family with a data family.",
                "Database creation and drop are journaled: Cassie journals the intended family before creating it and commits the catalog record only after the family exists, so an interrupted create — or an empty-only drop — can finish safely on the next startup. A catalog registry entry with no matching family is a startup error, and there is no online migration between layout baselines; a data directory built under an older baseline has to be recreated.",
                "Schema epoch and data epoch are two independent counters the runtime tracks. Schema epoch advances on catalog and DDL changes and invalidates cached plans and results — a mismatched schema epoch is one of the documented plan/result-cache rejection reasons. Data epoch advances on writes and feeds rollup refresh and materialized-projection staleness detection. Both epochs are part of the safe key that decides whether a cached execution result can be reused, and both are recorded in a database's snapshot manifest.",
                "An assignment is router-facing metadata for one independent node's local ownership of a tenant, projection, or partition scope, visible through `pg_catalog.pg_operational_assignments`. Cassie stores and updates assignment state on request but never interprets it, replicates it to other nodes, or uses it to route, forward, or fan out a query — reading the view, comparing generations, and moving traffic are entirely an external router's job, done by polling each independent node's view.",
              ],
              table: {
                headers: [
                  "Assignment state",
                  "What it means to the external router",
                ],
                rows: [
                  [
                    "claimed",
                    "The node is expected to serve the assignment; the router may send new traffic to it once it is the highest observed generation for the scope.",
                  ],
                  [
                    "draining",
                    "The node should receive no new traffic; the router stops routing new requests but lets in-flight work finish before treating the assignment as inactive.",
                  ],
                  [
                    "released",
                    "The node no longer serves the assignment; the router discards it once a newer `claimed` assignment is active elsewhere.",
                  ],
                  [
                    "failed",
                    "The node reports it cannot serve the assignment safely; the router stops sending traffic and waits for an operator or orchestrator to restore, rebuild, or reroute.",
                  ],
                ],
              },
              code: "BACKUP DATABASE analytics TO STDOUT;\nRESTORE DATABASE restored FROM STDIN;",
              callout: {
                title: "Assignment metadata never routes a query",
                body: "Cassie records and reports assignment state but does not subscribe routers, push changes, forward a misrouted query, or compare generations itself. If an external router sends a query to the wrong node, Cassie runs it against local data anyway — generation fencing and traffic movement stay entirely outside Cassie.",
              },
            },
            {
              id: "query-terms",
              title: "Query terms",
              paragraphs: [
                "EXPLAIN and `/metrics` report the concrete access path Cassie selected for a query, not just its estimated cost: `access_path` (for example `access_path=graph_adjacency`), `column_batch_index=<name>` for a covered column-batch scan, and `aggregate_acceleration=true` when segment summaries answered an aggregate without a row fetch.",
                "A fallback is the deterministic, always-correct row-scan (or row/vector) path that an accelerated access path steps down to when its accelerator is missing, stale, corrupt, or unsupported for the query shape. Row blobs remain the source of truth for every query family, so taking a fallback changes which internal path produced a result, never the result itself. HNSW and IVFFlat vector search fall back to the exact row/vector scan and re-rank; bucket-native time-series execution falls back to row-backed range execution; full-text and scalar-equality execution fall back to an explicitly labelled row path when a transaction overlay or a missing artifact makes the accelerator unusable.",
                "Fallback reasons are named per query family and surfaced in EXPLAIN and metrics rather than as one generic label. Vector search reports `concurrent-source-change` when a candidate's persisted source generation moves during reranking; graph traversal reports `missing-sidecar-manifest`, `sidecar-format-mismatch`, or `malformed-sidecar` when an adjacency sidecar can't be trusted. In every case Cassie discards the attempted accelerated-path rows and metrics and executes the exact path once, rather than returning a partial or mixed result.",
                "A query that exceeds its accounted memory budget or result-row cap fails with SQLSTATE `54000` instead of spilling to disk. `CASSIE_QUERY_MEMORY_BUDGET_BYTES` (default 10,485,760 bytes) bounds one query's tracked materialization — sorts, hash tables, aggregate state, graph frontiers, and search candidates share the same tracker — and `CASSIE_MAX_RESULT_ROWS` (default 100,000) bounds returned rows. A pgwire portal's result-row limit is counted cumulatively across its own resumes, while retained portal memory is charged cumulatively across every live portal on the connection.",
              ],
              table: {
                headers: ["Term", "What it names"],
                rows: [
                  [
                    "access_path",
                    "The concrete execution strategy EXPLAIN reports for a query, for example a point lookup, a covered index decode, or `access_path=graph_adjacency`.",
                  ],
                  [
                    "fallback",
                    "The always-correct row-scan (or row/vector) path used when an accelerated path's index, sidecar, or graph state can't be trusted for the query.",
                  ],
                  [
                    "fallback_reason",
                    "A named diagnostic (for example `concurrent-source-change`, `missing-sidecar-manifest`) exposed in EXPLAIN and metrics explaining why a query took the fallback path.",
                  ],
                  [
                    "aggregate_acceleration",
                    "An EXPLAIN flag meaning a column-batch index's segment summaries answered an unfiltered, non-grouped `count`/`sum`/`avg`/`min`/`max` without a row fetch.",
                  ],
                  [
                    "SQLSTATE 54000",
                    "The resource-limit error returned when a query exceeds its accounted memory budget or result-row cap.",
                  ],
                ],
              },
              code: "EXPLAIN SELECT tenant_id, count(*)\nFROM applications\nWHERE status = 'approved'\nGROUP BY tenant_id;",
              callout: {
                title: "54000 never returns a partial page",
                body: "A query or portal resume that would exceed its memory or row limit fails with SQLSTATE `54000` without publishing any rows for that attempt. Close, rollback, or disconnect releases the retained state — a shorter follow-up query does not.",
              },
            },
          ],
        },
      ],
    },
  ],
});
