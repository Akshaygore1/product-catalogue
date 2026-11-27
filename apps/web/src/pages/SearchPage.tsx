import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { catalogueQueries } from '../api/catalogue';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid';
import { ErrorState, StatusMessage } from '../components/ui/StatusMessage';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function SearchPage() {
  const [params] = useSearchParams();
  const term = (params.get('q') ?? '').trim();
  const results = useQuery(catalogueQueries.search(term));
  const categories = useQuery(catalogueQueries.categories());
  useDocumentTitle(term ? `Search: ${term}` : 'Search');

  if (!term) {
    return (
      <StatusMessage
        icon="search"
        title="Search the catalogue"
        description="Enter a search term above and press Search."
      />
    );
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-medium text-strong">Results for “{term}”</h1>
      <p className="mb-8 text-base text-subtle" aria-live="polite">
        {results.isSuccess &&
          `${results.data.length} ${results.data.length === 1 ? 'product' : 'products'} found`}
      </p>

      {results.isPending ? (
        <ProductGridSkeleton />
      ) : results.isError ? (
        <ErrorState error={results.error} onRetry={() => results.refetch()} />
      ) : results.data.length === 0 ? (
        <StatusMessage
          icon="package-search"
          title="No products match your search"
          description={
            categories.data && categories.data.length > 0 ? (
              <>
                Try a different term, or browse{' '}
                {categories.data.map((category, i) => (
                  <span key={category.slug}>
                    {i > 0 && (i === categories.data.length - 1 ? ' or ' : ', ')}
                    <Link
                      to={`/categories/${encodeURIComponent(category.slug)}`}
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      {category.name.toLowerCase()}
                    </Link>
                  </span>
                ))}
                .
              </>
            ) : (
              'Try a different term.'
            )
          }
        />
      ) : (
        <ProductGrid products={results.data} />
      )}
    </>
  );
}
