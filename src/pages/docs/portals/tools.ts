import { definePortal } from '../define';

export const toolsPortal = definePortal({
  id: 'tools',
  label: 'Tools',
  shortLabel: 'Tools',
  kind: 'supporting',
  route: '/docs/tools',
  description:
    'CLI support for repository validation, inventory generation, and benchmark reporting.',
  repository: 'https://github.com/cntryl/tools',
  loader: () => import('../routes/tools'),
  sections: [
    {
      id: 'start',
      label: 'Start here',
      pages: [
        {
          path: '',
          title: 'Overview',
          description:
            'Learn which repository workflows Tools supports and what its reports do and do not establish.',
          content: [
            {
              id: 'cli-surface',
              title: 'CLI surface',
              paragraphs: [
                'Cntryl Tools is a standalone Rust binary (cntryl-tools) with one subcommand per child task: validate-tests checks Rust test naming and arrange-act-assert structure, generate-inventory scans a repository for test and benchmark functions and writes a Markdown inventory, and summarize-benchmarks turns Criterion and cntryl-stress artifacts into a normalized JSON manifest, Markdown report, and CSV export.',
                'Three more commands read repository-owned policy from a .cntryl/repository.toml file rather than acting on hardcoded rules: validate-docs checks required and forbidden Markdown files, links, and anchors; validate-benchmarks checks that documented and CI-run benchmark targets match what cargo metadata actually registers; and check-module-sizes flags production Rust modules over a configured line count. A seventh command, test-watchdog, runs one integration test at a time under a per-test timeout so a hanging test fails instead of hanging the whole suite.',
              ],
            },
            {
              id: 'first-check',
              title: 'Run the first check',
              paragraphs: [
                'Install the executable, change to the repository under review, and run validate-tests before selecting inventory or reporting commands.',
              ],
            },
            {
              id: 'interpret-results',
              title: 'Interpret results',
              paragraphs: [
                'Tools does not establish product correctness. Treat output as a report about the inspected checkout and its artifacts, and review findings in repository context before making them a CI gate.',
              ],
            },
          ],
          keywords: [
            'CLI',
            'validate-tests',
            'generate-inventory',
            'summarize-benchmarks',
          ],
        },
        {
          path: 'installation',
          title: 'Installation',
          description:
            'Install the cntryl-tools CLI from its public repository and verify the resulting executable.',
          content: [
            {
              id: 'requirements',
              title: 'Requirements',
              paragraphs: [
                'You need a Rust toolchain with cargo, since cntryl-tools ships as source and is built by cargo install rather than distributed as a prebuilt binary. There is nothing else to provision: the crate has no system libraries or external services, only ordinary crates.io dependencies (clap, serde, serde_json, csv, toml, regex, walkdir, chrono, anyhow) that cargo resolves automatically during the build.',
                'A couple of subcommands shell out to other tools already expected on a Rust repository: validate-benchmarks runs cargo metadata, and test-watchdog runs cargo test. Neither needs separate installation if you can already build and test the target repository.',
              ],
            },
            {
              id: 'install-from-repository',
              title: 'Install from the repository',
              paragraphs: [
                'If you do not have the tools repository cloned, install straight from GitHub with --locked so the dependency versions match the checked-in Cargo.lock:',
                'If you already have a local clone, install from that checkout path instead. From inside the cntryl-tools directory itself, cargo install --path . is the same operation with an implicit path.',
              ],
              codeTabs: [
                {
                  id: 'from-github',
                  label: 'From GitHub',
                  code: 'cargo install --git https://github.com/cntryl/tools --locked',
                },
                {
                  id: 'from-local-clone',
                  label: 'From a local clone',
                  code: 'cargo install --path /path/to/cntryl-tools\n\n# or, from inside the checkout:\ncargo install --path .',
                },
              ],
            },
            {
              id: 'verify-the-executable',
              title: 'Verify the executable',
              paragraphs: [
                'cargo install places the binary on your cargo bin path (usually ~/.cargo/bin) and prints where it landed. Confirm the CLI resolves and lists all seven subcommands before relying on it in a script or CI job:',
              ],
              code: `cntryl-tools --help
# Standalone command-line tool with child commands for cntryl
#
# Usage: cntryl-tools <COMMAND>
#
# Commands:
#   validate-tests        ...
#   generate-inventory     ...
#   summarize-benchmarks   ...
#   validate-docs          ...
#   validate-benchmarks    ...
#   check-module-sizes     ...
#   test-watchdog          ...`,
            },
            {
              id: 'update-and-uninstall',
              title: 'Update and uninstall',
              paragraphs: [
                'cargo install refuses to overwrite an existing installation of the same binary name, so pulling a newer revision needs --force alongside the same install command. Run the same --git or --path invocation you used originally with --force appended.',
                'To remove it, use the matching cargo uninstall command; there is no separate installer or package to clean up beyond the one binary.',
              ],
              code: `cargo install --git https://github.com/cntryl/tools --locked --force
cargo uninstall cntryl-tools`,
            },
          ],
          keywords: ['cargo install', 'install', 'CLI'],
        },
        {
          path: 'getting-started',
          title: 'Getting Started',
          description:
            'Install cntryl-tools from GitHub and run test validation in one Rust repository.',
          content: [
            {
              id: 'install-cli',
              title: 'Install the CLI',
              paragraphs: [
                'Install the locked executable from the public repository so the command version is explicit in local work and CI.',
              ],
            },
            {
              id: 'validate-checkout',
              title: 'Validate the checkout',
              paragraphs: [
                'Run validate-tests from the Rust repository you intend to inspect. The command reports the file and convention associated with each finding.',
              ],
            },
            {
              id: 'ci-boundary',
              title: 'Choose a CI policy',
              paragraphs: [
                'Decide which findings should fail the job after reviewing repository rules; the CLI does not decide policy for you.',
              ],
            },
          ],
          keywords: ['cargo install', 'validate-tests', 'repository'],
          code: `cargo install --git https://github.com/cntryl/tools --locked
cd /path/to/rust-repository
cntryl-tools validate-tests`,
        },
      ],
    },
    {
      id: 'commands',
      label: 'Commands',
      pages: [
        {
          path: 'validate-tests',
          title: 'Validate Tests',
          description:
            'Check Rust test naming and arrange-act-assert conventions in the selected repository.',
          content: [
            {
              id: 'command-inputs',
              title: 'Command inputs',
              paragraphs: [
                "With no flags, validate-tests walks the current directory's src/ and tests/ subtrees (skipping target/ and dotfiles) and checks every #[test] function it finds. Both flags are optional and can be combined.",
              ],
              table: {
                headers: ['Flag', 'Argument', 'Effect'],
                rows: [
                  [
                    '--file, -f',
                    '<PATH>',
                    'Check only the #[test] functions in this one file instead of scanning the repository.',
                  ],
                  [
                    '--json, -j',
                    '<PATH>',
                    'Write the full result list as JSON to this path (parent directories are created as needed).',
                  ],
                ],
              },
            },
            {
              id: 'rules',
              title: 'Rules',
              paragraphs: [
                'Every test is checked for a should_-prefixed name. Tests longer than five lines are additionally checked for arrange-act-assert structure: a body of that length must contain a "// Arrange", a "// Act", and a "// Assert" comment, and must not combine two of them on one line (e.g. "// Arrange + Act").',
                'A body with more than one "// Act" line is flagged as testing multiple behaviors in one test. A test name is also flagged if it contains "_and_" in the action portion of the name (the part before "_given_" or "_when_", or the whole name if neither appears), unless that segment matches one of four allowed exceptions: with_id_and_name, point_writes_and_range_deletes, memtable_and_sst, or large_keys_and_values.',
              ],
              table: {
                headers: ['Issue prefix', 'Meaning'],
                rows: [
                  ['NAMING', 'Test function name does not start with should_.'],
                  [
                    'AAA',
                    'Missing a required // Arrange, // Act, or // Assert comment (bodies over 5 lines only), or combined two of them on one comment line.',
                  ],
                  [
                    'MULTI-BEHAVIOR',
                    'More than one "// Act" comment, or "_and_" in the action part of the test name outside the allowed exceptions.',
                  ],
                ],
              },
              callout: {
                title: 'Short tests skip the AAA check',
                body: 'The Arrange/Act/Assert comment check only applies once a test body exceeds five lines. A short, obviously single-assertion test is never flagged for missing AAA comments, even without any of the three.',
              },
            },
            {
              id: 'output',
              title: 'Output',
              paragraphs: [
                'Scanning the whole repository prints a summary (total tests, compliant count and percentage, non-compliant count and percentage), an issue breakdown by category, up to the first 20 non-compliant tests with their file, test name, line number, and issues, and then the complete list of MULTI-BEHAVIOR violations regardless of the 20-test cap.',
                'Checking a single file with --file prints a simpler per-test list: "[OK] test_name (line N)" for compliant tests and "[!!] test_name (line N)" followed by each issue for non-compliant ones.',
              ],
              code: `$ cntryl-tools validate-tests --file src/routing.rs
Checking tests in: src/routing.rs

Results: 4/5 compliant (80.0%)

[OK] should_route_by_prefix (line 12)
[!!] test_handles_empty_route (line 40)
    - NAMING: Does not start with 'should_'
[OK] should_reject_invalid_address (line 58)`,
            },
            {
              id: 'ci-usage',
              title: 'CI usage',
              paragraphs: [
                "The exit code is 1 if any test in the run is non-compliant and 0 if every test is compliant, so a CI job can gate on the command's own exit status without parsing output. Pair --json with an artifact upload step to keep the structured per-test result list (file, test, line, line_count, issues) for later review.",
              ],
              code: 'cntryl-tools validate-tests --json target/validate-tests.json',
            },
          ],
          keywords: ['validate-tests', 'Rust tests', 'CI'],
        },
        {
          path: 'generate-inventory',
          title: 'Generate Inventory',
          description:
            'Scan a repository and produce a reviewable inventory of tests and benchmarks.',
          content: [
            {
              id: 'command-inputs',
              title: 'Command inputs',
              paragraphs: [
                'Both flags are optional. --root points at the repository to scan (it is canonicalized, so it must exist) and defaults to the current directory. --output names the Markdown file to write, resolved relative to --root, and defaults to inventory.md.',
              ],
              table: {
                headers: ['Flag', 'Default', 'Meaning'],
                rows: [
                  [
                    '--root',
                    '.',
                    'Repository root to scan for src/, tests/, and benches/.',
                  ],
                  [
                    '--output',
                    'inventory.md',
                    'Output path for the generated Markdown, resolved against --root.',
                  ],
                ],
              },
            },
            {
              id: 'discovery',
              title: 'Discovery',
              paragraphs: [
                'Discovery is regex-based over every .rs file under each subtree, not a compiler pass, so it finds matching function signatures regardless of whether the crate currently builds. A match whose line is prefixed by //, ///, or /* (i.e. commented out) is skipped rather than counted.',
              ],
              table: {
                headers: ['Directory', 'Pattern matched', 'Notes'],
                rows: [
                  [
                    'src/',
                    'fn should_<name>',
                    'Unit tests colocated with production code.',
                  ],
                  ['tests/', 'fn should_<name>', 'Integration test functions.'],
                  [
                    'benches/',
                    'fn bench_<name>',
                    'Criterion-style benchmark functions.',
                  ],
                  [
                    'benches/',
                    '#[stress_test(...)] followed by fn <name>',
                    'cntryl-stress harness functions; matched by attribute plus the next function name.',
                  ],
                ],
              },
            },
            {
              id: 'inventory-output',
              title: 'Inventory output',
              paragraphs: [
                'The generated Markdown has three sections in order: Src Tests, Integration Tests (tests/), and Benches & Stress (benches/). Each section lists every file that contained a match as a bullet, with the matched function names nested underneath as a backticked list; a section with no matches at all prints "(none)" instead of an empty list.',
                'The command also prints one summary line per category (files scanned, total names found) to stdout, independent of what is written to the Markdown file.',
              ],
              code: `$ cntryl-tools generate-inventory --root . --output inventory.md
Wrote inventory to /repo/inventory.md
Found 214 src tests in 38 files
Found 41 integration tests in 6 files
Found 12 benches/stress in 3 files`,
            },
            {
              id: 'review-workflow',
              title: 'Review workflow',
              paragraphs: [
                'generate-inventory always exits 0; it reports what it found rather than judging it, so it is not meant to gate a build on its own. Commit the generated inventory.md and diff it over time to see test and benchmark coverage grow (or shrink) file by file, or run it in CI and upload the file as a build artifact for reviewers who want to see the full list without cloning the repo.',
              ],
            },
          ],
          keywords: ['generate-inventory', 'tests', 'benchmarks'],
        },
        {
          path: 'summarize-benchmarks',
          title: 'Summarize Benchmarks',
          description:
            'Turn supported benchmark artifacts into consistent JSON, Markdown, and CSV reports.',
          content: [
            {
              id: 'supported-inputs',
              title: 'Supported inputs',
              paragraphs: [
                'summarize-benchmarks reads two artifact shapes under --root (default "."): Criterion\'s own output and cntryl-stress reports. --product-name (default "cntryl") and --report-title (default "Cntryl Benchmark Report") override the branding text written into the report; they do not change what is read or how it is normalized.',
              ],
              table: {
                headers: ['Adapter', 'Reads', 'Notes'],
                rows: [
                  [
                    'criterion',
                    'target/criterion/**/new/estimates.json',
                    'Skips a benchmark whose mean is outside 1ns .. 1e12ns; records the median, not the mean.',
                  ],
                  [
                    'stress',
                    'target/stress/**/latest.json',
                    'Requires schema_version "cntryl-stress.v2"; a mismatched or mixed set of run_id values across artifacts is rejected outright.',
                  ],
                ],
              },
            },
            {
              id: 'normalization',
              title: 'Normalization',
              paragraphs: [
                'Every record, from either adapter, is normalized into one BenchmarkRecord shape: id, adapter, suite, case, an optional scenario, metric, unit, value, optional lower/upper bounds and sample count, a metric_direction (lower-is-better or higher-is-better), a stability classification, a status, an optional rel_stddev, and free-form tags/metadata. For the criterion adapter the metric is always latency_ns (lower is better); the stress adapter can additionally emit throughput_ops_per_s, latency_p95_ns, ns_per_op, allocs_per_op, and bytes_per_op depending on what the stress artifact recorded.',
                'Stability is derived from rel_stddev against three thresholds, and status collapses to "authoritative" whenever stability lands in the two acceptable buckets; otherwise status is set to the stability string itself so a noisy or untrustworthy record cannot masquerade as authoritative.',
              ],
              table: {
                headers: ['rel_stddev', 'Stability'],
                rows: [
                  ['<= 5%', 'stable'],
                  ['<= 10%', 'acceptable'],
                  ['<= 20%', 'noisy'],
                  ['> 20%', 'untrustworthy'],
                ],
              },
            },
            {
              id: 'report-formats',
              title: 'Report formats',
              paragraphs: [
                'A run always writes a JSON manifest and a Markdown report, plus a CSV per adapter that produced any records.',
              ],
              table: {
                headers: ['Path', 'Format', 'Contents'],
                rows: [
                  [
                    'target/bench_results.json',
                    'JSON',
                    'schema_version (2), generated_at, commit_hash, comparison_summary, and the full records array.',
                  ],
                  [
                    'target/bench_summary.md',
                    'Markdown',
                    'Front matter, Comparison Summary, Current Results (grouped by adapter then suite), Baseline Deltas, Parameter Sweeps, Measurement Notes.',
                  ],
                  [
                    'target/criterion/summarize_benchmarks.csv',
                    'CSV',
                    'One row per criterion record, only written if at least one criterion record exists.',
                  ],
                  [
                    'target/stress/stress_summary.csv',
                    'CSV',
                    'One row per stress record, only written if at least one stress record exists.',
                  ],
                ],
              },
            },
            {
              id: 'interpretation',
              title: 'Interpretation',
              paragraphs: [
                'Records are compared against config/bench_baseline.json when it exists. A regression is anything whose directional delta (accounting for metric direction) is at or below -10%, and it becomes critical at -25% or worse; a new or missing record is one whose id has no counterpart on the other side. The run prints one comparison-counters line and exits 1 if critical, new, or missing is nonzero, 0 otherwise.',
                'If every record in the run is authoritative (status authoritative/acceptable and stability stable/acceptable) and there are no critical, new, or missing records, the manifest is automatically promoted over config/bench_baseline.json so the next run compares against it.',
              ],
              code: `$ cntryl-tools summarize-benchmarks --product-name cntryl-midge --report-title "Midge Benchmark Report"
Wrote target/bench_results.json (manifest).
Wrote target/bench_summary.md (report).
Comparison counters: critical=0 new=0 missing=0 regressions=1 improvements=2 authority=lab-authoritative
Promoted config/bench_baseline.json (baseline).`,
              callout: {
                title: 'A changed ns_per_op basis is not a regression',
                body: 'If a record\'s ns_per_op_basis metadata differs from the baseline\'s, the delta is reported as a semantic change instead of a percentage: delta_pct and directional_delta_pct are left empty and a note asks you to confirm the change is intentional before refreshing the baseline. This keeps an accounting change (e.g. what counts as one "operation") from silently reading as a 40% speedup or regression.',
              },
            },
          ],
          keywords: ['summarize-benchmarks', 'JSON', 'Markdown', 'CSV'],
        },
      ],
    },
    {
      id: 'workflows',
      label: 'Workflows',
      pages: [
        {
          path: 'ci-integration',
          title: 'CI Integration',
          description:
            'Run the CLI in continuous integration and decide which results should fail a build.',
          content: [
            {
              id: 'install-in-ci',
              title: 'Install in CI',
              paragraphs: [
                'Add a step that installs the locked binary before any command that uses it, the same way you would locally. Caching the cargo bin directory between runs avoids rebuilding the crate on every job.',
              ],
              code: 'cargo install --git https://github.com/cntryl/tools --locked',
            },
            {
              id: 'choose-commands-per-job',
              title: 'Choose commands per job',
              paragraphs: [
                'validate-tests is the natural pull-request gate: it is fast, deterministic, and its exit code is exactly 0 or 1. generate-inventory is better run as an informational artifact step (it always exits 0) than as a gate. test-watchdog is worth adding to a job that runs a flaky or occasionally-hanging integration suite, since --timeout bounds each test individually and --continue-on-fail lets the run finish and report every failure instead of stopping at the first one.',
                "validate-benchmarks itself enforces that a repository's benchmark workflow is not a pull-request gate: it checks that the configured workflow file (default .github/workflows/bench.yml) declares workflow_dispatch: and does not declare pull_request:. Run summarize-benchmarks and validate-benchmarks from a manually-triggered or scheduled workflow, not from the one that runs on every PR.",
              ],
            },
            {
              id: 'interpret-results',
              title: 'Interpret results',
              paragraphs: [
                'Every command that produces findings (as opposed to just a report) uses a small, stable exit code: 0 for clean, and a nonzero code for findings that a CI step can check without parsing stdout. See Exit Codes for the full table.',
              ],
              code: 'cntryl-tools validate-tests\ncntryl-tools generate-inventory',
            },
            {
              id: 'failure-policy',
              title: 'Failure policy',
              paragraphs: [
                'Once .cntryl/repository.toml exists, validate-docs, validate-benchmarks, and check-module-sizes become repository-policy gates you can add alongside validate-tests; each reads its rules from that shared config file rather than from CLI flags, so the failure policy for those three lives in the config, not the pipeline.',
              ],
            },
          ],
          keywords: ['CI', 'pipeline', 'automation'],
        },
        {
          path: 'reporting-workflow',
          title: 'Reporting Workflow',
          description:
            'Collect artifacts, produce shared reports, and review them across repositories over time.',
          content: [
            {
              id: 'collect-artifacts',
              title: 'Collect artifacts',
              paragraphs: [
                'Run the benchmarks that produce the two input shapes summarize-benchmarks understands: cargo bench for Criterion targets writes target/criterion/**/new/estimates.json, and a cntryl-stress harness run writes target/stress/**/latest.json tagged with schema_version "cntryl-stress.v2". Neither artifact tree needs to exist for the command to run; whichever adapter finds nothing simply contributes no records.',
              ],
            },
            {
              id: 'produce-a-report',
              title: 'Produce a report',
              paragraphs: [
                'Run summarize-benchmarks from the repository root once both artifact trees are in place. It writes the JSON manifest, the Markdown report, and a CSV for each adapter that had records, then prints the comparison counters line so you can see the outcome without opening a file.',
              ],
              code: 'cntryl-tools summarize-benchmarks',
            },
            {
              id: 'share-and-review',
              title: 'Share and review',
              paragraphs: [
                'target/bench_summary.md is the format to read or paste into a PR: it groups current results by adapter and suite, lists baseline deltas, and calls out anything noisy or newly added. target/bench_results.json is the stable, versioned shape (schema_version 2) for any other tooling that wants to consume the same data programmatically, and the per-adapter CSVs are for spreadsheet or dashboard import.',
              ],
            },
            {
              id: 'track-changes-over-time',
              title: 'Track changes over time',
              paragraphs: [
                "config/bench_baseline.json is what every run compares against. It is only overwritten automatically when the current run is fully authoritative and has no critical, new, or missing records; any run with noisy data, a status that needs review, or a new/missing record leaves the existing baseline untouched. When you do want a baseline shift that wasn't auto-promoted (a deliberate perf improvement, for example), review the report and commit the newly written manifest as the baseline yourself.",
              ],
            },
          ],
          keywords: ['reports', 'artifacts', 'review'],
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
            'Find command flags, repository paths, artifact inputs, and report output settings.',
          content: [
            {
              id: 'global-options',
              title: 'Global options',
              paragraphs: [
                'Every subcommand takes its own flags; there are no options shared above the subcommand level. --root defaults to the current directory everywhere it appears.',
              ],
              table: {
                headers: ['Command', 'Flags'],
                rows: [
                  ['validate-tests', '--file/-f <PATH>, --json/-j <PATH>'],
                  [
                    'generate-inventory',
                    '--root <PATH> (default .), --output <PATH> (default inventory.md)',
                  ],
                  [
                    'summarize-benchmarks',
                    '--root <PATH> (default .), --product-name <NAME> (default cntryl), --report-title <TITLE> (default "Cntryl Benchmark Report")',
                  ],
                  [
                    'validate-docs',
                    '--root <PATH> (default .), --config <PATH> (default .cntryl/repository.toml)',
                  ],
                  [
                    'validate-benchmarks',
                    '--root <PATH> (default .), --config <PATH> (default .cntryl/repository.toml)',
                  ],
                  [
                    'check-module-sizes',
                    '--root <PATH> (default .), --config <PATH> (default .cntryl/repository.toml)',
                  ],
                  [
                    'test-watchdog',
                    '--suite <NAME> or --all, --pattern <SUBSTRING>, --timeout <SECS> (default 60), --continue-on-fail, --root <PATH> (default .)',
                  ],
                ],
              },
            },
            {
              id: 'repository-inputs',
              title: 'Repository inputs',
              paragraphs: [
                'validate-docs, validate-benchmarks, and check-module-sizes read policy from .cntryl/repository.toml (or the path passed to --config); if the file is absent, each command falls back to built-in defaults rather than failing.',
              ],
              code: `[docs]
required = ["README.md", "docs/README.md"]
exclude_paths = ["ui/node_modules"]
forbidden_paths = ["docs/archive/old.md"]
forbidden_text = ["draft, not for release"]

[benchmarks]
documentation = ["docs/development/benchmarks.md"]
workflow = ".github/workflows/bench.yml"
not_pr_gate_phrase = "not a pull-request performance gate"

[module_sizes]
warn_lines = 1200
max_lines = 1600
allowlist = ["src/large_provider.rs"]
legacy_allowlist = []`,
            },
            {
              id: 'artifact-inputs',
              title: 'Artifact inputs',
              paragraphs: [
                "summarize-benchmarks reads target/criterion (Criterion's own output tree) and target/stress (cntryl-stress latest.json artifacts), both resolved under --root, and compares against config/bench_baseline.json.",
              ],
              table: {
                headers: ['Path', 'Produced by', 'Read by'],
                rows: [
                  [
                    'target/criterion/**/new/estimates.json',
                    'cargo bench (Criterion)',
                    'summarize-benchmarks',
                  ],
                  [
                    'target/stress/**/latest.json',
                    'a cntryl-stress harness run',
                    'summarize-benchmarks',
                  ],
                  [
                    'config/bench_baseline.json',
                    'summarize-benchmarks (auto-promotion)',
                    'summarize-benchmarks',
                  ],
                ],
              },
            },
            {
              id: 'output-settings',
              title: 'Output settings',
              paragraphs: [
                '--product-name and --report-title only change the branding text written into target/bench_summary.md; --output only changes where generate-inventory writes its Markdown; --json only changes whether validate-tests additionally writes a structured JSON report. None of these change what is scanned or how findings are classified.',
              ],
            },
          ],
          keywords: ['flags', 'configuration'],
        },
        {
          path: 'output-formats',
          title: 'Output Formats',
          description:
            'Read the JSON, Markdown, and CSV report shapes the CLI writes and choose one per consumer.',
          content: [
            {
              id: 'json-reports',
              title: 'JSON reports',
              paragraphs: [
                'validate-tests --json <PATH> writes a plain array of results, one object per test found, each with file, test, line, line_count, and issues (an empty array means compliant).',
                'summarize-benchmarks always writes target/bench_results.json: a single object with schema_version (currently 2), generated_at, commit_hash (from git rev-parse HEAD in --root, or null if that fails), comparison_summary, and records, the full normalized list.',
              ],
              codeTabs: [
                {
                  id: 'validate-tests-json',
                  label: 'validate-tests --json',
                  code: `[
  {
    "file": "src/routing.rs",
    "test": "should_route_by_prefix",
    "line": 12,
    "line_count": 9,
    "issues": []
  },
  {
    "file": "src/routing.rs",
    "test": "test_handles_empty_route",
    "line": 40,
    "line_count": 6,
    "issues": ["NAMING: Does not start with 'should_'"]
  }
]`,
                },
                {
                  id: 'bench-results-json',
                  label: 'bench_results.json',
                  code: `{
  "schema_version": 2,
  "generated_at": "2026-07-20T00:00:00Z",
  "commit_hash": "a1b2c3d",
  "comparison_summary": {
    "performance_changes": 3,
    "improved": 2,
    "regressions": 1,
    "critical": 0,
    "stability_regressions": 0,
    "stability_improvements": 0,
    "new": 0,
    "missing": 0,
    "risk_areas": 0,
    "authoritative": true,
    "baseline_available": true
  },
  "records": [ ]
}`,
                },
              ],
            },
            {
              id: 'markdown-reports',
              title: 'Markdown reports',
              paragraphs: [
                'generate-inventory writes one Markdown file with three fixed sections: Src Tests, Integration Tests (tests/), and Benches & Stress (benches/), each a per-file bullet list of matched function names.',
                "summarize-benchmarks writes target/bench_summary.md with front-matter (product, generated_at, commit, baseline_available, record_count, and the paths of the manifest/baseline/CSV artifacts) followed by five sections: Comparison Summary, Current Results (grouped by adapter then suite), Baseline Deltas (or a note that no baseline exists), Parameter Sweeps (or a note that none were detected), and Measurement Notes, a flat bullet list of anything worth a human's attention.",
              ],
            },
            {
              id: 'csv-reports',
              title: 'CSV reports',
              paragraphs: [
                'summarize-benchmarks writes one CSV per adapter that produced at least one record: target/criterion/summarize_benchmarks.csv and target/stress/stress_summary.csv. Both share the same 18-column header regardless of adapter, so the two files can be concatenated or loaded with the same schema.',
              ],
              code: 'id,adapter,suite,case,scenario,metric,unit,value,lower_bound,upper_bound,samples,metric_direction,stability,status,rel_stddev,tags,metadata,source_file',
            },
            {
              id: 'choose-a-format',
              title: 'Choose a format',
              paragraphs: [
                'Use JSON when another program consumes the result: it is the only format with a stable schema_version to check compatibility against. Use Markdown for anything a person reads directly, a PR comment, a wiki page, a README section. Use CSV when the destination is a spreadsheet or a BI tool that expects flat rows rather than nested JSON.',
              ],
            },
          ],
          keywords: ['JSON', 'Markdown', 'CSV', 'reports'],
        },
        {
          path: 'exit-codes',
          title: 'Exit Codes',
          description:
            'Map each command result to an exit code so automation can act on it.',
          content: [
            {
              id: 'success',
              title: 'Success',
              paragraphs: [
                'A 0 exit code means the command ran to completion and found nothing it classifies as a failure; it does not mean nothing was reported. generate-inventory, for instance, always exits 0 no matter what it finds, because it is a scan, not a check.',
              ],
            },
            {
              id: 'findings-reported',
              title: 'Findings reported',
              paragraphs: [
                'Each checking command has its own nonzero exit code for findings, and none of them overlap in meaning across commands, so a shared "if nonzero, fail the job" policy works but a shared numeric convention does not.',
              ],
              table: {
                headers: ['Command', 'Exit code', 'Meaning'],
                rows: [
                  [
                    'validate-tests',
                    '0 / 1',
                    '0: every test compliant. 1: at least one test has an issue.',
                  ],
                  [
                    'generate-inventory',
                    '0',
                    'Always 0; the command reports, it does not gate.',
                  ],
                  [
                    'summarize-benchmarks',
                    '0 / 1',
                    '0: no critical regressions and no new/missing records vs baseline. 1: critical > 0, new > 0, or missing > 0.',
                  ],
                  [
                    'validate-docs',
                    '0 / 1',
                    '0: no policy errors. 1: at least one missing/forbidden doc, forbidden text, broken link, or broken anchor.',
                  ],
                  [
                    'validate-benchmarks',
                    '0 / 1',
                    '0: documented and CI-run benchmark targets match cargo metadata. 1: an unregistered target, an unexecuted target, an obsolete flag, or a missing workflow trigger requirement.',
                  ],
                  [
                    'check-module-sizes',
                    '0 / 1',
                    '0: no module exceeds max_lines outside the allowlists. 1: at least one does.',
                  ],
                  [
                    'test-watchdog',
                    '0 / 2 / 124',
                    '0: every listed test passed. 2: a test failed (returned nonzero). 124: a test was killed after exceeding --timeout. Without --continue-on-fail, the run stops at the first failure and returns its code (124 if that failure was a timeout, 2 otherwise).',
                  ],
                ],
              },
            },
            {
              id: 'usage-errors',
              title: 'Usage errors',
              paragraphs: [
                'Anything that keeps a command from running at all, an unreadable file, an unresolvable --root, a config file that fails to parse as TOML, a baseline JSON with an unsupported schema_version, prints "error: <message>" to stderr and exits 1 from main\'s shared error handler, regardless of which subcommand raised it.',
              ],
            },
            {
              id: 'automation-handling',
              title: 'Automation handling',
              paragraphs: [
                'Because the meaning of each nonzero code is command-specific, treat "did this step succeed" as the only thing to branch on in a pipeline; if you need the detail behind a 1 or 2, read the command\'s own stdout/stderr or its JSON output rather than trying to infer it from the exit code alone.',
              ],
            },
          ],
          keywords: ['exit code', 'automation', 'CI'],
        },
        {
          path: 'troubleshooting',
          title: 'Troubleshooting',
          description:
            'Diagnose installation, repository discovery, validation, inventory, and report failures.',
          content: [
            {
              id: 'installation-failures',
              title: 'Installation failures',
              paragraphs: [
                'If cargo install reports the binary is already installed, add --force to the same command to reinstall over it; cargo will not silently overwrite an existing install of the same crate name. If the --git install fails to resolve the repository, confirm network access to GitHub and that the ref you expect is on the default branch, since no --branch or --tag flag is documented for this install path.',
              ],
            },
            {
              id: 'repository-discovery',
              title: 'Repository discovery',
              paragraphs: [
                'Every --root defaults to the current directory and is canonicalized before use, so an error like "failed to resolve repository root ." almost always means the command was run from a directory that does not exist anymore or a --root path that is misspelled. validate-tests with no --file scans src/ and tests/ relative to the process\'s current directory specifically, not --root, so run it from inside the repository you want to check, or use --file to point at one file directly.',
              ],
            },
            {
              id: 'validation-failures',
              title: 'Validation failures',
              paragraphs: [
                'validate-docs errors are self-describing: "missing required document: X", "forbidden document is present: X", "X: forbidden documentation text \\"Y\\"", "X: broken local link Y", and "X: broken anchor Y#Z" each name the exact file and rule that failed.',
                'validate-benchmarks errors follow the same pattern: "X advertises unregistered benchmark Y" means the docs reference a cargo bench target that cargo metadata does not know about; "benchmark workflow does not execute Y" means a registered bench target is never invoked from the configured workflow file; "benchmark workflow has no manual trigger" and "benchmark workflow must not be a pull-request gate" check for workflow_dispatch: and the absence of pull_request: in that same file.',
              ],
            },
            {
              id: 'report-failures',
              title: 'Report failures',
              paragraphs: [
                'summarize-benchmarks refuses to load a baseline whose schema_version does not match the current BENCHMARK_MANIFEST_SCHEMA_VERSION (2): "unsupported baseline schema_version N in config/bench_baseline.json; expected 2". Delete or regenerate the baseline rather than editing its schema_version by hand.',
                'A stress artifact with the wrong schema fails the same way at the adapter level: "unsupported stress schema in <path>: schema_version=<value>; expected cntryl-stress.v2". This is deliberate: stale or foreign artifact shapes are rejected instead of silently normalized, so a mismatch means the stress harness version producing latest.json needs to be upgraded (or the target/stress directory cleared) before summarize-benchmarks will read it.',
              ],
            },
          ],
          keywords: ['diagnostics', 'errors'],
        },
      ],
    },
  ],
});
