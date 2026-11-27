import type { ReactNode } from 'react';
import type { Route } from '../hooks/useHashRoute';
import { DataControls } from './DataControls';

const NAV: { route: Route; label: string }[] = [
  { route: 'today', label: 'Today' },
  { route: 'journal', label: 'Journal' },
  { route: 'trends', label: 'Trends' },
];

export function Layout({ route, children }: { route: Route; children: ReactNode }) {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span aria-hidden="true">🌿</span> Wellbeing Companion
          </div>
          <nav aria-label="Main">
            <ul className="nav">
              {NAV.map((item) => (
                <li key={item.route}>
                  <a
                    href={`#/${item.route}`}
                    className={route === item.route ? 'nav-link active' : 'nav-link'}
                    aria-current={route === item.route ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="footer">
        <p>
          Wellbeing Companion is a self-reflection tool and is <strong>not medical advice</strong>. It
          does not diagnose or treat any condition. If you are concerned about your health, talk to a
          qualified professional.
        </p>
        <p className="muted">
          Your data is stored only in this browser on this device. Clearing your browser data deletes it.
        </p>
        <DataControls />
      </footer>
    </div>
  );
}
