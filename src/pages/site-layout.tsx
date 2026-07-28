import type { Props } from '@askrjs/askr';
import { ThemeScope } from '@askrjs/themes/theme';
import type { DocsPortalId } from './docs/types';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

// The one shell every page renders inside: shared top nav, the page, then the
// shared footer. Sections add their own chrome (the docs product bar and
// sidebar) inside the content region rather than around it.
export function SiteLayout({
  variant,
  portalId,
  children,
}: Props & {
  variant: 'marketing' | 'docs';
  portalId?: DocsPortalId;
}) {
  return (
    <ThemeScope defaultTheme="light" storageKey="cntryl-theme">
      <div class="site-shell" data-layout={variant}>
        <SiteHeader portalId={portalId} />
        <main class="site-main">{children}</main>
        <SiteFooter />
      </div>
    </ThemeScope>
  );
}
