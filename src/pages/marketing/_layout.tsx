import type { Props } from '@askrjs/askr';
import { SiteLayout } from '../site-layout';

export { CntrylBrand, GitHubLink, SiteThemeToggle } from '../site-header';

export function MarketingLayout({ children }: Props) {
  return <SiteLayout variant="marketing">{children}</SiteLayout>;
}
