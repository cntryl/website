import { definePortal } from '../define';

export const stressPortal = definePortal({
  id: 'stress',
  label: 'Stress',
  shortLabel: 'Stress',
  kind: 'supporting',
  route: '/docs/stress',
  description:
    'Repeatable Rust performance measurement with structured artifacts, diagnostics, and gates.',
  repository: 'https://github.com/cntryl/stress',
  loader: () => import('../routes/stress'),
  sections: [
    {
      id: 'start',
      label: 'Start here',
      pages: [
        {
          path: '',
          title: 'Overview',
          description:
            'Learn how Stress structures Rust benchmarks, artifacts, diagnostics, and author-owned boundaries.',
          content: [
            {
              id: 'measurement-contract',
              title: 'Measurement contract',
              paragraphs: [
                'Stress is a Rust benchmarking framework that records measurements, parameters, environment details, diagnostics, quality findings, and comparisons as structured artifacts. Mark a function with #[stress(tier = N)], call ctx.measure (or a related method) inside it, and cargo bench writes a schema_version: "cntryl-stress.v2" JSON artifact under target/stress alongside human-readable .txt and .md reports.',
                'The core question the artifact is built to answer is whether a benchmark row can be trusted: raw Sample rows are the source of truth, and every summary statistic, diagnostic, quality class, and baseline comparison is derived from measured samples only, never from warmup or cooldown samples.',
              ],
            },
            {
              id: 'write-one-benchmark',
              title: 'Write one benchmark',
              paragraphs: [
                "Keep setup outside the measured closure, name the operation, and record the logical work count that makes the result interpretable. #[stress(tier = 1)] through tier = 6 selects both the benchmark's scope and its timing strategy: Tier 1 uses calibrated micro-batches, Tier 2 runs a fixed operation count, and Tiers 3 through 6 run for a fixed wall-clock duration.",
                'ctx.measure_batch, ctx.record_external, and ctx.measure_async cover batched, externally-timed, and async work respectively; all of them are FnMut closures, so the benchmark function is re-invoked once per warmup, measured, and cooldown sample.',
              ],
            },
            {
              id: 'interpretation-boundary',
              title: 'Interpretation boundary',
              paragraphs: [
                'Stress reports the fixture and environment it ran, plus a battery of diagnostics (invalid timing, zero completed operations, high variance, setup-dominated measurement, and more) that call out common benchmark-shape mistakes. It does not decide whether the fixture represents a real application workload.',
                "The benchmark author owns operation counts, environment control, correctness checks (ctx.correctness()), and whether a row's tier and comparison settings make sense for the question being asked.",
              ],
            },
          ],
          keywords: ['Rust', 'benchmark', 'artifact', 'diagnostics', 'gate'],
        },
        {
          path: 'getting-started',
          title: 'Getting Started',
          description:
            'Add cntryl-stress, define one Rust benchmark, run it, and locate the structured result.',
          content: [
            {
              id: 'register-benchmark',
              title: 'Register a benchmark',
              paragraphs: [
                'Add cntryl-stress as a dev-dependency and register a harness-free bench target (harness = false) so Cargo hands control to stress_main!() instead of the built-in test harness. Inside the file, mark each measured function with #[stress(tier = N)]; the macro registers it in a linkme distributed slice that stress_main!() discovers at startup, so there is no manual benchmark list to maintain.',
                'Tier 1 is for hot paths and microbenchmarks, and it is the tier used below. #[stress] defaults to tier = 2 when no tier is given.',
              ],
            },
            {
              id: 'run-and-locate',
              title: 'Run and locate the artifact',
              paragraphs: [
                'Run cargo bench for the target and inspect target/stress/lookup/latest.json for the structured result. The same directory also gets a matching latest.txt and latest.md, plus a {timestamp}.json/.txt/.md set for every run so history is not overwritten.',
                'The default profile runs 5 measured samples and 1 warmup sample per benchmark; that is enough for local iteration, not enough to treat this first artifact as authoritative.',
              ],
            },
            {
              id: 'comparison-boundary',
              title: 'Set a comparison boundary',
              paragraphs: [
                'Compare only runs with compatible code, inputs, build profile, and environment; a single local run is not a baseline by itself. When you are ready to compare, cargo bench --bench lookup -- --baseline target/stress/lookup/latest.json (or --baseline latest with STRESS_BASELINE_DIR / --save-baseline) runs the comparison and reports Regression, Improvement, Inconclusive, or MissingBaseline per row.',
              ],
            },
          ],
          keywords: [
            'dev-dependencies',
            'stress_main',
            'cargo bench',
            'latest.json',
          ],
          code: `[dev-dependencies]
cntryl-stress = "0.3"

[[bench]]
name = "lookup"
harness = false

// benches/lookup.rs
use cntryl_stress::{black_box, stress, stress_main, StressContext};

#[stress(tier = 1)]
fn find_separator(ctx: &mut StressContext) {
    let route = b"tenant.queue";
    ctx.measure("find dot", || {
        black_box(route.iter().position(|byte| *byte == b'.'))
    });
}

stress_main!();

# Run and locate the structured result
cargo bench --bench lookup
find target/stress -name latest.json`,
        },
      ],
    },
    {
      id: 'authoring',
      label: 'Author benchmarks',
      pages: [
        {
          path: 'benchmark-model',
          title: 'Benchmark Model',
          description:
            'Define measured work, operation counts, setup, samples, and author-owned correctness checks.',
          keywords: ['benchmark', 'measure', 'operation'],
          content: [
            {
              id: 'benchmark-function',
              title: 'Benchmark function',
              paragraphs: [
                '#[stress(...)] is a proc-macro attribute applied to a plain fn(ctx: &mut StressContext) (or an async fn with the same signature). It reads the attribute arguments, validates the tier, and generates a static BenchmarkEntry that it registers into the STRESS_BENCHMARKS linkme distributed slice, so there is no separate registration call to write.',
                "The generated entry carries the function name, module path, tier, static budgets, and any metadata pairs. stress_main!() expands to a main() that calls into the framework's discovery and CLI-parsing entry point at runtime, which enumerates STRESS_BENCHMARKS, applies --workload/--tier filtering, and runs whatever matches.",
                'An async fn is wrapped in a small sync shim generated by the macro that blocks on the future with an internal executor, so async benchmarks never need a Tokio dependency in the benchmark crate itself.',
              ],
              code: `use cntryl_stress::{black_box, stress, StressContext};

#[stress(tier = 1)]
fn parse_header_hot_path(ctx: &mut StressContext) {
    let header = b"content-type:application/json";
    ctx.parameter("header_len", header.len());
    ctx.measure("separator lookup", || {
        black_box(header.iter().position(|byte| *byte == b':'))
    });
}`,
            },
            {
              id: 'measured-operation',
              title: 'Measured operation',
              paragraphs: [
                'A benchmark function can record more than one named measurement; each name becomes its own row in the artifact. ctx.measure runs the tier-derived default timing strategy (calibrated micro-batches for Tier 1, a fixed operation count for Tier 2, a fixed duration window for Tiers 3-6). ctx.measure_batch does the same but also multiplies the completed iteration count by a caller-supplied logical_operations_per_iteration and returns the total, so a single measured call that internally performs many logical operations still gets an accurate ns/op and throughput.',
                "ctx.measure_threaded, ctx.measure_pipeline, and ctx.measure_io use the identical timing strategy as ctx.measure; they only differ in the MeasurementIntent tag attached to the row, which downstream diagnostics use (for example, io-tagged fixed-duration samples yield the thread between iterations). ctx.record_external skips Stress's own timing entirely and records a duration and completed-operation count that another harness already measured; because Stress never bracketed the work, allocation counters are unavailable on that row.",
              ],
              code: `#[stress(tier = 2)]
fn flush_ready_entries(ctx: &mut StressContext) {
    let ready = ready_entry_count();
    // measure_batch returns the completed logical operation count
    let _completed = ctx.measure_batch("flush ready entries", ready, || {
        flush_ready_entries_once()
    });
}`,
            },
            {
              id: 'setup-and-teardown',
              title: 'Setup and teardown',
              paragraphs: [
                'Because the closure passed to ctx.measure* is an FnMut invoked once per warmup, measured, and cooldown sample, anything built before the ctx.measure* call runs exactly once for the whole benchmark, and anything built inside the closure runs on every sample. Build deterministic fixtures outside the closure and only touch them (or mutate local state) inside it.',
                'The queue_round_trip pattern below is a real example of state that must survive across samples: the VecDeque is built once, and each sampled call pops and pushes so the queue keeps its shape from sample to sample instead of being rebuilt.',
                'For work with its own teardown (a temp file, a socket), do the cleanup after ctx.measure* returns, not inside the closure, so setup/teardown cost is never folded into the measured window.',
              ],
              code: `use std::collections::VecDeque;

#[stress(tier = 2)]
fn queue_round_trip(ctx: &mut StressContext) {
    let mut queue = (0_u64..1024).collect::<VecDeque<_>>();
    ctx.parameter("queue_depth", queue.len());

    ctx.measure("queue round trip", || {
        let value = queue.pop_front().unwrap_or_default();
        queue.push_back(value.wrapping_add(1));
    });
}`,
            },
            {
              id: 'correctness-checks',
              title: 'Correctness checks',
              paragraphs: [
                'Every measurement carries a CorrectnessCounters struct (attempted, completed, failures, timeouts, duplicates, dropped, validation_errors). If a benchmark never touches it, Stress fills in a sane default: attempted = completed = the iteration or operation count for that sample. measure_batch and record_external instead set attempted = completed = the explicit logical operation count you pass in.',
                'To assert something stronger, call ctx.correctness() after (or before) the measured call: it returns a builder with .attempted(n), .completed(n), .failures(n), .timeouts(n), .duplicates(n), .dropped(n), and .validation_errors(n), all of which apply to the most recent measurement (or the next one, if called before any ctx.measure*). CorrectnessCounters::passed() requires every error counter at zero and attempted == completed; a row that fails correctness gets a correctness_failure diagnostic and fails RunGate::CorrectnessFailed regardless of profile.',
              ],
              code: `#[stress(tier = 2)]
fn dedupe_batch(ctx: &mut StressContext) {
    let input = build_batch_with_known_duplicates();
    let completed = ctx.measure_batch("dedupe", input.len() as u64, || dedupe(&input));

    let duplicates = count_expected_duplicates(&input);
    let _ = ctx
        .correctness()
        .attempted(completed)
        .completed(completed - duplicates)
        .duplicates(duplicates);
}`,
              callout: {
                title:
                  'operations() and correctness() only touch the latest measurement',
                body: 'ctx.operations(n) and ctx.correctness() apply to self.measurements.last_mut() if one exists, otherwise they buffer onto the next measurement pushed. Call them for the row they are meant to describe, immediately after the ctx.measure* call that produced it, especially in functions that record more than one named measurement.',
              },
            },
          ],
        },
        {
          path: 'selection-and-runs',
          title: 'Selection and Run Semantics',
          description:
            'Select benchmarks and understand warmup, measurement, repetition, filtering, and exit behavior.',
          keywords: ['selection', 'warmup', 'run'],
          content: [
            {
              id: 'selection',
              title: 'Selection',
              paragraphs: [
                '--workload PATTERN (alias --filter) narrows the registered STRESS_BENCHMARKS set before anything runs. Stress builds five candidate strings per benchmark, entry.name, entry.function_name, entry.module_path, "{module_path}::{function_name}", and "{module_path}::{name}", then matches pattern against all five, case-insensitively. Without a *, the match is a substring; with one or more *, the segments between asterisks must appear in order (a leading/trailing * is optional).',
                '--tier N restricts the run to exactly one numeric tier (1 through 6); it composes with --workload. --include-ignored (or STRESS_INCLUDE_IGNORED) is required to run a benchmark marked #[stress(ignore)] at all.',
                'When a --workload pattern matches nothing, Stress does not just report an empty run: it scores every registered candidate string by Levenshtein distance against the pattern and prints up to five close suggestions in "Did you mean: ...?" form, so a typo in a large suite does not read as a benchmark that silently stopped running.',
              ],
              code: `cargo bench --bench storage_stress -- --workload 'parse_route_hot_path'
cargo bench --bench storage_stress -- --workload 'queue::writer::*'
cargo bench --bench storage_stress -- --tier 3 --workload '*fanout*'`,
            },
            {
              id: 'warmup',
              title: 'Warmup',
              paragraphs: [
                'Warmup samples run before measured samples with the same benchmark function and mode, and they are written into the JSON artifact (SamplePhase::Warmup) for reproducibility, but they never contribute to summary statistics, quality classification, or baseline comparison.',
                'The warmup sample count is profile-dependent: 1 for default and release, 2 for lab, 0 for smoke. --warmup-samples N or STRESS_WARMUP_SAMPLES overrides it, and ctx.benchmark(name).warmup(n) overrides it for one measurement only.',
              ],
            },
            {
              id: 'measurement-runs',
              title: 'Measurement runs',
              paragraphs: [
                "Raw Sample rows are the only source of truth: BenchmarkSummary (mean, median, p50/p95/p99, std_dev, relative_std_dev, and a 95% confidence interval) is computed exclusively from SamplePhase::Measured rows for a given benchmark id. Cooldown samples (SamplePhase::Cooldown, default 0 except lab's 1) are recorded the same way as warmup: retained, never counted in statistics.",
                'Measured sample count is also profile-dependent, and it directly drives the quality classification a row can reach (authoritative needs at least 10 measured samples and <= 5% RSD; acceptable needs at least 5 and <= 10% RSD).',
              ],
              table: {
                headers: [
                  'Profile',
                  'Measured samples',
                  'Warmup',
                  'Cooldown',
                  'Gate behavior',
                ],
                rows: [
                  [
                    'default',
                    '5',
                    '1',
                    '0',
                    'Fails correctness and budgets; reports quality/regressions without failing on them',
                  ],
                  [
                    'smoke',
                    '1',
                    '0',
                    '0',
                    'Explicit diagnostic override; correctness/budgets only, no quality or regression failure',
                  ],
                  [
                    'lab',
                    '30',
                    '2',
                    '1',
                    'Exhaustive exploration; fails correctness and budgets, reports quality findings',
                  ],
                  [
                    'release',
                    '10',
                    '1',
                    '0',
                    'Fails correctness, budgets, quality below acceptable, and meaningful regressions',
                  ],
                ],
              },
            },
            {
              id: 'exit-behavior',
              title: 'Exit behavior',
              paragraphs: [
                'After a run finishes, evaluate_run_gate(&run) checks policy in a fixed order and returns the first failing RunGate variant: CorrectnessFailed, then BudgetFailed, then (if the profile fails on regression) RegressionFailed, then (if a strict diagnostic threshold is configured) DiagnosticsFailed, then (if the profile fails on quality) QualityFailed, otherwise Passed.',
                'A non-Passed gate prints "Stress run failed: <Gate>" to stderr and the process exits with status 1. This is what makes cargo bench --bench ... -- --profile release usable as a CI gate: correctness and configured budgets always fail the run regardless of profile, and release additionally fails on quality and regressions.',
              ],
            },
          ],
        },
        {
          path: 'attributes',
          title: 'Attributes',
          description:
            'Configure benchmark identity, tier, profiles, timing, samples, and comparison behavior.',
          keywords: ['attribute', 'tier', 'profile'],
          content: [
            {
              id: 'identity',
              title: 'Identity',
              paragraphs: [
                'name = "custom_name" sets the display name written into the artifact; without it the display name is the Rust function name. ignore marks the benchmark so it is skipped unless --include-ignored or STRESS_INCLUDE_IGNORED is set. Neither affects the stable id used for baseline matching, which is always "{suite}/{module_path}::{function_name}" built from the real Rust identifier.',
                'Baseline comparison first tries to match by this stable id and falls back to matching by display name, so renaming a function (which changes the id) but keeping the same name = "..." still lets a baseline resolve.',
              ],
              code: `#[stress]
#[stress(tier = 1)]
#[stress(name = "custom_name", ignore)]`,
            },
            {
              id: 'tier-and-profile',
              title: 'Tier and profile',
              paragraphs: [
                'tier = 1 through 6 is the one required piece of static shape: it selects both the semantic scope of the benchmark (hot path, subsystem, system, integration, saturation/scaling, soak/endurance) and its concrete timing mode. tier defaults to 2 when omitted. The macro rejects tier = 0 at compile time ("cntryl-stress tiers start at 1") and any tier above 6 ("cntryl-stress tiers are 1 through 6").',
                'mode is derived from tier, not set directly: mode = "..." is explicitly rejected by the macro parser with a compile error ("mode is not a public stress attribute; choose tier = 1 through 6"). Tier 1 always resolves to BenchmarkModeKind::Micro, Tier 2 to FixedOperations, and Tiers 3-6 to FixedDuration.',
              ],
            },
            {
              id: 'timing-and-samples',
              title: 'Timing and samples',
              paragraphs: [
                'Five optional budget attributes attach a BenchmarkBudgets to the row: max_ns_per_op, max_allocs_per_op, max_bytes_per_op, max_regression_pct, and max_rsd_pct. Any budget that is exceeded produces a budget_failure diagnostic and fails RunGate::BudgetFailed regardless of run profile; configuring max_allocs_per_op or max_bytes_per_op without cntryl_stress::stress_allocator!() installed also fails as budget_failure ("allocation tracking is unavailable") because the row cannot prove the budget.',
                'These attributes are static, compiled into the benchmark; per-measurement sample-count overrides (independent of budgets) go through the runtime builder instead: ctx.benchmark("name").samples(20).warmup(2).cooldown(1).measure(...) overrides just that one measurement\'s sample counts, leaving the profile defaults in place for every other row in the same binary.',
              ],
              table: {
                headers: ['Attribute', 'Meaning', 'Failure mode'],
                rows: [
                  [
                    'max_ns_per_op',
                    'Upper bound on mean net ns/op',
                    'budget_failure if mean exceeds the limit',
                  ],
                  [
                    'max_allocs_per_op',
                    'Upper bound on mean allocations/op',
                    'budget_failure; requires stress_allocator!()',
                  ],
                  [
                    'max_bytes_per_op',
                    'Upper bound on mean allocated bytes/op',
                    'budget_failure; requires stress_allocator!()',
                  ],
                  [
                    'max_regression_pct',
                    'Per-row override of the global regression threshold',
                    'Used instead of --threshold / STRESS_THRESHOLD for this row only',
                  ],
                  [
                    'max_rsd_pct',
                    'Upper bound on relative standard deviation, in percent',
                    'budget_failure if RSD exceeds the limit',
                  ],
                ],
              },
              code: `#[stress(tier = 1, max_ns_per_op = 250, max_regression_pct = 5)]
#[stress(max_allocs_per_op = 0, max_bytes_per_op = 0, max_rsd_pct = 10)]`,
            },
            {
              id: 'comparison-settings',
              title: 'Comparison settings',
              paragraphs: [
                'metadata(key = "value", ...) attaches free-form descriptive strings to BenchmarkSpec.metadata, which show up in the artifact and in diagnostics evidence; common uses in the demo suite are metadata(component = "storage") and metadata(scenario = "fanout"). metadata(row_class = "construction" | "parsing" | "allocation") is treated specially: it tells the allocation diagnostics that allocation is the point of the row, downgrading the high_allocations diagnostic to Info severity instead of Warning/Error unless an explicit max_allocs_per_op / max_bytes_per_op budget still fails.',
                "ns_per_op_basis in a row's metadata (set automatically for Tier 1 batch rows to logical_completed_operation) is compared across baseline and current runs; a mismatch marks the comparison Inconclusive with a baseline_semantics_changed diagnostic rather than reporting a false regression or improvement.",
              ],
              code: `#[stress(tier = 1, metadata(row_class = "parsing"))]
fn parse_header(ctx: &mut StressContext) {
    let header = b"content-type:application/json";
    ctx.measure("parse header", || {
        header.split(|byte| *byte == b':').count()
    });
}`,
            },
          ],
        },
        {
          path: 'tier-recipes',
          title: 'Tier Recipes',
          description:
            'Structure focused, lifecycle, integration, endurance, and campaign-style measurements.',
          keywords: ['tier', 'recipe', 'campaign'],
          content: [
            {
              id: 'pick-a-tier',
              title: 'Pick a tier first',
              paragraphs: [
                'Every tier shares the same authoring API; only the default timing shape changes. Pick tier by what the row is answering, not by how big the function looks: a two-line hash comparison that represents the entire request path is still Tier 1 if it is a hot path, and a call into a whole subsystem is Tier 2 even if the implementation is short.',
              ],
              table: {
                headers: ['Tier', 'Scope', 'Default recipe'],
                rows: [
                  [
                    '1',
                    'Hot path / microbenchmark',
                    'ctx.measure("parse", || hot_path())',
                  ],
                  [
                    '2',
                    'Subsystem operation',
                    'ctx.measure("write", || op()) or ctx.measure_batch("flush", n, || batch())',
                  ],
                  [
                    '3',
                    'System throughput',
                    '#[stress(tier = 3)] plus ctx.measure_batch("project", n, || batch())',
                  ],
                  [
                    '4',
                    'Integration throughput',
                    'Fixed-duration ctx.measure_batch(...) or ctx.record_external("round trip", duration, n)',
                  ],
                  [
                    '5',
                    'Saturation / scaling',
                    'Fixed-duration ctx.measure_batch(...) with scale parameters (client_count, shard_count)',
                  ],
                  [
                    '6',
                    'Soak / endurance',
                    'Fixed-duration ctx.measure_batch(...) or ctx.record_external("soak", duration, n) over the soak window',
                  ],
                ],
              },
            },
            {
              id: 'focused-work',
              title: 'Focused work (Tier 1)',
              paragraphs: [
                'Tier 1 calibrates a batch size to hit a target sample duration (25ms by default, tunable with STRESS_MICRO_SAMPLE_DURATION_MS), then subtracts an empty-loop overhead measurement to report net ns/op. Keep the closure small, deterministic, and free of anything that would dominate the timing itself.',
                'If a Tier 1 row intentionally measures parsing, construction, or allocation cost, tag it with metadata(row_class = "parsing") (or "construction" / "allocation") so the allocation diagnostics treat allocation as expected rather than as a regression to flag.',
              ],
              code: `#[stress(tier = 1, metadata(row_class = "parsing"))]
fn parse_header(ctx: &mut StressContext) {
    let header = b"content-type:application/json";
    ctx.measure("parse header", || {
        black_box(header.split(|byte| *byte == b':').count())
    });
}`,
            },
            {
              id: 'lifecycle-work',
              title: 'Lifecycle work (Tier 2)',
              paragraphs: [
                'Tier 2 runs a fixed number of operations per sample (1 by default; STRESS_OPERATIONS_PER_SAMPLE to change it) and reports ns/op from real wall-clock time, no calibration involved. Use ctx.measure for a single logical operation per call, or ctx.measure_batch when one call completes several logical units of the same subsystem operation; measure_batch returns the completed count so downstream code (or a follow-on ctx.correctness() call) can use it.',
              ],
              code: `#[stress(tier = 2)]
fn flush_ready_entries(ctx: &mut StressContext) {
    let ready = ready_entry_count();
    let _completed = ctx.measure_batch("flush ready entries", ready, || flush_ready_entries_once());
}`,
            },
            {
              id: 'integration-work',
              title: 'Integration work (Tiers 3-4)',
              paragraphs: [
                'Tier 3 and Tier 4 both run for a fixed wall-clock window (500ms by default; STRESS_SAMPLE_DURATION_MS to change it), repeating the closure until the window elapses and reporting completed-operations-per-second as throughput. Use ctx.measure_batch with the real per-call logical operation count for in-process throughput work, or ctx.record_external when a different harness (an external load generator, another process) already owns the timing and hands back an elapsed Duration plus a completed-operation count.',
                'record_external never brackets allocation, so allocation diagnostics and allocation budgets are unavailable on those rows; only use it when both the duration and the operation count it reports are exact, not estimated.',
              ],
              code: `#[stress(tier = 3)]
fn project_events(ctx: &mut StressContext) {
    let events = load_events();
    let completed = ctx.measure_batch("project events", events.len() as u64, || {
        for event in &events {
            black_box(project(event));
        }
    });
    black_box(completed);
}

#[stress(tier = 4)]
fn remote_round_trip(ctx: &mut StressContext) {
    let report = run_external_harness();
    ctx.record_external(
        "remote round trip",
        std::time::Duration::from_nanos(report.elapsed_ns),
        report.completed_operations,
    );
}`,
            },
            {
              id: 'endurance-and-campaigns',
              title: 'Endurance and campaigns (Tiers 5-6)',
              paragraphs: [
                'Tiers 5 and 6 use the same fixed-duration mechanics as Tier 3/4; what changes is intent and parameters. Tier 5 (saturation/scaling) should carry explicit scale parameters, such as ctx.parameter("shard_count", shard_count) or client_count, so a report can explain what was scaled. Tier 6 (soak/endurance) is meant to run over a much longer window than the default sample duration; override it explicitly with STRESS_SAMPLE_DURATION_MS or the campaign\'s own external timing via record_external, since the framework has no separate "soak mode" beyond the fixed-duration timing all Tier 3-6 rows already share.',
              ],
              code: `#[stress(tier = 5, metadata(component = "queue", tier_name = "saturation_scaling"))]
fn shard_fanout(ctx: &mut StressContext) {
    let shard_count = 64_u64;
    ctx.parameter("shard_count", shard_count);
    let completed = ctx.measure_batch("shard fanout", shard_count, || {
        for shard in 0..shard_count {
            black_box(shard.rotate_left(3));
        }
    });
    black_box(completed);
}`,
              callout: {
                title: 'STRESS_RUN_ID ties multi-binary campaigns together',
                body: "When a campaign spans more than one stress binary (or `cargo stress` orchestrates several benches/*.rs files), set STRESS_RUN_ID once so every child artifact's metadata.run_id matches. Report tooling that groups by run id can then treat the set as one generation instead of accidentally mixing latest.json files from unrelated runs.",
              },
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
          path: 'artifacts',
          title: 'Artifacts',
          description:
            'Read current and historical structured results, metadata, samples, percentiles, and findings.',
          keywords: ['artifact', 'latest.json', 'sample'],
          content: [
            {
              id: 'artifact-layout',
              title: 'Artifact layout',
              paragraphs: [
                "Each run writes files under target/stress/{suite}/: a timestamped {timestamp}.json plus a latest.json that always points at the most recent run, and matching {timestamp}.txt/latest.txt and {timestamp}.md/latest.md for human reading. The suite name comes from the compiled binary's file stem (with any Cargo hash suffix stripped and underscores turned into dashes).",
                'Every current-schema JSON artifact is a StressRun with schema_version: "cntryl-stress.v2". StressRun::from_json_str rejects any other schema_version outright, so older artifacts from a previous major version will not silently parse as if they matched the current shape.',
              ],
            },
            {
              id: 'run-metadata',
              title: 'Run metadata',
              paragraphs: [
                'StressRun carries suite, run_profile, environment (an EnvironmentInfo), started_at, total_elapsed_ns, and a free-form metadata map. EnvironmentInfo records cpu_model, core_count, os, rustc_version, allocator, build_profile, git_commit, tool_version, command_line, and the resolved profile_config (samples, warmup, cooldown, min_quality, thresholds); anything Stress could not determine is an explicit "unknown" string or null, never a silently omitted field.',
                'metadata.run_id is populated from the STRESS_RUN_ID environment variable when it is set (cargo stress generates a shared one for all child binaries automatically), which is the key report tooling should group by when comparing artifacts from a multi-binary run.',
              ],
            },
            {
              id: 'measurements-and-samples',
              title: 'Measurements and samples',
              paragraphs: [
                'samples is the array of raw Sample rows: benchmark_id, phase (warmup/measured/cooldown), elapsed_ns, wall_clock_ns (which includes framework overhead like Tier 1 calibration), operations_attempted/operations_completed, throughput, and, where applicable, calibrated_iterations, gross/overhead/net elapsed and per-op nanoseconds, allocs/bytes and their per-op derivatives, latency_ns, parameters, and a per-sample environment snapshot.',
                'summaries is the derived BenchmarkSummary array, one per benchmark_id, computed only from SamplePhase::Measured rows: mean/median/min/max/std_dev/relative_std_dev/p50/p95/p99 (via SummaryStats::from_values) for the primary metric, plus separate stats objects for wall clock, ns_per_op, gross_ns_per_op, overhead_ns_per_op, allocs_per_op, and bytes_per_op when they are available.',
              ],
              code: `{
  "benchmark_id": "lookup/benches::lookup::find_separator",
  "name": "benches::lookup::find_separator",
  "tier": 1,
  "primary_metric": "ns_per_op",
  "measured_samples": 5,
  "stats": { "mean": 3.21, "p50": 3.1, "p95": 3.9, "p99": 4.2, "relative_std_dev": 0.04 },
  "quality": "acceptable",
  "trust_class": "gate"
}`,
            },
            {
              id: 'quality-findings',
              title: 'Quality findings',
              paragraphs: [
                'Every summary gets a QualityClass: authoritative requires at least 10 measured samples and relative standard deviation <= 5%; acceptable requires at least 5 measured samples and RSD <= 10%; noisy means correctness passed but sample count or variance is weak; untrustworthy covers too few samples, zero completed operations, invalid timing, or a correctness failure.',
                "diagnostics on a summary is a Vec<BenchmarkDiagnostic>, each with a stable code, a severity (Info/Warning/Error), a human reason, a BTreeMap of machine-readable evidence, and concrete suggestions. diagnostics_summary at the run level flattens every summary's diagnostics into one query-friendly ledger tagged with suite, benchmark_id, tier, and the row's quality/trust_class, so tooling can filter across an entire run without walking each summary individually.",
              ],
            },
          ],
        },
        {
          path: 'comparisons-and-gates',
          title: 'Comparisons and Gates',
          description:
            'Compare compatible runs and apply explicit performance limits to trusted measurements.',
          keywords: ['baseline', 'comparison', 'gate'],
          content: [
            {
              id: 'comparison-identity',
              title: 'Comparison identity',
              paragraphs: [
                'compare_summaries matches each current summary against a baseline first by benchmark_id, then falls back to matching by display name if no id matches. This means renaming a function changes its id (module_path::function_name) but a baseline still resolves as long as the name = "..." attribute (or the default display name) is unchanged.',
                'Before computing a numeric comparison, Stress checks whether metadata["ns_per_op_basis"] differs between current and baseline (this key flips to "logical_completed_operation" automatically for Tier 1 batch rows). A mismatch marks the row Inconclusive with a baseline_semantics_changed reason instead of reporting a false regression, because the two runs are not measuring the same unit of work.',
              ],
            },
            {
              id: 'baselines',
              title: 'Baselines',
              paragraphs: [
                '--baseline PATH (or STRESS_BASELINE) points at an exact artifact file to compare against. --baseline latest resolves instead to {baseline-dir}/latest/{suite}.json, where baseline-dir defaults to target/stress/baselines (override with --baseline-dir / STRESS_BASELINE_DIR, and suite path separators are flattened to underscores in the filename).',
                '--save-baseline (STRESS_SAVE_BASELINE) writes both a {started_at}.json and a latest.json copy of the current run under baseline-dir, but only after the run gate has already passed; a run that fails correctness, budgets, quality, or regressions never gets saved as a new baseline.',
              ],
              code: `cargo bench --bench storage_stress -- --baseline target/stress/storage_stress/latest.json
cargo bench --bench storage_stress -- --baseline latest --baseline-dir target/stress/baselines
cargo bench --bench storage_stress -- --save-baseline`,
            },
            {
              id: 'gates',
              title: 'Gates',
              paragraphs: [
                "Each comparison is classified as Regression, Improvement, Inconclusive, or MissingBaseline. A verdict of Regression or Improvement requires both that the primary metric moved past the threshold (5% by default, or the row's own max_regression_pct if set) in the worse/better direction for that metric, and that the two runs' 95% confidence intervals do not overlap; if either condition fails, the comparison is Inconclusive rather than a false positive.",
                'Only rows with trust_class == Gate participate in the regression gate (run.regressions() filters comparisons down to gate-class benchmark ids); Diagnostic, Experimental, and Invalid rows are excluded from RunGate::RegressionFailed even if they show a large change.',
              ],
              table: {
                headers: ['Classification', 'Meaning'],
                rows: [
                  [
                    'Regression',
                    'Metric moved past threshold in the worse direction and confidence intervals do not overlap',
                  ],
                  [
                    'Improvement',
                    'Metric moved past threshold in the better direction and confidence intervals do not overlap',
                  ],
                  [
                    'Inconclusive',
                    'Metric did not clear threshold, intervals overlap, values are non-positive, or ns_per_op_basis changed',
                  ],
                  [
                    'MissingBaseline',
                    'No matching row (by id or name) in the baseline artifact',
                  ],
                ],
              },
            },
            {
              id: 'failure-output',
              title: 'Failure output',
              paragraphs: [
                'evaluate_run_gate checks correctness, then budgets, then (only if the profile\'s fail_on_regression is set, which is true only for release) regressions, then (if deny_diagnostics is configured) diagnostics severity, then (if fail_on_quality is set, also release-only) minimum quality. The first failing check wins and the run exits 1 with "Stress run failed: <Gate>" on stderr; a regressed row also gets a regression diagnostic (Error severity) attached to its own summary for the human/JSON report to surface.',
              ],
            },
          ],
        },
        {
          path: 'diagnostics',
          title: 'Diagnostics',
          description:
            'Capture allocation, environment, timing, trust, and benchmark-quality diagnostics.',
          keywords: ['diagnostics', 'allocation', 'trust'],
          content: [
            {
              id: 'environment',
              title: 'Environment',
              paragraphs: [
                'Every sample and every run carries an EnvironmentInfo snapshot (cpu_model, core_count, os, rustc_version, allocator, build_profile, git_commit, tool_version, command_line, profile_config). Fields Stress cannot determine on the current platform are explicit "unknown" strings or null, never silently dropped, so a report can distinguish "not available here" from "field missing from an old schema".',
                "git_commit is auto-detected by shelling out to git rev-parse HEAD unless STRESS_GIT_SHA or --print-config shows it was already supplied; either source is recorded, along with which one won, in the run's resolved-config metadata.",
              ],
            },
            {
              id: 'timing',
              title: 'Timing',
              paragraphs: [
                'invalid_timing (Error) fires when a measured sample has zero elapsed time or a non-finite/non-positive net_ns_per_op. zero_completed_ops (Error) fires when a measured sample completed no logical operations at all. too_few_samples (Error below 2, Warning below 5) flags a row that does not have enough measured samples to make a stable decision. high_variance (Warning) fires above 10% relative standard deviation and carries evidence (max/min-to-median ratios, wall-clock RSD, completed-operations RSD) plus targeted suggestions, for example noting when a stable wall clock alongside variable completed-operations points at contention rather than timer noise.',
                'setup_dominates_measurement (Error) fires when empty-loop overhead is at or above net measured time (or is at least half of gross time), which usually means the measured closure is too small relative to per-iteration bookkeeping. too_fast (Warning) flags samples whose elapsed time is too small to be a useful timing sample. likely_optimized_away (Warning) fires when Tier 1 net ns/op is under 5, and tiny_micro_timing (Warning) when it is between 5 and 15, unless the row carries metadata(validated_micro = "true") (or micro_validated) to say the low number was checked deliberately (for example, with varied inputs and accumulated outputs to defeat dead-code elimination).',
              ],
            },
            {
              id: 'allocation',
              title: 'Allocation',
              paragraphs: [
                'Allocation counters only exist if the benchmark crate installs cntryl_stress::stress_allocator!() as its global allocator; it wraps std::alloc::System and records allocation/byte counts through atomics that Stress diffs around each sample. Without it, allocs/bytes/allocs_per_op/bytes_per_op stay None on every sample, and configuring max_allocs_per_op or max_bytes_per_op without the allocator installed produces a budget_failure diagnostic ("allocation tracking is unavailable") that fails the run regardless of profile.',
                'high_allocations fires whenever measured allocation counts are non-trivial; its severity is downgraded to Info automatically when the row carries metadata(row_class = "construction" | "parsing" | "allocation"), because allocation is then treated as the expected shape of the row rather than a surprise, and only an explicit budget failure still errors.',
              ],
              code: `// benches/storage_stress.rs
cntryl_stress::stress_allocator!();

#[stress(tier = 1, max_allocs_per_op = 0, max_bytes_per_op = 0)]
fn parse_route_hot_path(ctx: &mut StressContext) {
    // ...
}`,
              callout: {
                title: 'One allocator per binary',
                body: "stress_allocator!() installs a #[global_allocator]. Call it once per benchmark binary; a binary with no call to it simply never has allocation data, and any allocation budget on that binary's rows will fail with budget_failure rather than being silently skipped.",
              },
            },
            {
              id: 'trust-findings',
              title: 'Trust findings',
              paragraphs: [
                "Every summary gets a TrustClass: Gate (default; participates in quality and regression gates), Diagnostic (intentionally non-gating but still reported), Experimental (needs follow-up before being trusted), or Invalid (known-bad semantics). Certain diagnostic codes are blocking by construction, invalid_timing, zero_completed_ops, correctness_failure, budget_failure, and setup_dominates_measurement among them, and downgrade a row's trust_class away from Gate even if the author never set one explicitly.",
                'batch_unit_ambiguous (Warning) flags Batch-intent rows missing a logical_unit parameter (or one whose *_per_logical_operation basis is not recorded), fixed_ops_throughput (Warning) flags a Tier 3+ throughput row still using fixed-operation timing semantics instead of duration-based timing, flat_or_capped_throughput (Warning) flags near-perfectly flat throughput alongside effectively fixed completed work (often an intentional capped-capacity probe, but worth confirming), single_op_throughput (Warning) flags a Tier 3+ row completing exactly one operation per sample, measurement_mode_mismatch (Warning) flags sibling rows in the same workload family mixing throughput measurement semantics, and async_misuse (Info) flags an Async-intent row that shows no observable scheduling overhead, which usually means the measured future never actually awaited real async work.',
              ],
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
            'Find environment variables, run policy, profiles, artifact paths, and runner settings.',
          keywords: ['configuration', 'environment', 'policy'],
          content: [
            {
              id: 'environment-variables',
              title: 'Environment variables',
              paragraphs: [
                "STRESS_* environment variables set defaults for a run; command-line flags on the compiled benchmark binary (--samples, --tier, --baseline, and so on) override them, and both override the profile's built-in defaults. cargo stress passes CLI flags through to each child binary as the equivalent STRESS_RUN_ID / --flag pair, and StressRunnerConfig::from_env() is what a programmatic StressRunner::new(suite) reads if you build a runner directly instead of using stress_main!().",
              ],
              table: {
                headers: ['Variable', 'Description'],
                rows: [
                  [
                    'STRESS_PROFILE',
                    'Optional profile override: default, smoke, lab, or release',
                  ],
                  ['STRESS_SAMPLES', 'Measured samples per benchmark'],
                  ['STRESS_WARMUP_SAMPLES', 'Warmup samples'],
                  ['STRESS_COOLDOWN_SAMPLES', 'Cooldown samples'],
                  [
                    'STRESS_FILTER',
                    'Benchmark name/module filter (same matching as --workload)',
                  ],
                  ['STRESS_TIER', 'Exact tier filter, 1 through 6'],
                  [
                    'STRESS_OUTPUT_DIR',
                    'Artifact output directory (default target/stress)',
                  ],
                  [
                    'STRESS_JSON',
                    'Emit machine-readable JSON to stdout instead of the console table',
                  ],
                  [
                    'STRESS_INCLUDE_IGNORED',
                    'Include #[stress(ignore)] benchmarks',
                  ],
                  [
                    'STRESS_BASELINE',
                    'Baseline stress artifact path, or "latest"',
                  ],
                  [
                    'STRESS_BASELINE_DIR',
                    'Baseline directory for latest/--save-baseline conventions',
                  ],
                  [
                    'STRESS_SAVE_BASELINE',
                    'Save a passed run under the baseline directory',
                  ],
                  [
                    'STRESS_THRESHOLD',
                    'Regression/improvement threshold (fraction, default 0.05)',
                  ],
                  [
                    'STRESS_GIT_SHA',
                    'Git SHA override (auto-detected via git rev-parse HEAD otherwise)',
                  ],
                  [
                    'STRESS_SAMPLE_DURATION_MS',
                    'Fixed-duration sample budget for Tiers 3-6',
                  ],
                  [
                    'STRESS_OPERATIONS_PER_SAMPLE',
                    'Fixed-operations sample size for Tier 2',
                  ],
                  [
                    'STRESS_MICRO_SAMPLE_DURATION_MS',
                    'Micro sample target duration for Tier 1 calibration',
                  ],
                  [
                    'STRESS_RUN_ID',
                    'Run generation identity copied into artifact metadata.run_id',
                  ],
                  [
                    'STRESS_FAIL_ON_ISSUES',
                    'Fail on warning-or-error diagnostics (shorthand for STRESS_DENY_DIAGNOSTICS=warning)',
                  ],
                  [
                    'STRESS_DENY_DIAGNOSTICS',
                    'Fail on diagnostics at info, warning, or error',
                  ],
                  [
                    'STRESS_CONSOLE_NAMES',
                    'Human console name mode: compact or full',
                  ],
                  [
                    'STRESS_PROGRESS',
                    'Enable or disable stderr progress for human output',
                  ],
                ],
              },
            },
            {
              id: 'run-policy',
              title: 'Run policy',
              paragraphs: [
                'Run policy is expressed by ProfileConfig / StressRunnerConfig: measured_samples, warmup_samples, cooldown_samples, min_quality, fail_on_quality, fail_on_regression, deny_diagnostics, regression_threshold, and the three timing knobs (sample_duration, operations_per_sample, micro_sample_duration). StressRunnerConfig::validation_errors() rejects a config before it runs anything if samples or operations_per_sample is zero, or if tier is set outside 1..=6; a run with zero measured samples would do no useful work, so Stress refuses to start it instead of quietly producing empty summaries.',
              ],
            },
            {
              id: 'profiles',
              title: 'Profiles',
              paragraphs: [
                'default, smoke, lab, and release are the four built-in RunProfile values; each resolves to a fixed ProfileConfig (see the Selection and Run Semantics page for the exact sample-count table). --profile (or STRESS_PROFILE) selects one; every other STRESS_* variable and CLI flag then overrides individual fields on top of whichever profile was selected, with CLI flags taking precedence over environment variables, which take precedence over the profile default.',
              ],
            },
            {
              id: 'artifact-settings',
              title: 'Artifact settings',
              paragraphs: [
                'STRESS_OUTPUT_DIR (default target/stress) controls where {suite}/{timestamp+latest}.json/.txt/.md land. STRESS_BASELINE_DIR (default target/stress/baselines) controls where --save-baseline writes and where --baseline latest looks, under a {bucket}/{suite-with-slashes-replaced-by-underscores}.json path. --print-config (or STRESS_PRINT_CONFIG via the equivalent flag) prints every resolved setting alongside which source won it (cli/env/default) without running any benchmarks, which is the fastest way to confirm what a given invocation will actually do.',
              ],
              code: `cargo bench --bench storage_stress -- --print-config
cargo bench --bench storage_stress -- --samples 10 --warmup-samples 1 --output-dir target/stress-ci`,
            },
          ],
        },
        {
          path: 'api-reference',
          title: 'Public API',
          description:
            'Find the benchmark macro, context, measurement, runner, policy, artifact, and result APIs.',
          keywords: ['Rust API', 'reference'],
          content: [
            {
              id: 'macros',
              title: 'Macros',
              paragraphs: [
                "#[stress(...)] (from cntryl_stress_macros, re-exported at the crate root) turns a fn(ctx: &mut StressContext) or async fn(ctx: &mut StressContext) into a registered benchmark entry. stress_main!() expands to a main() function that hands off to the framework's discovery-and-CLI-parsing runtime; a benchmark binary needs exactly one stress_main!() call. cntryl_stress::stress_allocator!() installs StressAllocator as the process's #[global_allocator] so allocation counters become available.",
                'Common benchmark files never need more than root imports: stress, stress_main, black_box, StressContext, StressRunner, StressRunnerConfig, StressRunnerOptions, and RunProfile all stay at the crate root across versions. Advanced imports live in submodules: result and schema types under cntryl_stress::artifact, reporters and console formatting under cntryl_stress::reporting, and run-gate helpers under cntryl_stress::runner.',
              ],
              code: `use cntryl_stress::{black_box, stress, stress_main, StressContext};
use cntryl_stress::artifact::{StressRun, BenchmarkSummary, SCHEMA_VERSION};
use cntryl_stress::reporting::{format_console_run, ConsoleReporter, Reporter};
use cntryl_stress::runner::{evaluate_run_gate, RunGate};`,
            },
            {
              id: 'benchmark-context',
              title: 'Benchmark context',
              paragraphs: [
                'StressContext is the parameter every benchmark function receives. Its core methods: parameter(key, value) and metadata(key, value) attach to the current or next measurement; measure, measure_batch, measure_async, measure_threaded, measure_pipeline, and measure_io each record one named row using the tier-derived timing mode; record_external records an externally-timed row; correctness() returns a fluent recorder (.attempted/.completed/.failures/.timeouts/.duplicates/.dropped/.validation_errors); operations(n) is a shorthand that sets both attempted and completed to n; and record_latency(duration) queues a raw latency observation for the next pushed measurement.',
                'ctx.benchmark(name) starts a BenchmarkBuilder for one-off overrides: .samples(n), .warmup(n), .cooldown(n), and .intent(...) before calling .measure(...), .measure_batch(...), or .measure_async(...).',
              ],
            },
            {
              id: 'runner-and-policy',
              title: 'Runner and policy',
              paragraphs: [
                'StressRunner is the lower-level programmatic entry point used instead of stress_main!() when a caller wants to drive benchmarks directly: StressRunner::new(suite) reads STRESS_* env vars, StressRunner::with_config(suite, config) takes an explicit StressRunnerConfig, and .run(name, |ctx| ...) or .run_spec(&spec, f) records one benchmark before .finish() (or .finish_with_baseline(path)) produces a StressRun.',
                'StressRunnerConfig::for_profile(profile) builds policy from one of the four profiles; the builder methods (.samples(n), .filter(pattern), .tier(n), .threshold(v), .deny_diagnostics(severity), and so on) layer overrides on top. runner::evaluate_run_gate(&run) -> RunGate is the same gate stress_main!() uses internally, available for callers that assemble a StressRun some other way.',
              ],
              code: `use cntryl_stress::{StressRunner, StressRunnerConfig};

let config = StressRunnerConfig::new().filter("write");
let mut runner = StressRunner::with_config("storage", config);
runner.run("write_batch", |ctx| {
    let batch = vec![0_u8; 4096];
    ctx.parameter("payload_size", batch.len());
    ctx.measure("write batch", || write_batch(&batch));
});
let run = runner.finish();`,
            },
            {
              id: 'artifacts-and-results',
              title: 'Artifacts and results',
              paragraphs: [
                'cntryl_stress::artifact exposes the full schema: StressRun (with StressRun::load(path) and StressRun::from_json_str), BenchmarkSpec, Sample, SamplePhase, BenchmarkSummary, SummaryStats, CorrectnessCounters, ComparisonResult, ComparisonClass, DiagnosticSummary, BenchmarkDiagnostic, DiagnosticSeverity, QualityClass, TrustClass, RunProfile, BenchmarkMode, BenchmarkModeKind, BenchmarkBudgets, and SCHEMA_VERSION ("cntryl-stress.v2"). StressRun also exposes convenience methods: correctness_passed(), meets_min_quality(min), regressions() (gate-class rows only), budgets_passed(), and diagnostics_passed(threshold).',
                'cntryl_stress::reporting exposes format_console_run(&run) / format_console_runs(&runs) (the same human table stress_main!() prints), the Reporter trait, and the built-in ConsoleReporter, JsonReporter, JsonStdoutReporter, StderrProgressReporter, GitHubActionsReporter, and MultiReporter implementations.',
              ],
            },
          ],
        },
        {
          path: 'troubleshooting',
          title: 'Troubleshooting',
          description:
            'Diagnose discovery, execution, measurement, artifact, comparison, and gate failures.',
          keywords: ['diagnostics', 'errors'],
          content: [
            {
              id: 'discovery-failures',
              title: 'Discovery failures',
              paragraphs: [
                '"No benchmarks registered. Add #[stress] to benchmark functions." means STRESS_BENCHMARKS is empty for this binary: either no function has #[stress(...)] at all, or the benchmark crate/module was not compiled into this binary. "No benchmarks matched workload pattern \'X\'" (with a "Did you mean: ...?" suggestion list when close registered names exist) means --workload/--filter or STRESS_FILTER excluded every candidate; --list prints every registered name, function_name, and module_path so you can check the exact strings being matched against.',
                'A tier/mode mismatch panics at runtime with a message like "Benchmark \'name\' has invalid tier/mode combination: Tier 1 uses micro; remove mode or use tier = 1 for micro." This should not normally be reachable through the public #[stress] macro (which derives mode from tier and rejects an explicit mode = "..." attribute at compile time); it only surfaces when a BenchmarkSpec is constructed by hand with mismatched tier and mode fields.',
              ],
            },
            {
              id: 'execution-failures',
              title: 'Execution failures',
              paragraphs: [
                '"Invalid stress config: samples must be greater than 0" (or the equivalent for operations_per_sample, or "tier must be between 1 and 6") comes from StressRunnerConfig::validation_errors() and exits 1 before any benchmark runs; it means an override (STRESS_SAMPLES=0, --tier 9, and so on) produced a config that could do no useful work.',
                'A malformed STRESS_* value (STRESS_SAMPLES=abc, STRESS_JSON=maybe) does not fail the run: Stress prints "Warning: invalid STRESS_X, using profile/default value" to stderr and falls back to the profile default for that one field, so a typo in one environment variable does not take down the whole run.',
              ],
            },
            {
              id: 'artifact-failures',
              title: 'Artifact failures',
              paragraphs: [
                'invalid_timing and zero_completed_ops (both Error severity) mean at least one measured sample had zero/invalid elapsed time or completed zero logical operations; check that the measured closure actually runs the intended work and that measure_batch / operations() is passed the true logical operation count, not a guessed one.',
                'setup_dominates_measurement (Error) means empty-loop overhead is at or above the net measured time; move fixture construction outside the ctx.measure* closure, or increase measured work per iteration so the ratio flips. StressRun::from_json_str returning an "unsupported schema_version" error means the artifact predates or postdates the "cntryl-stress.v2" schema this build understands; regenerate it with a matching cntryl-stress version rather than hand-editing the version string.',
              ],
            },
            {
              id: 'comparison-and-gate-failures',
              title: 'Comparison and gate failures',
              paragraphs: [
                '"Stress run failed to load baseline: <error>" means the --baseline path did not resolve to a readable, schema-matching artifact; confirm the path (or that --baseline-dir / STRESS_BASELINE_DIR points at where --save-baseline actually wrote files) before assuming the comparison logic is wrong.',
                'A comparison that stays Inconclusive when you expected Regression or Improvement usually means the two runs\' 95% confidence intervals overlap (the row is too noisy at the current sample count to tell) or that metadata["ns_per_op_basis"] differs between the two runs (surfaced as a baseline_semantics_changed diagnostic); in either case, more measured samples (via --samples, or the lab profile) is the direct fix, not a smaller threshold.',
                '"Stress run failed: <Gate>" reports the first RunGate to fail, in fixed order (correctness, budgets, regression, diagnostics, quality). A RunGate::QualityFailed or RegressionFailed on a row you did not intend to gate usually means its trust_class resolved to Gate by default; either fix the underlying diagnostic that is downgrading it, or mark it explicitly as diagnostic/experimental context if it should never participate in the release gate.',
              ],
            },
          ],
        },
      ],
    },
  ],
});
