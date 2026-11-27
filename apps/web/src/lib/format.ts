import type { Money } from '@catalogue/shared';

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney({ amount, currency }: Money): string {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency });
    formatters.set(currency, formatter);
  }
  return formatter.format(amount / 100);
}
