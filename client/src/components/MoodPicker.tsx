import type { Mood } from '@wellbeing/shared';
import { MOODS } from '../lib/moods';

interface Props {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  disabled?: boolean;
}

/** Five mood options as a radio group, usable with mouse and keyboard. */
export function MoodPicker({ value, onChange, disabled }: Props) {
  return (
    <fieldset className="mood-picker" disabled={disabled}>
      <legend>How are you feeling today?</legend>
      <div className="mood-options">
        {MOODS.map((m) => (
          <label key={m.value} className={value === m.value ? 'mood-option selected' : 'mood-option'}>
            <input
              type="radio"
              name="mood"
              value={m.value}
              checked={value === m.value}
              onChange={() => onChange(m.value)}
            />
            <span className="mood-emoji" aria-hidden="true">
              {m.emoji}
            </span>
            <span className="mood-label">
              {m.value} · {m.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
