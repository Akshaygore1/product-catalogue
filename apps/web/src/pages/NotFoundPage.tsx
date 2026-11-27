import { ButtonLink } from '../components/ui/Button';
import { StatusMessage } from '../components/ui/StatusMessage';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Not found');
  return (
    <StatusMessage
      icon="package-search"
      title="We couldn’t find that page"
      description="It may have moved, or the link may be wrong."
      action={
        <ButtonLink to="/" variant="secondary">
          Back to home
        </ButtonLink>
      }
    />
  );
}
