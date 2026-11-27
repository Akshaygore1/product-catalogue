import type {
  Category,
  CategoryPage,
  EnquiryInput,
  EnquiryReceipt,
  Product,
} from '@catalogue/shared';
import { queryOptions, useMutation } from '@tanstack/react-query';
import { apiRequest } from './client';

const enc = encodeURIComponent;

/** Query definitions in one place so keys and fetchers never drift apart. */
export const catalogueQueries = {
  categories: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: () => apiRequest<Category[]>('/categories'),
      staleTime: 5 * 60_000,
    }),
  featured: () =>
    queryOptions({
      queryKey: ['products', 'featured'],
      queryFn: () => apiRequest<Product[]>('/products/featured'),
    }),
  category: (slug: string) =>
    queryOptions({
      queryKey: ['categories', slug, 'products'],
      queryFn: () => apiRequest<CategoryPage>(`/categories/${enc(slug)}/products`),
    }),
  product: (id: string) =>
    queryOptions({
      queryKey: ['products', id],
      queryFn: () => apiRequest<Product>(`/products/${enc(id)}`),
    }),
  search: (term: string) =>
    queryOptions({
      queryKey: ['products', 'search', term],
      queryFn: () => apiRequest<Product[]>(`/products?q=${enc(term)}`),
      enabled: term.length > 0,
    }),
};

export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: (input: EnquiryInput) =>
      apiRequest<EnquiryReceipt>('/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      }),
  });
}
