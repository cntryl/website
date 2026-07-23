import { currentRoute, Link } from '@askrjs/askr/router';
import { GitHubLogo } from '@askrjs/logos';
import { ArrowRightIcon } from '@askrjs/lucide';
import { Button, Container } from '@askrjs/themes/components';
import { marketingPage, type MarketingPath } from './catalog';

export function MarketingPage() {
  const path = (currentRoute().matches?.at(-1)?.path ??
    currentRoute().path) as MarketingPath;
  const page = marketingPage(path);
  return (
    <>
      <section class="editorial-hero" aria-labelledby="page-title">
        <Container size="xl">
          <h1 id="page-title">{page.headline}</h1>
          <p class="editorial-hero__lede">{page.lede}</p>
          <p>{page.audience}</p>
          {page.path !== '/ecosystem' ? (
            <div class="hero-actions">
              <Button asChild>
                <Link href={page.next.primaryHref}>
                  {page.next.primaryLabel}
                  <ArrowRightIcon size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={page.next.secondaryHref}>
                  {page.next.secondaryLabel}
                </Link>
              </Button>
              {'repository' in page.next && page.next.repository ? (
                <a class="source-link" href={page.next.repository}>
                  <GitHubLogo size={15} aria-hidden="true" />
                  GitHub
                </a>
              ) : null}
            </div>
          ) : null}
        </Container>
      </section>
      {[page.what, page.fit].map((section, index) => (
        <section class="editorial-band" key={section.title}>
          <Container class="split-section" size="xl">
            <div>
              <p class="section-number">0{index + 1}</p>
              <h2>{section.title}</h2>
            </div>
            <p>{section.body}</p>
          </Container>
        </section>
      ))}
      <section class="editorial-evidence" aria-labelledby="work-title">
        <Container size="xl">
          <header class="section-heading">
            <p class="section-number">03</p>
            <h2 id="work-title">Concrete work it helps with</h2>
          </header>
          <div class="evidence-grid">
            {page.work.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section class="editorial-band">
        <Container class="split-section" size="xl">
          <div>
            <p class="section-number">04</p>
            <h2>{page.boundaries.title}</h2>
          </div>
          <p>{page.boundaries.body}</p>
        </Container>
      </section>
      <section class="editorial-cta">
        <Container class="editorial-cta__inner" size="xl">
          <h2>{page.next.title}</h2>
          <div class="hero-actions">
            <Button asChild>
              <Link href={page.next.primaryHref}>{page.next.primaryLabel}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={page.next.secondaryHref}>
                {page.next.secondaryLabel}
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
