import { For } from '@askrjs/askr';
import { Container, Tab, Tabs } from '@askrjs/themes/components';
import { docsManifest } from './manifest';
import { list } from '../list';

// The product switcher sits below the shared top nav on every docs page,
// including the index, so the set of products is always visible.
export function DocsProductBar() {
  return (
    <div class="docs-productbar">
      <Container size="xl">
        <Tabs class="docs-tabs" aria-label="Products">
          <For each={list(docsManifest)} by={(portal) => portal.id}>
            {(portal) => (
              <Tab href={portal.route} match="prefix">
                {portal.label}
              </Tab>
            )}
          </For>
        </Tabs>
      </Container>
    </div>
  );
}
