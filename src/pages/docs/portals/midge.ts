import { definePortal } from '../define';

export const midgePortal = definePortal({
  id: 'midge',
  label: 'Midge',
  shortLabel: 'Midge',
  kind: 'runtime',
  route: '/docs/midge',
  description:
    'Embedded Rust storage with explicit transaction, durability, and recovery choices.',
  repository: 'https://github.com/cntryl/midge',
  loader: () => import('../routes/midge'),
  sections: [
    {
      id: 'start',
      label: 'Start here',
      pages: [
        {
          path: '',
          title: 'Overview',
          description:
            'Learn when Midge fits, how its transaction and durability model works, and what remains application-owned.',
          contract:
            'Midge is an embedded Rust key-value engine for engineers who want storage inside one process. It provides snapshot transactions, column families, local or cloud-backed storage, and an explicit durability choice for every commit.',
          practice:
            'The application opens an Engine, starts a transaction for one column family, commits with selected WriteOptions, and closes the engine deliberately. Midge fits the runtime layer. Cassie uses it for storage, while other Rust applications can adopt it directly.',
          boundary:
            'Midge is not a server or a distributed database. The application owns schema, encoding, access control, placement, backups, and repair decisions. Next, open local storage, commit a value with sync durability, reopen it, and verify the value.',
          keywords: [
            'embedded',
            'Rust',
            'transaction',
            'durability',
            'recovery',
          ],
        },
        {
          path: 'getting-started',
          title: 'Getting Started',
          description:
            'Install Midge, commit one value to local storage, reopen the engine, and verify the recovered value.',
          contract:
            'Add cntryl-midge 0.1 to a Rust project. The walkthrough uses a temporary local path, one named column family, and WriteOptions::sync so the acknowledgement boundary is clear.',
          practice:
            'Run the program once to create the store and commit hello=world. Shut down the engine, open the same path again, look up the column family, and read the value in a new read-only transaction. The assertion verifies the end-to-end recovery path.',
          boundary:
            'Use an application-owned path and keep one engine owner for it. A clean shutdown is part of this first path; crash testing and other durability modes require separate recovery tests.',
          keywords: ['Cargo.toml', 'Engine::open', 'commit', 'reopen', 'get'],
          code: `[dependencies]
cntryl-midge = "0.1"

use std::time::Duration;
use cntryl_midge::prelude::*;

let path = "./midge-data";
let mut engine = Engine::open(OpenOptions::local(path).build()?)?;
let cf = engine.create_column_family("example")?;
let mut tx = engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"hello".to_vec(), b"world".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;
engine.shutdown(Duration::from_secs(30))?;

let mut engine = Engine::open(OpenOptions::local(path).build()?)?;
let cf = engine.column_family("example")?.expect("example column family");
let tx = engine.begin_tx(cf.id(), TransactionMode::ReadOnly)?;
assert_eq!(tx.get(b"hello")?.as_deref(), Some(b"world".as_slice()));
drop(tx);
engine.shutdown(Duration::from_secs(30))?;`,
        },
        {
          path: 'options',
          title: 'Options',
          description:
            'Configure every public Midge open option and understand the values derived when the options are built.',
          contract:
            'OpenOptions starts with a storage constructor and returns an OpenOptionsBuilder. Builder methods record intent. build() validates the combination and derives block, cache, memtable, WAL, SST, compaction, and compression settings once.',
          practice:
            'Choose storage first, then set Goal, MemoryBudget, and WorkloadProfile. These three inputs should be enough for most applications. Add a low-level override only when measurements show that a derived value does not fit the workload.',
          boundary:
            'Built OpenOptions are immutable. A zero I/O timeout, a zero required limit, or a memory override that cannot fit the total budget fails build(). The simulated-cloud budget method is hidden and is not part of the application configuration surface.',
          keywords: [
            'OpenOptions',
            'Goal',
            'MemoryBudget',
            'WorkloadProfile',
            'BlockCachePolicy',
            'CloudWritePolicy',
          ],
          content: [
            {
              id: 'storage',
              title: 'Choose storage',
              paragraphs: [
                'Every configuration begins with one storage constructor. in_memory keeps data in the process. local owns a filesystem path. cloud combines a bounded local cache with a real provider and object prefix. cloud_simulated uses filesystem-backed object storage for deterministic tests.',
              ],
              table: {
                headers: ['Constructor', 'Configure with', 'What it does'],
                rows: [
                  [
                    'OpenOptions::in_memory()',
                    'No arguments',
                    'Keeps engine state in memory.',
                  ],
                  [
                    'OpenOptions::local(path)',
                    'Application-owned directory',
                    'Stores WAL, manifest, and SST state on the local filesystem.',
                  ],
                  [
                    'OpenOptions::cloud(cache, provider, prefix)',
                    'Local cache path, CloudProviderConfig, unique object prefix',
                    'Uses a local cache with real provider-backed WAL and SST objects.',
                  ],
                  [
                    'OpenOptions::cloud_simulated(cache, bucket, prefix)',
                    'Local cache path, simulated bucket, object prefix',
                    'Exercises the cloud storage model against the filesystem.',
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
              id: 'derived-configuration',
              title: 'Set the derived configuration',
              paragraphs: [
                'Goal selects the primary optimization target. MemoryBudget sets the total memory envelope. WorkloadProfile supplies the access-pattern hint. Midge derives the lower-level values from their combination.',
              ],
              table: {
                headers: ['Method', 'Choices', 'Effect'],
                rows: [
                  [
                    '.goal(value)',
                    'Latency, Throughput, Economy',
                    'Changes derived block size, SST target, WAL buffer, cache allocation, compression, and compaction choices.',
                  ],
                  [
                    '.memory_budget(value)',
                    'Auto, Bytes(n)',
                    'Sets the total memory envelope used to divide cache, memtable, and transaction pools.',
                  ],
                  [
                    '.workload(value)',
                    'Mixed, WriteHeavy, ReadMostly, RangeScan, TtlHeavy',
                    'Adjusts derived memory allocation and data-layout choices for the expected access pattern.',
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
              id: 'runtime-overrides',
              title: 'Configure runtime overrides',
              paragraphs: [
                'These methods cover every public OpenOptionsBuilder override. Keep the derived defaults unless the application has measurements or an operating constraint that justifies a specific value.',
              ],
              table: {
                headers: ['Method', 'Value', 'What it controls'],
                rows: [
                  [
                    '.with_memtable_size_limit(bytes)',
                    'Non-zero bytes',
                    'Maximum runtime memtable size before write pressure applies.',
                  ],
                  [
                    '.with_memtable_flush_threshold(bytes)',
                    'Non-zero bytes',
                    'Memtable size that schedules a flush.',
                  ],
                  [
                    '.transaction_memory_pool_size(bytes)',
                    'Bytes within the total memory budget',
                    'Shared resident memory for transaction write sets before spill behavior.',
                  ],
                  [
                    '.block_cache_policy(policy)',
                    'Lru, TinyLfu, ClockPro',
                    'Eviction and admission policy for blocks read from SST files.',
                  ],
                  [
                    '.background_compaction(enabled)',
                    'true or false',
                    'Enables or disables automatic background compaction scheduling.',
                  ],
                  [
                    '.recovery_policy(policy)',
                    'Strict or Salvage',
                    'Chooses fail-closed recovery or an operator-approved degraded open.',
                  ],
                  [
                    '.storage_io_timeout(duration)',
                    'Non-zero Duration',
                    'Maximum wait for append, flush, and sync acknowledgements.',
                  ],
                  [
                    '.cloud_write_policy(policy)',
                    'CloudWritePolicy',
                    'Controls eventual flush distance and cloud WAL sealing thresholds.',
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
              id: 'cloud-write-policy',
              title: 'Configure cloud write policy',
              paragraphs: [
                'CloudWritePolicy is used only with cloud-backed storage. Its default flushes WAL-backed memtables after a segment gap of 128 and seals a cloud WAL segment at 16 MiB, 500 milliseconds, or 10,000 pending writes.',
              ],
              table: {
                headers: ['Field', 'Default', 'What it controls'],
                rows: [
                  [
                    'eventual_flush_segment_gap',
                    '128 segments',
                    'Maximum WAL segment distance before an eventual memtable flush.',
                  ],
                  [
                    'wal_seal_min_segment_bytes',
                    '16 MiB',
                    'Size threshold for sealing the active cloud WAL segment.',
                  ],
                  [
                    'wal_seal_max_flush_delay',
                    '500 ms',
                    'Time threshold for sealing a pending cloud WAL segment.',
                  ],
                  [
                    'wal_seal_max_pending_writes',
                    '10,000',
                    'Pending-write threshold for sealing a cloud WAL segment.',
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
              id: 'inspect-derived-values',
              title: 'Inspect the built values',
              paragraphs: [
                'After build(), getters expose the caller choices and every public derived value. This is useful for startup logs and tests that need to record the actual configuration.',
              ],
              table: {
                headers: ['Getter', 'Reported value'],
                rows: [
                  ['storage()', 'Selected storage backend'],
                  ['goal()', 'Selected optimization goal'],
                  ['memory_budget()', 'Caller-facing budget choice'],
                  ['memory_budget_bytes()', 'Resolved total budget'],
                  ['workload()', 'Selected workload profile'],
                  ['recovery_policy()', 'Selected recovery policy'],
                  ['block_size()', 'Derived SST block size'],
                  ['memtable_size_limit()', 'Resolved memtable limit'],
                  [
                    'memtable_flush_threshold()',
                    'Resolved memtable flush threshold',
                  ],
                  ['target_sst_size()', 'Derived target SST size'],
                  ['block_cache_size()', 'Derived cache allocation'],
                  [
                    'transaction_memory_pool_size()',
                    'Resolved transaction pool allocation',
                  ],
                  ['block_cache_policy_value()', 'Selected block-cache policy'],
                  ['cloud_write_policy_value()', 'Selected cloud write policy'],
                  ['storage_io_timeout()', 'Selected I/O timeout'],
                  ['wal_buffer_size()', 'Derived WAL buffer size'],
                  ['l0_compaction_trigger()', 'Derived L0 trigger'],
                  ['compression_policy()', 'Derived compression policy'],
                ],
              },
            },
          ],
        },
        {
          path: 'cloud',
          title: 'Cloud',
          description:
            'Configure Midge for AWS S3, S3-compatible storage, Azure Blob, or Google Cloud Storage with explicit credentials and durability.',
          contract:
            'Cloud mode uses a hybrid layout: a local cache and staging path plus one provider-backed object prefix. CloudProviderConfig selects the provider and credential source. OpenOptions::cloud binds that provider to the local cache and prefix.',
          practice:
            'Give each engine a unique prefix, keep its local cache on bounded storage, use platform-managed credentials where possible, and choose cloud_async or cloud_strict at every commit. Test recovery after removing the local cache before relying on the remote copy.',
          boundary:
            'The local cache is part of runtime performance but is not the remote durability boundary. A successful cloud_async commit does not wait for covering object upload. cloud_strict seals and uploads the covering WAL before returning.',
          keywords: [
            'AWS S3',
            'S3-compatible',
            'Azure Blob',
            'GCS',
            'CloudProviderConfig',
            'cloud_async',
            'cloud_strict',
          ],
          content: [
            {
              id: 'cloud-model',
              title: 'The cloud storage model',
              paragraphs: [
                'OpenOptions::cloud takes three values: a local cache path, a CloudProviderConfig, and an object prefix. The provider config owns bucket or container identity, endpoint details, and credentials. The prefix isolates one engine inside that provider location.',
              ],
              table: {
                headers: ['Input', 'Purpose', 'Rule'],
                rows: [
                  [
                    'local_cache_path',
                    'Caches and stages cloud-backed engine data locally',
                    'Use bounded, application-owned local storage.',
                  ],
                  [
                    'provider',
                    'Selects S3, Azure Blob, or GCS plus credentials',
                    'Construct it explicitly with CloudProviderConfig.',
                  ],
                  [
                    'prefix',
                    'Scopes WAL, manifest, and SST objects',
                    'Use a unique prefix for each engine writer.',
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
              id: 'aws-s3',
              title: 'AWS S3',
              paragraphs: [
                'aws_s3 uses Midge’s lightweight AWS default credential chain. Use an explicit S3CredentialSource when the deployment requires environment variables, a shared profile, static keys, or temporary session credentials.',
              ],
              table: {
                headers: ['Credential source', 'Constructor', 'Use'],
                rows: [
                  [
                    'AWS default chain',
                    'CloudProviderConfig::aws_s3(bucket, region)',
                    'AWS-hosted workloads using the supported default chain.',
                  ],
                  [
                    'Environment',
                    'S3CredentialSource::environment()',
                    'AWS-style access key variables.',
                  ],
                  [
                    'Shared profile',
                    'S3CredentialSource::shared_profile(name)',
                    'Named AWS shared credentials/config profile.',
                  ],
                  [
                    'Static key',
                    'S3CredentialSource::access_key(id, secret)',
                    'Explicit long-lived credentials supplied by the application.',
                  ],
                  [
                    'Session',
                    'S3CredentialSource::session(id, secret, token)',
                    'Explicit temporary credentials.',
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
              id: 's3-compatible',
              title: 'S3-compatible storage',
              paragraphs: [
                'Use an s3_compatible constructor for a custom endpoint. These providers default to path-style requests and should use static, environment, or shared-profile credentials so they do not contact AWS role or metadata endpoints.',
              ],
              table: {
                headers: ['Constructor', 'Credentials', 'Configuration'],
                rows: [
                  [
                    's3_compatible_env(bucket, endpoint)',
                    'AWS-style environment variables',
                    'us-east-1 and path-style addressing by default.',
                  ],
                  [
                    's3_compatible_static(bucket, endpoint, id, secret)',
                    'Explicit access key pair',
                    'us-east-1 and path-style addressing by default.',
                  ],
                  [
                    's3_compatible(bucket, region, endpoint, id, secret)',
                    'Explicit access key pair',
                    'Explicit signing region and path-style addressing.',
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
              id: 'azure-blob',
              title: 'Azure Blob Storage',
              paragraphs: [
                'azure_blob uses Midge’s lightweight Azure identity chain. AzureCredentialSource also supports storage environment variables, an Entra client secret, workload identity, managed identity, a shared key, SAS, or a connection string.',
              ],
              table: {
                headers: ['Credential source', 'Constructor'],
                rows: [
                  ['Default chain', 'AzureCredentialSource::default_chain()'],
                  [
                    'Storage environment',
                    'AzureCredentialSource::storage_environment()',
                  ],
                  [
                    'Environment client secret',
                    'AzureCredentialSource::environment_client_secret()',
                  ],
                  [
                    'Workload identity',
                    'AzureCredentialSource::workload_identity()',
                  ],
                  [
                    'Managed identity',
                    'AzureCredentialSource::managed_identity()',
                  ],
                  [
                    'Shared key',
                    'AzureCredentialSource::shared_key(account_key)',
                  ],
                  ['SAS', 'AzureCredentialSource::sas_token(token)'],
                  [
                    'Connection string',
                    'AzureCredentialSource::connection_string(value)',
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
              id: 'google-cloud-storage',
              title: 'Google Cloud Storage',
              paragraphs: [
                'gcs uses Application Default Credentials with the JSON API. GCS also supports a service-account file, authorized-user file, metadata server, bearer token, or HMAC credentials. HMAC selects the XML API.',
              ],
              table: {
                headers: ['Credential source', 'Constructor'],
                rows: [
                  [
                    'Application Default Credentials',
                    'GcsCredentialSource::application_default()',
                  ],
                  [
                    'Service-account JSON',
                    'GcsCredentialSource::service_account_json_file(path)',
                  ],
                  [
                    'Authorized-user JSON',
                    'GcsCredentialSource::authorized_user_json_file(path)',
                  ],
                  ['Metadata server', 'GcsCredentialSource::metadata_server()'],
                  ['Bearer token', 'GcsCredentialSource::bearer_token(token)'],
                  ['HMAC key', 'GcsCredentialSource::hmac_key(id, secret)'],
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
              id: 'endpoint-overrides',
              title: 'Endpoint and emulator overrides',
              paragraphs: [
                'with_endpoint is available for S3-compatible, Azure Blob, and GCS configurations. AWS S3 rejects endpoint overrides; use an S3-compatible constructor instead. Midge also provides sqrzl_s3, sqrzl_azure, and sqrzl_gcs constructors for the local Sqrzl emulator.',
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
              id: 'cloud-commits',
              title: 'Choose the cloud commit boundary',
              paragraphs: [
                'Cloud-backed engines reject sync and buffered because those are local-only policies. cloud_async returns after local visibility and cloud-runtime acceptance. cloud_strict forces the covering WAL segment to seal, rotate, upload, and acknowledge before commit returns. best_effort skips WAL and remains reload-only until an explicit flush publishes SST state.',
              ],
              table: {
                headers: ['WriteOptions', 'Acknowledgement boundary'],
                rows: [
                  [
                    'cloud_async()',
                    'Local visibility plus asynchronous cloud durability.',
                  ],
                  [
                    'cloud_strict()',
                    'Covering cloud WAL upload has completed.',
                  ],
                  [
                    'best_effort()',
                    'Memtable visibility only; data can be lost before flush.',
                  ],
                ],
              },
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"order:1".to_vec(), payload, None)?;
tx.commit(WriteOptions::cloud_strict())?;`,
              callout: {
                title: 'Match policy to storage',
                body: 'Use cloud_async or cloud_strict only with cloud-backed storage. Use sync or buffered only with local storage.',
              },
            },
            {
              id: 'recovery-and-ownership',
              title: 'Recovery and ownership',
              paragraphs: [
                'Use RecoveryPolicy::Strict for the normal open path. Assign one writer to each prefix, record the selected provider and prefix in deployment configuration, bound the local cache, and verify that a new cache can recover from provider objects. Salvage is an explicit operator decision for degraded recovery, not an automatic retry.',
              ],
            },
          ],
        },
        {
          path: 'operations',
          title: 'Operations',
          description:
            'Use short transaction-to-commit examples for puts, batches, inserts, reads, deletes, range deletes, scans, rollback, and durability.',
          contract:
            'All data operations belong to a column-family-scoped Transaction. Start a read-write transaction, add one or more mutations, and consume it with commit(WriteOptions). Read-only transactions use the same snapshot model and can be dropped after use.',
          practice:
            'Keep a transaction focused, handle every Result, and make the durability choice at commit. Multiple mutations in one transaction form one atomic batch. Range bounds use an inclusive start and exclusive end.',
          boundary:
            'Transactions cannot span column families. Mutation methods only update the transaction write set until commit. Dropping or rolling back an uncommitted transaction does not publish its mutations.',
          keywords: [
            'put',
            'insert',
            'batch',
            'get',
            'delete',
            'delete_range',
            'scan',
            'rollback',
            'commit',
          ],
          content: [
            {
              id: 'transaction-to-commit',
              title: 'Transaction to commit',
              paragraphs: [
                'Begin a read-write transaction for one column family, add a mutation, and commit with an explicit durability policy. commit consumes the transaction.',
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"user:1".to_vec(), b"alice".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: 'put',
              title: 'Put a value',
              paragraphs: [
                'put is an upsert. It writes a new value or replaces the value visible at the key. The optional TTL is expressed in seconds; use None for a value without TTL expiry.',
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
              id: 'batch',
              title: 'Commit a batch',
              paragraphs: [
                'Add several mutations to the same transaction and commit once. The puts and deletes are published atomically within the selected column family.',
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"user:1".to_vec(), b"alice".to_vec(), None)?;
tx.put(b"user:2".to_vec(), b"bob".to_vec(), None)?;
tx.delete(b"user:retired".to_vec())?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: 'insert',
              title: 'Insert only when absent',
              paragraphs: [
                'insert records create-only intent. The commit fails if the key already exists at conflict validation time.',
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.insert(b"user:3".to_vec(), b"carol".to_vec(), None)?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: 'read',
              title: 'Read a value',
              paragraphs: [
                'A read-only transaction captures a stable snapshot. get returns None when the key is absent. Drop the transaction promptly when the snapshot is no longer needed.',
              ],
              code: `let tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadOnly)?;
if let Some(value) = tx.get(b"user:1")? {
    println!("{}", String::from_utf8_lossy(&value));
}
drop(tx);`,
            },
            {
              id: 'delete',
              title: 'Delete a key',
              paragraphs: [
                'delete adds a point tombstone to the transaction. The deletion becomes visible only after commit.',
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.delete(b"user:1".to_vec())?;
tx.commit(WriteOptions::sync())?;`,
            },
            {
              id: 'range-delete',
              title: 'Delete a key range',
              paragraphs: [
                'delete_range removes keys in the half-open range [start, end). The start must sort before or equal to the end. The range tombstone is atomic with other mutations in the transaction.',
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
              id: 'scan',
              title: 'Scan a range or prefix',
              paragraphs: [
                'Build a Query with inclusive start, exclusive end, prefix, limit, or reverse direction. Iterate results without collecting the whole range in memory.',
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
              id: 'rollback',
              title: 'Roll back a transaction',
              paragraphs: [
                'rollback consumes the transaction, discards its uncommitted write set, and releases the snapshot registration.',
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.put(b"draft".to_vec(), b"value".to_vec(), None)?;
tx.rollback()?;`,
            },
            {
              id: 'commit-durability',
              title: 'Choose commit durability',
              paragraphs: [
                'Local storage accepts sync, buffered, and best_effort. Cloud storage accepts cloud_async, cloud_strict, and best_effort. best_effort can be lost before flush_cf and should be limited to data that can be reloaded.',
              ],
              table: {
                headers: ['WriteOptions', 'Commit waits for', 'Storage'],
                rows: [
                  ['sync()', 'Local WAL fsync', 'Local'],
                  ['buffered()', 'Local WAL append', 'Local'],
                  [
                    'best_effort()',
                    'Memtable visibility; no WAL durability',
                    'Memory, local, or cloud',
                  ],
                  ['cloud_async()', 'Local cloud runtime acceptance', 'Cloud'],
                  ['cloud_strict()', 'Covering cloud WAL upload', 'Cloud'],
                ],
              },
              code: `tx.commit(WriteOptions::sync())?;
tx.commit(WriteOptions::buffered())?;
tx.commit(WriteOptions::best_effort())?;
tx.commit(WriteOptions::cloud_async())?;
tx.commit(WriteOptions::cloud_strict())?;`,
              callout: {
                title: 'Each line represents a different transaction',
                body: 'commit consumes its transaction. Choose one WriteOptions value for each transaction; the five lines show the available policies, not five commits on one handle.',
              },
            },
            {
              id: 'write-conflicts',
              title: 'Choose write-conflict behavior',
              paragraphs: [
                'Read-write transactions default to LastWriteWins. Set AbortOnWriteConflict before mutations when overlapping changes since the start snapshot should fail the commit.',
              ],
              code: `let mut tx =
    engine.begin_tx(cf.id(), TransactionMode::ReadWrite)?;
tx.set_conflict_policy(ConflictPolicy::AbortOnWriteConflict);
tx.put(b"counter".to_vec(), next_value, None)?;
tx.commit(WriteOptions::sync())?;`,
            },
          ],
        },
      ],
    },
  ],
});
