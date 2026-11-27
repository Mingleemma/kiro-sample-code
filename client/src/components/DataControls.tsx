import { useState } from 'react';
import { api } from '../api/client';
import { localToday } from '../lib/dates';
import { ErrorMessage } from './Status';

/** Load sample data or delete everything stored in this browser. */
export function DataControls() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function run(confirmText: string, action: () => Promise<void>) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError(undefined);
    try {
      await action();
      // Reload so every page shows the new data.
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="data-controls">
      <button
        type="button"
        className="btn btn-small"
        disabled={busy}
        onClick={() =>
          run(
            'Load about 30 days of sample data? This replaces everything currently stored in this browser.',
            () => api.loadSampleData(localToday()),
          )
        }
      >
        Load sample data
      </button>
      <button
        type="button"
        className="btn btn-small btn-danger"
        disabled={busy}
        onClick={() =>
          run('Delete all your check-ins, journal entries, and feedback? This cannot be undone.', () =>
            api.clearAllData(),
          )
        }
      >
        Delete all my data
      </button>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
