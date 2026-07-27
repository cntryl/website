import { docsCatalog } from './catalog';
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

const generatedSiteCoverage = docsCatalog.map((page) => ({
  source: `${page.portalId} product docs`,
  audience: 'user' as const,
  disposition: 'site' as const,
  route: page.route,
}));

export const documentationCoverage = [
  ...generatedSiteCoverage,
  {
    source: 'midge/docs/development/**, benches/**, fuzz/**',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/midge',
  },
  {
    source: 'fitz/docs/development/** and docs/benchmarks/**',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/fitz',
  },
  {
    source: 'fitz-ts client repository reference and conformance material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/fitz-ts',
  },
  {
    source: 'fitz-go client repository reference and conformance material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/fitz-go',
  },
  {
    source: 'cassie contributor and benchmark material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/cassie',
  },
  {
    source: 'tools contributor implementation material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/tools',
  },
  {
    source: 'stress contributor and internal benchmark material',
    audience: 'contributor',
    disposition: 'github-only',
    repository: 'https://github.com/cntryl/stress',
  },
] as const satisfies readonly CoverageEntry[];
