import { Link } from '@askrjs/askr/router';
import { ArrowLeftIcon } from '@askrjs/lucide';
import { Button, Container } from '@askrjs/themes/components';

export function NotFoundPage() {
  return (
    <section class="not-found" aria-labelledby="not-found-title">
      <Container size="xl">
        <h1 id="not-found-title">This page is not part of the map.</h1>
        <p>
          Start with the ecosystem, choose product documentation, or return
          home.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeftIcon size={18} aria-hidden="true" />
            Return home
          </Link>
        </Button>
      </Container>
    </section>
  );
}
