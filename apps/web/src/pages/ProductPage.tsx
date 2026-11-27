import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { catalogueQueries } from '../api/catalogue';
import { ApiError } from '../api/client';
import { Rating } from '../components/Rating';
import { ButtonLink } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/StatusMessage';
import { formatMoney } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { NotFoundPage } from './NotFoundPage';

export function ProductPage() {
  const { id = '' } = useParams();
  const product = useQuery(catalogueQueries.product(id));
  const categories = useQuery(catalogueQueries.categories());
  useDocumentTitle(product.data?.title);

  if (product.isPending) return <ProductPageSkeleton />;
  if (product.isError) {
    if (product.error instanceof ApiError && product.error.status === 404) return <NotFoundPage />;
    return <ErrorState error={product.error} onRetry={() => product.refetch()} />;
  }

  const p = product.data;
  const category = categories.data?.find((c) => c.slug === p.categorySlug);

  return (
    <article className="grid gap-8 md:grid-cols-2 md:gap-12">
      <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface p-10">
        <img src={p.imageUrl} alt={p.title} className="max-h-full max-w-full object-contain" />
      </div>

      <div className="flex flex-col">
        {category && (
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-xs text-subtle">
            <Link to="/" className="hover:text-strong">
              Home
            </Link>
            <Icon name="chevron-right" size={12} />
            <Link
              to={`/categories/${encodeURIComponent(category.slug)}`}
              className="hover:text-strong"
            >
              {category.name}
            </Link>
          </nav>
        )}
        <h1 className="text-2xl font-medium text-strong">{p.title}</h1>
        {p.rating && (
          <div className="mt-2">
            <Rating rating={p.rating} />
          </div>
        )}
        <p className="mt-6 text-2xl font-medium text-strong">{formatMoney(p.price)}</p>
        <p className="mt-6 text-md text-default">{p.description}</p>

        <div className="mt-8 border-t border-border pt-6">
          <ButtonLink
            to={`/products/${encodeURIComponent(p.id)}/enquire`}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Icon name="mail" />
            Enquire
          </ButtonLink>
          <p className="mt-3 text-xs text-subtle">
            Interested? Send us your details and our sales team will be in touch.
          </p>
        </div>
      </div>
    </article>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12" aria-busy aria-label="Loading product">
      <Skeleton className="aspect-square rounded-lg" />
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-8 w-4/5" />
        <Skeleton className="mt-3 h-3 w-24" />
        <Skeleton className="mt-8 h-8 w-28" />
        <Skeleton className="mt-8 h-20 w-full" />
        <Skeleton className="mt-8 h-11 w-36" />
      </div>
    </div>
  );
}
