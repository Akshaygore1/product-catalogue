import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';
import { catalogueQueries } from '../api/catalogue';
import { cn } from '../lib/cn';
import { Skeleton } from './ui/Skeleton';

export function CategoryNav() {
  const { data: categories, isPending, isError } = useQuery(catalogueQueries.categories());

  if (isError) return null;

  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {isPending
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-8 w-24" />
              </li>
            ))
          : categories.map((category) => (
              <li key={category.slug}>
                <NavLink
                  to={`/categories/${encodeURIComponent(category.slug)}`}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-1.5 text-base whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-selected font-medium text-strong'
                        : 'text-default hover:bg-selected hover:text-strong',
                    )
                  }
                >
                  {category.name}
                </NavLink>
              </li>
            ))}
      </ul>
    </nav>
  );
}
