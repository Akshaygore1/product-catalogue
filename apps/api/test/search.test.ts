import { describe, expect, it } from 'vitest';
import { matchesSearchTerm } from '../src/domain/search';

describe('matchesSearchTerm', () => {
  const fields = ['Travel Backpack', 'A bag for day trips', 'Clothing'];

  it('matches text in any field regardless of case', () => {
    expect(matchesSearchTerm('BACKPACK', fields)).toBe(true);
    expect(matchesSearchTerm('DAY TRIPS', fields)).toBe(true);
    expect(matchesSearchTerm('CLOTHING', fields)).toBe(true);
    expect(matchesSearchTerm('speaker', fields)).toBe(false);
  });

  it('trims and collapses whitespace in a term', () => {
    expect(matchesSearchTerm('  travel \t backpack  ', fields)).toBe(true);
  });

  it.each(['', ' \t\n '])('rejects an empty term (%j)', (term) => {
    expect(matchesSearchTerm(term, fields)).toBe(false);
  });
});
