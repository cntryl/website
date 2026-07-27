import { For } from '@askrjs/askr';
import { Link } from '@askrjs/askr/router';
import { Button, Container, Grid } from '@askrjs/themes/components';
import { list } from '../list';
import { logoSrcSet, responsiveLogo } from '../logo';

export const homeJourneys = [
  {
    name: 'Midge',
    logo: 'midge-logo',
    question: 'Need durable state without running a database?',
    answer:
      'An embedded storage engine for Rust. Links into your process: no server, no port, no network hop to your data.',
    href: '/midge',
    label: 'Explore Midge',
    // Hover-only aside on the mascot; nothing visible changes.
    wink: "Small, fast, and doesn't need a database. Also, a cat.",
  },
  {
    name: 'Fitz',
    logo: 'fitz-logo',
    question: 'Need your services to talk to each other?',
    answer:
      'A message broker, cache, job queue, and scheduler, all in one process.',
    href: '/fitz',
    label: 'Explore Fitz',
    wink: 'If it fitz, i sitz.',
  },
  {
    name: 'Cassie',
    logo: 'cassie-logo',
    question: 'Got an event log you want to query with SQL?',
    answer:
      'You define the tables and views. Cassie stores what you replay into them and serves it over psql, your driver, or a BI tool.',
    href: '/cassie',
    label: 'Explore Cassie',
    wink: 'Query me like one of your SQL databases.',
  },
] as const;

export function HomePage() {
  return (
    <>
      <section class="home-hero" aria-labelledby="home-title">
        <Container size="xl">
          <h1 id="home-title">
            Storage in your cloud. Runtime you can throw away.
          </h1>
          <p class="home-hero__lede">
            Midge is an embedded storage engine that keeps its data in S3,
            Azure Blob, or GCS. Fitz embeds it to run a broker, cache, job
            queue, and scheduler as one process instead of four. Cassie
            embeds it to run a real SQL database for your event log's read
            side. None of them store your data in the container.
          </p>
          <div class="hero-actions">
            <Button asChild>
              <Link href="/ecosystem">See how it works</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">Browse documentation</Link>
            </Button>
          </div>
        </Container>
      </section>
      <section class="home-products" aria-labelledby="choose-title">
        <Container size="xl">
          <header class="section-heading">
            <h2 id="choose-title">Start with the one you need</h2>
            <p class="section-heading__lede">
              Each product solves its problem on its own. Adopt one without
              adopting the others.
            </p>
          </header>
          <Grid
            class="home-product-grid"
            columns={{ base: 1, md: 3 }}
            gap={{ base: 'xl', lg: '3xl' }}
          >
            <For each={list(homeJourneys)} by={(journey) => journey.href}>
              {(journey) => (
                <article class="home-product">
                  <img
                    class="home-product__logo"
                    src={logoSrcSet(journey.logo, 'lg').src}
                    {...responsiveLogo(journey.logo, 'lg', 112)}
                    alt=""
                    aria-hidden="true"
                    title={journey.wink}
                    width={112}
                    height={112}
                  />
                  <h3>{journey.name}</h3>
                  <p class="home-product__question">{journey.question}</p>
                  <p>{journey.answer}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={journey.href}>{journey.label}</Link>
                  </Button>
                </article>
              )}
            </For>
          </Grid>
        </Container>
      </section>
      <section class="home-askr" aria-labelledby="askr-title">
        <Container size="xl">
          <div class="home-askr__inner">
            <img
              class="home-askr__logo"
              src={logoSrcSet('askr-logo', 'lg').src}
              {...responsiveLogo('askr-logo', 'lg', 104)}
              alt=""
              aria-hidden="true"
              title="The framework. Also a cat."
              width={104}
              height={104}
            />
            <div>
              <h2 id="askr-title">Already building on Askr?</h2>
              <p>
                Askr is the full-stack application framework these products were
                built to sit under. An Askr app can talk to Fitz and query
                Cassie, with storage, communication, and read models staying
                infrastructure you run yourself rather than a hosted service
                you rent.
              </p>
              <Button asChild>
                <a href="https://askrjs.com">Go to askrjs.com</a>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
