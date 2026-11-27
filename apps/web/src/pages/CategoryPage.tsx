import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { catalogueQueries } from '../api/catalogue';
import { ApiError } from '../api/client';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid';
import { Section } from '../components/Section';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/StatusMessage';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { NotFoundPage } from './NotFoundPage';

export function CategoryPage() {
  const { slug = '' } = useParams();
  const page = useQuery(catalogueQueries.category(slug));
  useDocumentTitle(page.data?.category.name);

  if (page.isPending) {
    return (
      <>
        <Skeleton className="mb-10 h-8 w-48" />
        <ProductGridSkeleton count={3} />
      </>
    );
  }

  if (page.isError) {
    if (page.error instanceof ApiError && page.error.status === 404) return <NotFoundPage />;
    return <ErrorState error={page.error} onRetry={() => page.refetch()} />;
  }

  const { category, topRated, more } = page.data;

  return (
    <>
      <h1 className="mb-10 text-2xl font-medium text-strong">{category.name}</h1>

      {topRated.length > 0 && (
        <Section title="Top rated" description={`The best of ${category.name.toLowerCase()}.`}>
          <ProductGrid products={topRated} />
        </Section>
      )}

      {more.length > 0 && (
        <Section title={`More in ${category.name}`}>
          <ProductGrid products={more} />
        </Section>
      )}
    </>
  );
}
