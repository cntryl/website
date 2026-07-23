import { state } from '@askrjs/askr';
import { Link } from '@askrjs/askr/router';
import { SearchIcon, XIcon } from '@askrjs/lucide';
import { Button } from '@askrjs/themes/components';
import { docsPortals, searchDocs } from './catalog';
import type { DocsPortalId } from './types';

const adoptedSearchRoots = new WeakSet<HTMLElement>();

export function DocsSearch() {
  const [open, setOpen] = state(false);
  const [query, setQuery] = state('');
  const [filter, setFilter] = state<DocsPortalId | 'all'>('all');
  const queryValue = query();
  const filterValue = filter();
  const results = searchDocs(queryValue, filterValue);

  const close = () => {
    setOpen(false);
    setQuery('');
    setFilter('all');
  };
  return (
    <div
      class="docs-search"
      ref={(element: HTMLElement | null) => {
        if (!element || adoptedSearchRoots.has(element)) return;
        adoptedSearchRoots.add(element);
        window.addEventListener('keydown', (event) => {
          const target = event.target;
          const typing =
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement;
          if (
            (event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
            (event.key === '/' && !typing)
          ) {
            event.preventDefault();
            setOpen(true);
            window.setTimeout(
              () =>
                element
                  .querySelector<HTMLInputElement>('[data-docs-search-input]')
                  ?.focus(),
              0
            );
          }
          if (event.key === 'Escape' && open()) close();
        });
      }}
    >
      <Button
        class="docs-search__trigger"
        type="button"
        variant="outline"
        width="full"
        onPress={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <SearchIcon size={16} aria-hidden="true" />
        <span>Search docs</span>
        <kbd>⌘ K</kbd>
      </Button>
      {open() ? (
        <div
          class="docs-search__backdrop"
          role="presentation"
          onClick={(event: Event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            class="docs-search__dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
          >
            <div class="docs-search__input">
              <SearchIcon size={18} aria-hidden="true" />
              <input
                data-docs-search-input
                type="search"
                value={queryValue}
                placeholder="Search products, concepts, APIs, and operations"
                onInput={(event: Event) =>
                  setQuery((event.currentTarget as HTMLInputElement).value)
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onPress={close}
                aria-label="Close search"
              >
                <XIcon size={18} aria-hidden="true" />
              </Button>
            </div>
            <div class="docs-search__filters" aria-label="Filter by product">
              <Button
                size="sm"
                variant={filterValue === 'all' ? 'default' : 'ghost'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              {docsPortals.map((portal) => (
                <Button
                  key={portal.id}
                  size="sm"
                  variant={filterValue === portal.id ? 'default' : 'ghost'}
                  onClick={() => setFilter(portal.id)}
                >
                  {portal.shortLabel}
                </Button>
              ))}
            </div>
            <div class="docs-search__results" aria-live="polite">
              {!queryValue.trim() ? (
                <p>
                  Search every website-owned user and operator guide. Choose a
                  product filter when a term appears in more than one portal.
                </p>
              ) : results.length ? (
                <ul>
                  {results.map((result) => (
                    <li key={`${result.route}#${result.anchor ?? ''}`}>
                      <Link
                        href={`${result.route}${result.anchor ? `#${result.anchor}` : ''}`}
                        onClick={close}
                      >
                        <span>
                          <strong>{result.title}</strong>
                          <small>{result.description}</small>
                        </span>
                        <em>{result.portalLabel}</em>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No results for “{queryValue}” in this filter.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
