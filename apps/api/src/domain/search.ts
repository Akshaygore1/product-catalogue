/** Normalises a user-entered search term: trims and collapses whitespace. */
export function normaliseSearchTerm(term: string): string {
  return term.trim().replace(/\s+/g, ' ');
}

/** Case-insensitive substring match of the whole term against any of the fields. */
export function matchesSearchTerm(term: string, fields: string[]): boolean {
  const needle = normaliseSearchTerm(term).toLocaleLowerCase();
  if (!needle) return false;
  return fields.some((field) => field.toLocaleLowerCase().includes(needle));
}
