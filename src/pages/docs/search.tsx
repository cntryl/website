import { For, Show, state } from '@askrjs/askr';
import { navigate } from '@askrjs/askr/router';
import { on } from '@askrjs/askr/resources';
import { SearchIcon, XIcon } from '@askrjs/lucide';
import { Button } from '@askrjs/themes/components';
import { docsPortals, searchDocs } from './catalog';
import type { DocsPortalId } from './types';
import { list } from '../list';

type SearchChip = { id: DocsPortalId | 'all'; label: string; active: boolean };
type SearchResult = ReturnType<typeof searchDocs>[number];

// Its own component, not inline JSX in DocsSearch's conditional: the dialog
// only exists in the DOM while open, and its <For> calls need a hook-index
// sequence that starts fresh with it, not one merged into DocsSearch's own
// (mounting it inline throws "Hook order violation" the moment it opens,
// since that index was never claimed on DocsSearch's first render).
function SearchDialog({
  queryValue,
  chips,
  results,
  onQueryChange,
  onFilterChange,
  onDismiss,
  onSelectResult,
}: {
  queryValue: string;
  chips: SearchChip[];
  results: SearchResult[];
  onQueryChange: (value: string) => void;
  onFilterChange: (id: DocsPortalId | 'all') => void;
  onDismiss: () => void;
  onSelectResult: (event: Event, href: string) => void;
}) {
  return (
    <div
      class="docs-search__backdrop"
      role="presentation"
      onClick={(event: Event) => {
        const target = event.target as HTMLElement | null;
        if (target?.classList.contains('docs-search__backdrop')) onDismiss();
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
            onInput={(event: Event) => {
              onQueryChange((event.target as HTMLInputElement).value);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onPress={onDismiss}
            aria-label="Close search"
          >
            <XIcon size={18} aria-hidden="true" />
          </Button>
        </div>
        {/* The For is the SOLE child of this row, so the "All" chip is folded
          into the chip list rather than sitting beside it: a control
          boundary with an element sibling has no incremental commit path. */}
        <div class="docs-search__filters" aria-label="Filter by product">
          <For each={chips} by={(chip) => chip.id}>
            {(chip) => (
              <Button
                size="sm"
                variant={chip.active ? 'default' : 'ghost'}
                onPress={() => onFilterChange(chip.id)}
              >
                {chip.label}
              </Button>
            )}
          </For>
        </div>
        <div class="docs-search__results" aria-live="polite">
          {!queryValue.trim() ? (
            <p>
              Search every website-owned user and operator guide. Choose a
              product filter when a term appears in more than one portal.
            </p>
          ) : null}
          {queryValue.trim() && !results.length ? (
            <p>No results for “{queryValue}” in this filter.</p>
          ) : null}
          <ul>
            <For
              each={list(results)}
              by={(result) => `${result.route}#${result.anchor ?? ''}`}
            >
              {(result) => {
                const href = `${result.route}${
                  result.anchor ? `#${result.anchor}` : ''
                }`;
                return (
                  <li>
                    <a
                      href={href}
                      onClick={(event: Event) => onSelectResult(event, href)}
                    >
                      <span>
                        <strong>{result.title}</strong>
                        <small>{result.description}</small>
                      </span>
                      <em>{result.portalLabel}</em>
                    </a>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </section>
    </div>
  );
}

// Askr delegates every JSX event handler onto document.body and invokes the
// handler with the unmodified native event, so `event.currentTarget` is always
// BODY — never the element the prop was written on. Anything that needs the
// element must go through `event.target`.
function focusSearchInput() {
  document.querySelector<HTMLInputElement>('[data-docs-search-input]')?.focus();
}

function focusSearchTrigger() {
  document
    .querySelector<HTMLButtonElement>('[data-docs-search-trigger]')
    ?.focus();
}

// Inside a product's docs the search starts scoped to that product, and the
// filter chips still reach every other portal. Note this means a cross-product
// query ("fitz" while reading Midge docs) legitimately returns zero results
// until the reader widens the filter to All.
export function DocsSearch({ portalId }: { portalId?: DocsPortalId } = {}) {
  const [open, setOpen] = state(false);
  const [query, setQuery] = state('');
  const [filter, setFilter] = state<DocsPortalId | 'all'>(portalId ?? 'all');
  const queryValue = query();
  const filterValue = filter();
  const results = searchDocs(queryValue, filterValue);

  // Built fresh every render (and without .map, which this file bans) so each
  // chip's `active` flag travels with the item identity For reconciles on.
  const chips: {
    id: DocsPortalId | 'all';
    label: string;
    active: boolean;
  }[] = [{ id: 'all', label: 'All', active: filterValue === 'all' }];
  for (const portal of docsPortals) {
    chips.push({
      id: portal.id,
      label: portal.shortLabel,
      active: filterValue === portal.id,
    });
  }

  const close = () => {
    setOpen(false);
    setQuery('');
    setFilter(portalId ?? 'all');
  };

  // Explicit dismissal (X, Escape, backdrop click) returns focus to the
  // trigger. Without this, unmounting the dialog drops focus to <body> and
  // keyboard users lose their place. Result selection deliberately does NOT
  // call this — focus belongs to the page being navigated to.
  const dismiss = () => {
    close();
    focusSearchTrigger();
  };

  // Results are plain anchors driving navigate() by hand, NOT <Link>. There is
  // currently no way to run code when an askr <Link> is activated:
  //   - onPress is dropped (Link injects `onClick`, so mergeProps never pairs
  //     the two keys, and `onPress` is not a real DOM event on the <a>);
  //   - onClick is composed but then skipped, because Link's own handler calls
  //     preventDefault() and composeHandlers bails on defaultPrevented;
  //   - a handler on any ANCESTOR is dropped too, because navigate() tears the
  //     subtree down synchronously while the event is still propagating and the
  //     delegated dispatcher silently skips nodes whose handler store vanished.
  // Owning the handler ourselves lets us close BEFORE navigating.
  const selectResult = (event: Event, href: string) => {
    const mouse = event as MouseEvent;
    if (
      (mouse.button ?? 0) !== 0 ||
      mouse.ctrlKey ||
      mouse.metaKey ||
      mouse.shiftKey ||
      mouse.altKey
    ) {
      return; // let the browser handle new-tab / new-window activations
    }
    event.preventDefault();
    close();
    navigate(href);
  };

  // `on` attaches once per mounted instance and detaches automatically when
  // this component is disposed. A raw window.addEventListener in a ref
  // callback would instead leak one listener per mount, since nothing ever
  // called removeEventListener on navigation away from this component.
  //
  // Called unconditionally so its hook index stays stable — a wrapping
  // `if (typeof window !== 'undefined')` would make the call itself
  // conditional. Passing a lazy target instead lets `on` resolve it, and it
  // already treats a missing `window` (during `askr ssg`) as "no target",
  // skipping the attach without evaluating the accessor at all.
  on(
    () => window,
    'keydown',
    (rawEvent: Event) => {
      const event = rawEvent as KeyboardEvent;
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
        // Deliberately not a captured ref: the renderer re-invokes `ref` with
        // null on every re-render, so a ref captured here is already null by
        // the time this timeout runs.
        window.setTimeout(focusSearchInput, 0);
      }
      if (event.key === 'Escape' && open()) dismiss();
    }
  );

  return (
    <div class="docs-search">
      <Button
        class="docs-search__trigger"
        type="button"
        variant="outline"
        width="full"
        data-docs-search-trigger
        onPress={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open()}
      >
        <SearchIcon size={16} aria-hidden="true" />
        <span>Search docs</span>
        <kbd>⌘ K</kbd>
      </Button>
      {/* Mounted only while open. An always-mounted overlay keeps focusable
          controls (the close button, the filter chips) in the DOM, and toggling
          aria-hidden on their ancestor while one of them still holds focus is
          exactly what the browser blocks: "Blocked aria-hidden on an element
          because its descendant retained focus." Unmounting removes the hidden
          subtree, so there is nothing to hide from assistive tech and no need
          for aria-hidden at all.
          <Show>, not a `{open() ? ... : null}` ternary: SearchDialog's <For>
          calls need a real control boundary to get their own stable hook-index
          sequence. A plain ternary doesn't establish one, so the first mount
          throws "Hook order violation" the moment the dialog opens. */}
      <Show when={open}>
        <SearchDialog
          queryValue={queryValue}
          chips={chips}
          results={results}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onDismiss={dismiss}
          onSelectResult={selectResult}
        />
      </Show>
    </div>
  );
}
