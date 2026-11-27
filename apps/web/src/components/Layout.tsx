import { Link, Outlet, ScrollRestoration } from 'react-router';
import { CategoryNav } from './CategoryNav';
import { SearchBar } from './SearchBar';

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-medium text-strong">
            <img src="/favicon.svg" alt="" className="size-6" />
            Catalogue
          </Link>
          <div className="sm:ml-auto sm:w-96">
            <SearchBar />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <CategoryNav />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-subtle">
          Proof of concept. Product data from the Fake Store API.
        </p>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
