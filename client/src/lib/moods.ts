import type { Mood } from '@wellbeing/shared';

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 1, label: 'Very low', emoji: '😞' },
  { value: 2, label: 'Low', emoji: '🙁' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Great', emoji: '😄' },
];

export function moodLabel(mood: number): string {
  return MOODS.find((m) => m.value === Math.round(mood))?.label ?? '';
}
