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
          contract:
            'Cntryl Stress is a Rust benchmarking framework for repeatable performance work. Its macro-first API records measurements, parameters, environment details, diagnostics, quality findings, and comparisons in structured artifacts.',
          practice:
            'Add Stress as a development dependency, define a harness-free benchmark target, mark benchmark functions with #[stress], and run them with cargo bench. Tools can summarize current Stress artifacts.',
          boundary:
            'Stress cannot decide whether a fixture represents an application workload. Authors own operation counts, environment control, correctness checks, and interpretation. Next, define one benchmark and inspect target/stress for its result.',
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
  ],
});
