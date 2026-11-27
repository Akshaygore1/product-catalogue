import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { catalogueQueries } from '../api/catalogue';
import { ApiError } from '../api/client';
import { EnquiryForm } from '../components/EnquiryForm';
import { ButtonLink } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/StatusMessage';
import { formatMoney } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { NotFoundPage } from './NotFoundPage';

export function EnquiryPage() {
  const { id = '' } = useParams();
  const product = useQuery(catalogueQueries.product(id));
  const [submitted, setSubmitted] = useState(false);
  useDocumentTitle(submitted ? 'Thank you' : 'Enquire');

  if (product.isPending) {
    return (
      <div className="mx-auto max-w-lg" aria-busy aria-label="Loading">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    );
  }
  if (product.isError) {
    if (product.error instanceof ApiError && product.error.status === 404) return <NotFoundPage />;
    return <ErrorState error={product.error} onRetry={() => product.refetch()} />;
  }

  const p = product.data;
  const productPath = `/products/${encodeURIComponent(p.id)}`;

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center" role="status">
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-accent text-on-accent">
          <Icon name="check" size={28} />
        </div>
        <h1 className="text-2xl font-medium text-strong">Thank you</h1>
        <p className="mt-2 text-md text-subtle">
          We’ve received your enquiry about <span className="text-strong">{p.title}</span>. Our
          sales team will be in touch soon.
        </p>
        <div className="mt-8 flex gap-2">
          <ButtonLink to={productPath} variant="secondary">
            Back to product
          </ButtonLink>
          <ButtonLink to="/">Continue browsing</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        to={productPath}
        className="mb-6 inline-flex items-center gap-1 text-base text-subtle hover:text-strong"
      >
        <Icon name="arrow-left" />
        Back to product
      </Link>

      <h1 className="text-2xl font-medium text-strong">Enquire about this product</h1>
      <p className="mt-1 mb-6 text-md text-subtle">Leave your details and we’ll get back to you.</p>

      <div className="mb-8 flex items-center gap-4 rounded-lg border border-border p-3">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-surface p-1">
          <img src={p.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-strong">{p.title}</p>
          <p className="text-base text-subtle">{formatMoney(p.price)}</p>
        </div>
      </div>

      <EnquiryForm productId={p.id} onSuccess={() => setSubmitted(true)} />
    </div>
  );
}
