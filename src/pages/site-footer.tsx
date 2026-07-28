import { Link } from '@askrjs/askr/router';
import { Container, Footer, Text } from '@askrjs/themes/components';
import { GitHubLink } from './site-header';

// One slim row on every page: attribution left, a few links right. Product and
// repository links live in the nav, the docs index, and each docs page header.
export function SiteFooter() {
  return (
    <Footer class="site-footer">
      <Container size="xl">
        <div class="site-footer__row">
          <Text
            class="site-footer__copyright"
            size="sm"
            tone="muted"
            title="Midge, Fitz, Cassie, Askr. Yes, they're all cats. If it fitz, i sitz, and i'm Fitz."
          >
            © 2026 Cntryl contributors.
          </Text>
          <nav class="site-footer__links" aria-label="Footer">
            <Link href="/docs">Docs</Link>
            <Link href="/ecosystem">Ecosystem</Link>
            <GitHubLink size={15} compact={false} />
          </nav>
        </div>
      </Container>
    </Footer>
  );
}
