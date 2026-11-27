import type { Product } from '@catalogue/shared';
import { ProductCard } from './ProductCard';
import { Skeleton } from './ui/Skeleton';

const gridClasses = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className={gridClasses}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className={gridClasses} aria-busy aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <Skeleton className="aspect-square" />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/3" />
          <Skeleton className="mt-4 h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
