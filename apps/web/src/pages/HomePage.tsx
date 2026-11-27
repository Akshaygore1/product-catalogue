import { useQuery } from '@tanstack/react-query';
import { catalogueQueries } from '../api/catalogue';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid';
import { Section } from '../components/Section';
import { ErrorState, StatusMessage } from '../components/ui/StatusMessage';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function HomePage() {
  useDocumentTitle(undefined);
  const featured = useQuery(catalogueQueries.featured());

  return (
    <>
      <div className="mb-10">
        <h1 className="text-2xl font-medium text-strong">Discover our catalogue</h1>
        <p className="mt-1 text-md text-subtle">
          Hand-picked favourites, ready when you are. Find something you like and send us an
          enquiry.
        </p>
      </div>

      <Section title="Top rated" description="Our featured picks this season.">
        {featured.isPending ? (
          <ProductGridSkeleton />
        ) : featured.isError ? (
          <ErrorState error={featured.error} onRetry={() => featured.refetch()} />
        ) : featured.data.length === 0 ? (
          <StatusMessage icon="package-search" title="No featured products yet" />
        ) : (
          <ProductGrid products={featured.data} />
        )}
      </Section>
    </>
  );
}
