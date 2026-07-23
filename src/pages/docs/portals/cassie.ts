import { definePortal } from '../define';

export const cassiePortal = definePortal({
  id: 'cassie',
  label: 'Cassie',
  shortLabel: 'Cassie',
  kind: 'runtime',
  route: '/docs/cassie',
  description:
    'SQL-queryable read models built from application-owned history.',
  repository: 'https://github.com/cntryl/cassie',
  loader: () => import('../routes/cassie'),
  sections: [
    {
      id: 'start',
      label: 'Start here',
      pages: [
        {
          path: '',
          title: 'Overview',
          description:
            'Learn when Cassie fits, how projection data becomes queryable, and which history remains application-owned.',
          contract:
            'Cassie is a single-node query engine for CQRS and event-sourced read models. It materializes projection rows and serves supported SQL through the PostgreSQL wire protocol, with an administrative REST API.',
          practice:
            'The application supplies owned history and deterministic projection work. Cassie stores and queries the resulting view. Cassie uses Midge for persistence and recovery while owning SQL semantics, planning, execution, indexes, search, and resource controls.',
          boundary:
            'Cassie is not the event stream, an OLTP database, or a distributed SQL system. External systems own history, replay input, routing, placement, and failover. Next, run the canonical proof-of-concept and execute its read-model query workflow.',
          keywords: [
            'CQRS',
            'event sourced',
            'SQL',
            'PostgreSQL',
            'projection',
          ],
        },
        {
          path: 'getting-started',
          title: 'Getting Started',
          description:
            'Run Cassie’s canonical local example and complete its queryable read-model workflow.',
          contract:
            'The repository-owned poc_read_model example is the canonical local path. It creates projection data from application-style history and queries the resulting read model without requiring a separately managed server.',
          practice:
            'Clone the Cassie repository, run the locked example from its root, and inspect the printed query results. The example exercises projection input, persisted read-model state, and a query over that state in one maintained program.',
          boundary:
            'Treat the example as a local workflow, not a deployment configuration. Application history remains authoritative, and a production integration must define checkpoints, replay, verification, authentication, and placement.',
          keywords: ['poc_read_model', 'cargo run', 'query', 'read model'],
          code: `git clone https://github.com/cntryl/cassie.git
cd cassie
cargo run --locked --example poc_read_model`,
        },
      ],
    },
  ],
});
