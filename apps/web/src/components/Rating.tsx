import type { Rating as RatingValue } from '@catalogue/shared';
import { Icon } from './ui/Icon';

export function Rating({ rating }: { rating: RatingValue }) {
  return (
    <p className="flex items-center gap-1 text-xs text-subtle">
      <Icon name="star" size={12} className="text-strong" />
      <span>
        <span className="sr-only">Rated </span>
        {rating.average.toFixed(1)}
        <span className="sr-only"> out of 5 from</span> ({rating.count}
        <span className="sr-only"> reviews</span>)
      </span>
    </p>
  );
}
