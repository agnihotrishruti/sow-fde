import { useState } from 'react';
import FeasibilityStudy from './FeasibilityStudy';
import SowCreation from './SowCreation';

type AppView = 'sow' | 'feasibility';

export default function App() {
  const [view, setView] = useState<AppView>('sow');

  return (
    <div className="app-shell">
      <aside className="side-nav" aria-label="Main navigation">
        <div className="side-nav-brand">
          <span className="side-nav-logo">SOW for FDE</span>
          <span className="side-nav-tagline">Sales → engineering</span>
        </div>
        <nav className="side-nav-links">
          <button
            type="button"
            className={`side-nav-link${view === 'sow' ? ' is-active' : ''}`}
            onClick={() => setView('sow')}
            aria-current={view === 'sow' ? 'page' : undefined}
          >
            SOW creation
          </button>
          <button
            type="button"
            className={`side-nav-link${view === 'feasibility' ? ' is-active' : ''}`}
            onClick={() => setView('feasibility')}
            aria-current={view === 'feasibility' ? 'page' : undefined}
          >
            Feasibility study
          </button>
        </nav>
      </aside>

      <div className="app">
        <main>{view === 'sow' ? <SowCreation /> : <FeasibilityStudy />}</main>

        <footer className="foot">
          <p>
            Put <code>ANTHROPIC_API_KEY</code> in <code>.env</code> (see <code>.env.example</code>).
            Development: <code>npm run dev</code> — UI and <code>/api</code> share one port (default 5175).
          </p>
        </footer>
      </div>
    </div>
  );
}
