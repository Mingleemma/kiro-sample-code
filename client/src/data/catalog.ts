import type { CatalogItem, Category, IndicatorLevel, MoodBand } from '@wellbeing/shared';
import rawCatalog from './catalog.json';

const CATEGORIES: Category[] = ['mindfulness', 'exercise', 'self-care'];
const BANDS: MoodBand[] = ['low', 'mid', 'high'];
const LEVELS: IndicatorLevel[] = ['low', 'moderate', 'high'];

/** Checks the catalog shape once at startup, so a bad edit fails loudly. */
function validateCatalog(items: CatalogItem[]): CatalogItem[] {
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

export const catalog: CatalogItem[] = validateCatalog(rawCatalog as CatalogItem[]);
