import { createApp } from './app.js';
import { CATALOG_URL, DATA_FILE, HOST, PORT } from './config.js';
import { loadCatalog } from './services/catalog.js';
import { createJsonStore } from './store/jsonStore.js';

const catalog = await loadCatalog(CATALOG_URL);
const store = createJsonStore(DATA_FILE);
await store.read(); // creates the data file on first run and fails fast if it is corrupt

createApp({ store, catalog }).listen(PORT, HOST, () => {
  console.log(`Wellbeing API listening on http://${HOST}:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
