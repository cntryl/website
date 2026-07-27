import { definePortal, outlinePage } from '../define';

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
          contract:
            'Cntryl Stress is a Rust benchmarking framework for repeatable performance work. Its macro-first API records measurements, parameters, environment details, diagnostics, quality findings, and comparisons in structured artifacts.',
          practice:
            'Add Stress as a development dependency, define a harness-free benchmark target, mark benchmark functions with #[stress], and run them with cargo bench. Tools can summarize current Stress artifacts.',
          boundary:
            'Stress cannot decide whether a fixture represents an application workload. Authors own operation counts, environment control, correctness checks, and interpretation. Next, define one benchmark and inspect target/stress for its result.',
          content: [
            {
              id: 'measurement-contract',
              title: 'Measurement contract',
              paragraphs: [
                'Stress is a Rust benchmarking framework that records measurements, parameters, environment details, diagnostics, quality findings, and comparisons as structured artifacts.',
              ],
            },
            {
              id: 'write-one-benchmark',
              title: 'Write one benchmark',
              paragraphs: [
                'Keep setup outside the measured closure, name the operation, and record the logical work count that makes the result interpretable.',
              ],
            },
            {
              id: 'interpretation-boundary',
              title: 'Interpretation boundary',
              paragraphs: [
                'Stress reports the fixture and environment it ran. The benchmark author decides whether that fixture represents the application workload.',
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
          contract:
            'Add cntryl-stress 0.3 as a development dependency and register a harness-free benchmark target. stress_main discovers the #[stress] function and writes a current JSON artifact below target/stress.',
          practice:
            'Create benches/lookup.rs with the benchmark below, run cargo bench --bench lookup, and find the generated latest.json under target/stress. Keep the measured operation small and explicit.',
          boundary:
            'The first result is local evidence. Compare runs only when code, inputs, build profile, and environment make the comparison meaningful.',
          content: [
            {
              id: 'register-benchmark',
              title: 'Register a benchmark',
              paragraphs: [
                'Add cntryl-stress as a development dependency and use a harness-free benchmark target with stress_main!().',
              ],
            },
            {
              id: 'run-and-locate',
              title: 'Run and locate the artifact',
              paragraphs: [
                'Run cargo bench for the target and inspect target/stress/latest.json for the structured result and run metadata.',
              ],
            },
            {
              id: 'comparison-boundary',
              title: 'Set a comparison boundary',
              paragraphs: [
                'Compare only runs with compatible code, inputs, build profile, and environment; a single local run is not a baseline by itself.',
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
        outlinePage(
          'benchmark-model',
          'Benchmark Model',
          'Define measured work, operation counts, setup, samples, and author-owned correctness checks.',
          [
            'Benchmark function',
            'Measured operation',
            'Setup and teardown',
            'Correctness checks',
          ],
          ['benchmark', 'measure', 'operation']
        ),
        outlinePage(
          'selection-and-runs',
          'Selection and Run Semantics',
          'Select benchmarks and understand warmup, measurement, repetition, filtering, and exit behavior.',
          ['Selection', 'Warmup', 'Measurement runs', 'Exit behavior'],
          ['selection', 'warmup', 'run']
        ),
        outlinePage(
          'attributes',
          'Attributes',
          'Configure benchmark identity, tier, profiles, timing, samples, and comparison behavior.',
          [
            'Identity',
            'Tier and profile',
            'Timing and samples',
            'Comparison settings',
          ],
          ['attribute', 'tier', 'profile']
        ),
        outlinePage(
          'tier-recipes',
          'Tier Recipes',
          'Structure focused, lifecycle, integration, endurance, and campaign-style measurements.',
          [
            'Focused work',
            'Lifecycle work',
            'Integration work',
            'Endurance and campaigns',
          ],
          ['tier', 'recipe', 'campaign']
        ),
      ],
    },
    {
      id: 'evidence',
      label: 'Evidence',
      pages: [
        outlinePage(
          'artifacts',
          'Artifacts',
          'Read current and historical structured results, metadata, samples, percentiles, and findings.',
          [
            'Artifact layout',
            'Run metadata',
            'Measurements and samples',
            'Quality findings',
          ],
          ['artifact', 'latest.json', 'sample']
        ),
        outlinePage(
          'comparisons-and-gates',
          'Comparisons and Gates',
          'Compare compatible runs and apply explicit performance limits to trusted measurements.',
          ['Comparison identity', 'Baselines', 'Gates', 'Failure output'],
          ['baseline', 'comparison', 'gate']
        ),
        outlinePage(
          'diagnostics',
          'Diagnostics',
          'Capture allocation, environment, timing, trust, and benchmark-quality diagnostics.',
          ['Environment', 'Timing', 'Allocation', 'Trust findings'],
          ['diagnostics', 'allocation', 'trust']
        ),
      ],
    },
    {
      id: 'reference',
      label: 'Reference',
      pages: [
        outlinePage(
          'configuration',
          'Configuration Reference',
          'Find environment variables, run policy, profiles, artifact paths, and runner settings.',
          [
            'Environment variables',
            'Run policy',
            'Profiles',
            'Artifact settings',
          ],
          ['configuration', 'environment', 'policy']
        ),
        outlinePage(
          'api-reference',
          'Public API',
          'Find the benchmark macro, context, measurement, runner, policy, artifact, and result APIs.',
          [
            'Macros',
            'Benchmark context',
            'Runner and policy',
            'Artifacts and results',
          ],
          ['Rust API', 'reference']
        ),
        outlinePage(
          'troubleshooting',
          'Troubleshooting',
          'Diagnose discovery, execution, measurement, artifact, comparison, and gate failures.',
          [
            'Discovery failures',
            'Execution failures',
            'Artifact failures',
            'Comparison and gate failures',
          ],
          ['diagnostics', 'errors']
        ),
      ],
    },
  ],
});
