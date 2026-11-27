import type { Product } from '@catalogue/shared';
import { Link } from 'react-router';
import { formatMoney } from '../lib/format';
import { Rating } from './Rating';

/** Product tile. The whole card is one link to the product page. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${encodeURIComponent(product.id)}`}
      className="group flex h-full flex-col rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-selected"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-surface p-6">
        <img
          src={product.imageUrl}
          alt=""
          width={400}
          height={400}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1 px-1 pb-1">
        <h3 className="line-clamp-2 text-base font-medium text-strong">{product.title}</h3>
        {product.rating && <Rating rating={product.rating} />}
        <p className="mt-auto pt-2 text-md font-medium text-strong">{formatMoney(product.price)}</p>
      </div>
    </Link>
  );
}
