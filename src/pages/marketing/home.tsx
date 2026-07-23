import { Link } from '@askrjs/askr/router';
import { ArrowRightIcon } from '@askrjs/lucide';
import { Button, Container } from '@askrjs/themes/components';

export const homeJourneys = [
  {
    question: 'Need embedded Rust storage?',
    answer: 'Midge keeps durability and recovery choices explicit.',
    href: '/midge',
    label: 'Explore Midge',
  },
  {
    question: 'Need applications to communicate?',
    answer:
      'Fitz provides related messaging and coordination models through one broker.',
    href: '/fitz',
    label: 'Explore Fitz',
  },
  {
    question: 'Need queryable read models?',
    answer: 'Cassie serves projection data through supported SQL.',
    href: '/cassie',
    label: 'Explore Cassie',
  },
] as const;

export function HomePage() {
  return (
    <>
      <section class="home-hero" aria-labelledby="home-title">
        <Container size="xl">
          <h1 id="home-title">Choose the boundary your application needs.</h1>
          <p class="home-hero__lede">
            Cntryl provides embedded storage, an application broker, and a
            read-model query engine.
          </p>
          <div class="hero-actions">
            <Button asChild>
              <Link href="/ecosystem">
                See how they fit
                <ArrowRightIcon size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">Choose documentation</Link>
            </Button>
          </div>
        </Container>
      </section>
      <section class="problem-chooser" aria-labelledby="choose-title">
        <Container size="xl">
          <header class="section-heading">
            <h2 id="choose-title">What work are you doing?</h2>
          </header>
          <div class="problem-grid">
            {homeJourneys.map((journey) => (
              <article key={journey.href} class="problem-card">
                <h3>{journey.question}</h3>
                <p>{journey.answer}</p>
                <Link href={journey.href}>
                  {journey.label}
                  <ArrowRightIcon size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section class="home-proof" aria-labelledby="adopt-title">
        <Container class="split-section" size="xl">
          <div>
            <h2 id="adopt-title">Start with one product.</h2>
          </div>
          <div class="prose-stack">
            <p>
              Each product has a stated operating model and boundary. Cassie
              uses Midge. Fitz remains independently useful.
            </p>
            <Link href="/docs">
              Open documentation
              <ArrowRightIcon size={16} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
