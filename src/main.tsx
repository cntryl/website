import { createSPA, hydrateSPA } from '@askrjs/askr/boot';
import './styles.css';

async function main() {
  const root = document.getElementById('app');
  if (!root) throw new Error('Missing #app root element.');

  const { routeRegistry } = await import('./pages/_routes');

  if (root.childNodes.length > 0) {
    await hydrateSPA({ root, registry: routeRegistry });
    return;
  }

  await createSPA({ root, registry: routeRegistry });
}

void main();
