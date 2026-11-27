import { z } from 'zod';

/** Money in minor units (e.g. cents) to avoid floating point errors. */
export const MoneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3),
});
export type Money = z.infer<typeof MoneySchema>;

export const CategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const RatingSchema = z.object({
  average: z.number(),
  count: z.number().int(),
});
export type Rating = z.infer<typeof RatingSchema>;

/** Source-agnostic product. IDs are strings so any future data source fits. */
export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: MoneySchema,
  imageUrl: z.string(),
  categorySlug: z.string(),
  rating: RatingSchema.optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CategoryPageSchema = z.object({
  category: CategorySchema,
  topRated: z.array(ProductSchema),
  more: z.array(ProductSchema),
});
export type CategoryPage = z.infer<typeof CategoryPageSchema>;
