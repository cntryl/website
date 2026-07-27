import { definePortal } from "../define";

export const midgePortal = definePortal({
  id: "midge",
  label: "Midge",
  shortLabel: "Midge",
  kind: "runtime",
  route: "/docs/midge",
  description:
    "Embedded Rust storage with explicit transaction, durability, and recovery choices.",
  repository: "https://github.com/cntryl/midge",
  loader: () => import("../routes/midge"),
  sections: [
    {
      id: "start",
      label: "Start here",
      pages: [
        {
          path: "",
          title: "Overview",
          description:
            "Learn when Midge fits, how its transaction and durability model works, and what remains application-owned.",
          contract:
            "Midge is an embedded Rust key-value engine for engineers who want storage inside one process. It provides snapshot transactions, column families, local or cloud-backed storage, and an explicit durability choice for every commit.",
          practice:
            "The application opens an Engine, starts a transaction for one column family, commits with selected WriteOptions, and closes the engine deliberately. Midge fits the runtime layer. Cassie uses it for storage, while other Rust applications can adopt it directly.",
          boundary:
            "Midge is not a server or a distributed database. The application owns schema, encoding, access control, placement, backups, and repair decisions. Next, open local storage, commit a value with sync durability, reopen it, and verify the value.",
          content: [
            {
              id: "what-midge-is",
              title: "What Midge is",
              paragraphs: [
                "Midge is an embedded key-value storage engine for Rust applications. It links into your process as a library — there is no server to run, no port to open, and no network hop between your code and your data. One process owns one database directory, enforced by a single-writer lease.",
                "What you get is an LSM-tree engine with snapshot transactions, named keyspaces (column families), and a choice of local-filesystem or cloud-object-backed storage. What you write and read are raw byte strings; Midge never parses, validates, or versions them.",
                "The whole API is small enough to learn in one sitting: open an Engine, create or look up a column family, begin a transaction against it, stage reads and writes, and commit with an explicit durability policy.",
              ],
              code: `use cntryl_midge::prelude::*;

let mut engine = Engine::open(OpenOptions::local("./data").build()?)?;
let cf = engine.create_column_family("events")?;

let mut tx = engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"event:1".to_vec(), b"payload".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: "when-it-fits",
              title: "When Midge fits",
              paragraphs: [
                "Midge is a good fit when storage belongs inside the application: a local-first desktop or edge application, a service that needs durable state without operating a separate database, a cache or index that must survive restarts, or an event log an application replays on startup. Cassie uses Midge as its own storage layer; any Rust application can adopt it the same way.",
                "It does not fit when you need something Midge deliberately leaves out. Reach for a database server instead when more than one process must write the same data, when you need SQL or a query planner, when you need replication or automatic failover, or when you need transactions that span multiple keyspaces atomically.",
              ],
              table: {
                headers: ["You need", "Midge"],
                rows: [
                  [
                    "Durable storage inside one process",
                    "Yes — this is the core use case",
                  ],
                  [
                    "Snapshot isolation and atomic multi-key commits",
                    "Yes, scoped to one column family",
                  ],
                  [
                    "A per-commit choice of durability guarantee",
                    "Yes — five explicit policies, no default",
                  ],
                  [
                    "Data backed by S3, Azure Blob, or GCS",
                    "Yes — cloud mode, with a bounded local cache",
                  ],
                  [
                    "Multiple processes writing one database",
                    "No — a single-writer lease fences the second writer",
                  ],
                  [
                    "SQL, indexes, or a query planner",
                    "No — keys and values are opaque bytes",
                  ],
                  [
                    "Replication, consensus, or failover",
                    "No — not a distributed database",
                  ],
                  [
                    "Atomic writes across two column families",
                    "No — a transaction is bound to exactly one",
                  ],
                ],
              },
            },
            {
              id: "what-you-own",
              title: "What your application still owns",
              paragraphs: [
                "Midge draws its boundary narrowly on purpose, and the things outside it are things you have to build or decide yourself. None of them are hard, but none of them happen by default.",
                "Encoding and schema are yours: Midge stores opaque bytes, so record layout, field encoding, and schema versioning happen in your code before put and after get. Key ordering follows from that choice — keys sort byte-lexicographically, so a big-endian fixed-width integer sorts numerically and a decimal string does not.",
                "Durability is a decision you make at every commit, not a setting you configure once. Backup is a filesystem copy you make and schedule yourself; Midge ships verification tools but no backup command. And recovery beyond the automatic path — deciding between a salvage-mode open and a restore from backup — is an operator judgment call the engine will not make for you.",
              ],
            },
            {
              id: "where-to-go-next",
              title: "Where to go next",
              paragraphs: [
                "If you are new, start with Getting Started: it installs the crate, commits one value, restarts the engine, and verifies the value came back. That single loop exercises the whole contract in about fifteen lines.",
                "After that, read in the order your work needs rather than front to back. The Storage model section explains how the engine behaves; Configuration covers what you choose at open time; Operations covers what you do once it is running.",
              ],
              table: {
                headers: ["Question", "Page"],
                rows: [
                  ["How do I get one value in and out?", "Getting Started"],
                  ["How do I organize my keyspaces?", "Column Families"],
                  [
                    "What does a transaction actually see?",
                    "Transactions and MVCC",
                  ],
                  [
                    "What is the syntax for put, scan, delete_range?",
                    "Data Operations",
                  ],
                  ["What exactly survives a crash?", "Durability Modes"],
                  ["What happens when the engine restarts?", "Recovery"],
                  ["What files does Midge write to disk?", "Storage Contract"],
                  [
                    "How do I configure memory, cache, and compaction?",
                    "Options",
                  ],
                  ["How do I back it with S3, Azure, or GCS?", "Cloud"],
                  [
                    "Something failed — what does this error mean?",
                    "Troubleshooting",
                  ],
                ],
              },
            },
          ],
          keywords: [
            "embedded",
            "Rust",
            "transaction",
            "durability",
            "recovery",
          ],
        },
        {
          path: "getting-started",
          title: "Getting Started",
          description:
            "Install Midge, commit one value to local storage, reopen the engine, and verify the recovered value.",
          contract:
            "Add cntryl-midge 0.1 to a Rust project. The walkthrough uses a temporary local path, one named column family, and WriteOptions::sync so the acknowledgement boundary is clear.",
          practice:
            "Run the program once to create the store and commit hello=world. Shut down the engine, open the same path again, look up the column family, and read the value in a new read-only transaction. The assertion verifies the end-to-end recovery path.",
          boundary:
            "Use an application-owned path and keep one engine owner for it. A clean shutdown is part of this first path; crash testing and other durability modes require separate recovery tests.",
          content: [
            {
              id: "install",
              title: "Install",
              paragraphs: [
                "Add the crate to a Rust project. Midge has no system dependencies and no separate server to install — the engine compiles into your binary.",
                "Everything in this walkthrough comes from the prelude, which re-exports the canonical open-transact-commit types. Prefer it over importing from the internal modules directly.",
              ],
              code: `# Cargo.toml
[dependencies]
cntryl-midge = "0.1"`,
            },
            {
              id: "open-the-engine",
              title: "Open the engine",
              paragraphs: [
                "Engine::open takes a built OpenOptions. OpenOptions::local(path) selects filesystem storage and returns a builder; build() validates the combination and derives the block, cache, memtable, and compaction settings in one pass. You are not required to tune any of them to get started.",
                "The directory is created if it does not exist. Opening it also acquires a single-writer lease, so a second process pointed at the same path fails with MidgeError::Fenced rather than silently corrupting shared state.",
                'A column family is a named keyspace. Every engine already has one called "default" at id 0, but naming your own keeps unrelated data separate and is worth doing from the first commit. Hold on to the handle — you need its id() for every transaction.',
              ],
              code: `use std::time::Duration;
use cntryl_midge::prelude::*;

let path = "./midge-data";
let mut engine = Engine::open(OpenOptions::local(path).build()?)?;
let cf = engine.create_column_family("example")?;`,
            },
            {
              id: "commit-a-value",
              title: "Commit a value",
              paragraphs: [
                "All reads and writes go through a transaction bound to one column family. begin_tx captures a point-in-time snapshot and, in ReadWrite mode, buffers your mutations locally — nothing reaches the write-ahead log or the memtable until commit.",
                "commit takes an explicit WriteOptions and consumes the transaction. WriteOptions::sync() is the strictest local policy: it returns only after the WAL append and a covering fsync have completed, so once this line returns the write has survived to disk. There is deliberately no default policy, which is why the argument cannot be omitted.",
                "shutdown flushes and stops the runtime workers within the deadline you pass. Dropping the engine instead is not equivalent — a clean shutdown is what makes the next open a fast, uneventful one.",
              ],
              code: `let mut tx = engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"hello".to_vec(), b"world".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;

engine.shutdown(Duration::from_secs(30))?;`,
            },
            {
              id: "reopen-and-verify",
              title: "Reopen and verify",
              paragraphs: [
                "Open the same path again. Recovery runs automatically: Midge validates the format marker, loads the manifest, replays the durable WAL prefix, and resolves any flush interrupted by the previous exit — all before open() hands the engine back.",
                "Look the column family up by name rather than creating it again; create_column_family on an existing name is not how you reattach. Then read in a ReadOnly transaction, which serves lock-free reads from its snapshot and never blocks a writer.",
                "The assertion is the point of the exercise. It proves the value crossed the durability boundary sync() promised and came back through a real recovery path, not out of a warm in-memory cache.",
              ],
              code: `let mut engine = Engine::open(OpenOptions::local(path).build()?)?;
let cf = engine
    .get_column_family("example")
    .expect("example column family");

let tx = engine.begin_tx(cf.id(), TransactionMode::ReadOnly)?;
assert_eq!(tx.get(b"hello")?.as_deref(), Some(b"world".as_slice()));
drop(tx);

engine.shutdown(Duration::from_secs(30))?;`,
              callout: {
                title: "Drop read-only transactions promptly",
                body: "An open transaction pins its snapshot, which holds back compaction and stops garbage collection from deleting SST files the snapshot still points into. That cost is engine-wide, not scoped to the column family you read. Let the transaction go out of scope as soon as you have the value.",
              },
            },
            {
              id: "next-steps",
              title: "Next steps",
              paragraphs: [
                "This walkthrough covers the clean-shutdown path only. It does not prove anything about a crash: to test that, kill the process at the acknowledgment boundary a policy claims and check what survives on restart. Durability Modes describes exactly what each of the five policies guarantees, and Recovery covers what a restart does when the previous exit was not clean.",
                "From here, Data Operations is the reference for every verb — batches, inserts, deletes, range deletes, and scans. Transactions and MVCC explains what a snapshot actually sees and how to handle concurrent writers to the same key, which the default LastWriteWins policy will otherwise resolve silently.",
              ],
            },
          ],
          keywords: [
            "install",
            "Cargo.toml",
            "Engine::open",
            "commit",
            "reopen",
            "get",
          ],
        },
      ],
    },
    {
      id: "storage-model",
      label: "Storage model",
      pages: [
        {
          path: "column-families",
          title: "Column Families",
          description:
            "Create and use column families as explicit keyspaces with application-owned encoding.",
          contract:
            'Column families are named, independently-ided keyspaces inside one Midge engine: every WAL record and SST file carries an explicit cf_id, so distinct families never share on-disk state, and a "default" family at id 0 always exists from the moment the engine opens.',
          practice:
            "An application calls create_column_family once per keyspace it needs, resolves the returned or looked-up handle's id into begin_tx(cf_id, mode) for every transaction, and calls drop_column_family when a keyspace is retired — knowing the drop is a tombstone whose space is reclaimed later, not on the call.",
          boundary:
            "Column families give an application-owned keyspace boundary inside one Midge engine: separate ids, separate SST/WAL routing, separate ingest coordinators. They do not give schema enforcement, cross-column-family atomic transactions, rename/merge operations, or any notion of replication or distribution across engines.",
          keywords: ["column family", "keyspace", "encoding"],
          content: [
            {
              id: "column-family-model",
              title: "Column-family model",
              paragraphs: [
                "A column family is a named keyspace inside one engine. Use them to keep unrelated data apart: the same key bytes written to two families are unrelated entries, and each family is free to use its own key convention without coordinating with the others.",
                "Separation is enforced by an explicit cf_id stamped on every WAL record and built into every SST file name. Families share one WAL stream and one data directory, but that tag is what guarantees one family's data is never read as if it belonged to another.",
                "The one boundary to plan around: a transaction is bound to a single column family for its entire life, fixed at begin_tx. Nothing stages writes across two families and commits them as one atomic unit. If two keyspaces must change together, either put them in the same family or run two transactions and own the reconciliation yourself.",
              ],
              table: {
                headers: ["Rule", "Consequence"],
                rows: [
                  [
                    'A "default" family exists at id 0 from the moment the engine opens',
                    "You can start writing without creating anything; drop_column_family rejects id 0, so it is always there.",
                  ],
                  [
                    "Ids are assigned monotonically and never reused",
                    "Dropped entries are tombstoned, not removed, so a new family always gets a fresh higher id — a stale id can never resolve to the wrong family.",
                  ],
                  [
                    "Every WAL record and SST file carries its cf_id",
                    "Families are isolated on disk even though they share one WAL and one directory.",
                  ],
                  [
                    "One transaction, one column family",
                    "No cross-family atomic commit; group data that must change together into the same family.",
                  ],
                ],
              },
            },
            {
              id: "create-and-look-up",
              title: "Create and look up",
              paragraphs: [
                "Column-family lifecycle is four methods on Engine: create, look up by name, drop by id, and list every family currently registered. Create once at startup for each keyspace your application owns, then resolve handles by name rather than caching ids across restarts.",
                "On local storage these calls append to the manifest journal and persist immediately. On cloud-backed storage they run a two-phase protocol instead — a local prepare file, then a compare-and-swap against the remote registry object, and only then the local commit. A crash mid-protocol is reconciled on the next open: the prepare is either completed or discarded based on what the remote registry actually shows, and a state the two disagree on is reported as MidgeError::RecoveryFailed rather than guessed at.",
              ],
              table: {
                headers: ["Method", "Signature", "Behavior"],
                rows: [
                  [
                    "create_column_family",
                    "fn create_column_family(&self, name: &str) -> MidgeResult<ColumnFamilyHandle>",
                    "Assigns the next monotonic id, starts a per-CF ingest coordinator, and persists the manifest edit (or runs the cloud DDL protocol).",
                  ],
                  [
                    "get_column_family",
                    "fn get_column_family(&self, name: &str) -> Option<ColumnFamilyHandle>",
                    "Looks up an active family by name in the engine's local registry; returns None if it does not exist or the engine handle is closed.",
                  ],
                  [
                    "drop_column_family",
                    "fn drop_column_family(&self, cf_id: ColumnFamilyId) -> MidgeResult<()>",
                    "Tombstones the family (rejected for cf_id 0), removes its ingest coordinator, and removes it from the local registry.",
                  ],
                  [
                    "list_column_families",
                    "fn list_column_families(&self) -> MidgeResult<Vec<ColumnFamilyHandle>>",
                    "Returns every column family handle currently registered on the engine, including default.",
                  ],
                ],
              },
              code: 'let engine = Engine::open(OpenOptions::local("./data").build()?)?;\nlet events = engine.create_column_family("events")?;\n\nlet same = engine.get_column_family("events").expect("just created");\nassert_eq!(events.id(), same.id());\n\nfor cf in engine.list_column_families()? {\n    println!("{} -> {}", cf.name(), cf.id());\n}\n\nengine.drop_column_family(events.id())?;',
              callout: {
                title: "Cloud DDL needs the remote registry",
                body: "create_column_family and drop_column_family only take effect locally after the remote registry's compare-and-swap succeeds when storage is cloud-backed. A concurrent DDL call against the same remote registry loses that race and must be retried by the caller; column-family creation and drop are not something Midge completes purely from local state against cloud-backed storage.",
              },
            },
            {
              id: "key-and-value-encoding",
              title: "Key and value encoding",
              paragraphs: [
                "Midge stores keys and values as opaque bytes. The public API defines Key and Value as bytes::Bytes with no attached schema, field list, or type tag, and the engine never parses, validates, or versions what it stores — put(key: Vec<u8>, value: Vec<u8>, ttl_seconds: Option<u64>) and get(key) move raw byte strings in and out. Every structural decision — record layout, field encoding, schema versioning — is the application's, applied before put/insert and after get.",
                "Ordering is defined over those raw bytes directly: the memtable's skip list compares keys with Rust's slice Ord (a.cmp(b) on &[u8]), i.e. byte-lexicographic order. That ordering drives iteration and every scan or delete_range bound, so the application's key encoding decides sort order — a fixed-width big-endian integer encoding sorts numerically, while the same integer written as a decimal string does not.",
                "Encoding is scoped by cf_id, not by any shared type registry. The same key bytes written to two different column families are unrelated entries with independent values, and each family is free to use its own internal convention — a length-prefixed composite key in one, a plain UTF-8 identifier in another — without coordinating with any other family in the same engine.",
                "The optional TTL passed to put and insert is carried as a separate ttl_seconds field alongside the key and value bytes, not encoded into the value itself; expiry is out-of-band metadata the application does not have to fold into its own value format.",
              ],
            },
            {
              id: "lifecycle-boundaries",
              title: "Lifecycle boundaries",
              paragraphs: [
                "Dropping a column family is a tombstone, not an immediate delete. The drop records the engine sequence at that moment and the exact list of SST files the family owned, and those files stay authoritative for any reader whose snapshot predates the drop. Expect disk space to be returned later, not on the call — plan capacity accordingly.",
                "Reclamation happens once every snapshot that could still observe pre-drop data has been released, and it is written as its own manifest edit, so a crash partway through leaves the work retryable rather than lost. You do not drive this; it is the same snapshot-pinning machinery that protects ordinary SST garbage collection.",
                "Two things are worth knowing before you design around drops. begin_tx fails immediately with MidgeError::InvalidArgument for a family that never existed or was already dropped, and no API retargets an in-flight transaction to a different family. And there is no rename or merge operation at all — relabeling or consolidating a keyspace means creating the new family and copying data across with ordinary transactions.",
              ],
              callout: {
                title: "Any active snapshot delays reclamation",
                body: "The oldest-snapshot check that gates reclamation is engine-wide, not scoped to the dropped family: each open snapshot's pin entry records the sequence it was opened at plus the specific SST names it holds, but nothing groups those pins by column family. A long-lived read-only transaction against any column family in the engine — not just the dropped one — holds back reclamation of every dropped family's files until it ends.",
              },
            },
          ],
        },
        {
          path: "transactions-and-mvcc",
          title: "Transactions and MVCC",
          description:
            "Use snapshot transactions, conflict policies, and commit boundaries with explicit ownership.",
          contract:
            "Every begin_tx call captures a wait-free, point-in-time snapshot keyed to a single global u64 sequence number, then either serves lock-free reads (ReadOnly) or buffers a client-side write set that only touches the WAL and memtable at commit (ReadWrite). Commit applies the whole write set atomically under one sequence range, and the conflict policy chosen on the transaction decides whether overlapping concurrent writes silently overwrite each other or abort the commit.",
          practice:
            "An operator or application calls engine.begin_tx(cf_id, mode) to get a Transaction scoped to one column family, reads with tx.get/tx.scan (which check the buffered write set before falling back to the snapshot), and for ReadWrite transactions stages tx.put/tx.insert/tx.delete/tx.delete_range before calling tx.commit(opts) to publish everything at once, or calls tx.rollback()/drops it to discard the buffered writes. Callers that cannot tolerate lost updates must call tx.set_conflict_policy(ConflictPolicy::AbortOnWriteConflict) before commit and handle MidgeError::WriteConflict themselves.",
          boundary:
            "Midge does not detect write conflicts by default, does not provide serializable or SSI-level isolation, and does not support a single atomic transaction spanning more than one column family. Rollback leaves no WAL trace, so there is no audit record of an aborted transaction, and compare-and-set or stricter lost-update prevention is application logic that sits above the engine, not something the transaction API enforces on its own.",
          keywords: ["transaction", "MVCC", "snapshot"],
          content: [
            {
              id: "snapshot-model",
              title: "Snapshot model",
              paragraphs: [
                "Every transaction starts with `engine.begin_tx(cf_id, mode)`, which does a single wait-free `ArcSwap::load()` against a `SnapshotCache` that the event loop republishes after every write. There is no lock acquisition and no coordination with the write path on the read side.",
                "The snapshot is anchored to `start_sequence: u64`, the global monotonic sequence number at load time. Midge has no wall-clock timestamps or hybrid logical clocks anywhere in the visibility path; an entry at sequence `s` is visible to a transaction with `start_sequence = h` if and only if `s <= h`.",
                "The returned `Transaction` holds `Arc` references to the active memtable, any immutable memtables awaiting flush, and a cloned `Vec<FileMeta>` from the manifest. It also registers itself in the runtime snapshot pin registry so compaction and GC can see it as a live reader.",
                "Because the registration is explicit, a long-lived `ReadOnly` transaction has a real cost: compaction retains tombstones newer than the oldest active snapshot's sequence, and GC will not delete an SST file that a registered snapshot still points into. The snapshot unregisters automatically when the `Transaction` is dropped, whether that happens via commit, rollback, or simply going out of scope.",
              ],
              callout: {
                title: "No timestamps in the visibility path",
                body: 'Snapshot ordering is entirely a function of the global u64 sequence counter. Two transactions started on different threads at the "same" wall-clock instant still have a strict, deterministic before/after relationship based on which one observed a higher `start_sequence`.',
              },
            },
            {
              id: "read-only-transactions",
              title: "Read-only transactions",
              paragraphs: [
                "`TransactionMode::ReadOnly` forbids writes: calling `put`, `insert`, `delete`, or `delete_range` on a read-only transaction returns `MidgeError::InvalidArgument` before anything is buffered.",
                "`tx.get(key)` and `tx.scan(query)` execute directly against the `ReadSnapshot` captured at `begin_tx`, bypassing the event loop entirely. `ReadSnapshot::get` merges `KeyState` across the active memtable, immutable memtables, and SST files by highest-sequence-wins, considering only entries with `entry_seq <= start_sequence`.",
                "Repeated reads inside the same transaction always return the same committed view: writes committed by other transactions after `begin_tx` are never visible, no matter how long the transaction stays open. Calling `tx.commit(opts)` on a read-only transaction is a no-op that just unregisters the snapshot pin and returns `Ok(())`; it never touches the WAL.",
              ],
              code: 'let ro = engine.begin_tx(cf_id, TransactionMode::ReadOnly)?;\nlet val = ro.get(b"counter")?;\nassert!(val.is_some());\n// ro is dropped here; the snapshot unregisters and memtable Arc refcounts decrement.',
            },
            {
              id: "read-write-transactions",
              title: "Read-write transactions",
              paragraphs: [
                "`TransactionMode::ReadWrite` reads from the same snapshot mechanism as `ReadOnly`, plus read-your-own-writes: `tx.get` checks the in-memory `write_set` first and only falls back to the snapshot if the key was not touched locally.",
                "`tx.put`, `tx.delete`, and `tx.delete_range` append a `WriteIntent` to `Transaction.write_set`. Nothing reaches the WAL or the memtable at this point, and no other transaction can observe the buffered writes. `delete_range` also validates `start_key <= end_key` up front and returns `MidgeError::InvalidArgument` if the range is inverted.",
                "`tx.insert(key, value, ttl)` behaves like `put`, except the engine checks at commit time (inside the event loop, once the operation reaches the runtime) whether the key already exists. If it does, commit fails with `MidgeError::InvalidArgument`. This is a server-side existence check on a single key, not a conflict check against other in-flight transactions -- it fires even if no other transaction touched the key concurrently.",
                "A transaction is scoped to exactly one column family, passed as `cf_id` to `begin_tx`. There is no API for staging writes across multiple column families inside one atomic commit.",
                "On `tx.commit(opts)`, the runtime allocates a contiguous sequence range for the transaction (one number per op, plus a begin and a commit marker), appends the full batch as a single `TxnBatch` WAL frame (unless `opts` is `best_effort()`), applies every op to the active memtable, and republishes the `SnapshotCache`. All ops in the batch become visible atomically -- there is no partial visibility of a commit.",
              ],
              table: {
                headers: ["WriteOptions", "WAL behavior at commit"],
                rows: [
                  [
                    "sync()",
                    "Independent TxnBatch WAL frame plus a covering local fsync before returning. Concurrent non-overlapping strict commits may share the physical fsync.",
                  ],
                  [
                    "buffered()",
                    "WAL write, no fsync. A crash between the write and the later fsync loses the transaction.",
                  ],
                  [
                    "best_effort()",
                    "WAL skipped entirely. Data lives only in the memtable until the next flush.",
                  ],
                  [
                    "cloud_strict()",
                    "Uses the cloud durability path and waits for the cloud durability frontier before returning. Empty write-set commits validate cloud-mode compatibility but do not seal or wait for a new cloud sequence.",
                  ],
                ],
              },
              code: 'let mut tx = engine.begin_tx(cf_id, TransactionMode::ReadWrite)?;\n\n// Read: checks write_set first, then the snapshot at begin_tx time.\nlet existing = tx.get(b"counter")?;\nlet count: u64 = existing\n    .as_deref()\n    .and_then(|b| b.try_into().ok())\n    .map(u64::from_be_bytes)\n    .unwrap_or(0);\n\n// Write: appended to write_set, not yet visible to other readers.\ntx.put(b"counter".to_vec(), (count + 1).to_be_bytes().to_vec(), None)?;\n\n// Commit: sends all writes atomically to the event loop.\n// WAL write and memtable apply happen before this call returns.\ntx.commit(WriteOptions::buffered())?;',
              callout: {
                title: "Rollback has no WAL footprint",
                body: "tx.rollback() and simply dropping an uncommitted Transaction do the same thing: discard the buffered write_set and unregister the snapshot pin. There is no WAL abort record, no undo log, and no two-phase rollback, because nothing was ever sent to the engine until commit.",
              },
            },
            {
              id: "conflict-behavior",
              title: "Conflict behavior",
              paragraphs: [
                "Read-write transactions choose between two commit-time policies via `tx.set_conflict_policy(policy)`. The chosen policy only governs overlapping writes between concurrent transactions; it has no effect on the insert-only existence check described above, which is a separate code path.",
                "`ConflictPolicy::LastWriteWins` is the default: two concurrent transactions can both write the same key and both commit successfully. The transaction that reaches the runtime's sequence allocator second gets the higher sequence number, and its value is what subsequent readers see. The earlier writer's update is silently overwritten -- Midge does not surface this as an error.",
                "`ConflictPolicy::AbortOnWriteConflict` makes commit fail with `MidgeError::WriteConflict` if any write-set key, or any key covered by a `delete_range` in the write set, was modified by another transaction after this transaction's `start_sequence`. The check runs in the runtime's apply path before the WAL append, so an aborted conflicting commit never publishes a partial write.",
                "Neither policy provides serializable isolation. Both still guarantee repeatable reads from the fixed snapshot and read-your-own-writes for buffered keys; what differs is only whether a write-write overlap since the snapshot blocks the commit. There is no predicate locking, no range locking, and no detection of read-write conflicts (a transaction that reads a value another transaction later overwrites is not flagged under either policy).",
              ],
              table: {
                headers: [
                  "ConflictPolicy",
                  "Behavior on overlapping concurrent writes",
                  "Default",
                ],
                rows: [
                  [
                    "LastWriteWins",
                    "Both commits succeed; the write with the higher commit sequence wins.",
                    "Yes",
                  ],
                  [
                    "AbortOnWriteConflict",
                    "Commit returns MidgeError::WriteConflict if a write-set key or delete_range target changed after start_sequence.",
                    "No",
                  ],
                ],
              },
              callout: {
                title:
                  "Lost updates are the caller's responsibility under the default policy",
                body: "Two transactions that read the same counter, increment it, and commit under LastWriteWins can both succeed while one increment is lost. Applications that must reject that pattern need to opt into AbortOnWriteConflict and handle the resulting WriteConflict, or implement compare-and-set logic above the storage engine themselves -- Midge does not add this automatically.",
              },
            },
          ],
        },
        {
          path: "operations",
          title: "Data Operations",
          description:
            "Use short transaction-to-commit examples for puts, batches, inserts, reads, deletes, range deletes, scans, rollback, and durability.",
          contract:
            "All data operations belong to a column-family-scoped Transaction. Start a read-write transaction, add one or more mutations, and consume it with commit(WriteOptions). Read-only transactions use the same snapshot model and can be dropped after use.",
          practice:
            "Keep a transaction focused, handle every Result, and make the durability choice at commit. Multiple mutations in one transaction form one atomic batch. Range bounds use an inclusive start and exclusive end.",
          boundary:
            "Transactions cannot span column families. Mutation methods only update the transaction write set until commit. Dropping or rolling back an uncommitted transaction does not publish its mutations.",
          keywords: [
            "put",
            "insert",
            "batch",
            "get",
            "delete",
            "delete_range",
            "scan",
            "rollback",
            "commit",
          ],
          content: [
            {
              id: "the-shape-of-every-operation",
              title: "The shape of every operation",
              paragraphs: [
                "Every operation on this page follows the same three steps: begin a transaction against one column family, stage the work, then either commit with an explicit durability policy or let the transaction go. There is no standalone engine.put or engine.get — the transaction is the only way in.",
                "Two rules explain most of the behavior here. Mutations only update the transaction's local write set, so nothing is visible to anyone else until commit, and everything in one transaction becomes visible together. And commit consumes the transaction: a failed commit is not a handle you retry, it is a transaction you rebuild.",
                "Read-only transactions never need a commit at all. Drop them as soon as you have the data — they pin a snapshot that holds back compaction while they live.",
              ],
              table: {
                headers: ["To do this", "Use", "Mode"],
                rows: [
                  [
                    "Write a value, overwriting any existing one",
                    "put",
                    "ReadWrite",
                  ],
                  ["Write only if the key is absent", "insert", "ReadWrite"],
                  [
                    "Write several keys atomically",
                    "Multiple calls, one commit",
                    "ReadWrite",
                  ],
                  ["Read one key", "get", "Either"],
                  ["Read a range or prefix", "scan with a Query", "Either"],
                  ["Remove one key", "delete", "ReadWrite"],
                  ["Remove a contiguous range", "delete_range", "ReadWrite"],
                  [
                    "Discard staged work",
                    "rollback, or drop the handle",
                    "ReadWrite",
                  ],
                ],
              },
            },
            {
              id: "transaction-to-commit",
              title: "Transaction to commit",
              paragraphs: [
                "Begin a read-write transaction for one column family, add a mutation, and commit with an explicit durability policy. commit consumes the transaction.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"user:1".to_vec(), b"alice".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: "put",
              title: "Put a value",
              paragraphs: [
                "put is an upsert. It writes a new value or replaces the value visible at the key. The optional TTL is expressed in seconds; use None for a value without TTL expiry.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"user:1".to_vec(), b"alice".to_vec(), None)?;
tx.put(
    b"session:1".to_vec(),
    b"payload".to_vec(),
    Some(3_600),
)?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: "batch",
              title: "Commit a batch",
              paragraphs: [
                "Add several mutations to the same transaction and commit once. The puts and deletes are published atomically within the selected column family.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"user:1".to_vec(), b"alice".to_vec(), None)?;
tx.put(b"user:2".to_vec(), b"bob".to_vec(), None)?;
tx.delete(b"user:retired".to_vec())?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: "insert",
              title: "Insert only when absent",
              paragraphs: [
                "insert records create-only intent. The commit fails if the key already exists at conflict validation time.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.insert(b"user:3".to_vec(), b"carol".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: "read",
              title: "Read a value",
              paragraphs: [
                "A read-only transaction captures a stable snapshot. get returns None when the key is absent. Drop the transaction promptly when the snapshot is no longer needed.",
              ],
              code: `let tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadOnly)?;
if let Some(value) = tx.get(b"user:1")? {
    println!("{}", String::from_utf8_lossy(&value));
}
drop(tx);`,
            },
            {
              id: "delete",
              title: "Delete a key",
              paragraphs: [
                "delete adds a point tombstone to the transaction. The deletion becomes visible only after commit.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.delete(b"user:1".to_vec())?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: "range-delete",
              title: "Delete a key range",
              paragraphs: [
                "delete_range removes keys in the half-open range [start, end). The start must sort before or equal to the end. The range tombstone is atomic with other mutations in the transaction.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.delete_range(
    b"session:0000".to_vec(),
    b"session:1000".to_vec(),
)?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: "scan",
              title: "Scan a range or prefix",
              paragraphs: [
                "Build a Query with inclusive start, exclusive end, prefix, limit, or reverse direction. Iterate results without collecting the whole range in memory.",
              ],
              code: `let tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadOnly)?;
let query = Query::new()
    .prefix(Bytes::from_static(b"user:"))
    .limit(100);
let mut rows = tx.scan(&query)?;
while let Some((key, value)) = rows.next().transpose()? {
    println!("{key:?} = {value:?}");
}`,
            },
            {
              id: "rollback",
              title: "Roll back a transaction",
              paragraphs: [
                "rollback consumes the transaction, discards its uncommitted write set, and releases the snapshot registration.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"draft".to_vec(), b"value".to_vec(), None)?;
tx.rollback()?;`,
            },
            {
              id: "commit-durability",
              title: "Choose commit durability",
              paragraphs: [
                "Local storage accepts sync, buffered, and best_effort. Cloud storage accepts cloud_async, cloud_strict, and best_effort. best_effort can be lost before flush_cf and should be limited to data that can be reloaded.",
              ],
              table: {
                headers: ["WriteOptions", "Commit waits for", "Storage"],
                rows: [
                  ["sync()", "Local WAL fsync", "Local"],
                  ["buffered()", "Local WAL append", "Local"],
                  [
                    "best_effort()",
                    "Memtable visibility; no WAL durability",
                    "Memory, local, or cloud",
                  ],
                  ["cloud_async()", "Local cloud runtime acceptance", "Cloud"],
                  ["cloud_strict()", "Covering cloud WAL upload", "Cloud"],
                ],
              },
              code: `tx.commit(WriteOptions::sync())?;
tx.commit(WriteOptions::buffered())?;
tx.commit(WriteOptions::best_effort())?;
tx.commit(WriteOptions::cloud_async())?;
tx.commit(WriteOptions::cloud_strict())?;`,
              callout: {
                title: "Each line represents a different transaction",
                body: "commit consumes its transaction. Choose one WriteOptions value for each transaction; the five lines show the available policies, not five commits on one handle.",
              },
            },
            {
              id: "write-conflicts",
              title: "Choose write-conflict behavior",
              paragraphs: [
                "Read-write transactions default to LastWriteWins. Set AbortOnWriteConflict before mutations when overlapping changes since the start snapshot should fail the commit.",
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.set_conflict_policy(ConflictPolicy::AbortOnWriteConflict);
tx.put(b"counter".to_vec(), next_value, None)?;
tx.commit(WriteOptions::sync())?;`,
            },
          ],
        },
        {
          path: "durability",
          title: "Durability Modes",
          description:
            "Choose the acknowledgement boundary for each commit and test recovery against that choice.",
          contract:
            "This page is the complete list of durability guarantees behind WriteOptions: what commit() waits for, what is durable at the moment it returns, and what a crash can and cannot lose for each of the five policies.",
          practice:
            "An application picks one of sync(), buffered(), best_effort(), cloud_async(), or cloud_strict() at every commit() call — there is no default — matching the constructor to whether the engine is local or cloud-backed, then verifies the choice by killing the process at that acknowledgment boundary and checking what survives on restart.",
          boundary:
            "This page does not cover RecoveryPolicy::Strict versus RecoveryPolicy::Salvage, manifest repair, or local versus cloud storage layout — those decisions live on the separate Recovery and Storage Contract pages.",
          keywords: ["sync", "buffered", "cloud strict", "durability"],
          content: [
            {
              id: "durability-model",
              title: "Durability model",
              paragraphs: [
                "WriteOptions has no Default implementation, and that omission is deliberate: every call to commit() must name one of five constructors — sync(), buffered(), best_effort(), cloud_async(), or cloud_strict() — so the acknowledgment boundary for a write is always a conscious choice, never an inherited one.",
                "A committed write can cross up to four boundaries on its way to being fully durable: visible (the commit is applied to the memtable and new transactions can observe it), locally durable (the write survives a restart from local storage), cloud durable (the covering cloud WAL segment upload has been acknowledged), and SST-published (the data is represented by manifest-visible SST state rather than WAL replay). commit() returns as soon as the chosen policy's boundary is satisfied — it never automatically waits for all four.",
                "The five constructors split by storage mode. sync() and buffered() accept only local or in-memory storage; cloud_async() and cloud_strict() accept only cloud-backed storage. best_effort() is the single policy valid under either mode. Calling a constructor against a storage mode it doesn't support fails the commit with MidgeError::InvalidArgument instead of silently downgrading the guarantee.",
              ],
              table: {
                headers: ["Boundary", "What it means"],
                rows: [
                  [
                    "Visible",
                    "Commit applied to the memtable; new transactions can read it",
                  ],
                  [
                    "Locally durable",
                    "Write survives a restart from local storage",
                  ],
                  [
                    "Cloud durable",
                    "The covering cloud WAL segment upload has been acknowledged",
                  ],
                  [
                    "SST-published",
                    "Data is represented by manifest-visible SST state instead of WAL replay",
                  ],
                ],
              },
              code: "pub enum DurabilityPolicy {\n    Sync,\n    Buffered,\n    BestEffort,\n    CloudAsync,\n    CloudStrict,\n}",
              callout: {
                title: "No default policy",
                body: "commit() always takes an explicit WriteOptions argument. There is no bare commit() call and no implicit fallback — a caller that hasn't decided on an acknowledgment boundary cannot compile a commit at all.",
              },
            },
            {
              id: "local-commit-modes",
              title: "Local commit modes",
              paragraphs: [
                "sync() and buffered() are the two options restricted to local or in-memory storage; cloud-backed storage rejects both with MidgeError::InvalidArgument. sync() returns from commit() only after the transaction's own WAL frame has been appended and a local fsync covering that frame has completed. Independent concurrent sync() commits may share one physical fsync, but every caller is still acknowledged only once that shared barrier succeeds. At return the transaction is both visible and locally durable, and restart recovers it by WAL replay or from already-published SST state.",
                "buffered() returns from commit() after the WAL append barrier and memtable apply complete, but before a local fsync is guaranteed. It trades away that fsync wait for lower latency: a crash before the later fsync completes can lose the committed write, and WAL replay only recovers it if that fsync happened first.",
                "best_effort() has the smallest local acknowledgment boundary of the three: commit() returns after memtable visibility alone, and the WAL is skipped entirely. Nothing about the write is durable until a later flush_cf() call successfully publishes it to SST state — a crash before that flush loses it outright. Its own API documentation restricts it to bulk-load and setup phases that can be reloaded from source, not measured or application-critical writes.",
              ],
              table: {
                headers: [
                  "Local option",
                  "commit() returns after",
                  "Durable at return?",
                  "Crash outcome",
                ],
                rows: [
                  [
                    "sync()",
                    "WAL append + local fsync complete",
                    "Yes",
                    "Local-disk write survives restart, assuming local storage survives",
                  ],
                  [
                    "buffered()",
                    "WAL append barrier + memtable apply complete",
                    "No",
                    "May be lost if the process crashes before the later fsync completes",
                  ],
                  [
                    "best_effort()",
                    "Memtable apply complete (WAL skipped)",
                    "No",
                    "Lost unless a later flush_cf() call publishes it to SST",
                  ],
                ],
              },
              code: "// Setup phase: bulk-load without WAL overhead, then make it durable\ntx.commit(WriteOptions::best_effort())?;\n// ... continue loading rows ...\nengine.flush_cf(&cf)?;\n\n// Measured workload: switch to a durable policy\ntx.commit(WriteOptions::sync())?;",
            },
            {
              id: "cloud-commit-modes",
              title: "Cloud commit modes",
              paragraphs: [
                "cloud_async() and cloud_strict() are the two options restricted to cloud-backed storage; non-cloud storage rejects both with MidgeError::InvalidArgument. cloud_async() returns from commit() once the local WAL append barrier and memtable apply complete — the runtime still owes the work of sealing the active WAL segment, uploading it, and advancing the cloud durability frontier in the background. At return the write is visible but not yet proven to survive local cache loss.",
                "cloud_strict() waits for that same work before commit() returns. It submits the transaction to the local runtime, then blocks until the runtime seals and rotates the active WAL segment, uploads the sealed segment, and receives cloud acknowledgment covering the committed sequence. Only after that acknowledgment does the write count as cloud durable. Empty cloud-backed cloud_strict() transactions are allowed and don't invent a WAL record to satisfy the wait; the same option against non-cloud storage is rejected regardless of whether the transaction has any writes.",
                "best_effort() also runs against cloud-backed storage — it's the one policy valid in both modes — with the identical guarantee it has locally: memtable visibility only, no WAL involvement, and recovery only through a later successful flush_cf().",
              ],
              table: {
                headers: [
                  "Cloud option",
                  "commit() returns after",
                  "Cloud durable at return?",
                  "Crash outcome",
                ],
                rows: [
                  [
                    "cloud_async()",
                    "Local WAL append barrier + memtable apply complete; seal and upload continue in the background",
                    "No",
                    "May be lost if the process crashes before the sealed WAL upload is acknowledged",
                  ],
                  [
                    "cloud_strict()",
                    "WAL seal, rotate, upload, and cloud acknowledgment complete",
                    "Yes",
                    "Survives local cache loss once cloud acknowledgment has been received",
                  ],
                  [
                    "best_effort()",
                    "Memtable apply complete (WAL skipped)",
                    "No",
                    "Lost unless a later flush_cf() call publishes it to SST",
                  ],
                ],
              },
              code: '// cloud_async() and cloud_strict() only accept cloud-backed storage\nlet mut tx = local_engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;\ntx.put(b"k".to_vec(), b"v".to_vec(), None)?;\ntx.commit(WriteOptions::cloud_strict())?;\n// -> MidgeError::InvalidArgument(\n//      "cloud_async() and cloud_strict() require cloud-backed storage")',
              callout: {
                title:
                  "Visibility and cloud acknowledgment aren't the same moment",
                body: "cloud_strict() delays only the caller's return, not local publication. Concurrent readers can observe the transaction as soon as the local runtime applies it — which can be before the committing caller's own commit() call gets its cloud acknowledgment back.",
              },
            },
            {
              id: "recovery-expectations",
              title: "Recovery expectations",
              paragraphs: [
                "commit() always publishes a transaction as an all-or-nothing unit — incomplete transactional WAL state is never replayed into visibility, and an uncommitted transaction never becomes visible after restart. What changes per durability option isn't that atomicity guarantee; it's whether the published unit is still there to recover at all.",
                "After sync(), the write is recovered from the local durable prefix, by WAL replay or from already-published SST state — this is the only local option with no crash window. After buffered(), the write is recovered only if the later fsync completed before the crash. After best_effort(), the write is recovered only if a later flush_cf() call published it to SST state before the crash. After cloud_async(), the write is recovered only if the WAL seal and cloud upload it depends on completed before the crash or local cache loss event. After cloud_strict(), local cache loss occurring after cloud acknowledgment was received should not lose the committed write.",
                "During flush or compaction, output files can exist on disk without being authoritative — recovery trusts manifest-visible state, not the mere presence of a file. Testing a durability choice means killing the process at the acknowledgment boundary it claims and confirming, after restart, that the write is there (or, for best_effort(), that it may not be).",
              ],
              table: {
                headers: ["Write option", "Recovered after a crash when..."],
                rows: [
                  [
                    "sync()",
                    "Always — from WAL replay, or from already-published SST state",
                  ],
                  [
                    "buffered()",
                    "The later local fsync completed before the crash",
                  ],
                  [
                    "best_effort()",
                    "A later flush_cf() call published it to SST state before the crash",
                  ],
                  [
                    "cloud_async()",
                    "The WAL seal and cloud upload it depends on completed before the crash or cache loss",
                  ],
                  [
                    "cloud_strict()",
                    "Always once cloud acknowledgment was received — even after local cache loss",
                  ],
                ],
              },
              callout: {
                title: "These outcomes assume RecoveryPolicy::Strict",
                body: "RecoveryPolicy::Strict is the supported production recovery policy for the local-first target: open() fails outright on untrustworthy manifest, intent-log, or WAL state rather than continuing on an uncertain prefix. The outcomes above describe what survives under that policy; RecoveryPolicy::Salvage is a separate, degraded investigation path covered on the Recovery page.",
              },
            },
          ],
        },
        {
          path: "recovery",
          title: "Recovery",
          description:
            "Open existing storage, inspect recovery reports, and decide whether to continue, repair, or rebuild.",
          contract:
            "Recovery is Midge's fixed startup and inspection story for one local (or cloud-cached) storage directory: acquire the writer lease, validate the FORMAT marker, load manifest and intent-log state, replay the WAL's durable prefix, resolve any flush or compaction publication a crash interrupted, and classify the result as Healthy, Degraded, SalvageMode, WriteStalled, or Corrupt.",
          practice:
            "An operator points `midge verify [--json] <db-path>` at a database directory to get a non-mutating report — manifest and SST checksums, WAL boundary, health — without opening the engine at all. If `Engine::open()` itself fails under the default RecoveryPolicy::Strict, the next move is a deliberate one: reopen with RecoveryPolicy::Salvage to bring the store up on a verified WAL prefix, or restore the whole directory from a known-good backup.",
          boundary:
            "Recovery never edits an SST in place and never reconstructs a manifest entry from raw bytes; RecoveryPolicy::Salvage only trims the WAL to its last verified frame and marks the engine degraded. Anything past that point — rebuilding lost writes, restoring from backup — is an operator or application decision that happens outside Midge's own code paths.",
          keywords: ["recovery", "WAL", "repair"],
          content: [
            {
              id: "recovery-model",
              title: "Recovery model",
              paragraphs: [
                "Recovery has three fixed requirements on every restart: restore every write that crossed its acknowledged durability boundary, never apply a partial WAL frame or a partial transaction, and treat the manifest's published SST set as authoritative unless intent-log replay proves a newer durable state. Manifest state, not raw file presence on disk, is what recovery trusts — an SST file sitting in sst/ that the manifest does not list is never assumed durable just because it exists.",
                "At Engine::open(), local recovery runs a fixed sequence, and a later step never overrides an earlier one's authority:",
                "WAL replay itself walks two kinds of file: rotated, sealed segments named {segment_id}.wal in ascending segment-id order, then the single active file wal.log, read last. That file-kind distinction — sealed versus active — is what later determines which corruption recovery tolerates and which it does not.",
              ],
              table: {
                headers: ["Step", "What it establishes"],
                rows: [
                  [
                    "1. Acquire the single-writer lease",
                    "Confirms this process is the sole writer before anything else touches storage.",
                  ],
                  [
                    "2. Validate the FORMAT marker",
                    "Reads the FORMAT file and requires its version to equal CURRENT_FORMAT_VERSION (2); persisted state found without a marker, or a mismatched version, fails to open as a CompatibilityError instead of being reinterpreted.",
                  ],
                  [
                    "3. Load manifest and on-disk intent log",
                    "Manifest defines the currently published SST set; the intent log is read here but not yet applied.",
                  ],
                  [
                    "4. Replay the WAL durable prefix",
                    "Rebuilds memtables from rotated `{segment_id}.wal` segments in ascending order, then the active `wal.log` file, restoring committed writes the manifest does not yet reflect.",
                  ],
                  [
                    "5. Replay the intent log",
                    "Resolves any flush or compaction publication interrupted by the earlier crash, using the FlushPublish or CompactionPublish entries recorded before the crash instead of guessing from which files happen to be on disk.",
                  ],
                  [
                    "6. Finalize health and recovery metrics",
                    "Classifies EngineHealth (Healthy, Degraded, SalvageMode, or WriteStalled) and exposes WAL/intent replay counters through Engine::get_recovery_metrics().",
                  ],
                ],
              },
            },
            {
              id: "open-and-inspect",
              title: "Open and inspect",
              paragraphs: [
                "`midge verify [--json] <db-path>` runs `Engine::verify_path`, a read-only pass over an on-disk database directory. It does not acquire the single-writer lease and does not start the runtime — it opens the directory through a plain read-only filesystem handle, so it can be pointed at a directory the application is not currently holding open.",
                "The pass validates the FORMAT marker, loads the manifest and intent log under RecoveryPolicy::Strict, checksums every SST the manifest lists (on-disk size against the manifest's `size_bytes`, a whole-file CRC32C against `content_crc32c`, then every data block through `verify_all_blocks()`), and replays the WAL under strict policy to compute `wal_boundary`. It also scans `sst/` for two kinds of residue: `.sst` files present on disk but not listed in the manifest, and `.sst.tmp` staging files left behind by an interrupted write. Only the orphan `.sst` files and any pending intent-log entry push the reported health to Degraded instead of Healthy — leftover `.tmp` staging files are recorded internally but do not by themselves change the reported health value.",
                "Exit code is 0 for Healthy, 1 for Degraded (and, on a running engine's own status, SalvageMode or WriteStalled), and 2 for Corrupt.",
              ],
              table: {
                headers: ["Field", "What it reports"],
                rows: [
                  [
                    "health",
                    "Healthy or Degraded for this pass — see the caveat below.",
                  ],
                  [
                    "authoritative",
                    "true for a local directory verified directly; distinguishes this from a pass over a cloud cache.",
                  ],
                  [
                    "manifest_epoch",
                    "Highest durable manifest edit id, taken from the on-disk edit journal or the manifest's own checkpoint id, whichever is higher.",
                  ],
                  [
                    "manifest_files_verified",
                    "Count of SST files listed in the manifest.",
                  ],
                  [
                    "sst_files_verified",
                    "Same count as manifest_files_verified, reported separately.",
                  ],
                  [
                    "bytes_verified",
                    "SST bytes checksummed plus WAL payload bytes decoded during replay.",
                  ],
                  [
                    "data_blocks_verified",
                    "Number of SST data blocks read and checksummed.",
                  ],
                  [
                    "wal_boundary",
                    "Highest sequence number found in the verified WAL, or absent if the WAL held no records.",
                  ],
                  [
                    "wal_recovery_records_replayed",
                    "Records replayed while verifying the WAL prefix.",
                  ],
                  [
                    "wal_recovery_bytes_replayed",
                    "Bytes replayed while verifying the WAL prefix.",
                  ],
                  [
                    "intent_entries_loaded",
                    "Number of entries found in the on-disk intent log.",
                  ],
                ],
              },
              code: 'use cntryl_midge::Engine;\n\nlet report = Engine::verify_path("/var/lib/midge/db")?;\nprintln!("{:?} intents={}", report.health, report.intent_entries_loaded);',
              callout: {
                title: "verify itself never reports Corrupt",
                body: "Every loader verify_path calls runs under its strict variant — RecoveryPolicy::Strict for the manifest and intent log, ReplayPolicy::Strict for the WAL. Corruption those loaders do not tolerate aborts the whole call with an error instead of finishing the pass, so the CLI prints `midge: <message>` to stderr and exits 2 without ever printing a report line. In a completed report, health can only be Healthy or Degraded; SalvageMode, WriteStalled, and Corrupt are EngineHealth values a running engine can carry, not values this verification pass produces.",
              },
            },
            {
              id: "corruption-and-truncation",
              title: "Corruption and truncation",
              paragraphs: [
                "WAL replay classifies every read failure by where it happened and which policy is active. A torn final append — an incomplete frame header or an incomplete record body found at the very end of the active wal.log file — is always tolerated: the valid prefix is kept, the incomplete tail is dropped, and replay continues. This is the one case recovery expects, because it is exactly what an interrupted last write looks like.",
                "Corruption anywhere else — a bad CRC, an incomplete frame inside a sealed {segment_id}.wal segment, or non-tail corruption inside the active file — is not the expected case, and the two recovery policies handle it differently:",
                "RecoveryPolicy::Salvage is the default's opposite, not a companion setting: an application sets it deliberately on OpenOptionsBuilder::recovery_policy, and it exists for investigating a store that Strict already refused to open, not for routine startup. midge verify never uses it — the CLI's own verification pass is always Strict.",
                "Flush and compaction publication follow the same manifest-is-authoritative rule when a crash lands mid-transition. If a crash happens before a flushed SST is durable, the WAL-backed state is still authoritative and normal WAL replay recovers it. If a crash happens after the SST is durable but before its manifest publish, the intent-log entry recorded for that flush lets recovery either finish the publish or drop the unpublished SST — reads keep seeing the prior authoritative state either way until publication resolves. Compaction is symmetric: a crash after compaction output is durable but before the manifest publish leaves the original input SSTs authoritative until the intent resolves; a crash after publish but before input cleanup leaves the new SSTs already authoritative, with the now-obsolete inputs deleted idempotently by that recovery pass or a later cleanup.",
              ],
              table: {
                headers: ["Corruption location", "Strict (default)", "Salvage"],
                rows: [
                  [
                    "Incomplete tail frame at the very end of the active wal.log",
                    "Tolerated: valid prefix kept, tail dropped, replay continues.",
                    "Same as Strict.",
                  ],
                  [
                    "Bad CRC or incomplete frame anywhere else (a sealed segment, or non-tail in the active file)",
                    "Fails; Engine::open() returns an error and the engine does not open.",
                    "Stops at the last verified frame, keeps that prefix, and marks the engine SalvageMode/degraded; everything after the corrupt point is not recovered.",
                  ],
                ],
              },
            },
            {
              id: "repair-or-rebuild",
              title: "Repair or rebuild",
              paragraphs: [
                "Midge has no automated repair command. There is no midge repair, no online SST rewrite, and no tool that reconstructs a manifest entry or an SST from raw bytes. Beyond the strict-versus-salvage choice already covered, the only two paths available are opening in RecoveryPolicy::Salvage and operator-directed backup/restore of the whole storage directory.",
                "Opening with RecoveryPolicy::Salvage is a deliberate, investigation-only decision: it lets a directory that Strict refused to open come up anyway, on a verified WAL prefix, with the engine reporting SalvageMode. It is not a setting to leave on by default — it accepts data loss (everything past the corrupt point in that WAL file) in exchange for getting the store open enough to look at.",
                "Rebuilding a store beyond that verified prefix is an operator responsibility, not a Midge feature: restore the whole database directory — FORMAT marker, manifest, WAL, and sst/ together — from a backup taken before the corruption, then let normal recovery run against that restored directory. Midge does not ship a backup or restore command; the directory is the entire unit an operator must copy, snapshot, or restore.",
              ],
              code: 'use cntryl_midge::{Engine, OpenOptions, RecoveryPolicy};\n\nlet engine = Engine::open(\n    OpenOptions::local("/var/lib/midge/db")\n        .recovery_policy(RecoveryPolicy::Salvage)\n        .build()?,\n)?;\nlet metrics = engine.get_runtime_metrics()?;\nprintln!("{:?}", metrics.health); // EngineHealth::SalvageMode when Strict would have failed',
              callout: {
                title: "No partial rebuild path",
                body: "There is no supported way to rebuild just the corrupted piece — one bad WAL segment, one bad SST — in place. Salvage-mode open discards data after the first unrecoverable point in the WAL; recovering data beyond that point means restoring the directory from an earlier backup, not repairing the one in place.",
              },
            },
          ],
        },
        {
          path: "storage-contract",
          title: "Storage Contract",
          description:
            "Understand local files, cloud objects, compatibility boundaries, and application-owned backup policy.",
          contract:
            "The storage contract page names every file and object key Midge writes to local disk or a cloud provider, states the current on-disk format version and what a version mismatch does, and marks where that guarantee stops so an application knows what it still has to own.",
          practice:
            "An operator or application reads the local and cloud key layouts to script inspection or backup tooling, checks the FORMAT marker version before trusting a directory as current, and follows the migration guide's stop-writers, copy-directory, verify-the-copy sequence before promoting or restoring from a copy.",
          boundary:
            "Midge does not ship a backup, snapshot, or export command, does not promise any on-disk layout survives a version change before 1.0, and never adopts existing persisted files into a new format automatically — all three stay explicit operator or application responsibilities.",
          keywords: ["storage format", "layout", "compatibility"],
          content: [
            {
              id: "local-layout",
              title: "Local layout",
              paragraphs: [
                "A local Midge database is one directory. Its root holds a FORMAT marker, the manifest plus its snapshot and journal companions, the intent log, and two lease files; two subdirectories, wal/ and sst/, hold the append-only and immutable data files.",
                "SST files are named {cf_id:06}_{level:02}_{sequence:020}.sst — for example 000007_02_00000000000000000001.sst — so a plain directory listing sorts in creation order within a column family and level. Sealed WAL segments follow the same zero-padded convention: a 20-digit segment id plus .wal, e.g. 00000000000000000042.wal. The one mutable file inside wal/ is the active wal.log; every other file in that directory is an immutable sealed segment kept for replay.",
                "manifest.snapshot.json, when present, is loaded instead of manifest.json, and manifest.journal — the edits recorded since the last snapshot checkpoint — is replayed on top of whichever manifest was loaded. manifest.json is kept only as a legacy-compatible mirror once a snapshot checkpoint exists.",
              ],
              table: {
                headers: ["File or directory", "Written by", "Role"],
                rows: [
                  [
                    "FORMAT",
                    "metadata::format, at engine open",
                    "Whole-directory format-version marker (midge-format-version=2); validated on every open.",
                  ],
                  [
                    "manifest.json (+ .tmp staging)",
                    "ManifestPersistence::save",
                    "Full manifest state; a legacy-compatible mirror once a snapshot checkpoint exists.",
                  ],
                  [
                    "manifest.snapshot.json (+ .tmp staging)",
                    "ManifestPersistence::save_snapshot_and_truncate_journal",
                    "Authoritative manifest checkpoint; loaded instead of manifest.json when present.",
                  ],
                  [
                    "manifest.journal",
                    "metadata::journal edit appends",
                    "Manifest edits since the last snapshot checkpoint; replayed on top of the loaded manifest.",
                  ],
                  [
                    "intent_log.json (+ .tmp staging)",
                    "runtime::intent_persistence",
                    "Interrupted flush/compaction publication state used to resolve a crash between an SST being written and being published.",
                  ],
                  [
                    ".midge_leader / .midge_leader.lock",
                    "lease::filesystem::FileSystemLease",
                    "Single-writer lease record and its CAS lock file; acquired first in the recovery sequence.",
                  ],
                  [
                    "wal/wal.log",
                    "wal::fs writer",
                    "The one mutable WAL file; never uploaded or archived as-is.",
                  ],
                  [
                    "wal/{20-digit segment id}.wal",
                    "WAL rotation (wal::segment_file_name)",
                    "Sealed, immutable WAL segment; replayed in id order before wal.log.",
                  ],
                  [
                    "sst/{cf_id}_{level}_{sequence}.sst",
                    "Flush and compaction (sst::file_name)",
                    "Immutable sorted file; authoritative only once its name is published into the manifest.",
                  ],
                ],
              },
              code: "db-path/\n  FORMAT\n  manifest.json\n  manifest.snapshot.json\n  manifest.journal\n  intent_log.json\n  .midge_leader\n  .midge_leader.lock\n  wal/\n    wal.log\n    00000000000000000041.wal\n    00000000000000000042.wal\n  sst/\n    000000_00_00000000000000000001.sst\n    000000_01_00000000000000000002.sst",
              callout: {
                title: "Snapshot state wins over manifest.json",
                body: "When manifest.snapshot.json exists, it is what gets loaded, with manifest.journal replayed on top; manifest.json is left in place only as a mirror. Reading manifest.json directly from outside the engine once a snapshot checkpoint exists can show stale state.",
              },
            },
            {
              id: "cloud-layout",
              title: "Cloud layout",
              paragraphs: [
                "Cloud-backed storage mirrors the local layout as an object-key convention scoped by an application-chosen prefix. segment_object_key formats sealed WAL segments as wal/{20-digit-id}.wal; object_key formats SST files as sst/{filename}, with an in-flight upload staged at sst/{filename}.tmp until it is durable. The root metadata files — FORMAT, manifest.json, manifest.snapshot.json, manifest.journal, and intent_log.json — live one level under a metadata/ key, and the DDL registry has its own fixed key, metadata/ddl.registry.json.",
                "HybridStorage, the layer a cloud-backed engine actually calls, exposes only bounded keyed object I/O, byte-identity readback, provider identities, immutable publication, and conditional deletion — it does not parse WAL, SST, or manifest bytes. That interpretation, plus manifest coverage decisions and prune authorization, stays in runtime::hybrid_persistence; a guarded prune is authorized there and then rechecked against the object's identity in the storage worker immediately before the provider's conditional delete.",
              ],
              table: {
                headers: ["Object key pattern", "Produced by", "Contents"],
                rows: [
                  [
                    "wal/{20-digit segment id}.wal",
                    "wal::segment_object_key",
                    "One sealed WAL segment, byte-identical to the local file.",
                  ],
                  [
                    "sst/{cf_id}_{level}_{sequence}.sst",
                    "sst::object_key",
                    "One immutable SST file.",
                  ],
                  [
                    "sst/{filename}.tmp",
                    "sst::temp_object_key",
                    "Staging key for an SST upload still in flight.",
                  ],
                  [
                    "metadata/FORMAT, metadata/manifest.json, metadata/manifest.snapshot.json, metadata/manifest.journal, metadata/intent_log.json",
                    "storage::cloud::cloud_metadata_key",
                    "Same root metadata files as local storage, one level under metadata/.",
                  ],
                  [
                    "metadata/ddl.registry.json",
                    "runtime::ddl (fixed key)",
                    "The DDL registry object for the prefix.",
                  ],
                ],
              },
              code: 'use cntryl_midge::{wal, sst};\n\nlet wal_key = wal::segment_object_key(42);\nassert_eq!(wal_key, "wal/00000000000000000042.wal");\n\nlet sst_key = sst::object_key(&sst::file_name(0, 0, 1));\nassert_eq!(sst_key, "sst/000000_00_00000000000000000001.sst");',
            },
            {
              id: "format-compatibility",
              title: "Format compatibility",
              paragraphs: [
                "Every local or cloud database carries a top-level FORMAT marker: one file holding midge-format-version=<n>. The current build writes and expects version 2. Engine open validates that marker every time and returns CompatibilityError if the stored version does not match, or if the file is missing or malformed.",
                "A directory that already holds persisted state — any of manifest.json, manifest.snapshot.json, manifest.journal, or intent_log.json, or a non-empty wal/ or sst/ — but has no FORMAT file is treated as an incompatibility, not a fresh database. Open fails with CompatibilityError telling the operator the data must be rebuilt or re-imported; Midge never stamps a missing marker onto existing files and adopts them as version 2.",
                "The wider compatibility policy covers WAL frames and records, manifest files and the manifest journal, the intent-log persistence format, and SST file layout and its footer/version identifiers. On the path to 1.0 the required rules are: every persisted format carries an explicit version identifier or a versioned decoding path, current builds distinguish supported historical, current, and unsupported future format, an unsupported future format returns CompatibilityError, and corruption and incompatibility stay distinct error classes rather than collapsing into one.",
                "Before a 1.0 release there is no blanket promise that a given on-disk layout keeps working across versions. Any format change has to be called out explicitly — in the changelog and in a migration guide — rather than left for an operator to discover only from a compatibility error. The policy also commits Midge to golden-fixture coverage: opening current code against prior released data, verifying that data in strict mode, recovering from prior released WAL and manifest state, and rejecting synthetic future-version data with CompatibilityError. Building out that fixture set and the compatibility checks that run it is ongoing work; the rules above are the target contract, not a claim that every historical layout already has a fixture proving it.",
              ],
              table: {
                headers: ["Covered format", "Enforced today by"],
                rows: [
                  [
                    "WAL frames and records",
                    "Torn/corrupted frame detection during replay; strict recovery fails closed, salvage keeps only the valid prefix.",
                  ],
                  [
                    "Manifest files and manifest journal",
                    "FORMAT marker gates the directory; every persisted SST name is validated on manifest load and save.",
                  ],
                  [
                    "Intent-log persistence format",
                    "FORMAT marker gates the directory; intent_log.json must parse as the interrupted-publication record the runtime expects.",
                  ],
                  [
                    "SST file layout and footer/version identifiers",
                    "FORMAT marker gates the directory; SST names are validated wherever manifest state is loaded.",
                  ],
                ],
              },
              code: "// db-path/FORMAT\nmidge-format-version=2",
              callout: {
                title: "A missing marker is a failure, not a default",
                body: "If manifest, intent-log, or WAL/SST state already exists but FORMAT does not, open returns CompatibilityError instead of writing a fresh marker and treating the existing files as current-format data.",
              },
            },
            {
              id: "backup-ownership",
              title: "Backup ownership",
              paragraphs: [
                "Midge has no backup, snapshot, or export API. The one built-in tool for judging whether a copy is trustworthy is verification: Engine::verify_path(path) runs a non-mutating integrity pass over manifest, intent-log, WAL, and SST files without opening a runtime, and Engine::verify_storage(timeout) runs the equivalent pass against an already-open engine. Neither call makes, moves, or manages a copy of anything.",
                "Midge's own migration guide describes backup as an entirely operator- and application-owned procedure: stop the application's writers and call engine.shutdown(timeout) to reach a clean, quiesced state; copy the whole database directory — FORMAT, manifest state, intent_log.json, wal/, and sst/ together — to a separate location; then verify that copy with the target binary before trusting it, and roll forward only after reads, writes, restart recovery, and any required cloud checks pass against the copy.",
                "A partial copy breaks the recovery contract described above: manifest state without the SST files it names, or WAL segments without the manifest that accounts for their sequence range, cannot be replayed correctly. Copy the directory as one unit, lease files included, and treat any copy taken while the engine was still writing as unverified until verify_path has run against it.",
              ],
              table: {
                headers: ["Step", "Operator action", "Tool"],
                rows: [
                  [
                    "Quiesce",
                    "Stop the application's writers, then shut down cleanly",
                    "engine.shutdown(timeout)",
                  ],
                  [
                    "Copy",
                    "Copy the whole database directory to a separate location",
                    "Filesystem copy — application/operator owned, not a Midge API",
                  ],
                  [
                    "Validate",
                    "Run a non-mutating integrity pass against the copy",
                    "Engine::verify_path(path)",
                  ],
                  [
                    "Promote",
                    "Open the copy with the target binary and re-run application read/write checks",
                    "Engine::open",
                  ],
                ],
              },
              code: 'use std::time::Duration;\nuse cntryl_midge::prelude::*;\n\nengine.shutdown(Duration::from_secs(30))?;\n\n// (operator copies the whole database directory to restore_path here)\n\nlet report = Engine::verify_path(&restore_path)?;\nprintln!(\n    "restore verified: {} SST files, {} manifest files",\n    report.sst_files_verified, report.manifest_files_verified\n);\nlet mut restored = Engine::open(OpenOptions::local(&restore_path).build()?)?;',
              callout: {
                title: "No built-in backup command",
                body: "There is no dedicated backup, snapshot, or export call in Midge. verify_path and verify_storage check the integrity of a copy you already made by hand; making, scheduling, and storing that copy stays an operator or application responsibility.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "configuration",
      label: "Configuration",
      pages: [
        {
          path: "options",
          title: "Options",
          description:
            "Configure every public Midge open option and understand the values derived when the options are built.",
          contract:
            "OpenOptions starts with a storage constructor and returns an OpenOptionsBuilder. Builder methods record intent. build() validates the combination and derives block, cache, memtable, WAL, SST, compaction, and compression settings once.",
          practice:
            "Choose storage first, then set Goal, MemoryBudget, and WorkloadProfile. These three inputs should be enough for most applications. Add a low-level override only when measurements show that a derived value does not fit the workload.",
          boundary:
            "Built OpenOptions are immutable. A zero I/O timeout, a zero required limit, or a memory override that cannot fit the total budget fails build(). The simulated-cloud budget method is hidden and is not part of the application configuration surface.",
          keywords: [
            "OpenOptions",
            "Goal",
            "MemoryBudget",
            "WorkloadProfile",
            "BlockCachePolicy",
            "CloudWritePolicy",
          ],
          content: [
            {
              id: "storage",
              title: "Choose storage",
              paragraphs: [
                "Every configuration begins with one storage constructor. in_memory keeps data in the process. local owns a filesystem path. cloud combines a bounded local cache with a real provider and object prefix. cloud_simulated uses filesystem-backed object storage for deterministic tests.",
              ],
              table: {
                headers: ["Constructor", "Configure with", "What it does"],
                rows: [
                  [
                    "OpenOptions::in_memory()",
                    "No arguments",
                    "Keeps engine state in memory.",
                  ],
                  [
                    "OpenOptions::local(path)",
                    "Application-owned directory",
                    "Stores WAL, manifest, and SST state on the local filesystem.",
                  ],
                  [
                    "OpenOptions::cloud(cache, provider, prefix)",
                    "Local cache path, CloudProviderConfig, unique object prefix",
                    "Uses a local cache with real provider-backed WAL and SST objects.",
                  ],
                  [
                    "OpenOptions::cloud_simulated(cache, bucket, prefix)",
                    "Local cache path, simulated bucket, object prefix",
                    "Exercises the cloud storage model against the filesystem.",
                  ],
                ],
              },
              code: `let memory = OpenOptions::in_memory().build()?;
let local = OpenOptions::local("./data").build()?;
let cloud = OpenOptions::cloud("./cache", provider, "databases/app").build()?;
let simulated =
    OpenOptions::cloud_simulated("./cache", "test-bucket", "databases/app")
        .build()?;`,
            },
            {
              id: "derived-configuration",
              title: "Set the derived configuration",
              paragraphs: [
                "Goal selects the primary optimization target. MemoryBudget sets the total memory envelope. WorkloadProfile supplies the access-pattern hint. Midge derives the lower-level values from their combination.",
              ],
              table: {
                headers: ["Method", "Choices", "Effect"],
                rows: [
                  [
                    ".goal(value)",
                    "Latency, Throughput, Economy",
                    "Changes derived block size, SST target, WAL buffer, cache allocation, compression, and compaction choices.",
                  ],
                  [
                    ".memory_budget(value)",
                    "Auto, Bytes(n)",
                    "Sets the total memory envelope used to divide cache, memtable, and transaction pools.",
                  ],
                  [
                    ".workload(value)",
                    "Mixed, WriteHeavy, ReadMostly, RangeScan, TtlHeavy",
                    "Adjusts derived memory allocation and data-layout choices for the expected access pattern.",
                  ],
                ],
              },
              code: `let options = OpenOptions::local("./data")
    .goal(Goal::Latency)
    .memory_budget(MemoryBudget::Bytes(512 * 1024 * 1024))
    .workload(WorkloadProfile::Mixed)
    .build()?;`,
            },
            {
              id: "runtime-overrides",
              title: "Configure runtime overrides",
              paragraphs: [
                "These methods cover every public OpenOptionsBuilder override. Keep the derived defaults unless the application has measurements or an operating constraint that justifies a specific value.",
              ],
              table: {
                headers: ["Method", "Value", "What it controls"],
                rows: [
                  [
                    ".with_memtable_size_limit(bytes)",
                    "Non-zero bytes",
                    "Maximum runtime memtable size before write pressure applies.",
                  ],
                  [
                    ".with_memtable_flush_threshold(bytes)",
                    "Non-zero bytes",
                    "Memtable size that schedules a flush.",
                  ],
                  [
                    ".transaction_memory_pool_size(bytes)",
                    "Bytes within the total memory budget",
                    "Shared resident memory for transaction write sets before spill behavior.",
                  ],
                  [
                    ".block_cache_policy(policy)",
                    "Lru, TinyLfu, ClockPro",
                    "Eviction and admission policy for blocks read from SST files.",
                  ],
                  [
                    ".background_compaction(enabled)",
                    "true or false",
                    "Enables or disables automatic background compaction scheduling.",
                  ],
                  [
                    ".recovery_policy(policy)",
                    "Strict or Salvage",
                    "Chooses fail-closed recovery or an operator-approved degraded open.",
                  ],
                  [
                    ".storage_io_timeout(duration)",
                    "Non-zero Duration",
                    "Maximum wait for append, flush, and sync acknowledgements.",
                  ],
                  [
                    ".cloud_write_policy(policy)",
                    "CloudWritePolicy",
                    "Controls eventual flush distance and cloud WAL sealing thresholds.",
                  ],
                ],
              },
              code: `let options = OpenOptions::local("./data")
    .with_memtable_size_limit(128 * 1024 * 1024)
    .with_memtable_flush_threshold(96 * 1024 * 1024)
    .transaction_memory_pool_size(64 * 1024 * 1024)
    .block_cache_policy(BlockCachePolicy::Lru)
    .background_compaction(true)
    .recovery_policy(RecoveryPolicy::Strict)
    .storage_io_timeout(Duration::from_secs(30))
    .build()?;`,
            },
            {
              id: "cloud-write-policy",
              title: "Configure cloud write policy",
              paragraphs: [
                "CloudWritePolicy is used only with cloud-backed storage. Its default flushes WAL-backed memtables after a segment gap of 128 and seals a cloud WAL segment at 16 MiB, 500 milliseconds, or 10,000 pending writes.",
              ],
              table: {
                headers: ["Field", "Default", "What it controls"],
                rows: [
                  [
                    "eventual_flush_segment_gap",
                    "128 segments",
                    "Maximum WAL segment distance before an eventual memtable flush.",
                  ],
                  [
                    "wal_seal_min_segment_bytes",
                    "16 MiB",
                    "Size threshold for sealing the active cloud WAL segment.",
                  ],
                  [
                    "wal_seal_max_flush_delay",
                    "500 ms",
                    "Time threshold for sealing a pending cloud WAL segment.",
                  ],
                  [
                    "wal_seal_max_pending_writes",
                    "10,000",
                    "Pending-write threshold for sealing a cloud WAL segment.",
                  ],
                ],
              },
              code: `let cloud_writes = CloudWritePolicy {
    eventual_flush_segment_gap: 64,
    wal_seal_min_segment_bytes: 8 * 1024 * 1024,
    wal_seal_max_flush_delay: Duration::from_millis(250),
    wal_seal_max_pending_writes: 5_000,
};

let options = OpenOptions::cloud("./cache", provider, "databases/app")
    .cloud_write_policy(cloud_writes)
    .build()?;`,
            },
            {
              id: "inspect-derived-values",
              title: "Inspect the built values",
              paragraphs: [
                "Because build() derives so much from three inputs, it is worth logging what it actually decided. OpenOptions exposes eighteen getters: eight echo back exactly what you passed, and ten report values computed once at build() time.",
                "Log them at startup. When a performance question comes up later, knowing the real memtable limit and cache size on that host — rather than what you assumed Auto would pick — is usually the fastest way to an answer.",
                "The Configuration Reference lists every getter alongside the exact formula behind it.",
              ],
              code: `let options = OpenOptions::local("./data").build()?;

tracing::info!(
    budget = options.memory_budget_bytes(),
    memtable = options.memtable_size_limit(),
    cache = options.block_cache_size(),
    txn_pool = options.transaction_memory_pool_size(),
    block = options.block_size(),
    l0_trigger = options.l0_compaction_trigger(),
    "midge resolved configuration"
);`,
            },
          ],
        },
        {
          path: "cloud",
          title: "Cloud",
          description:
            "Configure Midge for AWS S3, S3-compatible storage, Azure Blob, or Google Cloud Storage with explicit credentials and durability.",
          contract:
            "Cloud mode uses a hybrid layout: a local cache and staging path plus one provider-backed object prefix. CloudProviderConfig selects the provider and credential source. OpenOptions::cloud binds that provider to the local cache and prefix.",
          practice:
            "Give each engine a unique prefix, keep its local cache on bounded storage, use platform-managed credentials where possible, and choose cloud_async or cloud_strict at every commit. Test recovery after removing the local cache before relying on the remote copy.",
          boundary:
            "The local cache is part of runtime performance but is not the remote durability boundary. A successful cloud_async commit does not wait for covering object upload. cloud_strict seals and uploads the covering WAL before returning.",
          keywords: [
            "AWS S3",
            "S3-compatible",
            "Azure Blob",
            "GCS",
            "CloudProviderConfig",
            "cloud_async",
            "cloud_strict",
          ],
          content: [
            {
              id: "cloud-model",
              title: "The cloud storage model",
              paragraphs: [
                "OpenOptions::cloud takes three values: a local cache path, a CloudProviderConfig, and an object prefix. The provider config owns bucket or container identity, endpoint details, and credentials. The prefix isolates one engine inside that provider location.",
              ],
              table: {
                headers: ["Input", "Purpose", "Rule"],
                rows: [
                  [
                    "local_cache_path",
                    "Caches and stages cloud-backed engine data locally",
                    "Use bounded, application-owned local storage.",
                  ],
                  [
                    "provider",
                    "Selects S3, Azure Blob, or GCS plus credentials",
                    "Construct it explicitly with CloudProviderConfig.",
                  ],
                  [
                    "prefix",
                    "Scopes WAL, manifest, and SST objects",
                    "Use a unique prefix for each engine writer.",
                  ],
                ],
              },
              code: `let provider = CloudProviderConfig::aws_s3(
    "application-data",
    "us-east-1",
);

let options = OpenOptions::cloud(
    "./midge-cache",
    provider,
    "databases/orders",
)
.recovery_policy(RecoveryPolicy::Strict)
.build()?;

let mut engine = Engine::open(options)?;`,
            },
            {
              id: "aws-s3",
              title: "AWS S3",
              paragraphs: [
                "aws_s3 uses Midge’s lightweight AWS default credential chain. Use an explicit S3CredentialSource when the deployment requires environment variables, a shared profile, static keys, or temporary session credentials.",
              ],
              table: {
                headers: ["Credential source", "Constructor", "Use"],
                rows: [
                  [
                    "AWS default chain",
                    "CloudProviderConfig::aws_s3(bucket, region)",
                    "AWS-hosted workloads using the supported default chain.",
                  ],
                  [
                    "Environment",
                    "S3CredentialSource::environment()",
                    "AWS-style access key variables.",
                  ],
                  [
                    "Shared profile",
                    "S3CredentialSource::shared_profile(name)",
                    "Named AWS shared credentials/config profile.",
                  ],
                  [
                    "Static key",
                    "S3CredentialSource::access_key(id, secret)",
                    "Explicit long-lived credentials supplied by the application.",
                  ],
                  [
                    "Session",
                    "S3CredentialSource::session(id, secret, token)",
                    "Explicit temporary credentials.",
                  ],
                ],
              },
              code: `let provider = CloudProviderConfig::aws_s3(
    "application-data",
    "us-east-1",
)
.with_s3_credentials(S3CredentialSource::environment())?;

let options =
    OpenOptions::cloud("./cache", provider, "databases/orders").build()?;`,
            },
            {
              id: "s3-compatible",
              title: "S3-compatible storage",
              paragraphs: [
                "Use an s3_compatible constructor for a custom endpoint. These providers default to path-style requests and should use static, environment, or shared-profile credentials so they do not contact AWS role or metadata endpoints.",
              ],
              table: {
                headers: ["Constructor", "Credentials", "Configuration"],
                rows: [
                  [
                    "s3_compatible_env(bucket, endpoint)",
                    "AWS-style environment variables",
                    "us-east-1 and path-style addressing by default.",
                  ],
                  [
                    "s3_compatible_static(bucket, endpoint, id, secret)",
                    "Explicit access key pair",
                    "us-east-1 and path-style addressing by default.",
                  ],
                  [
                    "s3_compatible(bucket, region, endpoint, id, secret)",
                    "Explicit access key pair",
                    "Explicit signing region and path-style addressing.",
                  ],
                ],
              },
              code: `let provider = CloudProviderConfig::s3_compatible_env(
    "application-data",
    "https://objects.example.com",
)
.with_s3_region("us-east-1")?
.with_path_style(true)?;

let options =
    OpenOptions::cloud("./cache", provider, "databases/orders").build()?;`,
            },
            {
              id: "azure-blob",
              title: "Azure Blob Storage",
              paragraphs: [
                "azure_blob uses Midge’s lightweight Azure identity chain. AzureCredentialSource also supports storage environment variables, an Entra client secret, workload identity, managed identity, a shared key, SAS, or a connection string.",
              ],
              table: {
                headers: ["Credential source", "Constructor"],
                rows: [
                  ["Default chain", "AzureCredentialSource::default_chain()"],
                  [
                    "Storage environment",
                    "AzureCredentialSource::storage_environment()",
                  ],
                  [
                    "Environment client secret",
                    "AzureCredentialSource::environment_client_secret()",
                  ],
                  [
                    "Workload identity",
                    "AzureCredentialSource::workload_identity()",
                  ],
                  [
                    "Managed identity",
                    "AzureCredentialSource::managed_identity()",
                  ],
                  [
                    "Shared key",
                    "AzureCredentialSource::shared_key(account_key)",
                  ],
                  ["SAS", "AzureCredentialSource::sas_token(token)"],
                  [
                    "Connection string",
                    "AzureCredentialSource::connection_string(value)",
                  ],
                ],
              },
              code: `let provider = CloudProviderConfig::azure_blob(
    "storage-account",
    "application-data",
)
.with_azure_credentials(
    AzureCredentialSource::workload_identity(),
)?;

let options =
    OpenOptions::cloud("./cache", provider, "databases/orders").build()?;`,
            },
            {
              id: "google-cloud-storage",
              title: "Google Cloud Storage",
              paragraphs: [
                "gcs uses Application Default Credentials with the JSON API. GCS also supports a service-account file, authorized-user file, metadata server, bearer token, or HMAC credentials. HMAC selects the XML API.",
              ],
              table: {
                headers: ["Credential source", "Constructor"],
                rows: [
                  [
                    "Application Default Credentials",
                    "GcsCredentialSource::application_default()",
                  ],
                  [
                    "Service-account JSON",
                    "GcsCredentialSource::service_account_json_file(path)",
                  ],
                  [
                    "Authorized-user JSON",
                    "GcsCredentialSource::authorized_user_json_file(path)",
                  ],
                  ["Metadata server", "GcsCredentialSource::metadata_server()"],
                  ["Bearer token", "GcsCredentialSource::bearer_token(token)"],
                  ["HMAC key", "GcsCredentialSource::hmac_key(id, secret)"],
                ],
              },
              code: `let provider = CloudProviderConfig::gcs(
    "application-data",
)
.with_gcs_project_id("my-project")?
.with_gcs_credentials(
    GcsCredentialSource::application_default(),
)?;

let options =
    OpenOptions::cloud("./cache", provider, "databases/orders").build()?;`,
            },
            {
              id: "endpoint-overrides",
              title: "Endpoint and emulator overrides",
              paragraphs: [
                "with_endpoint is available for S3-compatible, Azure Blob, and GCS configurations. AWS S3 rejects endpoint overrides; use an S3-compatible constructor instead. Midge also provides sqrzl_s3, sqrzl_azure, and sqrzl_gcs constructors for the local Sqrzl emulator.",
              ],
              code: `let azure = CloudProviderConfig::azure_blob(
    "dev-account",
    "application-data",
)
.with_endpoint("http://127.0.0.1:10000")?;

let local_s3 = CloudProviderConfig::sqrzl_s3("application-data");
let local_azure = CloudProviderConfig::sqrzl_azure("application-data");
let local_gcs = CloudProviderConfig::sqrzl_gcs("application-data");`,
            },
            {
              id: "cloud-commits",
              title: "Choose the cloud commit boundary",
              paragraphs: [
                "Cloud-backed engines reject sync and buffered because those are local-only policies. cloud_async returns after local visibility and cloud-runtime acceptance. cloud_strict forces the covering WAL segment to seal, rotate, upload, and acknowledge before commit returns. best_effort skips WAL and remains reload-only until an explicit flush publishes SST state.",
              ],
              table: {
                headers: ["WriteOptions", "Acknowledgement boundary"],
                rows: [
                  [
                    "cloud_async()",
                    "Local visibility plus asynchronous cloud durability.",
                  ],
                  [
                    "cloud_strict()",
                    "Covering cloud WAL upload has completed.",
                  ],
                  [
                    "best_effort()",
                    "Memtable visibility only; data can be lost before flush.",
                  ],
                ],
              },
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"order:1".to_vec(), payload, None)?;
tx.commit(WriteOptions::cloud_strict())?;`,
              callout: {
                title: "Match policy to storage",
                body: "Use cloud_async or cloud_strict only with cloud-backed storage. Use sync or buffered only with local storage.",
              },
            },
            {
              id: "recovery-and-ownership",
              title: "Recovery and ownership",
              paragraphs: [
                "The most important test for a cloud-backed deployment is the one that is easiest to skip: delete the local cache directory and confirm the engine still recovers from provider objects alone. Until that passes, you have not proven the remote copy is sufficient — you have only proven the local cache works.",
                "Run that test with the real provider and the exact feature flag you deploy with. CloudSimulated exercises the same code path against the local filesystem, which makes it excellent for deterministic tests and useless for qualifying a provider's IAM policy, quotas, or network behavior.",
                "The rest is deployment hygiene, and each item below has a specific failure it prevents. Keep RecoveryPolicy::Strict for the normal open path; Salvage is a deliberate operator decision for investigating a store that Strict already refused, not a fallback to leave configured.",
              ],
              table: {
                headers: ["Practice", "What it prevents"],
                rows: [
                  [
                    "One writer per prefix",
                    "Two engines racing on the same objects; the single-writer lease fences the second, but only if you noticed it exists.",
                  ],
                  [
                    "Record provider and prefix in deployment config",
                    "A redeploy silently pointing at a new, empty prefix and appearing to lose all data.",
                  ],
                  [
                    "Bound the local cache volume",
                    "The cache filling the disk and surfacing as MidgeError::NoSpace on commit.",
                  ],
                  [
                    "Test recovery from an empty cache",
                    "Discovering during an incident that objects were never sufficient on their own.",
                  ],
                  [
                    "Match commit policy to durability requirements",
                    "Assuming cloud_async() writes survived a cache loss when the upload had not finished.",
                  ],
                ],
              },
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
          path: "metrics",
          title: "Metrics and Reports",
          description:
            "Inspect runtime, storage, recovery, cache, compaction, and verification signals.",
          contract:
            "Midge exposes four read-only snapshot calls — get_runtime_metrics, get_storage_layout, get_recovery_metrics, and get_read_amp_metrics — plus a non-mutating integrity pass (engine.verify_storage on an open Engine, or the static Engine::verify_path used by the midge CLI) that checks the manifest, SSTs, and WAL against their own recorded checksums and sizes.",
          practice:
            "An operator polls get_runtime_metrics for health and write-stall state during normal operation, reads get_recovery_metrics once right after Engine::open() to see what the last restart replayed, watches get_storage_layout and get_read_amp_metrics when compaction or read latency needs explaining, and runs verify_storage or midge verify out of band to confirm every published SST and the WAL still checksum cleanly.",
          boundary:
            "These calls report what Midge already knows about its own files and counters; they do not export anywhere, schedule verification runs, or repair corruption they find — the application's own tracing subscriber and monitoring stack own collection, alerting, and remediation, and several counters described here stay at zero unless an internal collector this crate keeps private has been started in-process.",
          keywords: ["metrics", "report", "observability"],
          content: [
            {
              id: "runtime-metrics",
              title: "Runtime metrics",
              paragraphs: [
                "get_runtime_metrics() sends a request to Midge's single runtime actor thread and returns one RuntimeMetricsSnapshot built from that thread's own state, so every field reflects the same instant rather than a value that could tear across a concurrent writer. health carries one EngineHealth value, and get_storage_layout() and verify_storage() report health the same way.",
                "The fields split into two groups, and the difference matters more than any individual name. State fields are read straight from runtime state and are always current: health and current_sequence, the manifest checkpoint position, the WAL position fields (wal_pending_writes, wal_local_durable_seq, wal_cloud_durable_seq and their siblings), the memtable and compaction backlog (active_memtables, immutable_memtables, total_memtable_bytes, pending_compactions, active_compactions), and the snapshot and footprint fields (active_snapshots, pinned_ssts, oldest_snapshot_age_seconds, sst_count, sst_bytes).",
                "Cumulative counters are different. The WAL append/fsync timings, the compaction counters (compactions_run, compaction_bytes_rewritten, compaction_failures), the write-stall breakdown by cause (write_stalls_memory_total, write_stalls_compaction_total, write_stalls_cloud_total, write_stalls_no_space_total), and the cache and write-conflict counters all route through an internal telemetry collector. Read the callout below before you build an alert on any of them.",
                "For logs, Midge instruments its engine, runtime, and lease code with the tracing crate but installs no subscriber of its own — nothing prints until your application sets one up. The optional telemetry and telemetry-otlp Cargo features add OpenTelemetry export to that same setup, but turning either on does not by itself make the counters above nonzero.",
              ],
              table: {
                headers: ["EngineHealth variant", "Reported when"],
                rows: [
                  [
                    "Healthy",
                    "No salvage-mode open, no active hard write stall, no persistence anomaly, no pending replayed intents, and no orphan SST files on disk.",
                  ],
                  [
                    "Degraded",
                    "A persistence anomaly was detected, or intents replayed at startup are still pending, or the SST directory holds files the manifest does not publish.",
                  ],
                  [
                    "SalvageMode",
                    "The engine opened under RecoveryPolicy::Salvage after WAL or manifest recovery could not fully validate under RecoveryPolicy::Strict.",
                  ],
                  [
                    "WriteStalled",
                    "A hard write stall is currently applying backpressure to new writes.",
                  ],
                  [
                    "Corrupt",
                    "Defined for exhaustive matches — the midge CLI's exit-code mapping accounts for it — but not assigned by this crate's own health classifier; a checksum or size failure surfaces as an Err from verify_storage / verify_path instead of a Corrupt value.",
                  ],
                ],
              },
              callout: {
                title:
                  "Several counters can read zero while the activity they describe is happening",
                body: "Compaction, write-stall-by-cause, cache, write-conflict, and per-operation WAL timing counters all route through crate::telemetry::Telemetry, a collector this crate keeps private. No method on Engine or OpenOptions starts it, and the only call site in this repository is a doc-hidden benchmark hook. Treat write_stalled (a plain bool) and health (EngineHealth::WriteStalled) as the reliable signals for whether a stall is happening right now; the write_stalls_* breakdown by cause, and the compaction, cache, and conflict counters next to it, are only trustworthy once that collector is running in your process.",
              },
              code: 'let metrics = engine.get_runtime_metrics()?;\nmatch metrics.health {\n    EngineHealth::Healthy => {}\n    EngineHealth::WriteStalled => tracing::warn!(\n        pending_writes = metrics.wal_pending_writes,\n        "midge is applying write backpressure"\n    ),\n    EngineHealth::Degraded | EngineHealth::SalvageMode => {\n        tracing::warn!(health = ?metrics.health, "midge opened in a degraded state");\n    }\n    EngineHealth::Corrupt => unreachable!("the runtime health classifier never assigns Corrupt"),\n}',
            },
            {
              id: "storage-metrics",
              title: "Storage metrics",
              paragraphs: [
                'get_storage_layout() answers "what is actually on disk right now". It returns the manifest\'s view of every published SST, rolled up per LSM level with the individual file rows underneath, plus the compaction backlog, the residue scan (orphan and .sst.tmp files the manifest does not publish), and every currently pinned snapshot. Reach for it when compaction seems stuck, when disk usage does not match expectations, or when health reports Degraded and you want to see which files caused it.',
                "One naming trap: pending_compactions, compacting_ssts, and active_snapshots appear on both snapshots. Here they are name lists; on RuntimeMetricsSnapshot they are counts.",
                'get_read_amp_metrics() answers "why are reads slow", and unlike the runtime counters it needs no collector — every SST scan records itself, so these numbers are live from the moment the engine opens. reads_total, ssts_touched_total, l0_ssts_touched_total, and blocks_read_total are the raw totals; the avg_* fields divide them by reads_total, and l0_overlap_rate is the share of touched SSTs that came from L0. The two most actionable fields are sst_budget_violation_rate and block_budget_violation_rate: the share of reads that exceeded Midge\'s fixed budgets of 5 SSTs or 20 data blocks in a single operation. A rising violation rate is the signal that compaction is falling behind reads.',
              ],
              table: {
                headers: ["StorageLayoutSnapshot field", "Reports"],
                rows: [
                  [
                    "levels[].level, file_count, total_bytes",
                    "SST count and total size for one LSM level.",
                  ],
                  [
                    "levels[].files[]",
                    "Per-SST detail: name, cf_id, size_bytes, smallest_key/largest_key, smallest_seq/largest_seq.",
                  ],
                  [
                    "pending_compactions",
                    "Compaction tasks queued but not yet running.",
                  ],
                  [
                    "compacting_ssts",
                    "Names of SSTs currently locked into an in-flight compaction job.",
                  ],
                  [
                    "obsolete_files",
                    "Orphan or .sst.tmp files on disk that the manifest does not publish.",
                  ],
                  [
                    "active_snapshots",
                    "Every pinned snapshot: snapshot_id, sequence, age_seconds, ref_count.",
                  ],
                  [
                    "manifest_last_persisted_sequence, manifest_next_wal_seq",
                    "The manifest's durable checkpoint position and the WAL sequence it expects next.",
                  ],
                ],
              },
              code: 'let layout = engine.get_storage_layout()?;\nfor level in &layout.levels {\n    println!("L{} files={} bytes={}", level.level, level.file_count, level.total_bytes);\n}\nif !layout.obsolete_files.is_empty() {\n    tracing::warn!(count = layout.obsolete_files.len(), "unpublished SST files on disk");\n}\n\nlet read_amp = engine.get_read_amp_metrics()?;\nif read_amp.sst_budget_violation_rate > 0.1 {\n    tracing::warn!(\n        rate = read_amp.sst_budget_violation_rate,\n        "reads are touching more than 5 SSTs too often; consider compacting"\n    );\n}',
            },
            {
              id: "recovery-reports",
              title: "Recovery reports",
              paragraphs: [
                "get_recovery_metrics() returns a RecoveryMetricsSnapshot with four counters, and each one is set exactly once — during the replay Engine::open() runs before it hands back a usable engine — and never changes again for the life of that engine handle. wal_recovery_records_replayed and wal_recovery_bytes_replayed count the WAL records and bytes replayed into memtables while runtime state was rebuilt. intent_log_replay_runs and intent_log_entries_replayed cover a second, separate pass: replay_intent_log() recovers interrupted manifest or durability changes, only runs when the on-disk intent log is non-empty, and is only ever invoked from Engine startup, never mid-session — so intent_log_replay_runs is always 0 or 1 for a given open.",
                "RecoveryPolicy controls how strict that whole startup replay is. Strict, the default, fails Engine::open() outright if WAL, manifest, or intent-log recovery cannot establish a trustworthy state. Salvage keeps the legacy best-effort behavior and can open successfully in EngineHealth::SalvageMode instead of failing.",
              ],
              table: {
                headers: ["RecoveryMetricsSnapshot field", "Reports"],
                rows: [
                  [
                    "wal_recovery_records_replayed",
                    "WAL records replayed into memtables while Engine::open() rebuilt runtime state.",
                  ],
                  [
                    "wal_recovery_bytes_replayed",
                    "Bytes of WAL payload covered by that same replay pass.",
                  ],
                  [
                    "intent_log_replay_runs",
                    "Always 0 or 1 — set to 1 only if the on-disk intent log was non-empty at open and got replayed.",
                  ],
                  [
                    "intent_log_entries_replayed",
                    "Number of intent-log entries applied during that single run.",
                  ],
                ],
              },
              callout: {
                title: "Read it once, right after open",
                body: "Every field on this snapshot is fixed at startup, so polling get_recovery_metrics() later in the process just re-reads the same four numbers. Capture it once, immediately after Engine::open() succeeds, if startup replay volume needs to reach your own logs or an open-time health check.",
              },
              code: 'let engine = Engine::open(options)?;\nlet recovery = engine.get_recovery_metrics()?;\nif recovery.wal_recovery_records_replayed > 0 || recovery.intent_log_entries_replayed > 0 {\n    tracing::info!(\n        wal_records = recovery.wal_recovery_records_replayed,\n        wal_bytes = recovery.wal_recovery_bytes_replayed,\n        intent_entries = recovery.intent_log_entries_replayed,\n        "midge replayed durable state on open"\n    );\n}',
            },
            {
              id: "verification-reports",
              title: "Verification reports",
              paragraphs: [
                "Midge exposes two non-mutating entry points into the same integrity pass. Engine::verify_path(path) is a static method that opens a storage directory read-only under RecoveryPolicy::Strict with no runtime at all — it backs the midge verify CLI, which prints one line of key=value pairs by default or a JSON object with --json. engine.verify_storage(timeout) runs on an already-open Engine: it first captures the current health, then acquires a runtime verification barrier so a concurrent compaction cannot delete an SST out from under the scan, then runs the check on a background thread. It returns a NotSupported error immediately for an in-memory engine, and a Timeout error if the barrier cannot be acquired, or the deadline elapses, before the pass returns.",
                "For every SST the manifest publishes, verification confirms the on-disk file length matches the manifest's recorded size_bytes, recomputes a CRC32C over the whole file and compares it to the manifest's stored content_crc32c, then opens the SST and calls verify_all_blocks() to checksum every individual data block. Any one of those three checks failing returns an Err — a size mismatch, a content CRC mismatch, or a block checksum failure — rather than a Corrupt health value inside a returned report; the runtime's own health classifier never assigns EngineHealth::Corrupt, so a returned Ok report always carries Healthy, Degraded, SalvageMode, or WriteStalled.",
                "midge verify exits 0 for Healthy, 2 for Corrupt, and 1 for Degraded, SalvageMode, or WriteStalled — pair that exit code with an outright checksum-failure Err (which fails the command with its own message) rather than assuming a nonzero exit always means a Corrupt health field in the report.",
              ],
              table: {
                headers: ["StorageVerificationReport field", "Reports"],
                rows: [
                  ["manifest_epoch", "Highest manifest edit id observed."],
                  [
                    "manifest_files_verified, sst_files_verified",
                    "Count of manifest-published SSTs whose length, content CRC32C, and every data block all checked out.",
                  ],
                  [
                    "bytes_verified",
                    "SST bytes read plus decoded WAL payload bytes.",
                  ],
                  [
                    "data_blocks_verified",
                    "Checksummed SST data blocks decoded.",
                  ],
                  [
                    "wal_boundary",
                    "Highest sequence found in the WAL, or None if it held no records.",
                  ],
                  [
                    "wal_recovery_records_replayed, wal_recovery_bytes_replayed",
                    "This pass's own WAL replay counts — separate from the startup counters get_recovery_metrics reports.",
                  ],
                  [
                    "intent_entries_loaded",
                    "Intent-log entries loaded while assembling the report.",
                  ],
                  [
                    "authoritative",
                    "true for a directly verified local directory; verify_storage sets it false when the engine is cloud-backed, since the pass reads the local cache rather than the cloud objects.",
                  ],
                  ["health", "The EngineHealth for the verified state."],
                ],
              },
              callout: {
                title: "A timed-out call still finishes safely",
                body: "verify_storage's timeout covers health capture, barrier acquisition, the storage pass, and barrier release together. If the storage pass is still running when the deadline passes, the call returns a Timeout error to the caller, but a background verifier keeps the barrier and finishes the pass anyway before releasing it — a timed-out call does not leave compaction blocked behind an abandoned barrier.",
              },
              code: "$ midge verify ./data\nhealth=Healthy authoritative=true manifest_epoch=42 manifest_files_verified=118 sst_files_verified=118 bytes_verified=88473600 data_blocks_verified=5392 wal_boundary=Some(190441) wal_recovery_records_replayed=612 wal_recovery_bytes_replayed=401920 intent_entries_loaded=0\n$ echo $?\n0",
            },
          ],
        },
        {
          path: "resource-controls",
          title: "Resource Controls",
          description:
            "Bound memory, transactions, cache, compaction, storage I/O, and shutdown work.",
          contract:
            "Resource Controls documents how Midge turns a Goal, a MemoryBudget, and a WorkloadProfile into concrete byte allocations for the transaction pool, memtables, and block cache, plus the derived L0 compaction trigger and the storage I/O and shutdown timeouts that bound blocking work.",
          practice:
            "An application sets MemoryBudget, Goal, and WorkloadProfile once at open time, can read the derived pool, memtable, cache, and compaction-trigger values back off OpenOptions to log or assert them, and later calls Engine::shutdown with a Duration chosen at that call site, retrying on Busy or Timeout after releasing active transactions or clearing blocked storage I/O.",
          boundary:
            "None of these settings cap how many transactions can be open or how many operations one transaction stages; only the shared transaction memory pool, and its disk spill path on local or cloud storage, constrains that. Midge does not pick its own shutdown deadline or retry on the caller's behalf.",
          keywords: ["memory", "limits", "timeout"],
          content: [
            {
              id: "memory-budgets",
              title: "Memory budgets",
              paragraphs: [
                "MemoryBudget::Auto is not a fixed number until Midge measures the host. It reads total memory via sysinfo, and on Linux also reads the cgroup limit — cgroup v2's /sys/fs/cgroup/memory.max first, falling back to cgroup v1's memory.limit_in_bytes — then takes whichever of the two values is smaller as the effective limit. The total budget is roughly half of that effective limit, floored at 64 MiB once the effective limit reaches 128 MiB, or at 1 MiB below that. If neither host memory nor a cgroup limit can be read at all, Auto falls back to a fixed 512 MiB budget instead of a fraction of anything measured.",
                "Whatever the total budget turns out to be — from Auto or from an explicit MemoryBudget::Bytes(n) — Midge divides it in a fixed order: the transaction memory pool takes its share first (see Transaction limits), the memtable size is derived from Goal and WorkloadProfile and clamped to leave room for two memtable generations, and the block cache receives everything left over.",
                "The memtable base size depends only on Goal: 64 MiB for Latency, 256 MiB for Throughput, 32 MiB for Economy. WorkloadProfile then adjusts that base before it is clamped to the available budget: WriteHeavy doubles it, ReadMostly halves it, and Mixed, RangeScan, and TtlHeavy leave it unchanged. The block cache is what remains after subtracting the pool and two memtable generations — the active memtable plus one additional generation reserved while it flushes to disk — and Economy additionally caps the cache at 256 MiB even when more budget is left over.",
                "For example, a fixed 640 MiB budget puts a constant 64 MiB (10%) into the transaction pool regardless of Goal, then splits the remainder between memtable and cache as follows, assuming the default Mixed workload:",
              ],
              table: {
                headers: [
                  "Goal",
                  "Base memtable (Mixed workload)",
                  "Derived memtable size",
                  "Derived block cache",
                ],
                rows: [
                  ["Latency", "64 MiB", "64 MiB", "448 MiB"],
                  ["Throughput", "256 MiB", "256 MiB", "64 MiB"],
                  [
                    "Economy",
                    "32 MiB",
                    "32 MiB",
                    "256 MiB (capped from 512 MiB)",
                  ],
                ],
              },
              code: 'let opts = OpenOptions::local("./data")\n    .goal(Goal::Throughput)\n    .memory_budget(MemoryBudget::Bytes(640 * 1024 * 1024))\n    .build()?;\n\nassert_eq!(opts.transaction_memory_pool_size(), 64 * 1024 * 1024);\nassert_eq!(opts.memtable_size_limit(), 256 * 1024 * 1024);\nassert_eq!(opts.block_cache_size(), 64 * 1024 * 1024);',
              callout: {
                title: "Auto's fallback is a constant, not a measurement",
                body: "512 MiB only applies when sysinfo cannot read host memory and, on Linux, neither cgroup v2 nor v1 exposes a limit. It is not derived from anything on the host, so an application running where that detection might fail should set MemoryBudget::Bytes explicitly rather than rely on Auto.",
              },
            },
            {
              id: "transaction-limits",
              title: "Transaction limits",
              paragraphs: [
                "The transaction memory pool defaults to one tenth of the total memory budget (total_memory / 10) and can be overridden with .transaction_memory_pool_size(bytes). build() rejects an override larger than the total budget with MidgeError::ResourceLimit, and rejects a pool that leaves no room for even one byte of memtable with the same error.",
                "The pool is one allocation shared by every transaction the engine has open, not a per-transaction budget. Each staged put, insert, delete, or delete_range reserves the struct size of its entry plus its key/value heap bytes plus a fixed 256-byte accounting overhead — covering the resident Vec capacity, ordinal, sparse-key, and range interval-tree metadata Midge builds when it freezes a spilled run — against that single shared capacity.",
                "What happens when the pool is full depends on storage. For local and cloud-backed engines, a transaction whose next operation cannot be admitted first spills its already-resident operations to a CRC-framed run file on disk, releasing their pool bytes, and retries the reservation; if it still does not fit, the new operation is written directly as its own run instead of blocking. For an in-memory-only engine there is no spill directory, so an operation the pool cannot admit fails immediately with MidgeError::ResourceLimit.",
                "There is no explicit cap on how many transactions can be open at once or how many operations a single transaction can stage. Both are unbounded except for this shared pool: any number of concurrent transactions, or any number of operations in one transaction, is fine as long as their combined resident bytes fit the pool or — on local and cloud storage — spill to disk.",
              ],
              table: {
                headers: ["Aspect", "Behavior"],
                rows: [
                  [
                    "Default size",
                    "total_memory / 10; override with .transaction_memory_pool_size(bytes)",
                  ],
                  [
                    "Scope",
                    "One pool shared by every open transaction, not a per-transaction limit",
                  ],
                  [
                    "Accounting unit",
                    "Entry struct size + key/value heap bytes + 256-byte fixed overhead, per staged operation",
                  ],
                  [
                    "Local or cloud storage",
                    "Pool exhaustion spills that transaction's resident operations to disk and retries",
                  ],
                  [
                    "In-memory storage",
                    "Pool exhaustion fails the operation immediately with MidgeError::ResourceLimit",
                  ],
                  [
                    "Concurrent transactions / ops per transaction",
                    "No explicit count-based cap — bounded only by shared pool capacity (or disk, once spilled)",
                  ],
                ],
              },
              code: "let opts = OpenOptions::in_memory()\n    .memory_budget(MemoryBudget::Bytes(512 * 1024 * 1024))\n    .transaction_memory_pool_size(64 * 1024 * 1024)\n    .build()?;\n\nassert_eq!(opts.transaction_memory_pool_size(), 64 * 1024 * 1024);\n\n// An override larger than the total budget fails at build() time.\nlet err = OpenOptions::in_memory()\n    .memory_budget(MemoryBudget::Bytes(1024))\n    .transaction_memory_pool_size(2048)\n    .build()\n    .unwrap_err();",
            },
            {
              id: "background-work",
              title: "Background work",
              paragraphs: [
                ".background_compaction(enabled) defaults to true and toggles only the runtime's own automatic scheduler: with it on, the compaction actor checks L0 file counts after mutations and schedules a compaction plan itself. Setting it to false stops that automatic scheduling but does not remove compaction capability — Engine::compact_all() still schedules a full compaction pass and blocks until it completes, independent of the flag.",
                "The L0 file count that triggers a compaction — l0_compaction_trigger — is derived from Goal and WorkloadProfile, not set directly. Goal::Latency always resolves to 3 regardless of workload, because latency sensitivity overrides the write-heavy multiplier; WriteHeavy resolves to 8 under either Throughput or Economy; a Throughput goal with any other workload resolves to 6; everything else resolves to 4.",
                "Background compaction, when enabled, runs its active job on its own worker thread. Shutdown cancels and joins that worker before the runtime reports its workers exited, so an in-progress background compaction is part of what a graceful Engine::shutdown(timeout) call waits on, not something it can leave running.",
              ],
              table: {
                headers: ["Goal", "Workload", "l0_compaction_trigger"],
                rows: [
                  ["Latency", "any", "3"],
                  ["Throughput or Economy", "WriteHeavy", "8"],
                  [
                    "Throughput",
                    "Mixed, ReadMostly, RangeScan, or TtlHeavy",
                    "6",
                  ],
                  ["Economy", "Mixed, ReadMostly, RangeScan, or TtlHeavy", "4"],
                ],
              },
              code: 'let opts = OpenOptions::local("./data")\n    .goal(Goal::Latency)\n    .workload(WorkloadProfile::WriteHeavy)\n    .background_compaction(false)\n    .build()?;\n\nassert_eq!(opts.l0_compaction_trigger(), 3);\n\nlet engine = Engine::open(opts)?;\n// Automatic scheduling is off; run a compaction pass on demand instead.\nengine.compact_all()?;',
            },
            {
              id: "storage-and-shutdown-timeouts",
              title: "Storage and shutdown timeouts",
              paragraphs: [
                "storage_io_timeout defaults to 30 seconds and is set once, at open, via .storage_io_timeout(duration). It bounds how long the engine waits for a single append, flush, or sync acknowledgement — local WAL I/O or cloud runtime acceptance — and build() rejects a zero duration with MidgeError::InvalidArgument.",
                "The shutdown deadline is a different thing entirely: Engine::shutdown(&mut self, timeout: Duration) takes its Duration as a call-site argument, not an OpenOptions field. There is no configured default for it — the caller supplies a fresh Duration on every call.",
                "Once shutdown begins, the engine stays in a closing state and rejects new work for the rest of that call. shutdown blocks, up to timeout, for the runtime's workers (including any active background compaction worker) to exit and for a final flush to complete before it returns.",
              ],
              table: {
                headers: ["Result", "Meaning", "Retryable"],
                rows: [
                  [
                    "Ok(())",
                    "Workers exited and the final flush completed inside the deadline",
                    "n/a",
                  ],
                  [
                    "Err(Busy)",
                    "Transactions were still open when shutdown was called",
                    "Yes — release the active transactions, then call shutdown again",
                  ],
                  [
                    "Err(Timeout)",
                    "Workers or fencing cleanup did not finish inside the deadline",
                    "Yes — call shutdown again, typically with more time or after clearing blocked storage I/O",
                  ],
                  [
                    "Err(ResourceLimit)",
                    "The fencing-cleanup worker could not start",
                    "Depends on the underlying resource error",
                  ],
                  [
                    "Other MidgeError",
                    "The runtime's final flush surfaced a durability error",
                    "Depends on the underlying error",
                  ],
                ],
              },
              code: "use std::time::Duration;\n\nmatch engine.shutdown(Duration::from_secs(30)) {\n    Ok(()) => {}\n    Err(MidgeError::Busy(_)) => {\n        // Drop or commit the outstanding transactions, then retry.\n        engine.shutdown(Duration::from_secs(30))?;\n    }\n    Err(err) => return Err(err),\n}",
              callout: {
                title: "Two Duration values, two different scopes",
                body: "storage_io_timeout is fixed in OpenOptions at open and bounds one append, flush, or sync wait. The Duration passed to shutdown() is chosen fresh at each call and bounds the whole graceful-shutdown sequence — worker exit, final flush, and fencing cleanup — not a single I/O operation. Reusing one value for both by habit does not make them the same budget.",
              },
            },
          ],
        },
        {
          path: "migration",
          title: "Migration",
          description:
            "Move Midge data, configuration, and storage providers through a reversible application-owned workflow.",
          contract:
            "Migration is the operator checklist for moving a Midge database across a binary release or a storage provider: preserve a closed copy, prove the target binary against that copy, and only then let it touch the live database.",
          practice:
            "An operator stops writers, calls engine.shutdown(timeout), copies the closed data directory and WAL to a separate path, runs midge verify plus real read/write and restart checks against that copy with the target binary, and rolls the live database forward only once every check and the release's stated rollback position have been read.",
          boundary:
            "There is no schema-version converter or storage-backend mover inside Midge; format-version rejection, rollback support, and cloud provider qualification are each stated per release, not guaranteed by the engine, and restoring the preserved copy -- not an in-engine undo -- is what backs out a change that does not qualify.",
          keywords: ["migration", "backup", "rollback"],
          content: [
            {
              id: "plan-the-change",
              title: "Plan the change",
              paragraphs: [
                "Midge does not ship a schema-version converter or a storage-backend mover. Moving to a new release, or moving a database between local and cloud-backed storage, is an application-owned procedure that follows this checklist -- it is not a command that performs the move for you.",
                "Start with the target release's notes and its rollback statement. The release policy requires every release note to state exactly one of three positions before a release candidate can be promoted, and the plan should record which one applies before any binary changes.",
                "Also read the format compatibility policy for the target version. Midge tracks compatibility across four persistent formats: WAL frames and records, manifest files and the manifest journal, the intent-log persistence format, and SST file layout with its footer and version identifiers. Before Midge reaches 1.0 there is no blanket promise that any of them stay readable across a release; any format movement has to be called out in the changelog and the migration note for that release.",
                "That gap is not hypothetical. Every database directory carries a FORMAT marker with a single version number -- 2 in the current release -- and Engine::open already rejects any other value with a CompatibilityError. There is no in-engine path from an older marker to a newer one, so a release that bumps the marker is exactly the change this checklist exists to cover.",
                "If the plan is to abandon a database outright rather than carry it forward, treat that as a different procedure: stop its users, preserve any evidence needed, and rebuild the database from the application's source of truth. That is not the copy-test-roll-forward sequence below.",
              ],
              table: {
                headers: ["Release note states", "What the plan should assume"],
                rows: [
                  [
                    "Rollback supported",
                    "The previous binary can reopen data written by the new release without a separate restore step.",
                  ],
                  [
                    "Rollback supported with constraints",
                    "Rollback works only under the stated conditions; read the constraint before assuming it applies to this change.",
                  ],
                  [
                    "Rollback unsupported; restore from backup/export only",
                    "Only the preserved backup gets you back to the prior release; there is no supported way for the old binary to open data the new one already wrote.",
                  ],
                ],
              },
            },
            {
              id: "back-up-state",
              title: "Back up state",
              paragraphs: [
                "Stop every writer before touching storage, then call engine.shutdown(timeout) and wait for it to return. A timeout or an error here is an operational event to look into on its own -- dropping the engine instead of shutting it down cleanly is not the same acknowledgement, and it can leave more state for the next open to replay.",
                "Once shutdown returns, copy the entire database directory, including its WAL, to a separate path before anything else changes. That copy is what gets tested against the new binary in the next step, and it is what you restore from if the change does not qualify -- the live directory should never be the first thing the new binary opens.",
              ],
              code: "engine.shutdown(Duration::from_secs(30))?;",
              callout: {
                title: "Do not delete on failure",
                body: "Do not delete a database directory, WAL, manifest, or lock file as a generic recovery step, before or after making this copy. If the shutdown or the copy itself turns up an error, preserve the affected files for diagnosis instead of clearing them.",
              },
            },
            {
              id: "apply-the-migration",
              title: "Apply the migration",
              paragraphs: [
                "Install the new binary and point it at the preserved copy first, never at the live directory. Run midge verify against the copy before opening it for reads or writes.",
                "The report also carries manifest_epoch, manifest_files_verified, sst_files_verified, bytes_verified, data_blocks_verified, wal_boundary, wal_recovery_records_replayed, wal_recovery_bytes_replayed, and intent_entries_loaded. Keep the JSON output next to the migration note -- it is the qualification evidence the release policy asks for, not a log line to discard.",
                "After verify passes, open the copy with the new binary using RecoveryPolicy::Strict, run the application's normal reads and writes against it, shut it down, and open it a second time to confirm restart recovery. If the change touches cloud-backed storage, repeat the check with the exact provider feature and CloudProviderConfig intended for the change; CloudSimulated exercises the cloud storage model against the local filesystem and is suitable for deterministic tests, not for provider qualification.",
                "A CompatibilityError from either midge verify or Engine::open means the target binary cannot read this on-disk format at all. It is a distinct error class from Corruption, and no amount of retrying the same binary against the same copy changes that result.",
              ],
              code: "midge verify --json ./data.migration-backup",
              table: {
                headers: [
                  "EngineHealth",
                  "Exit code",
                  "What it means for the copy",
                ],
                rows: [
                  [
                    "Healthy",
                    "0",
                    "The copy opened cleanly; move on to the read/write and restart checks.",
                  ],
                  [
                    "Degraded",
                    "1",
                    "The copy is open but running in a reduced state; read the report before continuing.",
                  ],
                  [
                    "SalvageMode",
                    "1",
                    "Recovery kept a valid prefix instead of failing open; treat this as a finding, not a pass.",
                  ],
                  [
                    "WriteStalled",
                    "1",
                    "The copy reports write backpressure, not a compatibility problem by itself; look into it separately.",
                  ],
                  [
                    "Corrupt",
                    "2",
                    "The copy failed verification; do not roll the live database forward onto this binary.",
                  ],
                ],
              },
            },
            {
              id: "verify-or-roll-back",
              title: "Verify or roll back",
              paragraphs: [
                "Move the new binary onto the live database only after every copy-based check has passed: midge verify reports Healthy, ordinary reads and writes behave as expected, a shutdown-and-reopen cycle recovers cleanly, and any required cloud qualification has run against the real provider feature set. That ordering is the entire point of the workflow -- the live directory is never the first thing the new binary opens.",
                "Whether you can go back afterward is a per-release fact, not a Midge guarantee. The release policy requires every release note to state one of the same three rollback positions used during planning, and that statement -- not this page -- is the authority on whether the previous binary can reopen data written by the new one.",
                "When the statement is anything other than unconditional rollback support, the preserved copy from the backup step is the rollback path: stop the new binary, restore the copied directory and WAL onto the database path, and reopen it with the prior binary. Run midge verify against the restored copy before letting writers resume.",
              ],
              callout: {
                title: "No default downgrade path",
                body: "Before Midge reaches 1.0 there is no blanket guarantee that an older binary can open data written by a newer one. Where rollback is unsupported, restoring the preserved backup is the documented way back -- there is no export, import, or downgrade command that does it automatically.",
              },
            },
          ],
        },
        {
          path: "performance-tuning",
          title: "Performance Tuning",
          description:
            "Tune workload goals, memory, cache, memtables, compaction, and storage without hiding durability tradeoffs.",
          contract:
            "Performance tuning starts from Goal, MemoryBudget, and WorkloadProfile, which OpenOptions::build() resolves into block size, memtable size, WAL buffer size, compaction trigger, and compression policy once at open time.",
          practice:
            "Measure the workload that matters with the tiered cntryl-stress benches, compare against a saved baseline on the same machine, and add a narrow runtime override only when that measurement shows the derived defaults are wrong for the workload.",
          boundary:
            "Tuning never changes what a durability policy guarantees at commit; sync, buffered, and best_effort stay separate contracts, and confirming a change survives restart is a recovery check, not a benchmark number.",
          keywords: ["tuning", "cache", "compaction"],
          content: [
            {
              id: "measure-the-workload",
              title: "Measure the workload",
              paragraphs: [
                "Midge makes no universal latency or throughput promise. Every number depends on data shape, hardware, workload mix, storage mode, cache warmth, compaction state, and the durability policy chosen at commit. Measure the workload that matters and record the command, feature flags, dataset, and observed variance alongside the result, or the number cannot be reproduced later.",
                "The benchmark suite lives under benches/ and runs through cargo bench using the cntryl-stress harness across four tiers, from hot-path microbenchmarks up to full end-to-end workload runs.",
                "Run one suite directly, filter to a single row, or list the registered rows without running them. Choose --profile smoke for a fast diagnostic pass, lab for longer exploratory runs, or release for the most thorough pass; STRESS_PROFILE sets a default profile for local runs. Every run writes latest.json, latest.md, and latest.txt under target/stress/{suite}/, plus a timestamped copy of each.",
                "A single miss does not by itself prove a regression. Repeat the benchmark on the same machine with the same configuration and compare it against a saved baseline, then apply these investigation thresholds: a Tier 1 microbenchmark regression greater than 5%, a Tier 2 subsystem regression greater than 8-10% (or any failed transaction-latency assertion), a Tier 3 or Tier 4 sustained throughput drop greater than 15%, or p99 latency growth greater than 20%. Prefer at least 3 repeated runs for a normal check and 5 runs before accepting a meaningful Tier 4 change.",
              ],
              table: {
                headers: [
                  "Tier",
                  "What it answers",
                  "Harness mode",
                  "Example target",
                ],
                rows: [
                  [
                    "Tier 1",
                    "One tight hot-path latency question, e.g. a single bloom-filter check",
                    "micro timing",
                    "tier1_hotpath_bloom",
                  ],
                  [
                    "Tier 2",
                    "One subsystem under a fixed batch of operations",
                    "fixed operations",
                    "tier2_subsystem_event_loop",
                  ],
                  [
                    "Tier 3",
                    "System-level engine behavior, including clean open/drop lifecycle over empty state",
                    "fixed duration",
                    "tier3_system_engine",
                  ],
                  [
                    "Tier 4",
                    "End-to-end workloads, recovery after persisted state, and YCSB-style mixes",
                    "fixed duration",
                    "tier4_ycsb_workload_a",
                  ],
                ],
              },
              code: "cargo bench --bench tier1_hotpath_bloom\ncargo bench --bench tier2_subsystem_event_loop -- --workload 'direct_call'\ncargo bench --bench tier4_ycsb_workload_a -- --list\ncargo bench --bench tier4_ycsb_workload_a -- --profile default",
              callout: {
                title: "Durability modes are not comparable",
                body: "sync, buffered, and best_effort measure three different durability contracts, not three speeds of the same contract. A throughput or latency number recorded under one policy cannot be read against a number recorded under another, and a best_effort run should never stand in for a sync or buffered result when a workload change is being evaluated.",
              },
            },
            {
              id: "derived-configuration",
              title: "Derived configuration",
              paragraphs: [
                "OpenOptions::build() resolves Goal, MemoryBudget, and WorkloadProfile into every dependent value once, at open time, instead of asking the caller to size a block cache or a memtable directly. Goal defaults to Latency, MemoryBudget defaults to Auto (roughly half of the effective, cgroup-aware memory limit, or 512 MiB when that cannot be read), and WorkloadProfile defaults to Mixed.",
                "The WAL buffer size is also capped at the total memory budget. The L0 compaction trigger defaults to 3 under Goal::Latency regardless of workload, 6 under Goal::Throughput, and 4 under Goal::Economy, but rises to 8 under Throughput or Economy once WorkloadProfile::WriteHeavy is set; Latency's trigger stays 3 even under WriteHeavy. WorkloadProfile also scales the base memtable size directly: WriteHeavy doubles it and ReadMostly halves it, both still bounded by the memtable ceiling below.",
                "The transaction memory pool defaults to one tenth of the total budget. The remaining memory splits between two memtable generations and the block cache: the memtable ceiling is (total minus transaction pool) divided by two, the memtable size limit is the goal/workload base clamped to that ceiling, and the block cache receives whatever is left after the transaction pool and two memtable generations are subtracted. Under Goal::Economy the block cache is additionally capped at 256 MiB even if more memory is left over.",
              ],
              table: {
                headers: [
                  "Goal",
                  "Block size",
                  "Target SST size",
                  "WAL buffer size",
                  "Base memtable size",
                  "Compression policy",
                ],
                rows: [
                  [
                    "Latency (default)",
                    "16 KiB",
                    "128 MiB",
                    "128 KiB",
                    "64 MiB",
                    "Lz4, fixed",
                  ],
                  [
                    "Throughput",
                    "64 KiB (128 KiB when WorkloadProfile is RangeScan)",
                    "512 MiB",
                    "1 MiB",
                    "256 MiB",
                    "Adaptive across Lz4 and Zstd3, gated by a 0.95 minimum compression ratio and a 256-byte minimum savings threshold",
                  ],
                  [
                    "Economy",
                    "32 KiB",
                    "256 MiB",
                    "256 KiB",
                    "32 MiB",
                    "Zstd9, fixed",
                  ],
                ],
              },
              code: 'use cntryl_midge::{Engine, Goal, MemoryBudget, OpenOptions, WorkloadProfile};\n\nlet opts = OpenOptions::local("./midge-data")\n    .goal(Goal::Throughput)\n    .memory_budget(MemoryBudget::Bytes(2 * 1024 * 1024 * 1024))\n    .workload(WorkloadProfile::WriteHeavy)\n    .build()?;\nlet engine = Engine::open(opts)?;',
            },
            {
              id: "runtime-overrides",
              title: "Runtime overrides",
              paragraphs: [
                "Start from Goal, MemoryBudget, and WorkloadProfile, and add a specific override only once a measured benchmark shows the derived default is wrong for that workload. Every override is still validated against the total memory budget at build() time.",
                "A zero-valued memtable limit, flush threshold, or storage I/O timeout fails build() with an invalid-argument error before the engine opens. An override that cannot coexist with the rest of the budget, such as a memtable size limit or transaction pool that leaves no room for the rest of the derived layout, fails with a resource-limit error instead, so a bad override is caught at open time, not partway through a run.",
                "sync, buffered, best_effort, cloud_async, and cloud_strict are chosen on WriteOptions at each commit, not derived from Goal or MemoryBudget, and WriteOptions has no default constructor so the choice can never be skipped. cloud_async keeps commits local-only and uploads in the background; cloud_strict forces an immediate WAL seal, rotate, and upload, then blocks the commit until that upload finishes.",
              ],
              table: {
                headers: ["Override", "Builder method", "Effect"],
                rows: [
                  [
                    "Memtable size limit",
                    "with_memtable_size_limit(bytes)",
                    "Pins the memtable size instead of the goal/workload base",
                  ],
                  [
                    "Memtable flush threshold",
                    "with_memtable_flush_threshold(bytes)",
                    "Sets the runtime flush point below the size limit; defaults to the size limit itself",
                  ],
                  [
                    "Transaction memory pool",
                    "transaction_memory_pool_size(bytes)",
                    "Pins the shared transaction allocation instead of total_memory / 10",
                  ],
                  [
                    "Block-cache policy",
                    "block_cache_policy(BlockCachePolicy)",
                    "Chooses eviction: Lru (default), TinyLfu for frequency-biased access, or ClockPro for scan-resistant access",
                  ],
                  [
                    "Cloud write policy",
                    "cloud_write_policy(CloudWritePolicy)",
                    "Sets WAL seal thresholds (16 MiB / 500 ms / 10,000 pending writes by default) and the eventual-flush segment gap (128 by default) for cloud-backed storage",
                  ],
                  [
                    "Background compaction",
                    "background_compaction(bool)",
                    "Enables or disables automatic compaction scheduling; enabled by default",
                  ],
                  [
                    "Storage I/O timeout",
                    "storage_io_timeout(Duration)",
                    "Maximum wait for append, flush, and sync acknowledgement; defaults to 30 seconds and rejects a zero duration",
                  ],
                ],
              },
              code: 'use std::time::Duration;\nuse cntryl_midge::{BlockCachePolicy, Goal, OpenOptions};\n\nlet opts = OpenOptions::local("./midge-data")\n    .goal(Goal::Latency)\n    .with_memtable_size_limit(96 * 1024 * 1024)\n    .transaction_memory_pool_size(64 * 1024 * 1024)\n    .block_cache_policy(BlockCachePolicy::TinyLfu)\n    .storage_io_timeout(Duration::from_secs(5))\n    .build()?;',
              callout: {
                title: "best_effort has no crash durability",
                body: "best_effort skips WAL overhead entirely, so any data still in the memtable is lost if the engine crashes before flush_cf() runs. Use it only to load a bulk dataset before a measured run, call flush_cf() once the load finishes, then switch to buffered or sync for the workload that is actually being measured.",
              },
            },
            {
              id: "verify-the-result",
              title: "Verify the result",
              paragraphs: [
                "The Bench GitHub Actions workflow runs every registered benchmark target, but only on manual workflow_dispatch; normal CI compiles benchmark targets through its --all-targets checks without timing them. A tuning change is therefore not verified by CI on its own: rerun the relevant bench locally against a saved baseline before trusting it.",
                "Reports classify every row so the output states the question directly: gate rows are semantically correct, free of blocking diagnostics, and consistent enough across runs to drive regression decisions; diagnostic rows are intentionally tiny or capped and still run and report but never gate a decision; invalid rows carry known-bad semantics or a blocking diagnostic and should not be read at all. A fourth class covers newly added rows that have not yet accumulated enough historical runs to compare against and are excluded from gating until they do. Only gate rows should move a tuning decision.",
                "Confirm the benchmark number and the underlying runtime signal moved together. Check compactions_run and compaction_bytes_rewritten against an intended compaction-trigger change, cache_hits versus cache_misses against a cache-policy change, and the write-stall counters (write_stalls_memory, write_stalls_compaction, write_stalls_cloud, write_stalls_no_space) to see which resource is actually contended before adding caller backpressure.",
                "A benchmark win that costs recoverability is not a win. Confirm the change survives a restart with the durability and recovery integration test and the adopter smoke suite before adopting the new configuration.",
              ],
              code: "cargo bench --bench tier4_system_local_throughput_regression -- --quiet\nBENCH_RUNS=3 cargo bench --bench tier4_system_compaction_backpressure -- --quiet\ncargo test --test durability_recovery\ncargo test --test external_adopter_smoke --features failpoints",
            },
          ],
        },
        {
          path: "troubleshooting",
          title: "Troubleshooting",
          description:
            "Diagnose open, transaction, commit, recovery, cloud, resource, and shutdown failures.",
          contract:
            "Troubleshooting maps every operator-visible Midge failure — a failed open, a rejected commit, a stalled write, a failed or degraded recovery, a cloud triage step, or a shutdown that did not finish — back to the specific MidgeError variant, EngineHealth state, or metrics snapshot that explains it.",
          practice:
            "An operator or application first records the version, options, and the exact error, preserves the database directory untouched, then runs midge verify (or Engine::verify_path) against a copy, reads the runtime, recovery, and storage-layout snapshots, and only then chooses a retry, a backpressure response, RecoveryPolicy::Salvage, or a rebuild from the application's own source of truth.",
          boundary:
            "This page maps errors to causes and to the diagnostic calls Midge exposes. It does not automate repair, and it does not decide for the operator whether a degraded recovery or a rebuild is the right call for a given deployment.",
          keywords: ["diagnostics", "errors"],
          content: [
            {
              id: "open-failures",
              title: "Open failures",
              paragraphs: [
                "Before changing anything, record the Midge version, Rust toolchain, storage mode, the exact OpenOptions used, and the complete error text. Copy the whole database directory — including its wal/ and sst/ subdirectories — somewhere else before you attempt a fix, so the failing state survives whatever you try next.",
                "Confirm only one process owns the path. Midge enforces single-writer exclusivity for a database with a lease; on local storage that lease is backed by a lock file named .midge_leader.lock at the database root. MidgeError::Fenced means this process's lease went stale or another process already holds it — not that a coordinated handoff took place. Stop the competing process, or point each engine instance at its own path.",
                "Engine::open() surfaces environment and format problems directly through MidgeError. The variants below are the ones that show up while opening; commit-time and shutdown-time variants are covered further down this page.",
                'NoSpace is detected automatically, not something the caller has to classify. The From<io::Error> conversion checks raw_os_error for 28 (ENOSPC) or 112, and separately checks the lowercased error text for "no space" or "disk full"; a match becomes MidgeError::NoSpace, and every other IO failure stays MidgeError::Io. Treat a returned NoSpace as the volume being full, not as a bug in Midge\'s own accounting.',
                "CompatibilityError at open time almost always traces to the FORMAT marker file at the database root. Midge writes midge-format-version=2 into that file the first time it creates a database, and on every later open it rejects a directory that already holds persisted state but has no marker, a marker it can't parse, or a version number other than the build's own CURRENT_FORMAT_VERSION. Compare the two version numbers before assuming the data itself is damaged.",
              ],
              table: {
                headers: [
                  "MidgeError variant",
                  "What it means at open",
                  "First check",
                ],
                rows: [
                  [
                    "Io(io::Error)",
                    "An I/O failure that raw_os_error and message matching did not recognize as out-of-space.",
                    "Check path ownership, permissions, and that the parent directory exists.",
                  ],
                  [
                    "InvalidPath",
                    "A database or SST path is not valid UTF-8.",
                    "Use a UTF-8 filesystem path for the database directory.",
                  ],
                  [
                    "NoSpace(String)",
                    'From<io::Error> matched ENOSPC (28), OS code 112, or "no space"/"disk full" in the message.',
                    "Free space on the target volume, or move the path to one with room.",
                  ],
                  [
                    "CompatibilityError(String)",
                    "The FORMAT marker is missing on a directory with existing state, fails to parse, or names a version other than the build's CURRENT_FORMAT_VERSION.",
                    "Compare the FORMAT file contents against the version this build expects.",
                  ],
                  [
                    "Fenced(String)",
                    "The single-writer lease over this path is stale, or another process already holds it.",
                    "Confirm no other process or engine instance targets the same path.",
                  ],
                  [
                    "RecoveryFailed(String)",
                    "RecoveryPolicy::Strict, the default, refused to continue past unrecoverable WAL, manifest, or intent-log state.",
                    "Copy the directory, then read the message and the recovery metrics before considering RecoveryPolicy::Salvage.",
                  ],
                  [
                    "Corruption(String)",
                    "A manifest-referenced SST failed its size or CRC32C check during verification.",
                    "Run midge verify on a copy to identify which file failed.",
                  ],
                ],
              },
              code: "midge verify ./midge-data-copy\nhealth=Healthy authoritative=true manifest_epoch=12 manifest_files_verified=3 sst_files_verified=41 bytes_verified=182933480 data_blocks_verified=5210 wal_boundary=Some(90144) wal_recovery_records_replayed=0 wal_recovery_bytes_replayed=0 intent_entries_loaded=0",
              callout: {
                title: "Never delete your way out of an open failure",
                body: "Don't remove the database directory, the wal/ directory, manifest.json, the FORMAT marker, or .midge_leader.lock as a generic first step. Run midge verify (or Engine::verify_path) against a copy first, record the exact health value and error message, and only then decide between RecoveryPolicy::Salvage and rebuilding the database from the application's own source of truth.",
              },
            },
            {
              id: "transaction-and-commit-failures",
              title: "Transaction and commit failures",
              paragraphs: [
                'Check three things before assuming a commit failure is a bug: whether the transaction is TransactionMode::ReadOnly, whether every key and range you passed is well-formed, and which conflict policy is active. put, insert, and delete on a read-only transaction return MidgeError::InvalidArgument("Cannot write in ReadOnly transaction"); delete_range additionally rejects start_key > end_key with its own InvalidArgument.',
                "Read-write transactions default to ConflictPolicy::LastWriteWins: two overlapping commits can both succeed, and the later commit sequence simply becomes the visible value for subsequent readers. Call tx.set_conflict_policy(ConflictPolicy::AbortOnWriteConflict) before the first mutation if that silent overwrite is unacceptable; under that policy, a key or range touched by a commit newer than your transaction's snapshot fails the whole commit with MidgeError::WriteConflict, atomically — none of the transaction's writes are applied.",
                "commit() takes the transaction by value, so it is consumed whether it returns Ok or Err. A failed commit is not a handle you can retry: build a new transaction with begin_tx and reapply the writes.",
                "WriteStall and ResourceLimit are backpressure signals, not corruption. WriteStall fires when the immutable-memtable queue is already full and a flush is in progress, or when a flush itself is blocked waiting on compaction or on a pending cloud upload to free durable capacity. ResourceLimit fires when a read-write transaction's buffered writes outgrow the transaction memory pool: local and cloud-backed engines automatically spill the overflow to a txn/ directory under the database path, but OpenOptions::in_memory() has nowhere to spill, so ResourceLimit there means the transaction itself has to shrink.",
                "A Timeout from commit() is not proof that nothing happened. Reconcile with engine.get_runtime_metrics() or a fresh read in a new transaction before assuming the write is missing and reissuing it unconditionally.",
              ],
              table: {
                headers: ["Error", "Trigger", "Response"],
                rows: [
                  [
                    "InvalidArgument",
                    "A write call on a ReadOnly transaction, or delete_range with start_key > end_key.",
                    "Fix the call and reissue it — nothing was buffered.",
                  ],
                  [
                    "WriteConflict",
                    "AbortOnWriteConflict is set and a key or range was touched by a commit newer than this transaction's snapshot.",
                    "Reread the current value in a new transaction and reapply the intended change.",
                  ],
                  [
                    "WriteStall",
                    "The immutable memtable queue is full, or a flush is blocked on compaction or a pending cloud upload.",
                    "Stop issuing new writes to the column family; call flush_cf if one is not already running.",
                  ],
                  [
                    "ResourceLimit",
                    "The transaction write set exceeds the transaction memory pool, with no txn/ spill directory available (in-memory engines only).",
                    "Commit sooner, split the transaction into smaller commits, or use local/cloud storage instead of in_memory().",
                  ],
                  [
                    "Timeout",
                    "The caller-provided deadline elapsed before commit() returned.",
                    "Check runtime metrics or reread the key before retrying.",
                  ],
                ],
              },
              code: 'let mut tx = engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;\ntx.set_conflict_policy(ConflictPolicy::AbortOnWriteConflict);\ntx.put(b"counter".to_vec(), next_value, None)?;\nmatch tx.commit(WriteOptions::sync()) {\n    Ok(()) => {}\n    Err(MidgeError::WriteConflict(_)) => {\n        // reread the counter in a new transaction and retry\n    }\n    Err(MidgeError::WriteStall(_) | MidgeError::ResourceLimit(_)) => {\n        engine.flush_cf(&cf)?;\n    }\n    Err(other) => return Err(other),\n}',
            },
            {
              id: "recovery-and-cloud-failures",
              title: "Recovery and cloud failures",
              paragraphs: [
                "On every open, Midge loads manifest state, replays WAL segments in sequence, and then replays intent-log entries for any flush or compaction that was interrupted mid-publish, in that order. RecoveryPolicy::Strict, the default, refuses to open past a corrupted first WAL frame, a truncated non-tail frame, or an unresolved manifest/intent-log publication, and returns MidgeError::RecoveryFailed with the specific reason; a torn frame at the tail of the final active WAL file is the one case strict recovery accepts on its own, dropping it and continuing.",
                "RecoveryPolicy::Salvage keeps the valid WAL prefix and continues in a degraded state instead of failing open. Treat it as an explicit, one-time operator decision for investigation — made after you already have a preserved copy and the recorded RecoveryFailed message — not as a policy to leave configured for a database you intend to keep writing to.",
                "After an open, read engine.get_recovery_metrics() (wal_recovery_records_replayed, wal_recovery_bytes_replayed, intent_log_entries_replayed) and engine.get_runtime_metrics()?.health. Run midge verify --json <path> (or Engine::verify_path) against a copy of the directory to get the same health value plus the manifest epoch, verified SST and byte counts, and the WAL boundary sequence, without touching the original.",
                "Triage a cloud failure by reproducing it first against OpenOptions::cloud_simulated(local_cache, bucket, prefix), which runs the same cloud code path against local filesystem state with no external provider, credentials, or network involved. If the failure only reproduces against a real provider, rerun the repository's Sqrzl-emulator qualification suite, and any provider-specific qualification suite, with the exact feature flag (cloud-aws, cloud-azure, cloud-gcp, or cloud-oci) and CloudProviderConfig you run in the field — an emulator pass is evidence for the tested protocol path, not for the provider's IAM, quotas, or network policy.",
                "Confirm which commit boundary is in play before concluding data was lost. cloud_async() acknowledges after local visibility while the cloud upload continues in the background; cloud_strict() only returns once the covering WAL segment has sealed, rotated, uploaded, and been acknowledged. A lost local cache after cloud_async() writes is recoverable only if that seal-and-upload work finished first; after cloud_strict() writes it should recover from the uploaded WAL segment or later SST state. Test cache loss and restart with the exact provider and feature set you plan to run before depending on either boundary.",
              ],
              table: {
                headers: ["EngineHealth", "Meaning", "midge verify exit code"],
                rows: [
                  [
                    "Healthy",
                    "No persistence anomaly, pending intent, or orphan SST was found; verification checked out.",
                    "0",
                  ],
                  [
                    "SalvageMode",
                    "The engine opened under RecoveryPolicy::Salvage.",
                    "1",
                  ],
                  [
                    "WriteStalled",
                    "The engine opened fine but is presently backpressured on writes.",
                    "1",
                  ],
                  [
                    "Degraded",
                    "A persistence anomaly, an unresolved intent, or an orphan SST file was found on disk.",
                    "1",
                  ],
                  [
                    "Corrupt",
                    "Verification found a manifest, SST, or WAL inconsistency it could not resolve.",
                    "2",
                  ],
                ],
              },
              code: 'let opts = OpenOptions::cloud_simulated("./midge-cache", "app-bucket", "app-prefix")\n    .build()?;\nlet mut engine = Engine::open(opts)?;',
              callout: {
                title: "Salvage and rebuild are two different decisions",
                body: "RecoveryPolicy::Salvage is a degraded investigation path; the transaction-durability contract does not include it in the default recovery policy unless an operator turns it on deliberately. If a database is genuinely disposable, stop every user of it, keep a copy if you might need it later, and rebuild it from the application's own source of truth — that is a rebuild, not a recovery.",
              },
            },
            {
              id: "resource-and-shutdown-diagnostics",
              title: "Resource and shutdown diagnostics",
              paragraphs: [
                "Some ResourceLimit errors are caught at OpenOptions::build(), before the engine ever opens: a MemoryBudget too small to hold two memtable generations, a transaction_memory_pool_size override larger than the total budget, or an explicit memtable-size override that leaves no room for that pool. Fix the budget or the override — there is no runtime retry around a build()-time ResourceLimit.",
                "MidgeError::Busy shows up in two unrelated situations: a live verification barrier (from Engine::verify_path or an internal consistency pass) is holding writes and DDL back temporarily, or engine.shutdown(timeout) was called while transactions were still active — the runtime checks its active transaction count and returns Busy immediately rather than waiting for them to finish. Close every open transaction, by commit or rollback, before calling shutdown.",
                "A Timeout from shutdown(timeout) means the runtime workers did not stop, or the shutdown request itself could not be queued, before the deadline; it is an operational event to investigate, not evidence that the engine is closed. Dropping an Engine without calling shutdown does not carry the same acknowledgement, so treat a shutdown Err as something to retry with a longer timeout or escalate, never as something to ignore because the process is exiting anyway.",
                'MidgeError::Aborted is a background signal rather than something application code typically receives from put or commit. It shows up in tracing output tagged component="compaction", invariant="cooperative_cancellation" when a running compaction pass cancels itself because the column family\'s ingest epoch changed underneath it; the scheduler reissues the compaction under the new epoch instead of leaving the cancelled attempt as a final result.',
                "Keep engine.get_runtime_metrics(), engine.get_storage_layout(), and engine.get_recovery_metrics() snapshots next to your operator logs whenever you investigate an incident — they are the concrete evidence a bug report or a recovery decision needs. Midge logs through the tracing ecosystem and does not install a global subscriber on its own, so the application has to configure one before any of this is visible.",
              ],
              table: {
                headers: ["Signal", "What it means", "Where to look"],
                rows: [
                  [
                    "shutdown(timeout) -> Err(Busy)",
                    "At least one transaction was still active when shutdown was requested.",
                    "Application-level transaction bookkeeping — close outstanding transactions first.",
                  ],
                  [
                    "shutdown(timeout) -> Err(Timeout)",
                    "The shutdown request queue stayed full, or runtime workers did not exit, before the deadline.",
                    "get_runtime_metrics() for stalled or in-flight state; retry with a longer timeout.",
                  ],
                  [
                    "ResourceLimit at build()",
                    "The configured MemoryBudget or transaction-pool override cannot fit two memtable generations plus the pool.",
                    "The OpenOptionsBuilder inputs — Goal, MemoryBudget, transaction_memory_pool_size.",
                  ],
                  [
                    "ResourceLimit at commit (in_memory() only)",
                    "The transaction write set exceeded the transaction memory pool with no txn/ directory to spill into.",
                    "Commit sooner or split the transaction; local/cloud storage spills automatically.",
                  ],
                  [
                    "Aborted (background)",
                    "A compaction pass cancelled itself cooperatively after an ingest epoch change.",
                    'tracing output for component="compaction", invariant="cooperative_cancellation".',
                  ],
                ],
              },
              code: "match engine.shutdown(Duration::from_secs(30)) {\n    Ok(()) => {}\n    Err(MidgeError::Busy(msg)) => {\n        // an application-owned transaction is still open; close it, then retry\n    }\n    Err(MidgeError::Timeout(msg)) => {\n        // runtime did not stop in time; escalate, do not assume it is closed\n    }\n    Err(other) => return Err(other),\n}",
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
          path: "api-reference",
          title: "Public API",
          description:
            "Find the public engine, option, column-family, transaction, query, report, and error types.",
          contract:
            "This page indexes the crate's public export surface below the storage internals: the Engine/OpenOptions pair that opens a database, the ColumnFamilyHandle/Transaction/TransactionMode/ConflictPolicy types that scope and run work, the Query/ScanIterator/Direction types behind scans, and the MidgeError/report-snapshot types every call can return.",
          practice:
            "A developer already working from Options, Data Operations, or Cloud comes here with a bare type name — Query, ConflictPolicy, MidgeError — looks up its shape and owning page in the tables below, then imports it either through cntryl_midge::prelude::* or a direct crate-root import when the prelude does not carry it.",
          boundary:
            "This page does not re-derive OpenOptions defaults, re-explain transaction verbs, or interpret metric values — Options, Data Operations, and Metrics and Reports own that content. It only names the exported types, their shapes, and which method or constructor produces each one.",
          keywords: ["Rust API", "reference", "types"],
          content: [
            {
              id: "engine-and-options",
              title: "Engine and options",
              paragraphs: [
                "Only a small set of re-exported types make up Midge's intended public surface. Import cntryl_midge::prelude::* to reach the canonical open-transact-commit pattern rather than reaching into engine, config, or types directly.",
                "Engine is the single entry point, and its only constructor is Engine::open(opts: OpenOptions). MidgeEngine is a plain alias for the same struct (pub type MidgeEngine = Engine), kept so existing call sites do not have to rename.",
                "OpenOptions and OpenOptionsBuilder are exported as a pair. One of OpenOptions's four storage constructors (in_memory, local, cloud, cloud_simulated) returns a builder; builder.build() validates the combination and derives block, cache, memtable, WAL, and compaction settings once, returning an immutable OpenOptions with no public fields left to change afterward. Options covers every builder input and derived value in full — this page only names the two types.",
              ],
              table: {
                headers: ["Export", "Kind", "Role"],
                rows: [
                  [
                    "Engine",
                    "struct",
                    "Owns the runtime, column-family registry, and primary-instance lease; opened once with open(OpenOptions).",
                  ],
                  [
                    "MidgeEngine",
                    "type alias",
                    "pub type MidgeEngine = Engine — the same struct under its earlier name.",
                  ],
                  [
                    "OpenOptions",
                    "struct",
                    "Immutable, validated configuration; producible only through OpenOptionsBuilder::build().",
                  ],
                  [
                    "OpenOptionsBuilder",
                    "struct",
                    "Mutable input collected from a storage constructor and chained setter methods before build().",
                  ],
                  [
                    "Storage",
                    "enum",
                    "InMemory, Local, Cloud, or CloudSimulated — the backend an OpenOptions wraps.",
                  ],
                ],
              },
              code: 'use cntryl_midge::prelude::*;\n\nlet engine = Engine::open(OpenOptions::local("./db").build()?)?;\nlet cf = engine.create_column_family("events")?;',
              callout: {
                title:
                  "Hidden modules back the exports; they are not the exports",
                body: "common, config, types, diagnostics, iterators, sst, and wal are each technically public modules, but only for the crate's own integration tests and diagnostics tooling to reach — not meant for an application to import directly. Only the re-exported names, and the prelude built from them, are the intended surface.",
              },
            },
            {
              id: "column-families-and-transactions",
              title: "Column families and transactions",
              paragraphs: [
                "ColumnFamilyHandle, Transaction, TransactionMode, and ConflictPolicy are exported together from the engine module. ConflictPolicy itself is defined once in crate::types and re-exported through both engine and the crate root, so the public API and the runtime share one enum instead of two kept in sync by hand.",
                "A ColumnFamilyHandle is a small { id: ColumnFamilyId, name: String } pair returned by engine.create_column_family(name) and found again with engine.get_column_family(name) or engine.list_column_families(). It exposes id() and name() and holds no data-access methods itself — every read or write goes through a Transaction bound to that id().",
                "engine.begin_tx(cf_id, mode) opens a Transaction against exactly one column family for that transaction's lifetime; there is no method to point an open transaction at a second column family. TransactionMode is ReadOnly or ReadWrite — put, insert, delete, and delete_range each return MidgeError::InvalidArgument when called on a ReadOnly transaction. Data Operations covers every verb's semantics in full; this page only indexes the four type names.",
                "ConflictPolicy governs what commit() does when another writer touched the same keys after this transaction's snapshot was taken. Every new transaction starts at LastWriteWins; call tx.set_conflict_policy(ConflictPolicy::AbortOnWriteConflict) before the first mutation to make an overlapping change fail the commit instead of resolving by commit order.",
              ],
              table: {
                headers: ["Type", "Shape", "Key members"],
                rows: [
                  [
                    "ColumnFamilyHandle",
                    "struct { id: ColumnFamilyId, name: String }",
                    "id(), name()",
                  ],
                  ["TransactionMode", "enum", "ReadOnly, ReadWrite"],
                  [
                    "ConflictPolicy",
                    "enum",
                    "LastWriteWins (default), AbortOnWriteConflict",
                  ],
                  [
                    "Transaction",
                    "struct, column-family-scoped",
                    "put, insert, delete, delete_range, get, scan, commit, rollback, conflict_policy(), set_conflict_policy()",
                  ],
                ],
              },
              code: 'let cf = engine.create_column_family("events")?;\nlet mut tx = engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;\ntx.set_conflict_policy(ConflictPolicy::AbortOnWriteConflict);\ntx.put(b"key".to_vec(), b"value".to_vec(), None)?;\ntx.commit(WriteOptions::sync())?;',
              callout: {
                title: "ColumnFamilyHandle is not in the prelude",
                body: "The canonical usage pattern never writes the type name ColumnFamilyHandle; it only calls cf.id() on the value create_column_family returns. The prelude re-exports ColumnFamilyId (the u32 a handle wraps) but not ColumnFamilyHandle itself — import it explicitly from cntryl_midge whenever a function signature or struct field needs to name the type.",
              },
            },
            {
              id: "queries-and-results",
              title: "Queries and results",
              paragraphs: [
                "Query, ScanIterator, and Direction are the three types behind tx.scan(&query). Query is a builder struct with five public fields — start, end, prefix, limit, and direction — set through chained methods (start_key, end_key, prefix, limit, reverse) that each return Self.",
                "start is inclusive and end is exclusive, the same half-open convention delete_range uses on Data Operations. When only prefix is set, Query derives both bounds itself: effective_start() uses the prefix as the lower bound, and effective_end() computes a prefix successor by incrementing the last byte of the prefix that is not 0xFF. An explicit start_key or end_key always wins over the derived prefix bound when both are present.",
                "tx.scan(&query) returns a ScanIterator<'_> — engine's own iterator::Iterator type, re-exported under that name. It implements std::iter::Iterator<Item = MidgeResult<(Bytes, Bytes)>> and is lazy: each call to next() consults storage, so a corruption or I/O error surfaces from the specific item that reaches the bad block rather than at scan construction. exhausted() reports whether iteration finished, direction() reports the Direction the scan was built with, and try_collect() gathers every remaining row into a Vec, stopping at the first error.",
              ],
              table: {
                headers: ["Type", "Shape", "Notes"],
                rows: [
                  [
                    "Query",
                    "struct { start, end, prefix, limit, direction }",
                    "Built with Query::new(), then start_key/end_key/prefix/limit/reverse; every field is public.",
                  ],
                  ["Direction", "enum", "Forward (default) or Reverse."],
                  [
                    "ScanIterator<'a>",
                    "lifetime-bound struct",
                    "Item = MidgeResult<(Bytes, Bytes)>; exhausted(), direction(), and try_collect() are its only methods beyond Iterator.",
                  ],
                ],
              },
              code: 'let query = Query::new()\n    .prefix(Bytes::from_static(b"user:"))\n    .limit(100)\n    .reverse();\nlet rows = tx.scan(&query)?.try_collect()?;',
              callout: {
                title: "A prefix scan can stay open on the high end",
                body: "prefix(&[0xff, 0xff]) or an empty prefix has no finite successor byte to increment, so effective_end() returns None and the scan runs to the top of the keyspace unless the query also sets an explicit end_key.",
              },
            },
            {
              id: "reports-and-errors",
              title: "Reports and errors",
              paragraphs: [
                "MidgeError is the one enum behind every fallible call in the crate; MidgeResult<T> is simply Result<T, MidgeError>. Two variants — NotFound and InvalidPath — carry no data. Io(std::io::Error) wraps the underlying I/O failure directly. The remaining fifteen variants each attach a String message: InvalidArgument, Corruption, NotSupported, Internal, NoSpace, RecoveryFailed, CompatibilityError, WriteStall, MemoryModeViolation, Fenced, WriteConflict, Aborted, Busy, Timeout, and ResourceLimit.",
                "Engine exposes five report methods, each returning its own snapshot struct — get_read_amp_metrics(), get_recovery_metrics(), get_runtime_metrics(), get_storage_layout(), and verify_storage(timeout) alongside the associated function Engine::verify_path(path). Metrics and Reports, and Troubleshooting, explain what each counter means operationally; this page only lists the types and where they come from.",
                "RuntimeMetricsSnapshot and StorageLayoutSnapshot both embed EngineHealth (Healthy, Degraded, SalvageMode, WriteStalled, or Corrupt), so one call reports engine state and its health classification together. StorageLayoutSnapshot's levels field is a Vec<StorageLayoutLevel>, and each level carries its own Vec<StorageFileLayout> — the per-SST rows with name, level, size, and key/sequence bounds. StorageVerificationReport adds an authoritative flag that is false when the pass ran against a cloud cache rather than the storage of record.",
                "A handful of MidgeError variants map onto specific, checkable conditions rather than a generic failure: InvalidArgument when a mutation runs on a ReadOnly transaction or begin_tx names a column family that does not exist; Busy or Timeout when shutdown() cannot finish inside its deadline; ResourceLimit when OpenOptionsBuilder::build() cannot fit a memory override inside the total budget; NotSupported when verify_storage() runs against a memory-mode engine; and WriteConflict when a commit under AbortOnWriteConflict finds a key or range changed since its start snapshot.",
              ],
              table: {
                headers: ["Type", "Where it comes from", "Shape"],
                rows: [
                  [
                    "ReadAmpMetricsSnapshot",
                    "engine.get_read_amp_metrics()",
                    "Read counters and per-read averages for SSTs, L0 SSTs, and blocks touched.",
                  ],
                  [
                    "RecoveryMetricsSnapshot",
                    "engine.get_recovery_metrics()",
                    "WAL and intent-log replay counts captured during the last engine open.",
                  ],
                  [
                    "RuntimeMetricsSnapshot",
                    "engine.get_runtime_metrics()",
                    "EngineHealth plus memtable, WAL, cache, compaction, and stall counters.",
                  ],
                  [
                    "StorageLayoutSnapshot",
                    "engine.get_storage_layout()",
                    "EngineHealth, a per-level Vec<StorageLayoutLevel> (each holding Vec<StorageFileLayout>), and active Vec<SnapshotPinSnapshot> pins.",
                  ],
                  [
                    "StorageVerificationReport",
                    "engine.verify_storage(timeout) or Engine::verify_path(path)",
                    "Manifest, WAL, intent-log, and SST verification totals, an authoritative flag, and EngineHealth.",
                  ],
                  [
                    "EngineHealth",
                    "embedded in the three snapshot types above",
                    "enum: Healthy, Degraded, SalvageMode, WriteStalled, Corrupt.",
                  ],
                ],
              },
              code: 'match engine.verify_storage(Duration::from_secs(30)) {\n    Ok(report) => println!("{} SST files verified", report.sst_files_verified),\n    Err(MidgeError::NotSupported(reason)) => eprintln!("skipped: {reason}"),\n    Err(error) => return Err(error),\n}',
              callout: {
                title: "Fenced is a single-writer guard, not a cluster event",
                body: "Engine holds a primary-instance lease that enforces single-writer exclusivity over one storage location, checked at any time with is_primary_lease_healthy(). MidgeError::Fenced(_) means that lease has gone stale for this process — it is a local safety signal, not a sign of replication or automatic failover, which Midge does not provide.",
              },
            },
          ],
        },
        {
          path: "configuration",
          title: "Configuration Reference",
          description:
            "Find every builder input, derived value, runtime override, storage option, and timeout.",
          contract:
            "This page is the exhaustive low-level reference for OpenOptionsBuilder and OpenOptions: every public setter, every derived getter with its exact formula, and the one setting whose effect keeps happening after open instead of being spent once at build() time.",
          practice:
            "Read Builder inputs for every setter's accepted values and default; read Derived values for the exact formula behind whatever build() computed; check Runtime overrides only when something needs to change after open, since background_compaction is the sole entry that qualifies; use Storage and timeout settings to confirm which constructor and I/O ceiling are actually in effect.",
          boundary:
            "This reference does not recommend a goal, budget, or workload for any deployment; that judgment belongs to the Options guide. It also does not expose a way to change memory, cache, storage, or compaction settings once open() succeeds: OpenOptions is immutable end to end, and background_compaction is simply the one input the engine keeps consulting throughout its life instead of spending once at build() time.",
          keywords: ["configuration", "OpenOptions"],
          content: [
            {
              id: "builder-inputs",
              title: "Builder inputs",
              paragraphs: [
                "OpenOptionsBuilder starts from exactly one storage constructor — in_memory(), local(path), cloud(cache, provider, prefix), or cloud_simulated(cache, bucket, prefix) — and then exposes eleven public setter methods. Setters only record intent: nothing is validated or derived until build() runs, so the order the methods are chained in never matters.",
                "build() runs every check exactly once and returns an immutable OpenOptions. Every field on that struct is private, so once an engine is open there is no way to reach in and change goal, memory_budget, or any override — the values in the table below are fixed for the life of the engine.",
                "with_memtable_size_limit and with_memtable_flush_threshold are validated together inside that same build() call: an explicit flush threshold greater than the resolved memtable size limit fails with MidgeError::InvalidArgument, and a zero value for either fails the same way.",
              ],
              table: {
                headers: ["Method", "Accepts", "Default", "What it sets"],
                rows: [
                  [
                    "goal(value)",
                    "Latency, Throughput, Economy",
                    "Latency",
                    "Optimization target used to derive block size, target SST size, WAL buffer size, L0 compaction trigger, compression policy, and base memtable size.",
                  ],
                  [
                    "memory_budget(value)",
                    "Auto, Bytes(usize)",
                    "Auto",
                    "Total memory envelope that memtable, block cache, and transaction pool sizes are carved out of.",
                  ],
                  [
                    "with_memtable_size_limit(bytes)",
                    "Non-zero usize",
                    "none — derived from goal and workload",
                    "Overrides the memtable size limit build() would otherwise derive.",
                  ],
                  [
                    "with_memtable_flush_threshold(bytes)",
                    "Non-zero usize, at most the size limit",
                    "none — equals the size limit",
                    "Overrides the byte count that schedules a flush.",
                  ],
                  [
                    "transaction_memory_pool_size(bytes)",
                    "usize within the total budget",
                    "none — one tenth of memory_budget_bytes()",
                    "Overrides the shared transaction write-set pool allocation.",
                  ],
                  [
                    "workload(value)",
                    "Mixed, WriteHeavy, ReadMostly, RangeScan, TtlHeavy",
                    "Mixed",
                    "Scales the base memtable size (doubled for WriteHeavy, halved for ReadMostly) and widens block size for Throughput combined with RangeScan.",
                  ],
                  [
                    "block_cache_policy(value)",
                    "Lru, TinyLfu, ClockPro",
                    "Lru",
                    "Eviction and admission policy the SST block cache runs for the life of the engine.",
                  ],
                  [
                    "cloud_write_policy(value)",
                    "CloudWritePolicy",
                    "segment gap 128; seal at 16 MiB, 500 ms, or 10,000 pending writes",
                    "WAL sealing and eventual-flush thresholds, exercised only under cloud-backed storage (Storage::Cloud or Storage::CloudSimulated).",
                  ],
                  [
                    "background_compaction(enabled)",
                    "bool",
                    "true",
                    "Enables or disables the event loop's automatic compaction scheduling.",
                  ],
                  [
                    "recovery_policy(value)",
                    "Strict, Salvage",
                    "Strict",
                    "Fail-closed versus degraded-open behavior for the next engine open.",
                  ],
                  [
                    "storage_io_timeout(duration)",
                    "Non-zero Duration",
                    "30 seconds",
                    "Maximum wait for an append, flush, or sync acknowledgement.",
                  ],
                ],
              },
              code: 'use std::time::Duration;\nuse cntryl_midge::{\n    BlockCachePolicy, CloudWritePolicy, Goal, MemoryBudget, OpenOptions,\n    RecoveryPolicy, WorkloadProfile,\n};\n\nlet options = OpenOptions::local("./data")\n    .goal(Goal::Throughput)\n    .memory_budget(MemoryBudget::Bytes(1024 * 1024 * 1024))\n    .with_memtable_size_limit(192 * 1024 * 1024)\n    .with_memtable_flush_threshold(160 * 1024 * 1024)\n    .transaction_memory_pool_size(64 * 1024 * 1024)\n    .workload(WorkloadProfile::WriteHeavy)\n    .block_cache_policy(BlockCachePolicy::TinyLfu)\n    .cloud_write_policy(CloudWritePolicy::default())\n    .background_compaction(true)\n    .recovery_policy(RecoveryPolicy::Strict)\n    .storage_io_timeout(Duration::from_secs(30))\n    .build()?;',
            },
            {
              id: "derived-values",
              title: "Derived values",
              paragraphs: [
                "OpenOptions carries eighteen public getters. Eight return exactly what was passed to the builder — storage(), goal(), memory_budget(), workload(), recovery_policy(), block_cache_policy_value(), cloud_write_policy_value(), and storage_io_timeout(). The remaining ten are computed once inside build() from Goal, MemoryBudget, and WorkloadProfile, plus any explicit override, and are never recomputed afterward — OpenOptions has no setters, so a derived value can never drift from the inputs that produced it.",
                "memory_budget_bytes() is the foundation the other nine build on. MemoryBudget::Bytes(n) uses n directly. MemoryBudget::Auto takes the smaller of host total memory and any Linux cgroup limit (cgroup v2 memory.max or v1 memory.limit_in_bytes), halves it, then floors the result at 64 MiB when the effective limit is at least 128 MiB or 1 MiB otherwise; if neither host nor cgroup memory can be read, it falls back to a fixed 512 MiB. build() rejects any resolved budget under 2 bytes outright.",
              ],
              table: {
                headers: ["Getter", "Derivation"],
                rows: [
                  [
                    "memory_budget_bytes()",
                    "See above: Bytes(n) direct, or Auto from detected memory with a 512 MiB fallback.",
                  ],
                  [
                    "block_size()",
                    "16 KiB for Latency, 32 KiB for Economy, 128 KiB for Throughput combined with RangeScan, 64 KiB for Throughput otherwise.",
                  ],
                  [
                    "memtable_size_limit()",
                    "A base size by goal (Latency 64 MiB, Throughput 256 MiB, Economy 32 MiB) is doubled for WriteHeavy or halved for ReadMostly, then capped to half of what's left of memory_budget_bytes() after transaction_memory_pool_size() is subtracted.",
                  ],
                  [
                    "memtable_flush_threshold()",
                    "Equal to memtable_size_limit() unless with_memtable_flush_threshold overrides it.",
                  ],
                  [
                    "target_sst_size()",
                    "128 MiB for Latency, 512 MiB for Throughput, 256 MiB for Economy.",
                  ],
                  [
                    "block_cache_size()",
                    "What remains of memory_budget_bytes() after subtracting transaction_memory_pool_size() and two full memtable generations, capped at 256 MiB when goal is Economy.",
                  ],
                  [
                    "transaction_memory_pool_size()",
                    "One tenth of memory_budget_bytes() unless transaction_memory_pool_size(bytes) overrides it.",
                  ],
                  [
                    "wal_buffer_size()",
                    "128 KiB for Latency, 1 MiB for Throughput, 256 KiB for Economy, clamped to memory_budget_bytes().",
                  ],
                  [
                    "l0_compaction_trigger()",
                    "3 for Latency regardless of workload; 8 for WriteHeavy under Throughput or Economy; 6 for Throughput otherwise; 4 for Economy otherwise.",
                  ],
                  [
                    "compression_policy()",
                    "Fixed(Lz4) for Latency; for Throughput, Adaptive with a 256-byte minimum saving and a 0.95 ratio ceiling that tries Lz4 then Zstd3 per block; Fixed(Zstd9) for Economy.",
                  ],
                ],
              },
              code: "let options = OpenOptions::in_memory().goal(Goal::Economy).build()?;\n\nassert_eq!(options.block_size(), 32 * 1024);\nassert_eq!(options.target_sst_size(), 256 * 1024 * 1024);\nassert!(options.block_cache_size() <= 256 * 1024 * 1024);\n\n// options.goal = Goal::Latency; // does not compile: every field is private",
            },
            {
              id: "runtime-overrides",
              title: "Runtime overrides",
              paragraphs: [
                "OpenOptions is immutable, so every override in the table below is fixed once build() returns. Six of them — with_memtable_size_limit, with_memtable_flush_threshold, transaction_memory_pool_size, block_cache_policy, cloud_write_policy, and storage_io_timeout — are consumed once: each computes a fixed number or locks in a policy that then never changes for the life of the engine. background_compaction differs in kind, not in mutability: its value is fixed at build() time exactly like the rest, but the event loop stores it as runtime state and rechecks it on every flush publication before deciding whether to schedule automatic compaction. It is the one override whose effect keeps happening throughout the engine's life rather than being spent once at open.",
                "recovery_policy is the other setting worth calling out here, though for the opposite reason: it only matters for the open call itself. Strict fails open on untrustworthy manifest, intent-log, or WAL state; Salvage allows a degraded open after logging warnings. Once open succeeds, recovery_policy has nothing left to do.",
              ],
              table: {
                headers: ["Method", "Accepts", "Default", "Effect"],
                rows: [
                  [
                    "with_memtable_size_limit(bytes)",
                    "Non-zero usize",
                    "none — goal/workload derived",
                    "Fixes the memtable size limit at build() time; frozen afterward.",
                  ],
                  [
                    "with_memtable_flush_threshold(bytes)",
                    "Non-zero usize, at most the size limit",
                    "none — equals the size limit",
                    "Fixes the flush trigger at build() time; frozen afterward.",
                  ],
                  [
                    "transaction_memory_pool_size(bytes)",
                    "usize within the total budget",
                    "none — one tenth of the budget",
                    "Fixes the transaction pool allocation at build() time; frozen afterward.",
                  ],
                  [
                    "block_cache_policy(value)",
                    "Lru, TinyLfu, ClockPro",
                    "Lru",
                    "Fixes the block-cache eviction algorithm at build() time; frozen afterward.",
                  ],
                  [
                    "cloud_write_policy(value)",
                    "CloudWritePolicy",
                    "segment gap 128; seal at 16 MiB, 500 ms, or 10,000 writes",
                    "Fixes cloud WAL sealing thresholds at build() time; frozen afterward, exercised only under cloud-backed storage (Storage::Cloud or Storage::CloudSimulated).",
                  ],
                  [
                    "background_compaction(enabled)",
                    "bool",
                    "true",
                    "Fixed at build() like the rest, but read continuously: checked on every flush publication before automatic compaction is scheduled.",
                  ],
                  [
                    "recovery_policy(value)",
                    "Strict, Salvage",
                    "Strict",
                    "Only affects the open call itself; no effect once the engine is running.",
                  ],
                  [
                    "storage_io_timeout(duration)",
                    "Non-zero Duration",
                    "30 seconds",
                    "Fixes the I/O acknowledgement ceiling at build() time; applied on every append, flush, and sync.",
                  ],
                ],
              },
              callout: {
                title: "compact_all() bypasses the flag",
                body: "background_compaction(false) only turns off the event loop's own scheduling checks. Calling engine.compact_all() still schedules compactions and waits for them to finish regardless of the flag — it is an explicit, application-triggered path that ignores the background toggle entirely.",
              },
              code: 'let options = OpenOptions::local("./data")\n    .background_compaction(false)\n    .build()?;\nlet engine = MidgeEngine::open(options)?;\n\n// The event loop no longer schedules compaction on its own.\n// Force it explicitly whenever the application decides it\'s time.\nengine.compact_all()?;',
            },
            {
              id: "storage-and-timeout-settings",
              title: "Storage and timeout settings",
              paragraphs: [
                "Storage has no default. OpenOptions requires one of four explicit constructors, and Storage has no derived form: whatever variant goes into the builder is exactly what build() carries into the immutable OpenOptions.",
                "storage_io_timeout bounds how long the engine waits for an append, flush, or sync acknowledgement before treating the operation as failed, and it applies the same way no matter which Storage variant is selected. The builder default is 30 seconds (an internal constant, not part of the public API). It is also the very first thing build() checks: a zero duration fails immediately with MidgeError::InvalidArgument, ahead of memory derivation or any other validation.",
              ],
              table: {
                headers: ["Constructor", "Storage variant", "Persistence"],
                rows: [
                  [
                    "OpenOptions::in_memory()",
                    "Storage::InMemory (no fields)",
                    "No persistence; data is lost when the engine is dropped or the process exits.",
                  ],
                  [
                    "OpenOptions::local(path)",
                    "Storage::Local { path }",
                    "Persists WAL, manifest, and SST state to the given filesystem directory.",
                  ],
                  [
                    "OpenOptions::cloud(cache, provider, prefix)",
                    "Storage::Cloud { local_cache_path, provider, prefix }",
                    "Hybrid layout: a bounded local cache/staging directory plus provider-backed objects under one prefix.",
                  ],
                  [
                    "OpenOptions::cloud_simulated(cache, bucket, prefix)",
                    "Storage::CloudSimulated { local_cache_path, bucket, prefix }",
                    "Filesystem-backed stand-in for the cloud layout, for deterministic tests without a provider endpoint.",
                  ],
                ],
              },
              code: 'let local = OpenOptions::local("./data")\n    .storage_io_timeout(Duration::from_secs(30)) // matches the built-in default\n    .build()?;\n\nlet rejected = OpenOptions::in_memory()\n    .storage_io_timeout(Duration::ZERO)\n    .build();\nassert!(rejected.is_err());',
            },
          ],
        },
      ],
    },
  ],
});
