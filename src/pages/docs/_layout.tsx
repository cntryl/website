import { state, type Props } from '@askrjs/askr';
import { currentRoute, Link } from '@askrjs/askr/router';
import { GitHubLogo } from '@askrjs/logos';
import {
  BookOpenIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  XIcon,
} from '@askrjs/lucide';
import { Button } from '@askrjs/themes/components';
import { ThemeScope } from '@askrjs/themes/theme';
import {
  docsByRoute,
  docsNavigationGroups,
  docsTableOfContents,
  portalForRoute,
  resolveDocsRoute,
} from './catalog';
import { DocsSearch } from './search';
import { CntrylBrand, SiteThemeToggle } from '../marketing/_layout';

const STORAGE_KEY = 'cntryl-docs-sidebar-collapsed';
const adoptedShells = new WeakSet<HTMLElement>();

function DocsNavigation({
  collapsed = false,
  close,
}: {
  collapsed?: boolean;
  close?: () => void;
}) {
  const activePath = resolveDocsRoute(currentRoute());
  const activePortal = portalForRoute(activePath);
  if (collapsed) {
    return (
      <nav class="docs-nav docs-nav--collapsed" aria-label="Documentation">
        <Link href="/docs" onClick={close} aria-label="Documentation home">
          <BookOpenIcon size={18} aria-hidden="true" />
        </Link>
      </nav>
    );
  }

  return (
    <nav
      class="docs-nav"
      data-docs-sidebar="unified"
      aria-label="Product documentation"
    >
      <Link class="docs-nav__home" href="/docs" onClick={close}>
        <BookOpenIcon size={18} aria-hidden="true" />
        <span>Documentation</span>
      </Link>
      {docsNavigationGroups.map((group) => {
        const isOther = group.label === 'Other';
        return (
          <section class="docs-nav__group" key={group.label}>
            {isOther ? (
              <p class="docs-nav__group-label">{group.label}</p>
            ) : null}
            {group.portals.map((portal) => {
              return (
                <div
                  class="docs-nav__product"
                  key={portal.id}
                  data-nav-product={portal.id}
                >
                  <Link
                    class={
                      isOther
                        ? 'docs-nav__product-link'
                        : 'docs-nav__group-link'
                    }
                    href={portal.route}
                    aria-current={
                      activePath === portal.route ? 'page' : undefined
                    }
                    onClick={close}
                  >
                    {portal.label}
                  </Link>
                </div>
              );
            })}
          </section>
        );
      })}
      {activePortal ? (
        <section
          class="docs-nav__pages"
          data-nav-pages={activePortal.id}
          aria-label={`${activePortal.label} pages`}
        >
          <p>{activePortal.label} pages</p>
          {activePortal.sections.map((section) => (
            <div class="docs-nav__page-section" key={section.id}>
              <p>{section.label}</p>
              <ul>
                {section.pages.map((page) => (
                  <li key={page.route}>
                    <Link
                      href={page.route}
                      aria-current={
                        page.route === activePath ? 'page' : undefined
                      }
                      onClick={close}
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}
    </nav>
  );
}

function TableOfContents() {
  const route = resolveDocsRoute(currentRoute());
  const page = docsByRoute.get(route as `/docs${string}`);
  const headings = page
    ? docsTableOfContents(page)
    : route === '/docs'
      ? [
          { id: 'search', title: 'Search all products' },
          { id: 'choose-product', title: 'Choose a product' },
        ]
      : [];

  return (
    <aside class="docs-toc" aria-label="On this page">
      <p>On this page</p>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`}>{heading.title}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function DocsLayout({ children }: Props) {
  const [collapsed, setCollapsedState] = state(false);
  const [drawerOpen, setDrawerOpen] = state(false);
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {}
  };

  return (
    <ThemeScope defaultTheme="light" storageKey="cntryl-theme">
      <div
        class="docs-shell"
        data-layout="docs"
        data-sidebar-collapsed={collapsed() ? 'true' : 'false'}
        ref={(element: HTMLElement | null) => {
          if (!element || adoptedShells.has(element)) return;
          adoptedShells.add(element);
          try {
            setCollapsedState(
              window.localStorage.getItem(STORAGE_KEY) === 'true'
            );
          } catch {}
          window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setDrawerOpen(false);
          });
        }}
      >
        <aside class="docs-sidebar">
          <header>
            {!collapsed() ? <CntrylBrand /> : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                collapsed()
                  ? 'Expand docs navigation'
                  : 'Collapse docs navigation'
              }
              aria-pressed={collapsed()}
              onPress={() => setCollapsed(!collapsed())}
            >
              {collapsed() ? (
                <PanelLeftOpenIcon size={18} aria-hidden="true" />
              ) : (
                <PanelLeftCloseIcon size={18} aria-hidden="true" />
              )}
            </Button>
          </header>
          {!collapsed() ? <DocsSearch /> : null}
          <DocsNavigation collapsed={collapsed()} />
          <footer>
            <Button asChild variant="ghost" size="icon">
              <a
                href="https://github.com/cntryl"
                aria-label="Cntryl on GitHub"
                title="GitHub"
              >
                <GitHubLogo size={18} aria-hidden="true" />
              </a>
            </Button>
            <SiteThemeToggle />
          </footer>
        </aside>
        <header class="docs-mobile-header">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open documentation navigation"
            aria-expanded={drawerOpen()}
            onPress={() => setDrawerOpen(true)}
          >
            <MenuIcon size={20} aria-hidden="true" />
          </Button>
          <CntrylBrand />
          <DocsSearch />
          <SiteThemeToggle />
        </header>
        {drawerOpen() ? (
          <div
            class="docs-drawer-backdrop"
            role="presentation"
            onClick={(event: Event) => {
              if (event.target === event.currentTarget) setDrawerOpen(false);
            }}
          >
            <aside class="docs-drawer">
              <header>
                <CntrylBrand />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close documentation navigation"
                  onPress={() => setDrawerOpen(false)}
                >
                  <XIcon size={20} aria-hidden="true" />
                </Button>
              </header>
              <DocsNavigation close={() => setDrawerOpen(false)} />
            </aside>
          </div>
        ) : null}
        <main class="docs-main">
          <div class="docs-content">{children}</div>
        </main>
        <TableOfContents />
      </div>
    </ThemeScope>
  );
}
