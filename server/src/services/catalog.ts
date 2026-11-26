import { readFile } from 'node:fs/promises';
import type { CatalogItem, Category, IndicatorLevel, MoodBand } from '@wellbeing/shared';

const CATEGORIES: Category[] = ['mindfulness', 'exercise', 'self-care'];
const BANDS: MoodBand[] = ['low', 'mid', 'high'];
const LEVELS: IndicatorLevel[] = ['low', 'moderate', 'high'];

/** Loads and checks the static recommendation catalog. Fails fast on a bad file. */
export async function loadCatalog(fileUrl: URL): Promise<CatalogItem[]> {
  const items = JSON.parse(await readFile(fileUrl, 'utf8')) as CatalogItem[];
  if (!Array.isArray(items)) throw new Error('catalog.json must contain an array.');

  const ids = new Set<string>();
  for (const item of items) {
    const where = `catalog item "${item?.id ?? '?'}"`;
    if (!item.id || ids.has(item.id)) throw new Error(`${where}: missing or duplicate id`);
    if (!item.title || !item.description) throw new Error(`${where}: title and description are required`);
    if (!CATEGORIES.includes(item.category)) throw new Error(`${where}: invalid category`);
    if (!item.moodBands?.length || !item.moodBands.every((b) => BANDS.includes(b)))
      throw new Error(`${where}: invalid moodBands`);
    if (!item.indicatorLevels?.length || !item.indicatorLevels.every((l) => LEVELS.includes(l)))
      throw new Error(`${where}: invalid indicatorLevels`);
    ids.add(item.id);
  }
  return items;
}
