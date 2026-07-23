import type { Props } from '@askrjs/askr';
import { Link } from '@askrjs/askr/router';
import { GitHubLogo } from '@askrjs/logos';
import { BookOpenIcon, MoonIcon, SunIcon } from '@askrjs/lucide';
import {
  Brand,
  BrandLabel,
  Button,
  Container,
  Footer,
  FooterContent,
  FooterLink,
  FooterLinks,
  FooterSection,
  FooterTitle,
  Header,
  Navbar,
  NavBrand,
  NavGroup,
  Text,
} from '@askrjs/themes/components';
import { ThemeScope, ThemeToggle } from '@askrjs/themes/theme';
import { docsPortals } from '../docs/catalog';
import { marketingPages, repositories } from './catalog';

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

export function GitHubLink({ compact = true }: { compact?: boolean }) {
  return (
    <a
      href="https://github.com/cntryl"
      aria-label="Cntryl on GitHub"
      title="GitHub"
    >
      <GitHubLogo size={18} aria-hidden="true" />
      {!compact && <span>GitHub</span>}
    </a>
  );
}

export function MarketingLayout({ children }: Props) {
  return (
    <ThemeScope defaultTheme="light" storageKey="cntryl-theme">
      <div class="marketing-shell" data-layout="marketing">
        <Header sticky>
          <Container size="xl">
            <Navbar aria-label="Primary navigation">
              <NavBrand>
                <CntrylBrand />
              </NavBrand>
              <NavGroup align="end">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/ecosystem">Ecosystem</Link>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <Link
                    href="/docs"
                    aria-label="Documentation"
                    title="Documentation"
                  >
                    <BookOpenIcon size={18} aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <GitHubLink />
                </Button>
                <SiteThemeToggle />
              </NavGroup>
            </Navbar>
          </Container>
        </Header>
        <main>{children}</main>
        <Footer>
          <Container size="xl" paddingY="lg">
            <FooterContent class="site-footer__columns">
              <FooterSection>
                <FooterTitle>Products</FooterTitle>
                <FooterLinks aria-label="Product links">
                  {marketingPages
                    .filter((page) =>
                      ['/midge', '/fitz', '/cassie'].includes(page.path)
                    )
                    .map((page) => (
                      <FooterLink key={page.path} href={page.path}>
                        {page.label}
                      </FooterLink>
                    ))}
                </FooterLinks>
              </FooterSection>
              <FooterSection>
                <FooterTitle>Documentation</FooterTitle>
                <FooterLinks aria-label="Documentation links">
                  <FooterLink href="/docs">Documentation home</FooterLink>
                  {docsPortals.map((portal) => (
                    <FooterLink key={portal.id} href={portal.route}>
                      {portal.label}
                    </FooterLink>
                  ))}
                </FooterLinks>
              </FooterSection>
              <FooterSection>
                <FooterTitle>Source</FooterTitle>
                <FooterLinks aria-label="Repository links">
                  {repositories
                    .filter(
                      (repository) =>
                        repository.name !== 'tools' &&
                        repository.name !== 'stress'
                    )
                    .map((repository) => (
                      <FooterLink key={repository.name} href={repository.href}>
                        <GitHubLogo size={14} aria-hidden="true" />
                        {repository.name}
                      </FooterLink>
                    ))}
                </FooterLinks>
              </FooterSection>
            </FooterContent>
            <Text class="site-footer__copyright" size="sm" tone="muted">
              © 2026 Cntryl contributors.
            </Text>
          </Container>
        </Footer>
      </div>
    </ThemeScope>
  );
}
