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
          contract:
            'Cntryl Tools is a standalone Rust CLI for maintainers. validate-tests checks Rust test conventions, generate-inventory scans tests and benchmarks, and summarize-benchmarks produces shared reports.',
          practice:
            'Install cntryl-tools, change to the repository you want to inspect, and run one child command. Tools is a supporting product. It can summarize current structured artifacts from Stress.',
          boundary:
            'Tools does not run in an application data path and does not establish product correctness by itself. Results describe the inspected checkout and available artifacts. Next, install the CLI and validate one repository.',
          keywords: [
            'CLI',
            'validate-tests',
            'generate-inventory',
            'summarize-benchmarks',
          ],
        },
        {
          path: 'getting-started',
          title: 'Getting Started',
          description:
            'Install cntryl-tools from GitHub and run test validation in one Rust repository.',
          contract:
            'Install the locked CLI directly from its public repository. validate-tests uses the current directory by default and checks Rust tests for naming and arrange-act-assert conventions.',
          practice:
            'Run cargo install once, change to the Rust repository you want to check, and run cntryl-tools validate-tests. Review each reported file and rule in the context of that repository.',
          boundary:
            'The command reads the current checkout. Run it from the intended repository, and review local changes before treating a new report as a regression.',
          keywords: ['cargo install', 'validate-tests', 'repository'],
          code: `cargo install --git https://github.com/cntryl/tools --locked
cd /path/to/rust-repository
cntryl-tools validate-tests`,
        },
      ],
    },
  ],
});
