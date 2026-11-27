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
    const raw: unknown = JSON.parse(await readFile(this.filePath, 'utf8'));
    return FeaturedFileSchema.parse(raw).productIds;
  }
}
