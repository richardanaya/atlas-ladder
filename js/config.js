/**
 * Atlas Ladder runtime settings.
 *
 * Asset URLs are resolved relative to the module that fetches them, so the
 * GitHub Pages project site at /atlas-ladder/
 * (https://richardanaya.github.io/atlas-ladder/) works without a rebuild.
 *
 * Set BASE_PATH only if you intentionally serve the files from a nested folder
 * and need absolute URLs (include the leading and trailing slash, for example
 * "/atlas-ladder/"). Leave it empty for normal relative hosting.
 */
export const BASE_PATH = '';

export const CONFIG = {
  storageKey: 'atlas-ladder-progress-v1',
  hearts: 5,
  xpPerCorrect: 12,
  perfectBonus: 20,
  xpPerLevel: 80,
  appName: 'Atlas Ladder',
};
