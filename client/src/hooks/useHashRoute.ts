import { useEffect, useState } from 'react';

export const ROUTES = ['today', 'journal', 'trends'] as const;
export type Route = (typeof ROUTES)[number];

function current(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(hash) ? (hash as Route) : 'today';
}

/** Minimal hash router: #/today, #/journal, #/trends. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(current);
  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
