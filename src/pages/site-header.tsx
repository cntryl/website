import { Link } from '@askrjs/askr/router';
import { GitHubLogo } from '@askrjs/logos';
import { MoonIcon, SunIcon } from '@askrjs/lucide';
import {
  Brand,
  BrandLabel,
  Button,
  Container,
  Header,
  NavBrand,
  Navbar,
  NavGroup,
  NavLink,
} from '@askrjs/themes/components';
import { ThemeToggle } from '@askrjs/themes/theme';
import { For } from '@askrjs/askr';
import { DocsSearch } from './docs/search';
import type { DocsPortalId } from './docs/types';
import { marketingPages } from './marketing/catalog';
import { list } from './list';

// The three product pages, so a visitor who lands on one can reach the others.
const productLinks = marketingPages.filter((page) => page.productId);

export function CntrylBrand() {
  return (
    <Brand asChild>
      <Link href="/" aria-label="Cntryl home">
        <BrandLabel>Cntryl</BrandLabel>
      </Link>
    </Brand>
  );
}

export function SiteThemeToggle() {
  return (
    <ThemeToggle
      aria-label="Toggle color theme"
      title="Theme"
      variant="ghost"
      size="icon"
      lightIcon={<SunIcon size={18} aria-hidden="true" />}
      darkIcon={<MoonIcon size={18} aria-hidden="true" />}
    />
  );
}

export function GitHubLink({
  href = 'https://github.com/cntryl',
  size = 18,
  compact = true,
}: {
  href?: string;
  size?: number;
  compact?: boolean;
}) {
  return (
    <a href={href} aria-label="Cntryl on GitHub" title="GitHub">
      <GitHubLogo size={size} aria-hidden="true" />
      {!compact && <span>GitHub</span>}
    </a>
  );
}

// One header row for every page on the site. Anything section-specific, such
// as the docs product switcher, is a separate band below it.
export function SiteHeader({ portalId }: { portalId?: DocsPortalId } = {}) {
  return (
    <Header class="site-header" sticky>
      <Container size="xl">
        <Navbar aria-label="Primary navigation">
          <NavBrand>
            <CntrylBrand />
          </NavBrand>
          <NavGroup class="site-header__products">
            <For each={list(productLinks)} by={(page) => page.path}>
              {(page) => <NavLink href={page.path}>{page.label}</NavLink>}
            </For>
          </NavGroup>
          <NavGroup align="end">
            <DocsSearch portalId={portalId} />
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
          </NavGroup>
        </Navbar>
      </Container>
    </Header>
  );
}
