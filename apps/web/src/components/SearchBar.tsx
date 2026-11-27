import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

/** Searches on submit (button click or Enter), never as you type. */
export function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const currentTerm = params.get('q') ?? '';
  const [term, setTerm] = useState(currentTerm);

  // Keep the input in sync when the URL changes (back/forward, links). Adjusting
  // state during render avoids an extra effect pass.
  const [syncedTerm, setSyncedTerm] = useState(currentTerm);
  if (syncedTerm !== currentTerm) {
    setSyncedTerm(currentTerm);
    setTerm(currentTerm);
  }

  const trimmed = term.trim();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form role="search" onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <label htmlFor="search" className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
        />
        <input
          id="search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search products"
          maxLength={100}
          className="h-9 w-full rounded-md border border-border bg-selected pr-3 pl-9 text-base text-strong placeholder:text-subtle focus:bg-surface"
        />
      </div>
      <Button type="submit" disabled={!trimmed}>
        Search
      </Button>
    </form>
  );
}
