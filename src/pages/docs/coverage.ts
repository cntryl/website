import type { DocsPageDefinition } from './types';

export type CoverageEntry =
  | {
      source: string;
      audience: 'user' | 'operator';
      disposition: 'site';
      route: DocsPageDefinition['route'];
    }
  | {
      source: string;
      audience: 'contributor';
      disposition: 'github-only';
      repository: `https://github.com/cntryl/${string}`;
    };

export const documentationCoverage = [
  {
    source: 'midge/README.md overview material',
    audience: 'user',
    disposition: 'site',
    route: '/docs/midge',
  },
  {
    source: 'midge/README.md quick start',
    audience: 'user',
    disposition: 'site',
    route: '/docs/midge/getting-started',
  },
  {
    source: 'midge public OpenOptions and WriteOptions API',
    audience: 'user',
    disposition: 'site',
    route: '/docs/midge/options',
  },
  {
    source: 'midge public cloud provider and credential API',
    audience: 'operator',
    disposition: 'site',
    route: '/docs/midge/cloud',
  },
  {
    source: 'midge public Transaction and Query API',
    audience: 'user',
    disposition: 'site',
    route: '/docs/midge/operations',
  },
  {
    source: 'midge/docs/development/**, benches/**, fuzz/**',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/midge',
  },
  {
    source: 'fitz/README.md product and domain contract',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz',
  },
  {
    source: 'fitz/README.md local broker and client material',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/setup',
  },
  {
    source: 'fitz/docs/operations/cloud-setup.md',
    audience: 'operator',
    disposition: 'site',
    route: '/docs/fitz/cloud',
  },
  {
    source: 'fitz domain contracts',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/domains/notice',
  },
  {
    source: 'fitz domain contracts',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/domains/stream',
  },
  {
    source: 'fitz domain contracts',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/domains/kv',
  },
  {
    source: 'fitz domain contracts',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/domains/queue',
  },
  {
    source: 'fitz domain contracts',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/domains/rpc',
  },
  {
    source: 'fitz domain contracts',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/domains/lease',
  },
  {
    source: 'fitz domain contracts',
    audience: 'user',
    disposition: 'site',
    route: '/docs/fitz/domains/schedule',
  },
  {
    source: 'fitz/docs/development/** and docs/benchmarks/**',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/fitz',
  },
  {
    source: 'cassie/README.md product boundaries',
    audience: 'user',
    disposition: 'site',
    route: '/docs/cassie',
  },
  {
    source: 'cassie/README.md poc_read_model workflow',
    audience: 'user',
    disposition: 'site',
    route: '/docs/cassie/getting-started',
  },
  {
    source: 'cassie contributor and benchmark material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/cassie',
  },
  {
    source: 'tools/README.md command overview',
    audience: 'user',
    disposition: 'site',
    route: '/docs/tools',
  },
  {
    source: 'tools/README.md install and validate-tests',
    audience: 'user',
    disposition: 'site',
    route: '/docs/tools/getting-started',
  },
  {
    source: 'tools contributor implementation material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/tools',
  },
  {
    source: 'stress/README.md framework overview',
    audience: 'user',
    disposition: 'site',
    route: '/docs/stress',
  },
  {
    source: 'stress/README.md quick start',
    audience: 'user',
    disposition: 'site',
    route: '/docs/stress/getting-started',
  },
  {
    source: 'stress contributor and internal benchmark material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/stress',
  },
] as const satisfies readonly CoverageEntry[];
