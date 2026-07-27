import { definePortal, outlinePage } from '../define';

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
          content: [
            {
              id: 'cli-surface',
              title: 'CLI surface',
              paragraphs: [
                'Cntryl Tools provides repository checks, test and benchmark inventory, and normalized benchmark reports as one standalone Rust CLI.',
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
        outlinePage(
          'installation',
          'Installation',
          'Install the cntryl-tools CLI from its public repository and verify the resulting executable.',
          [
            'Requirements',
            'Install from the repository',
            'Verify the executable',
            'Update and uninstall',
          ],
          ['cargo install', 'install', 'CLI']
        ),
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
        outlinePage(
          'validate-tests',
          'Validate Tests',
          'Check Rust test naming and arrange-act-assert conventions in the selected repository.',
          ['Command inputs', 'Rules', 'Output', 'CI usage'],
          ['validate-tests', 'Rust tests', 'CI']
        ),
        outlinePage(
          'generate-inventory',
          'Generate Inventory',
          'Scan a repository and produce a reviewable inventory of tests and benchmarks.',
          [
            'Command inputs',
            'Discovery',
            'Inventory output',
            'Review workflow',
          ],
          ['generate-inventory', 'tests', 'benchmarks']
        ),
        outlinePage(
          'summarize-benchmarks',
          'Summarize Benchmarks',
          'Turn supported benchmark artifacts into consistent JSON, Markdown, and CSV reports.',
          [
            'Supported inputs',
            'Normalization',
            'Report formats',
            'Interpretation',
          ],
          ['summarize-benchmarks', 'JSON', 'Markdown', 'CSV']
        ),
      ],
    },
    {
      id: 'workflows',
      label: 'Workflows',
      pages: [
        outlinePage(
          'ci-integration',
          'CI Integration',
          'Run the CLI in continuous integration and decide which results should fail a build.',
          [
            'Install in CI',
            'Choose commands per job',
            'Interpret results',
            'Failure policy',
          ],
          ['CI', 'pipeline', 'automation']
        ),
        outlinePage(
          'reporting-workflow',
          'Reporting Workflow',
          'Collect artifacts, produce shared reports, and review them across repositories over time.',
          [
            'Collect artifacts',
            'Produce a report',
            'Share and review',
            'Track changes over time',
          ],
          ['reports', 'artifacts', 'review']
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
          'Find command flags, repository paths, artifact inputs, and report output settings.',
          [
            'Global options',
            'Repository inputs',
            'Artifact inputs',
            'Output settings',
          ],
          ['flags', 'configuration']
        ),
        outlinePage(
          'output-formats',
          'Output Formats',
          'Read the JSON, Markdown, and CSV report shapes the CLI writes and choose one per consumer.',
          [
            'JSON reports',
            'Markdown reports',
            'CSV reports',
            'Choose a format',
          ],
          ['JSON', 'Markdown', 'CSV', 'reports']
        ),
        outlinePage(
          'exit-codes',
          'Exit Codes',
          'Map each command result to an exit code so automation can act on it.',
          [
            'Success',
            'Findings reported',
            'Usage errors',
            'Automation handling',
          ],
          ['exit code', 'automation', 'CI']
        ),
        outlinePage(
          'troubleshooting',
          'Troubleshooting',
          'Diagnose installation, repository discovery, validation, inventory, and report failures.',
          [
            'Installation failures',
            'Repository discovery',
            'Validation failures',
            'Report failures',
          ],
          ['diagnostics', 'errors']
        ),
      ],
    },
  ],
});
