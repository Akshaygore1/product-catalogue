import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { FeaturedProducts } from '../../domain/ports';

const FeaturedFileSchema = z.object({
  productIds: z.array(z.coerce.string()),
});

/**
 * Reads the curated list from a JSON file. Re-read on every call so edits take
 * effect without a restart; the file is tiny. A CMS or admin UI can replace this adapter.
 */
export class JsonFileFeaturedProducts implements FeaturedProducts {
  constructor(private readonly filePath: string) {}

  async listFeaturedIds(): Promise<string[]> {
    const content = await readFile(this.filePath, 'utf8');
    try {
      const raw: unknown = JSON.parse(content);
      return FeaturedFileSchema.parse(raw).productIds;
    } catch (cause) {
      throw new Error('Invalid featured products file.', { cause });
    }
  }
}
