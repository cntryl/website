import { For, Show, type Props } from '@askrjs/askr';
import { currentRoute, Link } from '@askrjs/askr/router';
import {
  Container,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarScope,
  SidebarTrigger,
} from '@askrjs/themes/components';
import {
  docsByRoute,
  docsPortals,
  docsTableOfContents,
  portalForRoute,
  resolveDocsRoute,
} from './catalog';
import { DocsProductBar } from './product-bar';
import { SiteLayout } from '../site-layout';
import { list } from '../list';

// Products are the top-level tabs; the sidebar covers only the active one.
function activePortalFor(path: string) {
  return portalForRoute(path) ?? docsPortals[0];
}

function DocsNavigation({ close }: { close?: () => void }) {
  const activePath = resolveDocsRoute(currentRoute());
  const portal = activePortalFor(activePath);

  // Rebuilt every render so each entry's `active` flag travels with the item
  // identity For reconciles on. For does not re-invoke its children function
  // for stable item identities, and the catalog sections/pages are module-level
  // constants, so comparing against `activePath` from the closure would freeze
  // the highlight on whichever page was open when the sidebar first mounted.
  const groups: {
    id: string;
    label: string;
    pages: { route: string; title: string; active: boolean }[];
  }[] = [];
  for (const section of portal.sections) {
    const pages: { route: string; title: string; active: boolean }[] = [];
    for (const page of section.pages) {
      pages.push({
        route: page.route,
        title: page.title,
        active: page.route === activePath,
      });
    }
    groups.push({ id: section.id, label: section.label, pages });
  }

  return (
    <For each={groups} by={(section) => section.id}>
      {(section) => (
        <SidebarGroup data-nav-section={section.id}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <For each={section.pages} by={(page) => page.route}>
                {(page) => (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" active={page.active}>
                      <Link
                        href={page.route}
                        aria-current={page.active ? 'page' : undefined}
                        onPress={close}
                      >
                        {page.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </For>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </For>
  );
}

function TableOfContents() {
  const route = resolveDocsRoute(currentRoute());
  const page = docsByRoute.get(route as `/docs${string}`);
  const headings = page ? docsTableOfContents(page) : [];

  // <Show>, not an early `return null`: this component persists across docs
  // navigation (it's a sibling of {children} in DocsLayout, not remounted
  // per route), so whether the <For> below runs can change from render to
  // render — e.g. navigating from /docs (no matching page, no headings) to
  // any specific doc page. An early return that skips the <For> some renders
  // but not others is the same hook-order hazard <Show> exists to prevent.
  return (
    <Show when={headings.length > 0}>
      <aside class="docs-toc" aria-label="On this page">
        <p>On this page</p>
        <ul>
          <For each={list(headings)} by={(heading) => heading.id}>
            {(heading) => (
              <li>
                <a href={`#${heading.id}`}>{heading.title}</a>
              </li>
            )}
          </For>
        </ul>
      </aside>
    </Show>
  );
}

export function DocsLayout({ children }: Props) {
  const activePath = resolveDocsRoute(currentRoute());
  const portal = activePortalFor(activePath);

  // The product bar and sidebar are docs chrome inside the shared shell, not a
  // layout of their own.
  return (
    <SiteLayout variant="docs" portalId={portal.id}>
      <DocsProductBar />
      <Container size="xl" class="docs-channel">
        <SidebarScope class="docs-scope">
          <Sidebar collapsible="offcanvas">
            <SidebarContent
              data-docs-sidebar="unified"
              data-nav-product={portal.id}
            >
              <DocsNavigation />
            </SidebarContent>
          </Sidebar>
          <SidebarInset class="docs-main">
            <div class="docs-mobile-bar">
              <SidebarTrigger aria-label="Toggle documentation navigation" />
              <span>{portal.label} documentation</span>
            </div>
            <div class="docs-body">
              <div class="docs-content">{children}</div>
              <TableOfContents />
            </div>
          </SidebarInset>
        </SidebarScope>
      </Container>
    </SiteLayout>
  );
}
